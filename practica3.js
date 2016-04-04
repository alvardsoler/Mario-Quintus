window.addEventListener("load",function() {
	var Q = window.Q = Quintus().include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX")
	.setup(  {
    width: 320,  // width of created canvas
    height: 420, // height of created canvas
    maximize: false // set to true to maximize to screen, "touch" to maximize on touch devices
   }).controls().touch();
	

	Q.loadTMX("level.tmx", function(){
		Q.load("mario_small.png, mario_small.json, goomba.png, goomba.json, bloopa.png, bloopa.json", function(){
			Q.compileSheets("mario_small.png", "mario_small.json");
			Q.compileSheets("goomba.png", "goomba.json");
			Q.compileSheets("bloopa.png", "bloopa.json");
			Q.stageScene("level1");
		});

		
	});
		
	Q.scene("level1", function(stage){
		Q.stageTMX("level.tmx", stage);				
		var mario = stage.insert(new Q.Mario());
		stage.add("viewport").follow(mario);
		stage.viewport.offsetX = -120;
		stage.viewport.offsetY = 130;
		stage.insert(new Q.Bloopa());
	});

	Q.Sprite.extend("Mario", {
		init: function(p){
			this._super(p, {
				sheet: "marioR",	
				frames: 2,							
				x: 150,
				y: 380
			});
			this.add("2d, platformerControls, animation, tween");			
		},
		step: function(dt){
			if (this.p.y > 700)
				this.death();
			if (Q.inputs["fire"]){
				console.log("x: " + this.p.x + " y: " + this.p.y);
			}
		},

		death: function(){
			this.p.x = 150;
			this.p.y = 380;
		}
	});

	Q.Sprite.extend("Goomba", {
		init: function(p){
			this._super(p, {
				sheet: "goomba",	
				frames: 2,							
				x: 300,
				y: 380,
				vx: 100
			});
			this.add("2d, aiBounce");			
			this.on("bump.left, bump.right, bump.bottom", function(collision){
				if(collision.obj.isA("Mario")){
					collision.obj.destroy();				
				}
			});
			this.on("bump.top", function(collision){
				if(collision.obj.isA("Mario")){
					this.destroy();
				}
			});
		}
		
	});

	Q.Sprite.extend("Bloopa", {
		init: function(p){
			this._super(p, {
				sheet: "bloopa",	
				frames: 2,							
				x: 300,
				y: 528,
				vy: -150
			});

			this.add("2d");			
			this.on("bump.left, bump.right, bump.bottom", function(collision){
				if(collision.obj.isA("Mario")){
					collision.obj.destroy();				
				}
			});
			this.on("bump.top", function(collision){
				if(collision.obj.isA("Mario")){
					this.destroy();
				}
			});
		},

		step: function(dt){
			if (this.p.vy == 0) 
				this.p.vy = -150;

			this.p.vy -= dt * 9.8;
			this.p.y += this.p.vy * dt;		
		}

		
	});

});
