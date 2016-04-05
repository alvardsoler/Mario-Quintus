window.addEventListener("load",function() {
	var Q = window.Q = Quintus().include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX")
	.setup(  {
    width: 320,  // width of created canvas
    height: 420, // height of created canvas
    maximize: false // set to true to maximize to screen, "touch" to maximize on touch devices
   }).controls().touch();
	

	Q.animations("mario_anim",{ //Animations for Mario
		run: {frames: [0,1,2], rate: 1/10},
		stand: { frames: [0], rate: 1/50 },
		jump: { frames: [0], rate: 1/50, loop: false}
	});

	Q.animations("goomba_anim",{ //Animations for Mario		
		move: { frames: [0,1], rate: 1/50 },
		die: { frames: [2], rate: 1/50, loop: false, trigger: "death_event"}
	});
	
	Q.animations("bloopa_anim",{ //Animations for Mario		
		move: { frames: [0,1], rate: 1/50 },
		die: { frames: [2], rate: 1/50, loop: false, trigger: "death_event"}
	});

	

	Q.loadTMX("level.tmx", function(){
		Q.load("mario_small.png, mario_small.json, goomba.png, goomba.json, bloopa.png, bloopa.json, princess.png, mainTitle.png", function(){
			Q.compileSheets("mario_small.png", "mario_small.json");
			Q.compileSheets("goomba.png", "goomba.json");
			Q.compileSheets("bloopa.png", "bloopa.json");
			Q.stageScene("mainTitle");
		});

		
	});

	Q.scene("mainTitle", function(stage){
	var container = stage.insert(new Q.UI.Container({
			x: Q.width/2, y: Q.height/2
		}));

		//Button
		var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
		asset: "mainTitle.png" }))

		button.on("click", function(){
			Q.clearStages();
			Q.stageScene("level1");
		})



	});

	Q.scene("endGame", function(stage){
		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
		}));
		var button = container.insert(new Q.UI.Button({x: 0, y:0, fill: "#CCCCCC", label: "Play Again"}));
		var label = container.insert(new Q.UI.Text({x:10, y:-10 - button.p.h, label:stage.options.label}));

		button.on("click", function(){
			Q.clearStages();
			Q.stageScene("level1");
		});

		container.fit(20);
	});

	Q.scene("winGame", function(stage){
		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
		}));
		var button = container.insert(new Q.UI.Button({x: 0, y:0, fill: "#CCCCCC", label: "Play Again"}));
		var label = container.insert(new Q.UI.Text({x:10, y:-10 - button.p.h, label:stage.options.label}));

		button.on("click", function(){
			Q.clearStages();
			Q.stageScene("level1");
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
		stage.insert(new Q.Princess({x: 1990, y: 380}));

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

	        if (this.p.death){
	        	this.p.sheet = "marioDie";
	        	this.p.vx = 0;this.p.vy = 0;

	        	this.animate({y: this.p.y - 50},0.5, Q.Easing.Linear, {callback: function(){ 
	        		// La animación que "lanza" mario hacia arriba	        		
	        		this.destroy();
					Q.stageScene("endGame",1, {label: "You died"});			

	        	}});
	        }

			if (this.p.y > 700){
					this.destroy();
					Q.stageScene("endGame",1, {label: "You died"});
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

 /* Enemies */

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
					Q.stageScene("endGame",1, {label: "You died"});
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
				vy: -100
			});

			this.add("2d");			
			this.on("bump.left, bump.right, bump.bottom", function(collision){
				if(collision.obj.isA("Mario")){
					collision.obj.p.death = true;					
				//	collision.obj.destroy();				
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
				this.p.vy = -100;

			this.p.vy -= dt * 8;
			this.p.y += this.p.vy * dt;		
		}

		
	});

});
