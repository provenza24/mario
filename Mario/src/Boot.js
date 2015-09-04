var Mario = {};
Mario.Boot = function(game){};
Mario.Boot.prototype = {
	preload: function(){
		// preload the loading indicator first before anything else
		this.load.image('preloaderBar', 'assets/images/loading-bar.png');
	},
	create: function(){
		// set scale options		
		this.input.maxPointers = 1;
		this.scale.scaleMode = Phaser.ScaleManager.NO_SCALE ; //SHOW_ALL, NO_SCALE		
		this.scale.fullScreenScaleMode = Phaser.ScaleManager.NO_SCALE ; //SHOW_ALL, NO_SCALE		
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = false;
		this.scale.setScreenSize(true);
		
		// start the Preloader state
		this.state.start('Preloader');		
	}
};