Mario.Preloader = function(game){
	// define width and height of the game
	Mario.GAME_WIDTH = 520;
	Mario.GAME_HEIGHT = 480;		
	game.coins = 0;
	game.lifes = 3;
	game.marioState = 0;
	game.worldNumber = 1;
	game.levelNumber = 1;
};
Mario.Preloader.prototype = {
	preload: function(){
			
		// Set background color and preload image
		//this.stage.backgroundColor = '#B4D9E7';
		this.preloadBar = this.add.sprite((Mario.GAME_WIDTH-311)/2, (Mario.GAME_HEIGHT-27)/2, 'preloaderBar');
		this.load.setPreloadSprite(this.preloadBar);
		
		// Load spritesheets
		this.load.spritesheet('mario', 'assets/images/mario.gif', 32, 32);	
		this.load.spritesheet('mario-big', 'assets/images/mario-big.png', 32, 61);	
		this.load.spritesheet('mario-big-flower', 'assets/images/mario-big-flower.png', 32, 61);			
		this.load.spritesheet('mario-grow-up-left', 'assets/images/mario-grow-up-left.png', 32, 61);	
		this.load.spritesheet('mario-grow-up-right', 'assets/images/mario-grow-up-right.png', 32, 61);	

				
		// Tilemap
		this.load.tilemap('level_1_1', 'assets/tilemaps/level_1_1.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('level_1_2', 'assets/tilemaps/level_1_2.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.image('tiles', 'assets/tilemaps/tileset.png');		
		
		// Items
		this.load.spritesheet('coin', 'assets/images/items/coin.png', 28, 32);
		this.load.spritesheet('mystery', 'assets/images/items/mystery.png', 32, 32);
		this.load.spritesheet('pipe', 'assets/images/items/pipe.png', 64, 64);
		this.load.image('transfer', 'assets/images/items/transfer.png',8, 8);
		this.load.image('wall-4', 'assets/images/items/wall-4.png', 64, 64);
		this.load.image('wall-64', 'assets/images/items/wall-64.png', 64, 64);
		this.load.spritesheet('flag', 'assets/images/items/flag.png', 32, 32);
		this.load.image('flag-stick', 'assets/images/items/flag_stick.png', 5, 32);
		this.load.spritesheet('mushroom', 'assets/images/items/mushroom.png', 32, 32);
		this.load.spritesheet('flower', 'assets/images/items/flower.png', 32, 32);
		this.load.image("elevator", "assets/images/items/elevator.png");
		
		// Ennemies
		this.load.spritesheet('goomba', 'assets/images/enemies/goomba.png', 32, 32);
		this.load.spritesheet('piranhaPlant', 'assets/images/enemies/plant_piranha.png', 32, 50);
		
		// Effects
		this.load.spritesheet('coin-explosion', 'assets/images/effects/coin_explosion.png', 40, 32);
		this.load.spritesheet('firework-yellow', 'assets/images/effects/firework_yellow.png', 32, 32);
		this.load.spritesheet('firework-pink', 'assets/images/effects/firework_pink.png', 32, 32);
		this.load.spritesheet('firework-purple', 'assets/images/effects/firework_purple.png', 32, 32);
		this.load.spritesheet('firework-red', 'assets/images/effects/firework_red.png', 32, 32);		
		this.load.image("transparency-castle-wall", "assets/images/effects/transparency_castle_wall.png");		
		this.load.spritesheet('fireball', 'assets/images/effects/fireball.png', 16, 16);
		this.load.image("brokenWall_0_1", "assets/images/effects/brokenWall_0_1.png");
		this.load.image("brokenWall_0_2", "assets/images/effects/brokenWall_0_2.png");
		this.load.image("brokenWall_0_3", "assets/images/effects/brokenWall_0_3.png");
		this.load.image("brokenWall_0_4", "assets/images/effects/brokenWall_0_4.png");
		this.load.image("brokenWall_1_1", "assets/images/effects/brokenWall_1_1.png");
		this.load.image("brokenWall_1_2", "assets/images/effects/brokenWall_1_2.png");
		this.load.image("brokenWall_1_3", "assets/images/effects/brokenWall_1_3.png");
		this.load.image("brokenWall_1_4", "assets/images/effects/brokenWall_1_4.png");
		
		// Misc				
		this.load.spritesheet('backgrounds', 'assets/images/backgrounds/backgrounds.png', 512, 480);
		this.load.image("background_overworld", "assets/images/backgrounds/clouds.gif");
		this.load.image("background_underworld", "assets/images/backgrounds/underworld.png");					
		
		// Fonts
		this.load.bitmapFont('font', 'assets/fonts/mario256/font.png', 'assets/fonts/mario256/font.fnt');	

		// Audio
		this.load.audio('audio-main-theme', ['assets/audio/main_theme.ogg']);
		this.load.audio('audio-die', ['assets/audio/smb_mariodie.ogg']);
		this.load.audio('audio-kick', ['assets/audio/smb_kick.ogg']);
		this.load.audio('audio-powerup', ['assets/audio/smb_powerup.ogg']);				
		this.load.audio('audio-powerup-appears', ['assets/audio/smb_powerup_appears.ogg']);				
		this.load.audio('audio-jump-small', ['assets/audio/smb_jump-small.ogg']);
		this.load.audio('audio-jump-super', ['assets/audio/smb_jump-super.ogg']);
		this.load.audio('audio-break-block', ['assets/audio/smb_breakblock.ogg']);
		this.load.audio('audio-bump', ['assets/audio/smb_bump.ogg']);
		this.load.audio('audio-stage-clear', ['assets/audio/smb_stage_clear.ogg']);
		this.load.audio('audio-flag-pole', ['assets/audio/smb_flagpole.ogg']);
		this.load.audio('audio-fireworks', ['assets/audio/smb_fireworks.ogg']);
		this.load.audio('audio-coin', ['assets/audio/smb_coin.ogg']);
		this.load.audio('audio-pipe', ['assets/audio/smb_pipe.ogg']);
		

	},
	create: function(){
		// start the Game state
		this.state.start('Game');
	}
};