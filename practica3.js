window.addEventListener("load",function() {
	var Q = window.Q = Quintus({audioSupported: ["ogg", "mp3"]}).include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")
	.enableSound()
	.setup(  {
    width: 320,  // width of created canvas
    height: 420, // height of created canvas
    maximize: false // set to true to maximize to screen, "touch" to maximize on touch devices
   }).controls().touch();
	
	Q.load(["coin.ogg", "music_die.ogg", "music_level_complete.ogg", "music_main.ogg"], function(){

	});

	Q.animations("mario_anim",{ //Animations for Mario
		run: {frames: [0,1,2], rate: 1/10},
		stand: { frames: [0], rate: 1/50 },
		jump: { frames: [0], rate: 1/50, loop: false}
	});

	Q.animations("goomba_anim",{ //Animations for Goomba
		move: { frames: [0,1], rate: 1/50 },
		die: { frames: [2], rate: 1/50, loop: false, trigger: "death_event"}
	});

	Q.animations("bloopa_anim",{ //Animations for Bloopa	
		move: { frames: [0,1], rate: 1/50 },
		die: { frames: [2], rate: 1/50, loop: false, trigger: "death_event"}
	});

	

	Q.loadTMX("level.tmx", function(){
		Q.load("mario_small.png, mario_small.json, goomba.png, goomba.json, bloopa.png, bloopa.json, princess.png, mainTitle.png, coin.png, coin.json", function(){
			Q.compileSheets("mario_small.png", "mario_small.json");
			Q.compileSheets("goomba.png", "goomba.json");
			Q.compileSheets("bloopa.png", "bloopa.json");
			Q.compileSheets("coin.png", "coin.json");
			Q.stageScene("mainTitle");
		});

		
	});
	var StartLevel1 = function(){
		Q.clearStages();
		Q.audio.stop();
		Q.stageScene("level1");
		Q.stageScene("HUD", 1);
		Q.audio.play("music_main.ogg", {loop: true});
	};

	Q.scene("mainTitle", function(stage){
	var container = stage.insert(new Q.UI.Container({
			x: Q.width/2, y: Q.height/2
		}));

		Q.state.set("points", 0);
		Q.state.set("lifes", 3);

		//Button
		var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
		asset: "mainTitle.png" }))

		button.on("click", function(){
			StartLevel1();
		});
		Q.input.on("confirm",this,function(){
			StartLevel1();
		});

	});

	Q.scene("endGame", function(stage){
		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
		}));
		Q.state.set("points", 0);
		Q.state.set("lifes", 3);

		var button = container.insert(new Q.UI.Button({x: 0, y:0, fill: "#CCCCCC", label: "Play Again"}));
		var label = container.insert(new Q.UI.Text({x:10, y:-10 - button.p.h, label:stage.options.label}));

		button.on("click", function(){
			StartLevel1();
		});
		Q.input.on("confirm",this,function(){
			StartLevel1();
		});

		container.fit(20);

	});

	Q.scene("winGame", function(stage){
		Q.audio.stop();
		Q.audio.play("music_level_complete.ogg");
		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
		}));
		var button = container.insert(new Q.UI.Button({x: 0, y:0, fill: "#CCCCCC", label: "Play Again"}));
		var label = container.insert(new Q.UI.Text({x:10, y:-10 - button.p.h, label:stage.options.label}));

		button.on("click", function(){
			StartLevel1();
		});

		container.fit(20);
	});	

	Q.scene("level1", function(stage){
		Q.stageTMX("level.tmx", stage);				
		var mario = stage.insert(new Q.Mario());
		
		stage.add("viewport").follow(mario);
		stage.viewport.offsetX = -120;
		stage.viewport.offsetY = 130;
		stage.insert(new Q.Goomba({x:1595, y: 380}));
		stage.insert(new Q.Goomba({x:1655, y: 380}));
		stage.insert(new Q.Bloopa({x:1167, y: 380}));
		stage.insert(new Q.Bloopa({x:765, y: 380}));
		stage.insert(new Q.Coin({x: 350, y: 500}));
		stage.insert(new Q.Princess({x: 1990, y: 380}));
	});

	Q.scene("HUD", function(stage){
		var container = stage.insert(new Q.UI.Container({x: 0, y: 0}));
		var points = container.insert(new Q.Score());
		var lifes = container.insert(new Q.Lifes());

	});

	/* UI */

	Q.UI.Text.extend("Score", {
		init: function(p){
			this._super({label: "Score: " + Q.state.p.points, x: 70, y: 0});

			Q.state.on("change.points", this, "points");
		},
		points: function(points){
			this.p.label = "Score: " + points;
		}
	});

	Q.UI.Text.extend("Lifes", {
		init: function(p){
			this._super({label: "Lifes: " + Q.state.p.lifes, x: Q.width-70, y: 0});

			Q.state.on("change.lifes", this, "lifes");
		},
		lifes: function(lifes){
			this.p.label = "Lifes: " + lifes;
		}
	});


	Q.Sprite.extend("Mario", {
		init: function(p){
			this._super(p, {
				sheet: "marioR", // Setting a sprite sheet sets sprite width and height
				sprite: "mario_anim",
				frame:0,
				x: 150,
				y: 380,
				jumpSpeed: -500,
				jumped: false
			});
			this.add("2d, platformerControls, animation, tween");			
			this.on("jump",this, function(){
				if (!this.p.jumped){
					// sonido
					this.p.jumped = true;
				}
			});

			this.on("jumped", this, function(){
				this.p.jumped = false;
			});
		},
		death: function(){
			this.p.death = true;			
		},
		step: function(dt){
			 if(this.p.vx > 0) { // derecha
	          if(this.p.landed > 0) {
	          	this.p.sheet = "marioR";
	            this.play("run");
	          } else {
	            this.p.sheet = "marioJumpR";
	            this.play("jump");
	          }

	          this.p.direction = "right";
	        } else if(this.p.vx < 0) {

	          if(this.p.landed > 0) {
	            this.p.sheet = "marioL";
	            this.play("run");
	          } else {
	           	this.p.sheet = "marioJumpL";
	            this.play("jump");
	          }

	          this.p.direction = "left";
	        } else {

	          if(this.p.direction == "right"){
	          	this.p.sheet = "marioR";
	            this.play("stand");
	          }else{
	          	this.p.sheet = "marioL";
	            this.play("stand");
	          }
	        }

	        if(this.p.vy != 0){
	          if(this.p.direction == "right"){
	          	this.p.sheet = "marioJumpR";
	            this.play("jump");
	          }
	          else{
	          	this.p.sheet = "marioJumpL";
	            this.play("jump");
	          }
	        }

	        if (this.p.death && !this.p.dead){
	        	this.p.sheet = "marioDie";
	        	this.p.dead = true;
	        	this.p.vx = 0;this.p.vy = 0;      	
	        	Q.audio.stop("music_main.ogg");
	        	Q.audio.play("music_die.ogg");
	        	this.animate({y: this.p.y - 50},0.5, Q.Easing.Linear, {callback: function(){ 
	        		// La animación que "lanza" mario hacia arriba	        		
	        		this.destroy();
	        		Q.state.dec("lifes",1);
	        		if (Q.state.p.lifes <= 0)
						Q.stageScene("endGame",1, {label: "You died"});			
					else
						StartLevel1();

	        	}});
	        }

			if (this.p.y > 700){
					this.destroy();
	        	Q.state.dec("lifes",1);
	        	if (Q.state.p.lifes <= 0)
					Q.stageScene("endGame",1, {label: "You died"});			
				else
					StartLevel1();			
			}
					
			if (Q.inputs["fire"]){
				console.log("x: " + this.p.x + " y: " + this.p.y);
			}
		}				
	});

	Q.Sprite.extend("Princess", {
		init: function(p){
			this._super(p, {
				asset: "princess.png"								
			});
			this.add("2d");

			this.on("hit", function(collision){
				if (collision.obj.isA("Mario")){
					this.trigger("win");
				}
			});
			
			this.on("win", function(){				
				Q.stageScene("winGame", 1, {label: "You win!"});
			});
			
		}

		
	});

	Q.Sprite.extend("Coin", {
		init: function(p){
			this._super(p, {
				sheet: "coin",
				z: -1,
				hit: false,
				angle: 0,
				sensor: true,
				frame: 0
			});

			this.add("tween");

			this.on("hit", function(collision){
				if (collision.obj.isA("Mario") && !this.p.hit){
					this.p.hit = true;
					Q.state.inc("points", 100);
					Q.audio.play("coin.ogg");
					this.animate({y: this.p.y -50, angle: 360 }, 0.3, Q.Easing.Linear, {callback: function(){
						this.destroy();
					}});
				}
			});
		}
	});
 /* Enemies */

	Q.Sprite.extend("Goomba", {
		init: function(p){
			this._super(p, {
				sheet: "goomba",
				sprite: "goomba_anim",	
				frame: 0,								
				vx: 100
			});
			this.add("2d, aiBounce, animation, enemy");
			
		}
		
	});

	Q.Sprite.extend("Bloopa", {
		init: function(p){
			this._super(p, {
				sheet: "bloopa",	
				sprite: "bloopa_anim",
				frame: 0,							
				x: 300,
				y: 528,
				vy: -100
			});

			this.add("2d, animation, enemy");	
			this.on("hit", function(collision){
				if(!collision.obj.isA("Mario")){					
					this.p.vy = -500;					
				}
			});				
		}
		
	});

	Q.component("enemy", {
		added: function() {
			this.entity.play("move");

			this.entity.on("bump.top", function(collision){
				if(collision.obj.isA("Mario")){
					// add points
					Q.state.inc("points", 10);
					//animation
					this.play("die");
					//sonido

					//move enemy
					this.p.vy = -300;
				}
			});

			this.entity.on("bump.left, bump.right, bump.bottom", function(collision){
				if(collision.obj.isA("Mario")){
					collision.obj.death();		
				}
			});

			this.entity.on("death_event", this, function(){
				// its called after animation
				this.entity.destroy();
			});
		}
	})

});
