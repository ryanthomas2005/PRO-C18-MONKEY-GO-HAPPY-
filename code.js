var p5Inst = new p5(null, 'sketch');

window.preload = function () {
  initMobileControls(p5Inst);

  p5Inst._predefinedSpriteAnimations = {};
  p5Inst._pauseSpriteAnimationsByDefault = false;
  var animationListJSON = {"orderedKeys":["a6870703-0124-47f7-acff-dbe905f5014c","5ce44e39-12ac-4a66-88cf-a87a0ed6a180","33841f90-7a53-4346-b956-e51d1961959b"],"propsByKey":{"a6870703-0124-47f7-acff-dbe905f5014c":{"name":"Monkey","sourceUrl":null,"frameSize":{"x":560,"y":614},"frameCount":10,"looping":true,"frameDelay":12,"version":"3gbQRKXJtogtk63LNejwK.Dohwnk0PmV","loadedFromSource":true,"saved":true,"sourceSize":{"x":1680,"y":1842},"rootRelativePath":"assets/a6870703-0124-47f7-acff-dbe905f5014c.png"},"5ce44e39-12ac-4a66-88cf-a87a0ed6a180":{"name":"Banana","sourceUrl":"assets/v3/animations/0Pmc2UypwJxUUUBBxMOOYmiSvh97BJLRo_BQZbjyEto/5ce44e39-12ac-4a66-88cf-a87a0ed6a180.png","frameSize":{"x":1080,"y":1080},"frameCount":1,"looping":true,"frameDelay":4,"version":"PAmjkqKe_7_i_PqhSDrKN9N2c4nkuq4g","loadedFromSource":true,"saved":true,"sourceSize":{"x":1080,"y":1080},"rootRelativePath":"assets/v3/animations/0Pmc2UypwJxUUUBBxMOOYmiSvh97BJLRo_BQZbjyEto/5ce44e39-12ac-4a66-88cf-a87a0ed6a180.png"},"33841f90-7a53-4346-b956-e51d1961959b":{"name":"Stone","sourceUrl":"assets/v3/animations/0Pmc2UypwJxUUUBBxMOOYmiSvh97BJLRo_BQZbjyEto/33841f90-7a53-4346-b956-e51d1961959b.png","frameSize":{"x":512,"y":512},"frameCount":1,"looping":true,"frameDelay":4,"version":"k4cQfORJ1u_RkMWnwMhiAcq3Lfp_ph76","loadedFromSource":true,"saved":true,"sourceSize":{"x":512,"y":512},"rootRelativePath":"assets/v3/animations/0Pmc2UypwJxUUUBBxMOOYmiSvh97BJLRo_BQZbjyEto/33841f90-7a53-4346-b956-e51d1961959b.png"}}};
  var orderedKeys = animationListJSON.orderedKeys;
  var allAnimationsSingleFrame = false;
  orderedKeys.forEach(function (key) {
    var props = animationListJSON.propsByKey[key];
    var frameCount = allAnimationsSingleFrame ? 1 : props.frameCount;
    var image = loadImage(props.rootRelativePath, function () {
      var spriteSheet = loadSpriteSheet(
          image,
          props.frameSize.x,
          props.frameSize.y,
          frameCount
      );
      p5Inst._predefinedSpriteAnimations[props.name] = loadAnimation(spriteSheet);
      p5Inst._predefinedSpriteAnimations[props.name].looping = props.looping;
      p5Inst._predefinedSpriteAnimations[props.name].frameDelay = props.frameDelay;
    });
  });

  function wrappedExportedCode(stage) {
    if (stage === 'preload') {
      if (setup !== window.setup) {
        window.setup = setup;
      } else {
        return;
      }
    }
// -----

//initiate Game STATEs
var PLAY = 1;
var END = 0;
var gameState = PLAY;

//create a Monkey sprite
var Monkey = createSprite(200,380,20,50);
Monkey.setAnimation("Monkey");

//set collision radius for the Monkey
Monkey.setCollider("circle",0,200,100);
Monkey.debug = true;

//scale and position the trex
Monkey.scale = 0.1;
Monkey.x = 50;

//create a ground sprite
var ground = createSprite(400,400,600,20);
ground.x = ground.width /2;

//invisible Ground to support Monkey
var invisibleGround = createSprite(200,385,400,5);
invisibleGround.visible = false;

//create Obstacle and Cloud Groups
var StonesGroup = createGroup();
var BananasGroup = createGroup();


//set text
textSize(18);
textFont("Georgia");
textStyle(BOLD);

//score
var count = 0;

function draw() {
  //set background to white
  background("white");
  //display score
  text("Score: "+ count, 250, 100);
  console.log(gameState);
  
  if(gameState === PLAY){
    //move the ground
    ground.velocityX = -(6 + 3*count/100);
    //scoring
    count = count + Math.round(World.frameRate/60);
    
    if (count>0 && count%100 === 0){
      playSound("checkPoint.mp3");
    }
    
    if (ground.x < 0){
      ground.x = ground.width/2;
    }
    
     //jump when the space key is pressed
    if(keyDown("space") && Monkey.y >= 359){
      Monkey.velocityY = -12 ;
      playSound("jump.mp3");
    }
  
    //add gravity
    Monkey.velocityY = Monkey.velocityY + 0.8;
    
    //spawn the bananas
    spawnBananas();
  
    //spawn Stones
    spawnStones();
    
    if(BananasGroup.isTouching(Monkey)){
      count = count+1
      BananasGroup.destroyEach();
    }
    
    //End the game when Monkey is touching the stones
    if(StonesGroup.isTouching(Monkey)){
      playSound("jump.mp3");
      gameState = END;
      playSound("die.mp3");
    }
  }
  
  else if(gameState === END) {
   
    //set velcity of each game object to 0
    ground.velocityX = 0;
    Monkey.velocityY = 0;
    StonesGroup.setVelocityXEach(0);
   BananasGroup.setVelocityXEach(0);
    
    //set lifetime of the game objects so that they are never destroyed
    StonesGroup.setLifetimeEach(-1);
    BananasGroup.setLifetimeEach(-1);
    
    
  }
  
 
  
  //console.log(trex.y);
  
  //stop trex from falling down
  Monkey.collide(ground);
  
  drawSprites();
}

function reset(){
  gameState = PLAY;
  
  
  StonesGroup.destroyEach();
  BananasGroup.destroyEach();
  
  count = 0;
  
}

function spawnStones() {
  if(World.frameCount % 120 === 0) {
    var Stone = createSprite(400,380,10,40);
    Stone.velocityX = -6
    //generate random obstacles
    var rand = randomNumber(1,6);
    Stone.setAnimation("Stone");
    
    //assign scale and lifetime to the obstacle           
    Stone.scale = 0.1;
    Stone.lifetime = 70;
    //add each obstacle to the group
    StonesGroup.add(Stone);
  }
}

function spawnBananas() {
  //write code here to spawn the Bananas
  if (World.frameCount % 85 === 0) {
    var Banana = createSprite(400,320,40,10);
    Banana.y = randomNumber(280,320);
    Banana.setAnimation("Banana");
    Banana.scale = 0.05;
    Banana.velocityX = -9;
    
     //assign lifetime to the variable
    Banana.lifetime = 134;
    
    //adjust the depth
    Banana.depth = Monkey.depth;
    Monkey.depth = Monkey.depth + 1;
    
    //add each cloud to the group
    BananasGroup.add(Banana);
  }
  
}

// -----
    try { window.draw = draw; } catch (e) {}
    switch (stage) {
      case 'preload':
        if (preload !== window.preload) { preload(); }
        break;
      case 'setup':
        if (setup !== window.setup) { setup(); }
        break;
    }
  }
  window.wrappedExportedCode = wrappedExportedCode;
  wrappedExportedCode('preload');
};

window.setup = function () {
  window.wrappedExportedCode('setup');
};
