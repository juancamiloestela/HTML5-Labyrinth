/**
 * @author juan camilo estela / http://mecannical.com/
 * 
 * Simple Labyrinth Game made in HTML5
 */
	

// thanks to paul irish
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

    	

(function(){


		var	board = document.getElementById('board');

		var alpha = 0,
			beta = 0,
			gamma = 0,
			position = {
				x: 0,
				y: 0
			};

		var velocity = {
				x: 0,
				y: 0,
				z: 0
			},
			rollingFriction = {
				x: 0.8,
				y: 0.8,
				z: 0.8
			},
			impactFriction = {
				x: 0.5,
				y: 0.5,
				z: 0.5
			},
			calibration = {
				x: 0,
				y: 0,
				z: 0
			}

		var orientation = 'PORTRAIT';
		window.addEventListener('orientationchange', function(e){
			// TODO: handle this stuff to make it work on ipad, 
			// currently you have to lock ipad's rotation
			if (window.orientation == 90 || window.orientation == -90){
				orientation = 'LANDSCAPE';
			}else{
				orientation = 'PORTRAIT';
			}
		});

		window.addEventListener('deviceorientation', function(event) {
			a = (alpha + event.alpha)/2;  // low pass filter
			b = (beta + event.beta)/2;
			g = (gamma + event.gamma)/2;

			alpha = a;
			beta = b;//(orientation == 'PORTRAIT') ? b : g;  
			gamma = g;//(orientation == 'PORTRAIT') ? g : b;
		}, false);

		/* UNUSED window.addEventListener('devicemotion', function(event){
			acceleration = {
				x: event.acceleration.x,
				y: event.acceleration.y,
				z: event.acceleration.z
			};
		}, true);*/

		var x = 30,
			y = 30,
			oldX = 30,
			oldY = 30;

		var ballShadow = 10,
			won = false;

		function renderLoop(){

			velocity.x += (gamma - calibration.x)/10;
			velocity.y += (beta - calibration.y)/10;

			x += (velocity.x * rollingFriction.x)/10;
			y += (velocity.y * rollingFriction.y)/10;

			ball.style.boxShadow = 'inset 0 0 '+ballShadow+'px #000';

			// Board Limits
			if (x < 0){
				x = 0;
				velocity.x *= -1 * impactFriction.x;
			}else if(x > 500 - 25){
				x = 500 - 25;
				velocity.x *= -1 * impactFriction.x;
			}

			if (y < 0){
				y = 0;
				velocity.y *= -1 * impactFriction.y;
			}else if(y > 360 - 25){
				y = 360 - 25;
				velocity.y *= -1 * impactFriction.y;
			}


			var i;

			// iterate walls for collisions
			for (i in level.walls){
				var a = x <= level.walls[i].x + level.walls[i].w,
					b = x+25 >= level.walls[i].x,
					c = y <= level.walls[i].y + level.walls[i].h,
					d = y+25 >= level.walls[i].y;

				level.walls[i].element.style.backgroundColor = '#00aa00';

				var wallCenter = {
					x: level.walls[i].x + level.walls[i].w/2,
					y: level.walls[i].y + level.walls[i].h/2
				}

				var ballCenter = {
					x: x + 12.5,
					y: y + 12.5
				}

				var offset = {
					x: wallCenter.x - ballCenter.x,
					y: wallCenter.y - ballCenter.y
				}

				var minX = (level.walls[i].w + 25)/2,
					minY = (level.walls[i].h + 25)/2;

				if (Math.abs(offset.x) < minX && Math.abs(offset.y) < minY){
					level.walls[i].element.style.backgroundColor = '#ff0000';
					var xy = minX * offset.y,
						yx = minY * offset.x;

					if (xy > yx){
				        if (xy > -yx){
				            // collides with top side
				            velocity.y *= -1 * impactFriction.y;
				            y = level.walls[i].y - 25;
				        }else{
				            // collides with right side
				            velocity.x *= -1 * impactFriction.x;
				            x = level.walls[i].x + level.walls[i].w;
				        }
				    }else{
				        if (xy > -yx){
				            // collides with left side
				            velocity.x *= -1 * impactFriction.x;
				            x = level.walls[i].x - 25;
				        }else{
				            // collides with bottom side
				            velocity.y *= -1 * impactFriction.y;
				            y = level.walls[i].y + level.walls[i].h;
				        }
				    }
				}
				
			}
			

			// iterate holes for collision
			for (i in level.holes){
				var holeCenter = {
					x: level.holes[i].x + 30/2,
					y: level.holes[i].y + 30/2
				}

				var ballCenter = {
					x: x + 12.5,
					y: y + 12.5
				}

				var offset = {
					x: holeCenter.x - ballCenter.x,
					y: holeCenter.y - ballCenter.y
				}

				if (Math.abs(offset.x) < 14 && Math.abs(offset.y) < 14){
					console.log('hole');
					velocity.x += offset.x;
					velocity.y += offset.y;

					if(Math.abs(offset.x) < 8 && Math.abs(offset.y) < 8){
						x = holeCenter.x - 12.5;
						y = holeCenter.y - 12.5;

						ballShadow += 4;

						if (ballShadow > 25){
							if (level.holes[i].isGoal){
								won = true;
							}else{
								x = level.start.x;
								y = level.start.y;
								ballShadow = 10;
								velocity.x = 0;
								velocity.y = 0;
							}
						}
					}
				}
			}


			// grandpa x and grandma y
			oldX = x;
			oldY = y;

			ball.style.webkitTransform = 'translate3d(' + x + 'px,' + y + 'px,0)';
			if (!won){
				window.requestAnimFrame(renderLoop);
			}			
		}
		
		var samples = 50,
			n = 0;
		function calibrate(){

			if (calibration.x == 0 && calibration.y == 0){
				calibration.x = gamma;
				calibration.y = beta;
			}else{
				calibration.x = (calibration.x + gamma)/2;
				calibration.y = (calibration.y + beta)/2;
			}

			if (n < samples){
				setTimeout(calibrate,10);
				n++;
			}else{
				console.log('calibration values',calibration);
				renderLoop();
			}
		}

		var level = {
    		'name':' level 1 name',
    		'pointsRequired': 0,
    		'difficulty': 1,
    		'time': 1000,
    		'start': {
    			x: 40,
    			y: 320
    		},
    		'walls': [
    			{x: 240,y: 0,w: 20,h: 300},
    			{x: 260,y: 280,w: 140,h: 20},
    			{x: 400,y: 140,w: 20,h: 160},
    			{x: 360,y: 140,w: 40,h: 20},
    			{x: 320,y: 80,w: 180,h: 20},
    			{x: 300,y: 60,w: 20,h: 120},
    			{x: 180,y: 140,w: 60,h: 20},
    			{x: 60,y: 80,w: 140,h: 20},
    			{x: 60,y: 100,w: 20,h: 120},
    			{x: 60,y: 220,w: 120,h: 20},
    			{x: 100,y: 240,w: 20,h: 120}
    		],
    		'holes': [
    			{x: 65,y: 245},
    			{x: 5,y: 285},
    			{x: 28,y: 160},
    			{x: 5,y: 5},
    			{x: 205,y: 5},
    			{x: 85,y: 105},
    			{x: 85,y: 185},
    			{x: 205,y: 275},
    			{x: 125,y: 325},
    			{x: 285,y: 305},
    			{x: 465,y: 305},
    			{x: 425,y: 205},
    			{x: 465,y: 105},
    			{x: 345,y: 245},
    			{x: 265,y: 245},
    			{x: 295,y: 25},
    			{x: 465,y: 5},
    			{x: 465,y: 45, isGoal: true}
    		]
    	};

		function loadLevel(level){
			var i;
			// draw holes
			for (i in level.holes){
				var hole = level.holes[i];
				var domHole = document.createElement('div');
				if (hole.isGoal){
					domHole.className = 'goal';
				}else{
					domHole.className = 'hole';
				}
				domHole.style.webkitTransform = 'translate3d('+hole.x+'px,'+hole.y+'px,0)';
				board.appendChild(domHole);
			}

			// draw walls
			for (i in level.walls){
				var wall = level.walls[i];
				var domWall = document.createElement('div');
				domWall.className = 'wall';
				domWall.innerText = i;
				domWall.style.width = wall.w + 'px';
				domWall.style.height = wall.h + 'px';
				domWall.style.webkitTransform = 'translate3d('+wall.x+'px,'+wall.y+'px,0)';
				board.appendChild(domWall);
				level.walls[i].element = domWall;
			}

			// draw start marker
			start = document.createElement('div');
			start.className = 'start';
			start.style.webkitTransform = 'translate3d('+level.start.x+'px,'+level.start.y+'px,0)';
			board.appendChild(start);

			// draw ball
			ball = document.createElement('div');
			ball.className = 'ball';
			ball.style.webkitTransform = 'translate3d('+level.start.x+'px,'+level.start.y+'px,0)';
			x = level.start.x;
			y = level.start.y;
			oldX = x;
			oldY = y;
			board.appendChild(ball);
		}

		// init
		(function(){
			loadLevel(level);
			calibrate();
		})();

})();