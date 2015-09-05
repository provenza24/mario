Mario.Game = function(game){
	
	this.map;	
	this.layer;	
	this.mario;	
	this.customText;
	this.customTextStyle;	
	this.debug;
	
	// Shift jump indicator	
	this.shiftJump;		
	// Camera offset
	this.cameraOffset;	
	
	// Mario
	this.animations;
	this.growUpAnimation;
	
	// Enemis / Items groups	
	this.ennemies;	
	this.items;
	this.fireBalls;
	this.background;	
	this.transparencyGroup;
	this.elevatorGroup;
	
	// Keyboard management
	this.keyboard;
	this.cursors;
	this.startButton;
	this.pauseButton;
	this.debugCustomButton;
	this.debugPhysicsButton;
	this.debugBoundButton;
	this.debugFpsButton;
	this.showBackgroundButton;	
	
	this.scaleButton;
	
	this.xMaxScrolling;	
	this.mapType = 0;
	this.mapWorld;
	this.flag;
	this.transfer = false;
	this.xGate;
	
	this.mapEnv;	
	
	this.audio;
};
Mario.Game.prototype = {
	/**************************************************************************************************************************************************************************/
	/**                                                                       CREATE METHOD                                                                                   */
	/**************************************************************************************************************************************************************************/	
	create: function(game){
		
		/***************************************************************************************/
		/**                                 GENERAL FONCTIONS                                  */
		/***************************************************************************************/
		function initGoomba(goomba) {				
			goomba.alive = false;
			goomba.enemyType = 0;
			goomba.animations.add('goomba-anim', [0,1], 6, true);
			goomba.animations.play('goomba-anim');									
			goomba.body.velocity.x = 0;			
			goomba.body.bounce.y = 0;		
			goomba.body.mass = 60;		
			goomba.body.linearDamping = 1;
			goomba.body.collideWorldBounds = true;	
			goomba.body.allowGravity = false;
			goomba.body.setSize(28, 32, 2, 0);
			goomba.body.velocity.x = 0;
			goomba.body.bounce.x = 1;
			goomba.initialized = false;
			if (goomba.xAlive ==undefined || goomba.xAlive ==null) {
				goomba.xAlive = goomba.x - 520;
			}
			goomba.killed = false;
			goomba.stateSaved = {};
		}	

		function initPiranhaPlant(piranhaPlant, transparencyGroup) {						
			piranhaPlant.finalPosition = piranhaPlant.y-47;		
			piranhaPlant.enemyType = 1;			
			piranhaPlant.animations.add('piranha-anim', [0,1], 10, true);
			piranhaPlant.animations.play('piranha-anim');	
			piranhaPlant.body.allowGravity = false;
			piranhaPlant.alive = false;
			piranhaPlant.body.collideWorldBounds = false;
			piranhaPlant.y = piranhaPlant.finalPosition;
			piranhaPlant.xAlive = piranhaPlant.body.x - 520;
			piranhaPlant.killed = false;
			piranhaPlant.stateSaved = {};
						
			// Foreach piranha plant, add a pipe to hide it
			/*var pipe = game.add.sprite(Math.floor(piranhaPlant.body.x-16), piranhaPlant.body.y - 4, 'pipe');
			transparencyGroup.add(pipe);
			pipe.body.allowGravity = false;
			pipe.body.collideWorldBounds = false;*/
			
			// Piranah animations
			piranhaPlant.tween1 = {running:false};									
			piranhaPlant.tween2 = {running:false};
			
						
						
		}
		
		function createMysteryBloc(game, x,y) {
			var mystery = game.add.sprite(x*32, y*32, 'mystery');
			mystery.type = 0;
			mystery.xTile = x;
			mystery.yTile = y;
			mystery.animations.add('myster-anim', [0,1,2,3], 10, true);
			mystery.animations.play('myster-anim');
			return mystery;
		}
		
		// Mario animations enumeration
		this.animations = [];
		this.animations[0]='mario-right';
		this.animations[5]='mario-left';
		this.animations[4]='mario-slide-right';
		this.animations[9]='mario-slide-left';
		this.animations[3]='mario-jump-right';
		this.animations[8]='mario-jump-left';
		this.animations[10]='mario-dead';		
						
		// Keyboard handling
		this.cursors = game.input.keyboard.createCursorKeys();
		this.pauseButton = game.input.keyboard.addKey(Phaser.Keyboard.P);	
		this.startButton = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);		
		this.debugFpsButton = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
		this.debugCustomButton = game.input.keyboard.addKey(Phaser.Keyboard.TWO);	
		this.debugPhysicsButton = game.input.keyboard.addKey(Phaser.Keyboard.THREE);	
		this.debugBoundsButton = game.input.keyboard.addKey(Phaser.Keyboard.THREE);		
		this.debugBoundsButton = game.input.keyboard.addKey(Phaser.Keyboard.FOUR);		
		this.leftButton = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
		this.rightButton = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
		this.downButton = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
		this.jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.Z);
		this.accelerationButton = game.input.keyboard.addKey(Phaser.Keyboard.A);
		this.fireButton = game.input.keyboard.addKey(Phaser.Keyboard.E);
		this.showBackgroundButton = game.input.keyboard.addKey(Phaser.Keyboard.FIVE);		
		this.scaleButton = game.input.keyboard.addKey(Phaser.Keyboard.S);
		this.nextLevelButton = game.input.keyboard.addKey(Phaser.Keyboard.N);		
		
		// Special keys for debug
		this.keyboard = {debugCustom:false, debugPhysics:false, debugBounds:false, debugFps:false, showBackground: true, scale: true, nextLevel:false, fireBall:false};
		
		// Debuging
		game.time.advancedTiming = false;
		this.debug = {bodyBounds: false, bodyPhysics: false, customText: true};
		
		// Game physics
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.physics.arcade.checkCollision.up = false; // Don't collide with the top of the screen
		game.physics.arcade.checkCollision.down = false; // Don't collide with the top of the screen		
		
		// Background color
		//game.stage.backgroundColor = '#5f97ff';
		
		// First scrolling background group
		this.backgroundGroup = game.add.group();		
			
		// Tilemap
		var levelToLoad = 'level_' + game.worldNumber + '_' + game.levelNumber;
		this.map = game.add.tilemap(levelToLoad);
		this.map.addTilesetImage('Tileset', 'tiles');		
		this.map.setCollisionBetween(0, 200);		
		this.layer = this.map.createLayer('world');		
		this.layer.resizeWorld();	
		this.map.type=0;
		//this.layer.debug = true;			
		
		// First scrolling background
		this.mapEnv = this.layer.layer.properties.background == "background_overworld" ? 0 : 1;
		this.mapWorld = this.mapEnv;
		this.background = game.add.tileSprite(0, 0, game.width, game.height, 'backgrounds');		
		this.background.frame = this.mapEnv;
		this.background.fixedToCamera = true;
		this.backgroundGroup.add(this.background);
		
		// Groups		
		this.items = game.add.group();
		this.items.enableBody = true;		
		this.enemies = game.add.group();
		this.enemies.enableBody = true;		
		this.marioGroup = game.add.group();
		this.fireBalls = game.add.group();
		this.fireBalls.enableBody = true;		
		this.transparencyGroup = game.add.group();
		this.transparencyGroup.enableBody = true;		
					
		// Add coins
		this.map.createFromObjects('objectsLayer',412, 'coin', 0, true, false, this.items);
		var itemIndex = 0;
		this.items.forEach(function(coin){
			coin.type = 0;
			coin.body.allowGravity = false;
			itemIndex++;
		 }, this);		
		this.items.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3], 10, true);
		this.items.callAll('animations.play', 'animations', 'spin');
		
		this.map.createFromObjects('objectsLayer',406, 'transfer', 0, true, false, this.items);
		var startIndex = itemIndex;
		for (var i=startIndex; i< this.items.children.length; i++) {
			var transferElement = this.items.children[i];
			transferElement.type= 1;
			transferElement.body.allowGravity = false;
			transferElement.body.collideWorldBounds = false;	
			itemIndex++;
		}
		startIndex = itemIndex;
		this.map.createFromObjects('objectsLayer',409, 'transfer', 0, true, false, this.items);
		for (var i=startIndex; i< this.items.children.length; i++) {
			var transferElement = this.items.children[i];
			transferElement.type= 2;
			transferElement.body.allowGravity = false;
			transferElement.body.collideWorldBounds = false;	
			itemIndex++;
		}
		
		this.map.createFromObjects('objectsLayer',405, 'flag', 0, true, false, this.items);
		var flagItem = this.items.children[itemIndex];
		flagItem.type=3;
		flagItem.animations.add('flag-anim', [0,1,2], 5, true);
		flagItem.animations.play('flag-anim');				
		this.flag = flagItem;		
					
		// Add enemies - Goomba		
		this.map.createFromObjects('objectsLayer',402, 'goomba', 0, true, false, this.enemies);
		var enemyIndex = 0;
		this.enemies.forEach(function(goomba){
			initGoomba(goomba);
			enemyIndex++;						
		 }, this);
					
		// Add enemies - Piranha Plant 
		this.map.createFromObjects('objectsLayer',414, 'piranhaPlant', 0, true, false, this.enemies);
		for (var i=enemyIndex; i< this.enemies.children.length; i++) {
			var piranhaPlant = this.enemies.children[i];
			initPiranhaPlant(piranhaPlant, this.transparencyGroup);					
		}	
					
		game.physics.enable(this.enemies);	
		
		// Special elements - Mystery box
		for (var y=0; y< this.map.height; y++) {
			for (var x=0; x < this.map.width; x++) {
				var tile = this.map.getTile(x,y);
				if (tile!=null && tile!=undefined && (tile.index==7 || tile.index==8)) {										
					this.transparencyGroup.add(createMysteryBloc(game, x, y));					
				} else if (tile!=null && tile!=undefined && tile.index==387) {										
					var stick = game.add.sprite(x*32+13, y*32, 'flag-stick'); 
					stick.type=4;
					this.items.add(stick);
				} else if (tile!=null && tile!=undefined && tile.index==383) {
					this.xGate = tile.worldX + 16;					
				}				
			}
		}
						
		// Mario			
		this.map.createFromObjects('objectsLayer',401, 'mario', 0, true, false, this.marioGroup);
		this.mario = this.marioGroup.getAt(0);
		this.mario.state = {orientation: 1, canJump : true, falling : false, direction : 1, running: false, jumping: false, sliding:false, oldAnimation: 0, currentAnimation: 0, allowShiftJump: true};		
		this.shiftJump = {shift : false, reajust:false};				
		this.mario.constants = {ACCELERATION : 0.020, ACCELERATION_FAST:0.040, ACCELERATION_MAX : 1.4, ACCELERATION_FAST_MAX: 2, DECCELERATION : 0.04, DECCELERATION_SLIDE:0.1, JUMP_TIMER_MAX: 20, VELOCITY_MAX_Y : 116, X_OFFSET: 4, CAMERA_OFFSET:220};		
		this.mario.jumptimer = 0;
		game.physics.enable(this.mario);				
		this.mario.body.velocity.x = 0;		
		this.mario.body.bounce.y = 0;		
		this.mario.body.mass = 60;		
		this.mario.body.linearDamping = 1;
		this.mario.body.collideWorldBounds = true;
		if (game.marioState==0) {
			this.mario.body.setSize(32-this.mario.constants.X_OFFSET, 32, 2, 0);
		} else {			
			this.mario.loadTexture(game.marioState==1 ? 'mario-big' : 'mario-big-flower');
			this.mario.y = this.mario.y - 29;
			this.mario.body.y = this.mario.body.y - 29;
			this.mario.body.setSize(32-this.mario.constants.X_OFFSET, 61, 2, 0);
		}			
		this.mario.body.gravity.y = 1600; // Mario gravity value
		this.mario.alive = true;
		this.mario.frame = 0;
		this.mario.invincible = false;
		this.mario.invincibleCount =0;		
		this.mario.stateSaved = {};
		this.mario.growUp = false;
		this.mario.growDown = false;
		game.mapFinished = false;
		
		// Mario - animations		
		this.mario.animations.add('mario-right-anim', [0,1,2], 18, true);
		this.mario.animations.add('mario-jump-right-anim', [3]);
		this.mario.animations.add('mario-slide-right-anim', [4]);
		this.mario.animations.add('mario-left-anim', [5,6,7], 18, true);
		this.mario.animations.add('mario-jump-left-anim', [8]);
		this.mario.animations.add('mario-slide-left-anim', [9]);		
		this.mario.animations.add('mario-dead-anim', [10]);
		this.mario.animations.add('mario-right-anim', [0,1,2], 18, true);		
		this.mario.animations.add('mario-grow-up-anim', [0,1,0,1,0,1,2], 7, false);		
		this.mario.animations.add('mario-grow-down-anim', [2,1,2,1,2,1,0], 6, false);		
				
		game.camera.follow(this.mario);
		game.camera.deadzone = new Phaser.Rectangle(-10, 0, 256, 480);
				
		// Custom debug
		if (this.debug.customText) {
			var sprite = game.add.sprite(0,0);
			sprite.fixedToCamera = true;
			this.customTextStyle = {font:"bold 12px Arial", fill: "#ff0000"};		
			this.customText = game.add.text(0,0,"(CanJump:"+this.mario.state.canJump+"\n(Jumping:"+this.mario.state.jumping+")\n(Moving:"+this.mario.state.running+")\n(oldAnimation:"+this.mario.state.oldAnimation+")\ncurrentAnimation:"+this.mario.state.currentAnimation+")", this.customTextStyle);
			sprite.addChild(this.customText);
			sprite.cameraOffset.x = 10;
			sprite.cameraOffset.y = 10;
			this.customText.visible = false;
		}

		/*function switchFullScreenMode() {
			if (game.scale.isFullScreen) {
				game.scale.stopFullScreen();
			} else {
				game.scale.startFullScreen(false);
			}						
		};
		game.input.onDown.add(switchFullScreenMode, this);
		
		switchFullScreenMode();*/
				
		/*this.mario.x = 4370;		
		this.mario.y = 259;		
		this.camera.x = 4165;*/
		

		
		function createElevator(x, y, velocity, from, to, direction) {
			var elevator = game.add.sprite(x, y, 'elevator');			
			game.physics.enable(elevator);		
			elevator.body.immovable = true;
			elevator.body.velocity.y = velocity;
			elevator.from = from;	
			elevator.to = to;
			elevator.direction = direction;
			return elevator;
		}
		
		this.elevatorGroup = game.add.group();        		
		if (game.levelNumber ==2) {			
			this.elevatorGroup.add(createElevator(4482, -7, 80, -7, game.height + 7, -1));		
			this.elevatorGroup.add(createElevator(4482, 185, 80, -7, game.height + 7, -1));	
		
			this.elevatorGroup.add(createElevator(4960, -7, -80, game.height + 7, -7, 1));		
			this.elevatorGroup.add(createElevator(4960, 185, -80, game.height + 7, -7, 1));												
						
		}
		
		this.audio = {};
		this.audio.mainTheme = game.add.audio('audio-main-theme');
		this.audio.mainTheme.volume = 0.5;
		this.audio.die = game.add.audio('audio-die');	
		this.audio.powerUp = game.add.audio('audio-powerup');			
		this.audio.powerUpAppears = game.add.audio('audio-powerup-appears');
		this.audio.kick = game.add.audio('audio-kick');
		this.audio.smallJump = game.add.audio('audio-jump-small');
		this.audio.superJump = game.add.audio('audio-jump-super');
		this.audio.breakWall = game.add.audio('audio-break-block');
		this.audio.bump = game.add.audio('audio-bump');
		this.audio.stageClear = game.add.audio('audio-stage-clear');
		this.audio.flagPole = game.add.audio('audio-flag-pole');
		this.audio.fireworks = game.add.audio('audio-fireworks');
		this.audio.coin = game.add.audio('audio-coin');
		this.mario.audio = {};
		this.mario.audio.pipe = game.add.audio('audio-pipe');
		
		
		//  Being mp3 files these take time to decode, so we can't play them instantly
		//  Using setDecodedCallback we can be notified when they're ALL ready for use.
		//  The audio files could decode in ANY order, we can never be sure which it'll be.
		/*var sounds = [ this.audio.mainTheme, this.audio.die, this.audio.powerUp, this.audio.powerUpAppears, this.audio.kick];
		game.sound.setDecodedCallback(sounds, this.preinitGame(), this);*/
				
		// Finally, launch preinitGame method which wait the user to enter start button to play
		this.preinitGame();			
				
	},
	endLevel: function() {
		
		// Lance l'animation de mort de Mario (un saut)
		function launchFirework(game, group, delay, xPosition, yPosition, fireworkNum, sound) {			
			game.time.events.add(delay, function() {			
				var fireworkImage = fireworkNum == 1 ? 'firework-yellow' : fireworkNum == 2 ? 'firework-pink' : 'firework-red';
				var firework = game.add.sprite(xPosition, yPosition, fireworkImage);
				group.add(firework);
				firework.animations.add('firework-anim', [0,1,2,3,4], 10, false);
				firework.animations.play('firework-anim');				
				sound.play();
		  }, this);
		}		
		
		// Wait while Mario animation is playing, then go to next level											
		if (this.mario.tween == undefined) {
			this.game.camera.follow(null);
			this.mario.tween = this.game.add.tween(this.mario).to( { y: 380 + (32-this.mario.height)}, 1000 - ((this.mario.body.y-64)*2), Phaser.Easing.Linear.None);
			this.mario.tween.start();
			this.mario.endGameState = 1;
			var flagTween = this.game.add.tween(this.flag).to( { y: 380 }, 1000, Phaser.Easing.Linear.None);
			flagTween.start();
			this.audio.flagPole.play();
		} else if (!this.mario.tween.isRunning && this.mario.endGameState==1) {			
			this.mario.x = this.mario.x + 32
			this.mario.frame = 12;				
			this.mario.endGameState = 2;
		} else if (this.mario.endGameState==2) {
			this.mario.tween = this.game.add.tween(this.mario).to( { y: this.mario.y   }, 1000, Phaser.Easing.Linear.None);
			this.mario.tween.start();
			this.mario.endGameState=3;
		} else if (!this.mario.tween.isRunning && this.mario.endGameState==3) {
			this.audio.stageClear.play();
			var castleWall = this.game.add.sprite(this.xGate+32, 384, 'transparency-castle-wall');				
			this.transparencyGroup.add(castleWall);
			this.mario.x = this.mario.x + 16;
			this.mario.y = 416 + (32-this.mario.height);
			this.mario.endGameState=4;
			this.mario.animations.play(this.animations[0]+"-anim");	
			this.mario.tween = this.game.add.tween(this.mario).to( { x: this.xGate}, 3000, Phaser.Easing.Linear.None);
			this.mario.tween.start();								
			var tween = this.game.add.tween(this.camera).to( { x: this.flag.x -64}, 3000, Phaser.Easing.Linear.None);
			tween.start();								
		} else if (!this.mario.tween.isRunning && this.mario.endGameState==4) {
			this.mario.endGameState=5;
			this.mario.animations.stop(null, true);
			this.mario.frame = 13;
			this.mario.tween = this.game.add.tween(this.mario).to( { y: this.mario.y   }, 1500, Phaser.Easing.Linear.None);
			this.mario.tween.start();	
		} else if (!this.mario.tween.isRunning && this.mario.endGameState==5) {
			this.mario.endGameState=6;				
			this.mario.animations.play(this.animations[0]+"-anim");	
			this.mario.tween = this.game.add.tween(this.mario).to( { x: this.xGate+32}, 500, Phaser.Easing.Linear.None);				
			this.mario.tween.start();			
		}else if (!this.mario.tween.isRunning && this.mario.endGameState==6) {
			this.mario.endGameState=7;
			var firework = this.game.add.sprite(this.mario.body.x, 96, 'firework-yellow');
			this.transparencyGroup.add(firework);
			firework.animations.add('firework-anim', [0,1,2,3,4], 10, false);
			firework.animations.play('firework-anim');
			for (var i=0; i<10;i++) {
				var fireworkNum = Math.floor((Math.random() * 3) + 1);
				var add = Math.floor((Math.random() * 2) + 1);
				var xVariable = Math.floor((Math.random() * 150) + 1);
				var xPosition = add==1 ? this.xGate + xVariable : this.xGate - xVariable;
				var yPosition = Math.floor((Math.random() * 100) + 32);				
				launchFirework(this.game, this.transparencyGroup, i*400, xPosition, yPosition, fireworkNum, this.audio.fireworks);
			}			
			this.mario.tween = this.game.add.tween(firework).to( { x: firework.x}, 5000, Phaser.Easing.Linear.None);					
			this.mario.tween.start();			
		}else if (!this.mario.tween.isRunning && this.mario.endGameState==7) {
			this.game.levelNumber++;
			this.restartLevel();
		}			
	},	
	/**************************************************************************************************************************************************************************/
	/**                                                                     RESTART LEVEL METHOD                                                                              */
	/**************************************************************************************************************************************************************************/
	restartLevel: function(){
		this.state.start('Game');		
	},
	/**************************************************************************************************************************************************************************/
	/**                                                                      PREINIT GAME METHOD                                                                              */
	/**************************************************************************************************************************************************************************/
	preinitGame: function(){
		
		// pause the game
		this.game.paused = true;
		
		// display text centered
		var pausedText =  this.game.add.bitmapText(10, this.game.width/2, 'font', '- PRESS START -', 32);		
		pausedText.align='center';
		pausedText.x = this.game.width/2 - pausedText.textWidth/2;
				
		// set event listener for the user's action (start key entered)
		this.startButton.onDown.add(function(){			
			// remove the pause text
			pausedText.destroy();
			// unpause the game
			this.game.paused = false;
			this.audio.mainTheme.play();
		}, this);	
	},
	/**************************************************************************************************************************************************************************/
	/**                                                                      MANAGE PAUSE METHOD                                                                              */
	/**************************************************************************************************************************************************************************/
	managePause: function(){		
		this.game.paused = true;
		// add proper informational text
		var pausedText =  this.game.add.bitmapText(10, this.game.width/2, 'font', '- PAUSED -', 32);		
		pausedText.align='center';
		pausedText.x = this.camera.x + this.game.width/2 - pausedText.textWidth/2;
		// set event listener for the user's click/tap the screen		
		this.pauseButton.onDown.add(function(){
			// remove the pause text
			pausedText.destroy();
			// unpause the game
			this.game.paused = false;
		}, this);
	},
	/**************************************************************************************************************************************************************************/
	/**                                                                          RENDER METHOD                                                                                */
	/**************************************************************************************************************************************************************************/
	render: function(game) {		
		
		if (game.time.advancedTiming) {
			game.debug.text(game.time.fps || '--', 2,14, "#00ff00");
		}		
		if (this.debug.bodyBounds) {
			game.debug.body(this.mario);
			game.debug.body(this.layer);
			this.enemies.forEach(function(enemy){						
				game.debug.body(enemy);	
			});			
		}		
		if (this.debug.bodyPhysics) {
			game.debug.bodyInfo(this.mario, 32, this.game.width/2);							
		}				
			
	},
	/**************************************************************************************************************************************************************************/
	/**                                                                          UPDATE METHOD                                                                                */
	/**************************************************************************************************************************************************************************/
	update: function(game){						
		
		/***************************************************************************************/
		/**                                 GENERAL FONCTIONS                                  */
		/***************************************************************************************/	
		function isAboveTile(element, tile) {
			var xTileLeft = tile.x*32;
			var xTileRight = tile.x*32 + 32;
			var yElementTile = Math.floor(element.body.y / 32);
			var xElementLeft = element.body.x;
			var xElementRight = element.body.x + element.width;
			return (((xElementLeft>=xTileLeft && xElementLeft<=xTileRight)
				||	(xElementRight>=xTileLeft && xElementRight<=xTileRight))
				&& tile.y == yElementTile +1);
		}

		
		function createMushroom(collisioningTile) {
			var mushroom = game.add.sprite(collisioningTile.x*32, (collisioningTile.y)*32, 'mushroom');									
			mushroom.initialized = false;			
			mushroom.type = 5;			
			mushroom.tween = game.add.tween(mushroom).to( { y: (collisioningTile.y-1)*32}, 500, Phaser.Easing.Linear.None);											
			mushroom.tween.start();			
			return mushroom;
		}
		
		function createFlower(collisioningTile) {
			var flower = game.add.sprite(collisioningTile.x*32, (collisioningTile.y)*32, 'flower');									
			flower.animations.add('flower-anim', [0,1,2,3], 15, true);
			flower.animations.play('flower-anim');
			flower.initialized = false;			
			flower.type = 6;			
			flower.tween = game.add.tween(flower).to( { y: (collisioningTile.y-1)*32}, 500, Phaser.Easing.Linear.None);											
			flower.tween.start();			
			return flower;
		}

		
		function createBrokenWall(xPos, yPos, image, xVelocity, yVelocity) {
			var brokenWall = game.add.sprite(xPos, yPos, image);
			game.physics.enable(brokenWall);				
			brokenWall.body.velocity.x = xVelocity;		
			brokenWall.body.velocity.y = yVelocity;
			brokenWall.body.gravity.y = 1600;
			return brokenWall;
		}
		
		function animateCoinFromBlock(group, xTile, yTile) {
			var coin = game.add.sprite(xTile*32, yTile*32, 'coin');
			coin.animations.add('coin-anim', [0,1,2,3], 10, true);
			coin.animations.play('coin-anim');
			coin.type = 100; // No collision	
			group.add(coin);
			var tween = game.add.tween(coin).to( { y: coin.y-64 }, 150, Phaser.Easing.Linear.None);																		
			tween.start();
			tween.onComplete.add(function(coin) { 																		
				var explosion = game.add.sprite(coin.x-4, coin.y, 'coin-explosion');
				group.add(explosion);
				explosion.animations.add('coin-explosion-anim', [0,1,2,3], 10, false);
				explosion.animations.play('coin-explosion-anim');
				removeAfterDelay(explosion, 300);
				coin.destroy();
			}, this);				
		}
		
		function createBlockWallForAnimation(group, xTile, yTile, index) {
			var element = game.add.sprite(xTile*32, yTile*32, 'wall-'+index);
			element.type = 100; // 100 -> no collision
			element.xTile = xTile;
			element.yTile = yTile;
			group.add(element);
			return element;
		}		
						
		// Lance l'animation de mort de Mario (un saut)
		function launchDeathAnimation(mario, delay) {			
			game.time.events.add(delay, function() {				
				mario.body.allowGravity = true;
				mario.body.velocity.y = -600;				
		  }, this);
		}		
		
		// Remove a sprite after a given delay
		function removeAfterDelay(sprite, delay) {
			// Add a single-fire timer event to destroy sprite after delay (in ms)
			game.time.events.add(delay, function() {
			sprite.destroy();
		  }, this);
		}
		
		// Constraint Mario velocity (to avoid Mario passing throught the floor
		function constrainVelocity(sprite, maxVelocity) {
			if (!sprite || !sprite.body) {return;}
			var body = sprite.body;
			var angle, currVelocitySqr, vx, vy;
			vx = body.velocity.x;
			vy = body.velocity.y;
			currVelocitySqr = vx * vx + vy * vy;
			if (currVelocitySqr > maxVelocity * maxVelocity) {
				angle = Math.atan2(vy, vx);
				vx = Math.cos(angle) * maxVelocity;
				vy = Math.sin(angle) * maxVelocity;
				body.velocity.x = vx;
				body.velocity.y = vy;
			}
		};
		
		// Change Mario animation
		changeAnimation = function(game, mario, animations, animation) {
			if (!(animation==mario.state.currentAnimation)) {				
				mario.frame = animation;				
				mario.state.oldAnimation = mario.state.currentAnimation;
				mario.state.currentAnimation = animation;				
			}			
		};
		
		// Method called when mario collides an item
		function collideItems(mario, item) {			
			if (item.type==0) {
				// Item is a coin
				item.kill();				
				game.coins++;
				this.audio.coin.play();
			} else if ((item.type==1 && this.downButton.isDown) || (item.type==2 && this.rightButton.isDown)) {
				// Transfer down element
				mario.body.velocity.x =0;
				mario.body.velocity.y =0;
				mario.body.acceleration.x =0;
				mario.body.acceleration.y =0;
				mario.body.x = parseInt(item.xOutgoing);				
				mario.body.y = parseInt(item.yOutgoing);															
				mario.body.y  = game.marioState > 0 ? mario.body.y - 29 : mario.body.y; 
				this.mapType = parseInt(item.mapType);				
				if (this.mapType==0) {
					game.camera.x = item.xOutgoing -100;	
				} else {
					game.camera.setPosition(item.xCamera, game.camera.y);					
				}
				this.transfer = true;
				if (item.background != undefined) {
					var newFrame = item.background === 'underworld' ? 1 : 0;				
					this.background.destroy();						
					this.background = game.add.tileSprite(0, 0, game.width, game.height, 'backgrounds');		
					this.background.frame = 0;
					this.background.fixedToCamera = true;
					this.backgroundGroup.add(this.background);									
				}
				
			} else if (item.type==4 && !this.transfer) {
				this.game.mapFinished = true;
			} else if (item.type==5 || item.type==6) {
				// Mushroom : if Mario state == 0 (small Mario) -> 1 (big Mario)
				// Flower : if Mario state == 1 -> Mario flower				
				item.destroy();
				this.audio.powerUp.play();
				if (game.marioState == 0) {
					mario.growUp = true;
				} else if (game.marioState == 1) {
					this.mario.loadTexture('mario-big-flower', 0);
					game.marioState = 2;
				}												
			}			
		};
		
		function killEnemy(enemy, xVelocity, yVelocity, newFrame, allowGravity) {
			enemy.body.velocity.x = xVelocity;
			enemy.body.velocity.y = yVelocity;
			enemy.animations.stop(null, true);						
			enemy.frame = newFrame;
			enemy.killed = true;			
			enemy.body.allowGravity = allowGravity;
		}
		
		function collideFireballs(enemy, fireball) {
			if (enemy.enemyType==0) {
				this.audio.kick.play();
				killEnemy(enemy, fireball.body.velocity.x>0 ? 150 : -150, -200, 3, true);
			} else 	if (enemy.enemyType==1) {		
				this.audio.kick.play();
				enemy.destroy();
			}
			fireball.destroy();
			removeAfterDelay(enemy, 500);		
		}
		
		function hitMario(mario) {
			// Otherwise, if Mario is not invincible
			if (game.marioState>0) {
				// if mario is big -> Mario becomes small and invincible
				game.marioState = 0;				
				mario.growDown = true;
				mario.invincible = true;
				mario.invincibleCount = 0;
				mario.audio.pipe.play();
			} else {
				mario.alive = false;
			}					
		}
						
		// Method called when mario collides an enemy	
		function collideEnemy(mario, enemy) {			
			if (enemy.enemyType==1) {
				// Piranha plant
				if (!this.mario.invincible) {
					hitMario(mario);
				}
			} else {
				if (!enemy.killed) {
					// Goomba -> check if we were falling and Mario feet are at least at mid-hight of the enemy hight					
					var marioY = mario.body.y;
					var enemyY = enemy.body.y;
					var marioX = mario.body.x + mario.constants.X_OFFSET;
					var marioWidth = mario.body.width;
					var marioHeight = mario.body.height;
					var marioRightX = mario.body.x + (marioWidth-mario.constants.X_OFFSET);
					/********************************** VERIFIER LES OFFSET DES ENNEMIS SI BESOIN ********************/				
					var enemyHeight = enemy.body.height;				
					var onTop =  mario.body.velocity.y >0 && (((marioY + marioHeight) - (enemyY + enemyHeight/2))<0) && ((marioX>=enemy.body.x-4 && marioX<=(enemy.body.x+32)) || (marioRightX>=enemy.body.x-4 && marioRightX<(enemy.body.x+32)));			
					if (onTop) {	
						// Mario kills the enemy		
						this.audio.kick.play();	
						killEnemy(enemy, 0, 0, 2, false);
						removeAfterDelay(enemy, 500);	
						mario.body.velocity.y = -400;								
					} else if (!mario.invincible) {
						hitMario(mario);												
					}
				}			
			}
		};

		function awakeGoomba(goomba) {
			goomba.body.allowGravity = true;
			goomba.body.gravity.y = 1600;
			goomba.body.velocity.x = -65;
			goomba.initialized = true;
		}
		
		function movePiranhaPlant(piranhaPlant, xMarioPosition) {
			// Piranha plant moves (from bottom to top to get out of its pipe and vice versa)
			if (piranhaPlant.body.y == piranhaPlant.finalPosition) {
				piranhaPlant.tween1 = game.add.tween(piranhaPlant).to( { y: piranhaPlant.body.y +50 }, 1000, Phaser.Easing.Linear.In);
				piranhaPlant.tween2 = game.add.tween(piranhaPlant).to( { y: piranhaPlant.body.y +50 }, 2000, Phaser.Easing.Linear.In);
				piranhaPlant.tween1.chain(piranhaPlant.tween2);									
				piranhaPlant.tween1.start();
			} else {
				var xDiff = Math.floor(xMarioPosition - piranhaPlant.body.x);	
				var	stopMove = xDiff >= -76 && xDiff <= 80;
				if (!stopMove) {
					piranhaPlant.tween1 = game.add.tween(piranhaPlant).to( { y: piranhaPlant.finalPosition }, 1000, Phaser.Easing.Linear.In);									
					piranhaPlant.tween2 = game.add.tween(piranhaPlant).to( { y: piranhaPlant.finalPosition }, 2000, Phaser.Easing.Linear.In);
					piranhaPlant.tween1.chain(piranhaPlant.tween2);
					piranhaPlant.tween1.start();
				}
			}		
		}
				
		/***************************************************************************************/
		/**                                 SPECIAL KEYS HANDLING                              */
		/***************************************************************************************/
		// Fonction qui affiche les informations de Mario en mode debug (touche 1 du clavier)
		if (this.debug.customText) {
			this.customText.setText(
				"Position=("+Math.floor(this.mario.body.x)+","+Math.floor(this.mario.body.y)+")\n"
				+"Velocity.x=("+this.mario.body.velocity.x+","+this.mario.body.velocity.x+")\n"
				+"Direction="+this.mario.state.direction+"     Orientation="+this.mario.state.orientation+"\n"				
				+"Running="+this.mario.state.running+"     Sliding="+this.mario.state.sliding+"\n"
				+"Jumping="+this.mario.state.jumping+"     CanJump="+this.mario.state.canJump+"     Falling="+this.mario.state.falling+"\n"
				+"Fireball="+this.keyboard.fireBall+"   fireBalls.elaspedTime="+this.fireBalls.elaspedTime+"\n"
				+"OldAnimation="+this.mario.state.oldAnimation+"     CurrentAnimation="+this.mario.state.currentAnimation+"\n"
				+"Camera="+game.camera.x+","+game.camera.y+"     CameraOffset="+Math.floor(this.cameraOffset)+"\n"				
				+"Coins="+game.coins+"\n"
				+"transparencyGroup.length="+this.transparencyGroup.length+"     items.length="+this.items.length+"     enemies.length="+this.enemies.length+"   fireBalls.length="+this.fireBalls.length
				);				
		}
		
		if (this.pauseButton.isDown && !game.pause) {
			this.managePause();
		}
		
		if (this.debugFpsButton.isDown) {
			if (this.keyboard.debugFps==false) {
				this.keyboard.debugFps=true;
				game.time.advancedTiming = true;
			}				
		} else {
			this.keyboard.debugFps=false;
		}
		
		if (this.debugCustomButton.isDown) {
			if (this.keyboard.debugCustom==false) {
				this.keyboard.debugCustom=true;
				this.customText.visible = !this.customText.visible;
			}				
		} else {
			this.keyboard.debugCustom=false;
		}
		
		if (this.debugPhysicsButton.isDown) {		
			if (this.keyboard.debugPhysics==false) {
				this.keyboard.debugPhysics = true;
				this.debug.bodyPhysics = !this.debug.bodyPhysics;
				if (!this.debug.bodyPhysics) {				
					game.debug.stop();
				}
			}		
		} else {
			this.keyboard.debugPhysics = false;
		}
		
		if (this.debugBoundsButton.isDown) {
			if (this.keyboard.debugBounds==false) {
				this.keyboard.debugBounds = true;
				this.debug.bodyBounds = !this.debug.bodyBounds;
				if (!this.debug.bodyBounds) {				
					game.debug.stop();
				}
			}			
		} else {
			this.keyboard.debugBounds = false;
		}
		
		if (this.showBackgroundButton.isDown) {
			if (this.keyboard.showBackground==false) {
				this.keyboard.showBackground = true;				
				this.background.visible = !this.background.visible;
			}			
		} else {
			this.keyboard.showBackground = false;
		}

		if (this.scaleButton.isDown) {			
			if (this.keyboard.scale==false) {
				this.keyboard.scale=true;
				if (game.marioState == 0) {					
					game.marioState = 1;										
					this.mario.body.y = this.mario.body.y - 29;
					this.mario.body.setSize(32-this.mario.constants.X_OFFSET, 61, 2, 0);
					this.mario.loadTexture('mario-big', 0);	
				} else if (game.marioState == 1) {					
					game.marioState = 2;																				
					this.mario.loadTexture('mario-big-flower', 0);	
				} else {
					game.marioState = 0;
					this.mario.body.y = this.mario.body.y + 29;
					this.mario.body.setSize(32-this.mario.constants.X_OFFSET, 32, 2, 0);					
					this.mario.loadTexture('mario', 0);
				}
				changeAnimation(this.game, this.mario, this.animations, this.mario.state.currentAnimation);		
			}				
		} else {
			this.keyboard.scale=false;
		}
		
		if (this.nextLevelButton.isDown) {
			if (this.keyboard.nextLevel==false) {
				this.keyboard.nextLevel = true;				
				this.game.levelNumber++;
				this.restartLevel();
			}			
		} else {
			this.keyboard.nextLevel = false;
		}		
		
		this.transfer = false;
		
		/***************************************************************************************/
		/**                                 MARIO MOVE HANDLING                                */
		/***************************************************************************************/	
		
		if (this.mario.growUpAnimating) {						
			if (!this.growUpAnimation.isPlaying) {								
				this.mario.growUpAnimating = false;											
				this.mario.body.allowGravity = true;
				this.mario.body.acceleration.x = this.mario.stateSaved.xAcceleration;
				this.mario.body.acceleration.y = this.mario.stateSaved.yAcceleration;				
				this.mario.body.velocity.x = this.mario.stateSaved.xVelocity;
				this.mario.body.velocity.y = this.mario.stateSaved.yVelocity;
				if (game.marioState == 0) {					
					this.mario.loadTexture('mario', 0);					
					this.mario.body.y = this.mario.body.y + 29;
					this.mario.body.setSize(32-this.mario.constants.X_OFFSET, 32, 2, 0);					
					this.mario.alpha = 0.4;
				} else if (game.marioState == 1) {					
					this.mario.loadTexture('mario-big', 0);					
				} else {					
					this.mario.loadTexture('mario-big-flower', 0);					
				}
				this.enemies.forEach(function(enemy){
					enemy.body.acceleration.x = enemy.stateSaved.xAcceleration;
					enemy.body.acceleration.y = enemy.stateSaved.yAcceleration;
					enemy.body.velocity.x = enemy.stateSaved.xVelocity;					
					enemy.body.velocity.y = enemy.stateSaved.yVelocity;					
					enemy.body.allowGravity = true;			
				}, this);		
			}
		} else if (game.mapFinished) {			
			this.endLevel();
		} else  {	
			
			if (this.mario.alive) {
						
				var xAcceleration = this.accelerationButton.isDown ? this.mario.constants.ACCELERATION_FAST : this.mario.constants.ACCELERATION;
				var xAccelerationMax = this.accelerationButton.isDown ? this.mario.constants.ACCELERATION_FAST_MAX : this.mario.constants.ACCELERATION_MAX;
				
				if (this.fireBalls.length== 1) {
					this.fireBalls.elaspedTime += this.time.elapsed;
				}				
				if (game.marioState==2 && this.accelerationButton.isDown) {					
					if (this.keyboard.fireBall==false) {
						this.keyboard.fireBall=true;						
						if (this.fireBalls.length==0 ||  (this.fireBalls.length<2 && this.fireBalls.elaspedTime>=100)) {
							this.fireBalls.elaspedTime =0;
							var fireBall = game.add.sprite(this.mario.state.orientation == 0 ? this.mario.body.x+16 : this.mario.body.x+16, this.mario.body.y +16, 'fireball');
							fireBall.animations.add('fireball-anim', [0,1,2,3], 20, true);
							fireBall.animations.play('fireball-anim');									
							this.fireBalls.add(fireBall);
							fireBall.body.velocity.x = this.mario.state.orientation == 0 ? -600 : 600;
							fireBall.body.velocity.y = 200;							
							fireBall.body.bounce.x = 1;		
							fireBall.body.mass = 5;		
							//fireBall.body.linearDamping = 1;
							fireBall.body.collideWorldBounds = true;			
							fireBall.body.allowGravity = true;
							fireBall.body.gravity.y = 1600;
						}					
					}			
				} else {
					this.keyboard.fireBall=false;
				}	

				for (var i=0;i<this.elevatorGroup.length;i++) {				
					var elevator = this.elevatorGroup.getAt(i);					
					if ((elevator.direction==-1 && elevator.body.y > elevator.to)
					|| (elevator.direction==1 && elevator.body.y < elevator.to)) {
						 elevator.body.y = elevator.from;
					}
				}
								
				/***************************************************************************************/
				/**                          MARIO INVINCIBILITY AFTER AN ENEMY COLLISION              */
				/***************************************************************************************/
				if (this.mario.invincible && this.mario.invincibleCount<3000) {
					// Mario is invincible during 3 seconds while going from big Mario to small Mario					
					this.mario.invincibleCount+= this.time.elapsed;
					if (this.mario.invincibleCount>=3000) {
						// 3 seconds -> Mario is not invincible anymore
						this.mario.invincible = false;
						this.mario.invincibleCount =0;
						this.mario.alpha = 1;
					}
				}
								
				/***************************************************************************************/
				/**                                   ENEMIES HANDLING                                 */
				/***************************************************************************************/					
				for (var i=0;i<this.enemies.length;i++) {				
					var enemy = this.enemies.getAt(i);
					if (enemy.alive==false && this.mapType==0) {
						// Enemy becomes alive (visible and move) when Mario can see them on the right of the screen					
						enemy.alive = game.camera.x >= enemy.xAlive;					
					}				
					if (enemy.alive) {					
						// Once the enemy is alive, we must move him, check if it's still alive ...
						if (enemy.body.y>=game.height || (this.mapType==0 && (enemy.body.x - game.camera.x) <= -32)) {
							// Enemy is not alive anymore if it falls into a hole of the floor						
							enemy.destroy(true);
						} else if (!enemy.killed) {
							// Enemy is alive, initialize/move the enemy
							if (enemy.enemyType==0 && !enemy.initialized) {
								// Goomba -> move from left to right (and reverse move when colliding a wall)
								awakeGoomba(enemy);
								
							} else if (enemy.enemyType == 1 && !enemy.tween1.isRunning && !enemy.tween2.isRunning)  {								
								movePiranhaPlant(enemy, this.mario.body.x);												
							}	
							// Collisions enemy <-> mario
							game.physics.arcade.overlap(this.mario, enemy, collideEnemy, null, this);				
							// Collisions enemy <-> background
							game.physics.arcade.collide(enemy, this.layer);
						}
					} 				
				}						
				
				/***************************************************************************************/
				/**                                   ITEMS HANDLING                                   */
				/***************************************************************************************/
				for (var i=0;i<this.items.length;i++) {				
					var item = this.items.getAt(i);
					if (item.type==5 && !item.tween.isRunning) {
						// Mushroom collides with layer			
						if (!item.initialized) {							
							item.initialized = true;
							item.body.velocity.x = 100;
							item.body.bounce.x = 1;		
							item.body.bounce.y = 0;		
							item.body.mass = 60;		
							item.body.linearDamping = 1;
							item.body.collideWorldBounds = true;	
							item.body.allowGravity = true;																		
							item.body.gravity.y = 1600;
							item.body.setSize(30, 32, 0, 0);
						}						
						game.physics.arcade.collide(item, this.layer);
					}
				}
				
				/***************************************************************************************/
				/**                                     COLLISIONS                                     */
				/***************************************************************************************/	
				// Collisions enemies <-> ennemies
				for (var i=0;i<this.enemies.length;i++) {
					var enemy1 = this.enemies.getAt(i);
					for (var j=i+1;j<this.enemies.length-1;j++) {
						var enemy2 = this.enemies.getAt(j);
						if (enemy1.alive && enemy2.alive && !enemy1.killed && !enemy2.killed) {
							game.physics.arcade.collide(enemy1, enemy2);
						}
					}
					if (enemy1.alive && !enemy1.killed) {
						// Collisions fireballs <-> enemies
						game.physics.arcade.overlap(enemy1, this.fireBalls, collideFireballs, null, this);			
					}
				}				
				
				// Collisions Mario <-> layer
				game.physics.arcade.collide(this.mario, this.layer);								
				
				// Collisions Mario <-> Items
				game.physics.arcade.overlap(this.mario, this.items, collideItems, null, this);																
				
				// Collisions Mario <-> Plateformes de type elevator
				game.physics.arcade.collide(this.mario, this.elevatorGroup);
				
				if (this.mario.body.touching.left || this.mario.body.touching.right) {
					this.mario.body.velocity.x = 0;
					this.mario.body.acceleration.x = 0;
				}
				var isOnElevator = this.mario.body.touching.down;				
								
				game.physics.arcade.collide(this.fireBalls, this.layer);
				
				for (var i=0;i<this.fireBalls.length;i++) {
					var fireBall = this.fireBalls.getAt(i);
					if (fireBall.body.blocked.right || fireBall.body.blocked.left || fireBall.body.y >=480 || fireBall.body.x >= this.camera.x + 520 || fireBall.body.x <= this.camera.x) {
						fireBall.destroy();
					} else if (fireBall.body.blocked.down) {
						fireBall.body.velocity.y = -300;
					}
				}
								
				var old_x = this.mario.body.x;
				var old_y = this.mario.body.y;			
				
				/***************************************************************************************/
				/**                                 GESTION DU SHIFT JUMP                              */
				/***************************************************************************************/			
				if (this.mario.state.allowShiftJump && this.mario.body.blocked.up && Math.abs(this.mario.body.velocity.x<=20)) {
					// Shift jump case : Mario's head is blocked, and he's not running -> we must allow Mario to continue his jump to the upper block
					var x_tile =  Math.floor((this.mario.x+32)/32);
					var y_tile = Math.floor(this.mario.y/32)-1;							
					var tile = this.map.getTile(x_tile, y_tile, this.layer, true);					
					if (tile.index!=-1) {
						// There's a block on its right
						x_tile =  Math.floor((this.mario.x+22)/32);
						tile = this.map.getTile(x_tile, y_tile, this.layer, true);	
						if (tile.index==-1) {
							// Shift Mario position to the left of the block							
							this.shiftJump.shift = true;
							this.mario.body.x = x_tile * 32;
							this.mario.jumptimer--;
						} else {
							// First time we check the collision -> since we collides, do not allow shift jump for this jump
							this.mario.state.allowShiftJump = false;
						}
					} else {					
						x_tile =  Math.floor((this.mario.x)/32);
						tile = this.map.getTile(x_tile, y_tile, this.layer, true);	
						if (tile.index!=-1) {						
							x_tile =  Math.floor((this.mario.x+10)/32);
							tile = this.map.getTile(x_tile, y_tile, this.layer, true);	
							if (tile.index==-1) {							
								this.shiftJump.shift = true;
								this.mario.body.x = x_tile * 32;
								this.mario.jumptimer--;
							}
						} else {
							// First time we check the collision -> since we collides, do not allow shift jump for this jump
							this.mario.state.allowShiftJump = false;
						}
					}			
				}	
				
				/***************************************************************************************/
				/**                                   JUMP HANDLING                                    */
				/***************************************************************************************/
				if (this.jumpButton.isDown && (this.mario.body.onFloor() || isOnElevator)  && this.mario.state.canJump) {   
					//player is on the ground, so he is allowed to start a jump
					this.mario.body.acceleration.y = 3;
					this.mario.jumptimer = 1;
					this.mario.body.velocity.y = -this.mario.constants.VELOCITY_MAX_Y;
					this.mario.state.canJump = false;
					if (game.marioState==0) {
						this.audio.smallJump.play();
					} else {
						this.audio.superJump.play();
					}
				} else if (this.jumpButton.isDown && (this.mario.jumptimer != 0)) { 
					//player is no longer on the ground, but is still holding the jump key
					if (this.mario.jumptimer > this.mario.constants.JUMP_TIMER_MAX) {
						// player has been holding jump for over 10 frames, it's time to stop him
						this.mario.jumptimer = 0;					
						this.mario.body.acceleration.y = 0;					
					} else { 
						// player is allowed to jump higher (not yet 30 frames of jumping)
						this.mario.body.acceleration.y = this.mario.body.acceleration.y - 0.01;
						this.mario.jumptimer++;
						this.mario.body.velocity.y = -this.mario.constants.VELOCITY_MAX_Y * this.mario.body.acceleration.y;					
					}
				} else if (this.mario.jumptimer != 0) { 
					//reset jumptimer since the player is no longer holding the jump key
					this.mario.body.acceleration.y = 0;
					this.mario.jumptimer = 0;			
				}
				
				/***************************************************************************************/
				/**                          COLLISIONS MARIO <-> UPPER BLOCK                          */
				/***************************************************************************************/			
				if (this.mario.body.blocked.up && this.shiftJump.shift === false) {
						// Collision with a block above Mario's head, define which bloc is collisioning (above, above left, above right)
						this.mario.jumptimer = 0;										
						var x_tile =  Math.floor((this.mario.x)/32);
						var y_tile = Math.floor(this.mario.y/32)-1;
						var tileLeft = this.map.getTile(x_tile, y_tile, this.layer, true);	
						var collisioningTile = tileLeft;
						var tileRight = this.map.getTile(x_tile + 1, y_tile, this.layer, true);	
						if (tileLeft.index==-1) {
							collisioningTile = tileRight;
						} else if (tileLeft.index!=-1 && tileRight.index!=-1) {
							var x_tile =  Math.floor((this.mario.x+16)/32);						
							collisioningTile = this.map.getTile(x_tile, y_tile, this.layer, true);	
						}
						if (collisioningTile.index==7 || collisioningTile.index==8 || collisioningTile.index==4 || collisioningTile.index==64) {
							// Stop the jump
								this.mario.jumptimer = 0;					
								this.mario.body.acceleration.y = 0;					
								this.mario.body.velocity.y = 0;		
							// Block mystery / block wall
							var newMushroomAdded = false;
							var element = null;
							var blockReplacedWith = this.mapWorld==0 ? 5 : 65;
							if (collisioningTile.index==7 || collisioningTile.index==8) {
								// The collisionning block is a mystery block, we look for its corresponding sprite in the transparency group
								var elementFound = false;
								for (var i=0; i< this.transparencyGroup.children.length && !elementFound; i++) {								
									element = this.transparencyGroup.children[i];
									if (element.type ==0 && element.xTile==collisioningTile.x && element.yTile==collisioningTile.y) {
										elementFound = true;			
									}
								}
							} else if ((collisioningTile.index==4 || collisioningTile.index==64) && game.marioState==0) {
								// The collisionning bloc is a wall, add a wall sprite to the transparencyGroup
								element = createBlockWallForAnimation(this.transparencyGroup, collisioningTile.x, collisioningTile.y, collisioningTile.index);							
								blockReplacedWith = collisioningTile.index;
							}
																									
							if (game.marioState>0 && collisioningTile.index!=7 && collisioningTile.index!=8) {
								// Mario is big, this is a wall, explode the wall
								this.audio.breakWall.play();
								this.map.removeTile(collisioningTile.x,collisioningTile.y);
								this.map.removeTile(collisioningTile.x,collisioningTile.y);
								var brokenWall1 = createBrokenWall(collisioningTile.x*32, collisioningTile.y*32, 'brokenWall_'+this.mapEnv+'_1', -200,-300);
								var brokenWall2 = createBrokenWall(collisioningTile.x*32+16, collisioningTile.y*32, 'brokenWall_'+this.mapEnv+'_2', 200,-300);
								var brokenWall3 = createBrokenWall(collisioningTile.x*32, collisioningTile.y*32+16, 'brokenWall_'+this.mapEnv+'_3', -200,-200);
								var brokenWall4 = createBrokenWall(collisioningTile.x*32+16, collisioningTile.y*32+16, 'brokenWall_'+this.mapEnv+'_4', 200,-200);													
								this.transparencyGroup.add(brokenWall1);
								this.transparencyGroup.add(brokenWall2);
								this.transparencyGroup.add(brokenWall3);													
								this.transparencyGroup.add(brokenWall4);
								removeAfterDelay(brokenWall1, 3000);
								removeAfterDelay(brokenWall2, 3000);
								removeAfterDelay(brokenWall3, 3000);
								removeAfterDelay(brokenWall4, 3000);										
							} else {
								// Mystery box or Mario is small
								// Play animation here : collisioning tile will move from up to down fastly
								// 1 - Replace the collisioning tile by an invisible collisioning tile
								this.audio.bump.play();
								element.index = collisioningTile.index;						
								this.map.replace(collisioningTile.index,-1, collisioningTile.x,collisioningTile.y,1,1);
								// Play the animation on the sprite
								var tween1 = game.add.tween(element).to( { y: element.y-12 }, 80, Phaser.Easing.Linear.None);
								var tween2 = game.add.tween(element).to( { y: element.y }, 80, Phaser.Easing.Linear.None);								
								tween1.chain(tween2);
								tween1.start();
								tween2.onComplete.add(function(element) { 
									// 2 - When animation complete, replace invisible tile by a block
									this.map.replace(-1,blockReplacedWith, element.xTile,element.yTile,1,1);
									// 3 - remove the sprite used for the animation
									element.kill();																									
								}, this);
								// Now we must check if a coin / mushroom / Flower has to be generated
								if (element.index==7) {
									// Single coin appears from block
									this.audio.coin.play();
									animateCoinFromBlock(this.items, collisioningTile.x, collisioningTile.y-1);
									game.coins++;
									// And finally check if an enemy is on the block
								} else 	if (element.index==8) {									
									newMushroomAdded = true;
									this.audio.powerUpAppears.play();									
									if (game.marioState==0) {	
										// Mushroom									
										this.items.add(createMushroom(collisioningTile));																			
									} else {
										// Flower										
										this.items.add(createFlower(collisioningTile));		
									}
									
								}
							}

							// Enemis / items handling if an enemi was above the bloc
							for (var i=0;i<this.enemies.length;i++) {				
								var enemy = this.enemies.getAt(i);
								if (enemy.alive && !enemy.killed && isAboveTile(enemy, collisioningTile)) {									
									// Check enemis position
									killEnemy(enemy, -150, -200, 3, true);																													
								} 
							}
							if (!newMushroomAdded) {
								for (var i=0;i<this.items.length;i++) {				
									var item = this.items.getAt(i);
									if (item.type==5 && isAboveTile(item, collisioningTile)) {
										item.body.velocity.y = -250;
										var itemVelocity = Math.abs(item.body.velocity.x);
										item.body.velocity.x = this.mario.state.orientation==0 ? -itemVelocity : itemVelocity;
									} else if (item.type==0 && isAboveTile(item, collisioningTile)) {
										// A coin is just above the bloc, get the coin
										game.coins++;										
										item.destroy();
										this.audio.coin.play();
										animateCoinFromBlock(this.items, collisioningTile.x, collisioningTile.y-1);										
									}
								}
							}
						}
				}						
						
				this.mario.state.jumping = !this.mario.body.onFloor() && !isOnElevator;
				if (!this.mario.state.jumping && !(this.jumpButton.isDown)) {
					this.mario.state.canJump = true;
					this.mario.state.allowShiftJump = true;
				}
				
				var animToStart = -1;
				
				if (this.leftButton.isDown) {	
					this.mario.state.orientation = 0;
					// On se d�place sur la gauche
					if (this.mario.body.blocked.left) {
						// On est bloqu� en allant sur la gauche, stopper l'animation en cours, acceleration devient nulle
						this.mario.animations.stop(null, true);
						this.mario.body.acceleration.x = 0;
						this.mario.state.running = false;
					} else {												
						if (this.mario.state.direction == 1 && this.mario.body.acceleration.x>0) {					
							// On se d�pla�ait vers la droite -> on d�rape en repartant vers la gauche
							if (this.mario.constants.DECCELERATION_SLIDE >= this.mario.body.acceleration.x) {
								this.mario.body.acceleration.x = 0;						
								this.mario.state.sliding = false;
								animToStart = 5;												 					
							} else {						
								this.mario.body.acceleration.x -= this.mario.constants.DECCELERATION_SLIDE;
								animToStart = 9;
								this.mario.state.sliding = true;							
							}					
						} else {
							this.mario.state.running = true;
							animToStart = 5;																	
							this.mario.body.acceleration.x = this.mario.body.acceleration.x + xAcceleration;
							this.mario.body.acceleration.x = this.mario.body.acceleration.x > xAccelerationMax ? xAccelerationMax : this.mario.body.acceleration.x;
							this.mario.state.direction = 0;
							velocity = -150;				
						}					
						this.mario.body.velocity.x = velocity * this.mario.body.acceleration.x;			
					}			
				} else if (this.rightButton.isDown) {	
					this.mario.state.orientation = 1;
					if (this.mario.body.blocked.right) {
						this.mario.animations.stop(null, true);
						this.mario.body.acceleration.x = 0;
						this.mario.state.running = false;
					} else {				
						if (this.mario.state.direction == 0 && this.mario.body.acceleration.x>0) {
							if (this.mario.constants.DECCELERATION_SLIDE >= this.mario.body.acceleration.x) {
								this.mario.body.acceleration.x = 0;
								this.mario.state.sliding = false;
								animToStart = 0;
								this.mario.state.direction = 1 ;
							} else {					
								this.mario.body.acceleration.x -= this.mario.constants.DECCELERATION_SLIDE;						
								animToStart = 4;
								this.mario.state.sliding = true;				
							}			
						} else {
							this.mario.state.running = true;
							animToStart = 0;						
							this.mario.state.direction = 1;
							velocity = 150;	
							this.mario.body.acceleration.x = this.mario.body.acceleration.x + xAcceleration;		
							this.mario.body.acceleration.x = this.mario.body.acceleration.x > xAccelerationMax ? xAccelerationMax : this.mario.body.acceleration.x;		
						}				
						this.mario.body.velocity.x = velocity * this.mario.body.acceleration.x;				
					}
					
				} else {			
					if (this.mario.body.acceleration.x>0) {			
						if (this.mario.constants.DECCELERATION > this.mario.body.acceleration.x) {
							this.mario.body.acceleration.x = 0;					
						} else {
							this.mario.body.acceleration.x -= this.mario.constants.DECCELERATION;			
						}
						if (!this.mario.state.jumping) {
							animToStart = this.mario.state.orientation == 0 ? 5 : 0;							
						}	
					}						
					this.mario.body.velocity.x = 150 * (this.mario.state.direction == 0 ? -this.mario.body.acceleration.x : this.mario.body.acceleration.x); 			
				}	
																	
				if (this.mario.state.jumping) {
					// On est en saut, on change donc l'animation
					if (this.mario.state.orientation == 0) {				
						animToStart = 8;				
					} else {
						animToStart = 3;				
					}			
				}			
						
				if (this.mario.body.acceleration.x==0) {			
					if (!this.mario.state.jumping) {
						animToStart = this.mario.state.orientation == 0 ? 5 : 0;							
					}
					this.mario.state.sliding = false;
					this.mario.animations.stop(null, true);				
					this.mario.state.running = false;
				}
												
				if (animToStart!=-1) {								
					changeAnimation(this.game, this.mario, this.animations, animToStart);
					this.mario.animations.play(this.animations[animToStart]+"-anim");		
				}
				
				if (this.mario.state.currentAnimation==0 || this.mario.state.currentAnimation==1) {			
					this.mario.animations.currentAnim.speed = 10 + this.mario.body.acceleration.x * 5;			
				}
							
				/***************************************************************************************/
				/**                                    CAMERA HANDLING                                 */
				/***************************************************************************************/			
				if (this.shiftJump.shift == true && this.mario.state.falling) {
					this.shiftJump.shift = false;								
				}
													
				// Ne pas aller plus � gauche que ce qui est en cours d'affichage � l'�cran								
				if (this.mario.body.x<game.camera.x) {
					this.mario.body.velocity.x = 0;
					this.mario.body.acceleration.x = 0;
					this.mario.body.x = game.camera.x;
				}
				
				/***************************************************************************************/
				/**                                    MOVE BACKGROUND                                 */
				/***************************************************************************************/
				// D�placement du background qui scrolle en fond (pour un scroll auto, soustraire 0.5 � chaque fois)			
				if (this.shiftJump.shift == false && this.mario.body.x<=this.flag.x) {
					this.background.tilePosition.x -= 0.5 * (this.mario.body.x-this.camera.x>=248 ? this.mario.deltaX :0);
				}
				
				/***************************************************************************************/
				/**                              TRANSPARENCY LAYER HANDLING                            */
				/***************************************************************************************/	
				if (this.mapType==0 && this.transfer==false) {
					for (var i=0;i<this.transparencyGroup.length;i++) {
						// Foreach element of the layer
						var transparencyElement = this.transparencyGroup.getAt(i);
						if (transparencyElement.x - game.camera.x <= -32) {
							// Remove it when it's offscreen on the left
							transparencyElement.destroy();
						}
					}	
				}
				
				/***************************************************************************************/
				/**                                 MARIO'S STATUS UPDATES                             */
				/***************************************************************************************/		
				this.mario.state.falling = (this.mario.y - old_y) < 0;
				if (this.mario.state.falling) {
					constrainVelocity(this.mario, 800);
				}
				if (this.mario.body.y>game.height) {
					this.mario.alive = false;				
				}			
				
				/***************************************************************************************/
				/**                                 MARIO'S DEATH HANDLING                             */
				/***************************************************************************************/
				if (this.mario.alive == false) {
					this.audio.mainTheme.stop();
					this.audio.die.play();
					game.lifes--;
					// Changer l'animation du personnage
					this.mario.animations.stop(null, true);
					changeAnimation(this.game, this.mario, this.animations, 10);				
					this.mario.body.velocity.x = 0;
					this.mario.body.velocity.y = 0;
					this.mario.body.acceleration.x = 0;
					this.mario.body.acceleration.y = 0;
					// Arr�ter la gravit� quelques secondes pour afficher l'animation sans bouger
					this.mario.body.allowGravity = false;
					this.enemies.forEach(function(enemy){	
						// Arr�ter la gravitation des ennemis
						enemy.body.allowGravity = false;
						enemy.body.velocity.x = 0;
						enemy.body.velocity.y = 0;
						enemy.animations.stop(null, true);
						if (enemy.enemyType==1) {
							// Arr�ter l'animation des piranha plant
							if (enemy.tween1.isRunning) {
								enemy.tween1.stop();
							} else if (enemy.tween2.isRunning) {
								enemy.tween2.stop();
							}																		
						}
					}, this);
					this.items.forEach(function(item){
						// Arr�ter l'animation des items
						item.animations.stop(null, true);					
					}, this);										
					// D�marrer l'animation de sa mort (on fait une sorte de saut jusqu'� sortir de l'�cran)
					launchDeathAnimation(this.mario, 1500);				
				}
				
				if (game.mapFinished) {
					this.audio.mainTheme.stop();					
					this.mario.body.acceleration.x = 0;					
					this.mario.body.velocity.x = 0;
					this.mario.body.acceleration.y = 0;					
					this.mario.body.velocity.y = 0;											
					this.mario.animations.stop(null, true);
					this.mario.frame = 11;	
					this.mario.body.allowGravity = false;
				}
				
				if (this.mario.growUp || this.mario.growDown) {
				
					this.mario.stateSaved.xAcceleration = this.mario.body.acceleration.x;
					this.mario.stateSaved.yAcceleration = this.mario.body.acceleration.y;
					this.mario.stateSaved.xVelocity = this.mario.body.velocity.x;
					this.mario.stateSaved.yVelocity = this.mario.body.velocity.y;
					this.mario.body.acceleration.x = 0;
					this.mario.body.acceleration.y = 0;
					this.mario.body.velocity.x = 0;
					this.mario.body.velocity.y = 0;
					this.mario.body.allowGravity = false;			
					this.mario.animations.stop(null, true);						
					
					this.mario.loadTexture(this.mario.state.orientation == 0 ? 'mario-grow-up-left' : 'mario-grow-up-right', 0);				
					if (this.mario.growUp) {						
						this.growUpAnimation = this.mario.animations.play('mario-grow-up-anim');	
						this.mario.body.y = this.mario.body.y - 29;
						this.mario.body.setSize(32-this.mario.constants.X_OFFSET, 61, 2, 0);					
						game.marioState	= 1;	
					} else if (this.mario.growDown) {						
						this.growUpAnimation = this.mario.animations.play('mario-grow-down-anim');							
						game.marioState = 0;
					}
										
					this.mario.growUp = false;
					this.mario.growDown = false;
					this.mario.growUpAnimating = true;
				
					this.enemies.forEach(function(enemy){
						enemy.stateSaved.xAcceleration = enemy.body.acceleration.x;
						enemy.stateSaved.yAcceleration = enemy.body.acceleration.y;
						enemy.stateSaved.xVelocity = enemy.body.velocity.x;
						enemy.stateSaved.yVelocity = enemy.body.velocity.y;
						enemy.body.acceleration.x = 0;
						enemy.body.acceleration.y = 0;
						enemy.body.velocity.x = 0;
						enemy.body.velocity.y = 0;
						enemy.body.allowGravity = false;			
					}, this);		
				}
														
			} else {
				// Action � effectuer apr�s l'animation de la mort
				if (this.mario.body.y>600) {
					// Mario felt in a hole
					if (game.lifes>0) {
						// 1 life a least remaning -> restart level in small state
						game.marioState = 0;
						this.restartLevel();
					} else {
						// Game over screen
					}
				}
			}
		}
		
		
	}
};

