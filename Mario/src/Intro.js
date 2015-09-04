Mario.Intro = function(game){
	
	this.backgroundGroup;
	this.background;
	
	this.mario;
	
	this.startButton;	
	
};
Mario.Intro.prototype = {
	/**************************************************************************************************************************************************************************/
	/**                                                                       CREATE METHOD                                                                                   */
	/**************************************************************************************************************************************************************************/	
	create: function(game){
	
		function createMysteryBloc(game, x,y) {
			var mystery = game.add.sprite(x*32, y*32, 'mystery');
			mystery.type = 0;
			mystery.xTile = x;
			mystery.yTile = y;
			mystery.animations.add('myster-anim', [0,1,2,3], 10, true);
			mystery.animations.play('myster-anim');
			return mystery;
		}
		
		function createGoomba(game, x,y) {				
			var goomba = game.add.sprite(x*32, y*32, 'goomba');
			goomba.animations.add('goomba-anim', [0,1], 6, true);
			goomba.animations.play('goomba-anim');									
			return goomba;
		}	
		
		function createCoin(game, x, y) {
			var coin = game.add.sprite(x*32, y*32, 'coin');						
			coin.animations.add('spin', [0, 1, 2, 3], 10, true);
			coin.animations.play('spin');											
			return coin;
		}
		
		function createMushroom(xTile, yTile) {
			var mushroom = game.add.sprite(xTile*32, yTile*32, 'mushroom');									
			mushroom.initialized = false;			
			mushroom.type = 5;			
			mushroom.tween = game.add.tween(mushroom).to( { y: (yTile-1)*32}, 500, Phaser.Easing.Linear.None);											
			mushroom.tween.start();			
			return mushroom;
		}
		
		function createFlower(xTile, yTile) {
			var flower = game.add.sprite(xTile*32, yTile*32, 'flower');									
			flower.animations.add('flower-anim', [0,1,2,3], 15, true);
			flower.animations.play('flower-anim');
			flower.initialized = false;			
			flower.type = 6;			
			flower.tween = game.add.tween(flower).to( { y: (yTile-1)*32}, 500, Phaser.Easing.Linear.None);											
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
		
		function removeAfterDelay(sprite, delay) {
			game.time.events.add(delay, function() {
			sprite.destroy();
		  }, this);
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
	
		this.startButton = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);		
				
		game.physics.startSystem(Phaser.Physics.ARCADE);
		
		this.backgroundGroup = game.add.group();	
		this.background = game.add.tileSprite(0, 0, game.width, game.height, 'backgrounds');		
		this.background.frame = 0;
		this.background.fixedToCamera = true;
		this.backgroundGroup.add(this.background);
				
		this.map = game.add.tilemap('level_1_1');
		this.map.addTilesetImage('Tileset', 'tiles');		
		this.map.setCollisionBetween(0, 200);		
		this.layer = this.map.createLayer('world');		
		this.layer.resizeWorld();			
		
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

		game.add.sprite(128, 416, 'mario-big');		
		game.add.sprite(128, 416, 'mario-big-flower');		
		this.mario = game.add.sprite(128, 416, 'mario');		
		this.mario.animations.add('mario-right-anim', [0,1,2], 18, true);
		this.mario.animations.add('mario-jump-right-anim', [3]);
		this.mario.animations.play('mario-right-anim');						
		game.physics.enable(this.mario);
		this.mario.body.mass = 60;
		this.mario.body.allowGravity = true;
		this.mario.body.gravity.y = 1600;
		
		// Special elements - Mystery box
		for (var y=0; y< this.map.height; y++) {
			for (var x=0; x < this.map.width; x++) {
				var tile = this.map.getTile(x,y);
				if (tile!=null && tile!=undefined && (tile.index==7 || tile.index==8)) {										
					this.transparencyGroup.add(createMysteryBloc(game, x, y));					
				}				
			}
		}
		
		this.enemies.add(createGoomba(game, 20,13));				
		this.items.add(createMushroom(21,10));
		this.items.add(createCoin(game, 22,9));		
		this.items.add(createFlower(23, 10));		
		createBlockWallForAnimation(this.transparencyGroup, 20, 10, 4);
		createBlockWallForAnimation(this.transparencyGroup, 20, 10, 4);
		animateCoinFromBlock(this.transparencyGroup, 22, 9);
		this.items.add(game.add.sprite(10*32, 10*32, 'flag-stick')); 
		
		this.marioGroup.add(this.mario);
				
		game.camera.follow(this.mario);
		
		// set event listener for the user's action (start key entered)
		this.startButton.onDown.add(function(){			
			this.state.start('Game');		
		}, this);		
	},				
	/**************************************************************************************************************************************************************************/
	/**                                                                          RENDER METHOD                                                                                */
	/**************************************************************************************************************************************************************************/
	render: function(game) {			
		//game.debug.bodyInfo(this.mario, 32, this.game.width/2);							
	},
	/**************************************************************************************************************************************************************************/
	/**                                                                          UPDATE METHOD                                                                                */
	/**************************************************************************************************************************************************************************/
	update: function(game){	
			
		game.physics.arcade.collide(this.mario, this.layer);
		
		if (this.mario.body.x>=6528) {
			this.mario.body.velocity.x = 0;					
			this.mario.body.acceleration.x = 0;					
			this.mario.animations.stop(null, true);		
			this.mario.frame=13;
		} else {
			if (this.mario.body.onFloor() && this.mario.body.y==416 || this.mario.body.y==288) {
				var tile = this.map.getTile(Math.floor(this.mario.body.x/32),Math.floor(this.mario.body.y/32)+1);
				if (tile!=undefined && tile!=null && (tile.index==3 || tile.index==6)) {
					this.mario.body.velocity.y = -650;		
				}
			}
		
			if (this.mario.body.blocked.right) {
				this.mario.body.velocity.y = -300;		
			} else {
				this.mario.body.velocity.x = 150;					
				this.background.tilePosition.x -= 0.5 * this.mario.deltaX;		
			}	

			if (this.mario.body.onFloor()) {
				this.mario.animations.play('mario-right-anim');
			} else {
				this.mario.animations.play('mario-jump-right-anim');
			}
		}
		
		
	}
};

