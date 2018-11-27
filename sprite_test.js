// load sprite image
var krickiImage = new Image();
var krickiImageL = new Image();
var ground_test_image = new Image();
var ground_test_image2 = new Image();
var sky_sun_image = new Image();
var cloud1_image = new Image();
var cloud2_image = new Image();
var cloud3_image = new Image();
var ufoImage = new Image();
var loading_screen = new Image();
var bug_image = new Image();
var bug_text_image = new Image();
var kricki_roll_r_image = new Image();
var kricki_roll_l_image = new Image();
var frame_image = new Image();
var bar_image = new Image();
var kr_bar_image = new Image();
var prog_text_image = new Image();

// define sprite object
function player (options) {
	
	var that = {};
	that.context = options.context;
	that.width = options.width;
	that.height = options.height;
	that.image = options.imager;
	var frameIndex = 0;
	var stateIndex = options.stateIndex || 0;
	var tickCount = 0;
	var ticksPerFrame = 6;
	var numberOfFrames = options.numberOfFrames || 1;
	var numberOfStates = options.numberOfStates || 1;
	var deg_row_ind = 0;
	var deg_col_ind = 0;
	that.posX = 0;
	that.posY = 0;
	that.dir = 'right';
	that.deg = 0;
	that.circumference = 60*Math.PI;
	rollprocess = false;
	that.left = false;
	that.vely = 0;
	that.jumping = false;
	that.jumpval = 20;
	that.jumpanimation = false;
	that.rolling = false;
	that.walkspeed = 3;
	var draw_add_x = that.width/2 - (that.width/numberOfFrames/2);
	// incorporate kricki height! ~14 px
	var draw_add_y = canvas.height - (that.width/numberOfFrames) - 120 - 14;//(numberOfFrames-1)*that.height/numberOfFrames;
	
	that.render = function() {
		
		// clear canvas
		// that.context.clearRect(0, 0, that.width, that.height);
		
		if (that.posX < -canvas.width/4) {
			scroll_x += (that.posX - -canvas.width/4)
			that.posX = -canvas.width/4;
		} else if (that.posX > canvas.width/4) {
			scroll_x += (that.posX - canvas.width/4);
			that.posX = canvas.width/4;
		}
		
		if (!that.rolling) {
			
			that.context.drawImage(
				that.image,
				frameIndex * that.width / numberOfFrames,
				stateIndex * that.height / numberOfStates,
				that.width / numberOfFrames,
				that.height / numberOfStates,
				that.posX + draw_add_x, //+ scroll_x,
				that.posY + draw_add_y, // + scroll_y,
				that.width / numberOfFrames,
				that.height / numberOfStates
				);
				
		} else {
			
			that.context.drawImage(
				that.image,
				that.deg_col_ind * 480 / 4,
				that.deg_row_ind * 480 / 4,
				480 / 4,
				480 / 4,
				that.posX + draw_add_x, //+ scroll_x,
				that.posY + draw_add_y, // + scroll_y,
				480 / 4,
				480 / 4
				);
			
		}
	
	}
	
	that.loop = options.loop;
	
	that.update = function() {
		
		// console.log('modulo', (3/that.circumference*360)%360);
		// console.log('no modulo', 3/that.circumference*360);
		
		function set_rolling_indices() {
			
			num = Math.floor((that.deg/22.5)%16);
			that.deg_col_ind = num % 4;
			that.deg_row_ind = Math.floor(num/4);
			
			// if (that.deg >= 315 || (that.deg >= 0 && that.deg < 45)) { that.deg_row_ind = 0; }
			// if (that.deg >= 45 && that.deg < 135) {that.deg_row_ind = 1; }
			// if (that.deg >= 135 && that.deg < 225) {that.deg_row_ind = 2; }
			// if (that.deg >= 225 && that.deg < 315) {that.deg_row_ind = 3; }
			
			// moddeg = that.deg % 90;
			// if (moddeg >= 78.75 || (moddeg >= 0 && moddeg < 11.25)) { that.deg_col_ind = 0; }
			// if (moddeg >= 11.25 && moddeg < 33.75) { that.deg_col_ind = 1; }
			// if (moddeg >= 33.75 && moddeg < 56.25) { that.deg_col_ind = 2; }
			// if (moddeg >= 56.25 && moddeg < 78.75) { that.deg_col_ind = 3; }
			
		}
		
		function convert_deg_left_right() {
			buffer_deg = that.deg;
			that.deg = (337.5 - buffer_deg) % 360;
			if (that.deg < 0) {that.deg = 360+that.deg; }
			console.log(that.deg)
		}
		
		// console.log(that.deg);
		
		// variable to store previous direction
		// if (leftPressed) { that.dir = 'left'; }
		// else if (rightPressed) {that.dir = 'right'; }
		
		// move
		if (leftPressed && stateIndex != 2) {
			that.posX -= that.walkspeed; that.left = true; that.image = options.imagel;
			that.dir = 'left';
		}
		if (rightPressed && stateIndex != 2) {
			that.posX += that.walkspeed; that.left = false; that.image = options.imager;
			that.dir = 'right';
		}
		if (leftPressed && stateIndex == 2 && frameIndex == numberOfFrames - 1) {
			// mirror degrees on 180 if direction changed
			if (that.dir == 'right') { console.log('here'); convert_deg_left_right(); that.dir = 'left'; }
			that.rolling = true;
			that.image = kricki_roll_l_image;
			that.posX -= that.walkspeed; that.left = true; that.image = kricki_roll_l_image;
			prev_deg = that.deg;
			that.deg = Math.round((prev_deg + (3/that.circumference)*360) % 360);
			set_rolling_indices(); // for picking the correct sprite frame
		}
		else if (rightPressed && stateIndex == 2 && frameIndex == numberOfFrames - 1) {
			// mirror degrees on 180 if direction changed
			if (that.dir == 'left') { console.log('here'); convert_deg_left_right(); that.dir = 'right'; }
			that.rolling = true;
			that.image = kricki_roll_r_image;
			that.posX += that.walkspeed; that.left = false; that.image = kricki_roll_r_image;
			prev_deg = that.deg;
			that.deg = Math.round((prev_deg + (3/that.circumference)*360) % 360);
			set_rolling_indices(); // for picking the correct sprite frame
		}
		// keep in rolling position
		else if (downPressed && stateIndex == 2) {}
		// not rolling --> reset values
		else {
			that.rolling = false;
			if (that.dir == 'right') { that.image = krickiImage; } else { that.image = krickiImageL; }
			that.deg = 0;
		}
		if (upPressed && !that.jumping) {
			that.vely = -that.jumpval*gravity;
			that.jumping = true;
			that.jumpanimation = true;
		}
		
		//console.log(that.deg, that.deg_row_ind, that.deg_col_ind);
		
		tickCount += 1;
		
		// apply gravity
		if (that.jumping) {
			if (that.vely < 10) { that.vely += gravity; }
			//TODO change jump height
		}
		
		that.posY += that.vely;
		
		// check ground
		if (that.jumping && that.posY >= 0) {
			that.vely = 0;
			that.posY = 0;
			that.jumping = false;
		}
		
		if (tickCount > ticksPerFrame) {
			
			tickCount = 0;
			
			//todo decluster
			// find correct frame
			if (frameIndex < numberOfFrames - 1 && (leftPressed || rightPressed) && !that.jumping) {
				stateIndex = 0;
				frameIndex += 1;
			} else if (that.jumping && stateIndex != 1) {
				stateIndex = 1;
				frameIndex = 0;
			} else if (that.jumping && frameIndex < numberOfFrames-1 && that.jumpanimation) {
				frameIndex += 1;
			} else if (that.jumping) {
				frameIndex = 0;
				that.jumpanimation = false;
			} else if (downPressed && stateIndex != 2) {
				stateIndex = 2;
				frameIndex = 0;
			} else if (downPressed && stateIndex == 2 && frameIndex < numberOfFrames - 1) {
				frameIndex += 1;
			} else if (downPressed && stateIndex == 2) {
				frameIndex = frameIndex;
			} else if (!downPressed && stateIndex == 2 && frameIndex > 0) {
				frameIndex -= 1;
			} else if (!downPressed && stateIndex == 2 && frameIndex == 0) {
				stateIndex = 0;
			} else if (that.loop) {
				stateIndex = 0;
				frameIndex = 0;
			}
			
		}
		
	};
	
	return that;
	
}

function ufo (options) {
	
	var that = {};
	that.context = options.context;
	that.width = options.width;
	that.height = options.height;
	that.imageu = options.imageu;
	var frameIndex = 0;
	var stateIndex = options.stateIndex || 0;
	var tickCount = 0;
	var ticksPerFrame = 12;
	var numberOfFrames = options.numberOfFrames || 1;
	var numberOfStates = options.numberOfStates || 1;
	that.posX = options.x;
	that.posY = options.y;
	that.speed = options.speed;
	that.vely = 0;
	var draw_add_x = that.width/2 - (that.width/numberOfFrames/2);
	// incorporate ufo height! ~14 px
	var draw_add_y = canvas.height - (that.width/numberOfFrames) - 120 - 14;//(numberOfFrames-1)*that.height/numberOfFrames;
	
	// render function
	
	that.render = function() {
		
		that.context.drawImage(
			that.imageu,
			frameIndex * that.width / numberOfFrames,
			stateIndex * that.height / numberOfStates,
			that.width / numberOfFrames,
			that.height / numberOfStates,
			that.posX + draw_add_x,
			that.posY + draw_add_y,
			that.width / numberOfFrames,
			that.height / numberOfStates
			);
		
	}
	
	// update function
	
	that.update = function() {
		
		function adjust_pos() {
			
			factor = Math.ceil(that.speed / 2);
			center = Math.floor(that.speed / 2);
			
			// hover about
			if (that.posX > -200 && that.posX < 200) {
				that.posX += Math.floor((Math.random()*that.speed)-center);
			} else if (that.posX > -200) {
				that.posX += Math.floor((Math.random()*factor)-center);
			} else {
				that.posX += Math.floor((Math.random()*factor));
			}
			if (that.posY > -300 && that.posY < 0) {
				that.posY += Math.floor((Math.random()*that.speed)-center);
			} else if (that.posY > -300) {
				that.posY += Math.floor((Math.random()*factor)-center);
			} else {
				that.posY += Math.floor((Math.random()*factor));
			}
			
		}
		
		function adjust_pos_smooth() {
			
			factor = Math.ceil(that.speed / 2);
			center = Math.floor(that.speed / 2);
			
			dir = 0;
			rand1 = Math.random();
			rand2 = Math.random();
			if (rand1 < 0.5) { dirx = -that.speed} else { dirx = that.speed}
			if (rand2 < 0.5) { diry = -that.speed} else { diry = that.speed}
			
			// console.log(Math.random());
			
			// hover about
			if (that.posX > -200 && that.posX < 200) {
				that.posX += dirx;
			} else if (that.posX > -200) {
				that.posX -= that.speed;
			} else if (that.posX < 200) {
				that.posX += that.speed;
			}
			if (that.posY > -300 && that.posY < -100) {
				that.posY += diry;
			} else if (that.posY > -300) {
				that.posY -= that.speed;
			} else if (that.posY < -100) {
				that.posY += that.speed;
			}
			
		}
		
		tickCount++;
		
		if (tickCount > ticksPerFrame) {
			
			tickCount = 0;
			
			if (frameIndex < numberOfFrames - 1) {
				frameIndex++;
			} else {
				frameIndex = 0;
			}
			
			adjust_pos_smooth();
			
		} else if (tickCount > ticksPerFrame/6) {
			
			adjust_pos_smooth();
			
		}
		
	}
	
	return that;
	
}

function ground (options) {
	
	var that = {};
	that.context = options.context;
	that.width = options.width;
	that.height = options.height;
	that.image = options.image;
	that.imageb = options.imageb;
	that.posX = options.posX;
	that.posY = 0;
	var kr = options.kr;
	
	that.render = function() {
		
		total_width = that.width*2;
		
		if (scroll_x > total_width) {
			scroll_x = scroll_x % total_width;
		} else if (scroll_x < 0) {
			buffer_val = total_width - scroll_x;
			scroll_x = buffer_val;
		}
		
		if (scroll_x > total_width - canvas.width) {
			pic1x = -scroll_x + 2*that.width;
			pic2x = -scroll_x + 1*that.width;
		} else {
			pic1x = -scroll_x;
			pic2x = -scroll_x + 1*that.width;
		}
		
		that.context.drawImage(
			that.image,
			0,//scroll_x - factor*that.width,
			0,//scroll_y,
			that.width,
			that.height,
			pic1x, //-scroll_x + factor*that.width, //(factor)*that.width - scroll_x,//0, // scroll_x,
			scroll_y + (canvas.height - that.height),
			that.width,
			that.height);
		
		that.context.drawImage(
			that.imageb,
			0,
			0,
			that.width,
			that.height,
			pic2x, //-scroll_x + that.width, //((factor)+1)*that.width - scroll_x,
			scroll_y + (canvas.height - that.height),
			that.width,
			that.height);
		
		// that.context.drawImage(
			// that.imageb,
			// 0,
			// 0,
			// that.width,
			// that.height,
			// -scroll_x + that.width, //((factor)+1)*that.width - scroll_x,
			// scroll_y + (canvas.height - that.height),
			// that.width,
			// that.height);
	
		};
		
		// that.context.drawImage(
			// that.image,
			// scroll_x + that.width,
			// scroll_y,
			// that.width,
			// that.height,
			// 0, // scroll_x,
			// scroll_y + (canvas.height - that.height),
			// that.width,
			// that.height);
	
		// }
	
	return that;
		
	}

function background (options) {
	
	var that = {};
	that.context = options.context;
	that.width = options.width;
	that.height = options.height;
	that.image = options.image;
	
	that.render = function() {
		
		that.context.drawImage(
			that.image,
			0,
			0,
			that.width,
			that.height,
			0,
			0,
			that.width,
			that.height);
		
	}
	
	return that;
}

function cloud (options) {
	
	var that = {};
	that.context = options.context;
	that.width = options.width;
	that.height = options.height;
	that.X = options.x;
	that.Y = options.y;
	that.image = options.image;
	that.dir = options.dir;
	that.speed = options.speed;
	that.scale = options.scale;
	that.counter = 0;
	
	that.render = function() {
		
		that.context.drawImage(
			that.image,
			0,
			0,
			that.width,
			that.height,
			that.X,
			that.Y,
			that.width*that.scale,
			that.height*that.scale);
		
	}
	
	that.update = function() {
		
		// move in dir
		that.counter++;
		if (that.counter >= that.speed) {
			that.counter = 0;
			that.X += that.dir;
		}
		
		// check if outside screen
		if (that.X < -that.width && that.dir < 0) { // moving left
			that.X = canvas.width;
		} else if (that.X > canvas.width && that.dir > 0) { // moving right
			// print here
			that.X = -that.width;
		}
		
	}
	
	return that;
	
}

function bug_report (options) {
	
	var that = {};
	that.context = options.context;
	that.widthb = options.widthb;
	that.heightb = options.heightb;
	that.widtht = options.widtht;
	that.heightt = options.heightt;
	that.imagebug = options.imagebug;
	that.imagetext = options.imagetext;
	var frameIndexText = 0;
	var frameIndexBug = 0;
	that.stateIndexBug = 0;
	var tickCount = 0;
	var ticksPerFrame = 8;
	var numberOfFramesText = 4;
	var numberOfFramesBug = 4;
	var numberOfStatesBug = 2;
	
	// render function
	that.render = function() {
		
		that.context.drawImage(
			that.imagebug,
			frameIndexBug * that.widthb / numberOfFramesBug,
			that.stateIndexBug * that.heightb / numberOfStatesBug,
			that.widthb / numberOfFramesBug,
			that.heightb / numberOfStatesBug,
			0,
			0,
			that.widthb / numberOfFramesBug*0.7,
			that.heightb / numberOfStatesBug*0.7
			);
		
		that.context.drawImage(
			that.imagetext,
			0,
			frameIndexText * that.heightt / numberOfFramesText,
			that.widtht,
			that.heightt / numberOfFramesText,
			160,
			20,
			that.widtht,
			that.heightt / numberOfFramesText
			);
		
	}
	
	that.update = function() {
		
		tickCount++;
		
		if (tickCount > ticksPerFrame) {
			
			tickCount = 0;
			
			if (frameIndexBug < numberOfFramesBug-1) {
				frameIndexBug++;
			} else {
				frameIndexBug = 0;
			}
			
			if (frameIndexText < numberOfFramesText-1) {
				frameIndexText++;
			} else {
				frameIndexText = 0;
			}
			
		}
		
	}
	
	return that;
	
}

function prog_bar (options) {
	
	var that = {};
	that.context = options.context;
	that.widthk = options.widthk;
	that.heightk = options.heightk;
	that.widtht = options.widtht;
	that.heightt = options.heightt;
	that.widthb = options.widthb;
	that.heightb = options.heightb;
	that.widthf = options.widthf;
	that.heightf = options.heightf;
	that.imageframe = options.imageframe;
	that.imagebar = options.imagebar;
	that.imagekricki = options.imagekricki;
	that.imagetext = options.imagetext;
	var frameIndexText = 1;
	
	// render function
	that.render = function() {
		
		// frame
		that.context.drawImage(
			that.imageframe,
			0,
			0,
			that.widthf,
			that.heightf,
			0,
			40,
			that.widthf,
			that.heightf
			);
		
		// bar
		that.context.drawImage(
			that.imagebar,
			0,
			0,
			that.widthb,
			that.heightb,
			10,
			50,
			(frameIndexText/20)*480,
			that.heightb
			);
		
		// kricki
		that.context.drawImage(
			that.imagekricki,
			0,
			0,
			that.widthk,
			that.heightk,
			(frameIndexText/20)*480+10 - 20,
			0,
			40,
			40
			);
		
		// text
		that.context.drawImage(
			that.imagetext,
			0,
			(frameIndexText-1) * 120, //TODO some error here
			that.widtht,
			(frameIndexText) * 120,
			0,
			120,
			that.widtht/3,
			40
			);
		
	}
	
	return that;
	
}

// check fps

var lastLoop = new Date();

function gameLoop () {
	
	game_started = true;
	
	var thisLoop = new Date();
	lastLoop = thisLoop;
	
	window.requestAnimationFrame(gameLoop);
	
	canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
	canvas_bug.getContext("2d").clearRect(0, 0, canvas_bug.width, canvas_bug.height);
	
	kricki.update();
	
	cloud1.update();
	cloud2.update();
	cloud3.update();
	ufo1.update();
	
	sky_sun.render();
	cloud3.render(); // large cloud in BG
	cloud1.render();
	cloud2.render();
	
	ground_test.render();
	ufo1.render();
	// ground_test2.render();
	kricki.render();
	
	bug_report1.update();
	bug_report1.render();
	
	bug_report1.render();
	prog_bar1.render();
	
	// deactive all key presses if i.e. switching tabs
	if (!document.hasFocus()) {
		leftPressed = false;
		rightPressed = false;
		downPressed = false;
		upPressed = false;
	}
	
}

// get canvas ID and set size
var canvas = document.getElementById("myCanvas");
var canvas_bug = document.getElementById("CanvasBug");
var canvas_prog = document.getElementById("CanvasProgress");
canvas.width = 480;
canvas.height = 480;
var button_deleted = false;
var game_started = false;
krickiImage.src = "./kricki_spritesheet.png";
krickiImageL.src = "./kricki_spritesheet_l.png";
ground_test_image.src = "./ground_tile_sand.png";
ground_test_image2.src = "./ground_tile_sand_m.png";
sky_sun_image.src = "./sky_sun.png";
cloud1_image.src = "./cloud1.png";
cloud2_image.src = "./cloud2.png";
cloud3_image.src = "./cloud3.png";
ufoImage.src = "./UFO_spritesheet.png";
loading_screen.src = "./Start.png";
bug_image.src = "./bug_spritesheet.png";
bug_text_image.src = "./bug_report_text.png";
kricki_roll_l_image.src = "./kricki_roll_l_spritesheet.png";
kricki_roll_r_image.src = "./kricki_roll_r_spritesheet.png";
frame_image.src = "./frame_prog.png";
bar_image.src = "./bar_prog.png";
kr_bar_image.src = "./kricki_prog.png";
prog_text_image.src = "./prog_txt.png";


// create the sprite object
var kricki = player({
	context: canvas.getContext("2d"),
	width: 480,
	height: 480,
	imagel: krickiImageL,
	imager: krickiImage,
	numberOfFrames: 4,
	numberOfStates: 4,
	stateIndex: 0,
	loop: true
});

var ufo1 = ufo({
	context: canvas.getContext("2d"),
	width: 480,
	height: 240,
	imageu: ufoImage,
	numberOfFrames: 4,
	numberOfStates: 2,
	stateIndex: 0,
	x: 100,
	y: -150,
	speed: 2
});

var sky_sun = background({
	context: canvas.getContext("2d"),
	width: 600,
	height: 600,
	image: sky_sun_image
})

var ground_test = ground({
	context: canvas.getContext("2d"),
	width: 640,
	height: 160,
	image: ground_test_image,
	imageb: ground_test_image2,
	tiled: true,
	kr: kricki,
	posX: 0
});

var ground_test2 = ground({
	context: canvas.getContext("2d"),
	width: 640,
	height: 160,
	image: ground_test_image2,
	tiled: true,
	kr: kricki,
	posX: 160
});

var cloud1 = cloud({
	context: canvas.getContext("2d"),
	width: 498,
	height: 168,
	x: 300,
	y: 100,
	image: cloud1_image,
	dir: -1,
	speed: 10,
	scale: 0.5
});

var cloud2 = cloud({
	context: canvas.getContext("2d"),
	width: 700,
	height: 168,
	x: 50,
	y: 50,
	image: cloud2_image,
	dir: -1,
	speed: 4,
	scale: 0.5
});

var cloud3 = cloud({
	context: canvas.getContext("2d"),
	width: 432,
	height: 372,
	x: -20,
	y: 20,
	image: cloud3_image,
	dir: 1,
	speed: 6,
	scale: 0.5
});

var bug_report1 = bug_report({
	context: canvas_bug.getContext("2d"),
	widthb: 640,
	heightb: 320,
	widtht: 480,
	heightt: 240,
	imagebug: bug_image,
	imagetext: bug_text_image
})

var prog_bar1 = prog_bar({
	context: canvas_prog.getContext("2d"),
	widthk: 120,
	heightk: 120,
	widtht: 1840,
	heightt: 2040,
	widthb: 60,
	heightb: 60,
	widthf: 500,
	heightf: 80,
	imageframe: frame_image,
	imagebar: bar_image,
	imagekricki: kr_bar_image,
	imagetext: prog_text_image
})

function keyDownHandler(e) {
	
	if (e.keyCode == 37 || e.keyCode == 65) { leftPressed = true; }
	if (e.keyCode == 39 || e.keyCode == 68) { rightPressed = true; }
	if (e.keyCode == 40 || e.keyCode == 83) { downPressed = true; }
	if (e.keyCode == 38 || e.keyCode == 87) { upPressed = true; }
	if (e.keyCode == 13  && !game_started) { console.log(is); startLoop(); } // 
	
}

function keyUpHandler(e) {
	
	if (e.keyCode == 37 || e.keyCode == 65) { leftPressed = false; }
	if (e.keyCode == 39 || e.keyCode == 68) { rightPressed = false; }
	if (e.keyCode == 40 || e.keyCode == 83) { downPressed = false; }
	if (e.keyCode == 38 || e.keyCode == 87) { upPressed = false; }
	
}

function hover_bug(e) {
	
	relativeX = e.clientX - canvas_bug.offsetLeft;
	relativeY = e.clientY - canvas_bug.offsetTop;
	
	if (relativeX > 0 && relativeX < 160 && relativeY > 0 && relativeY < 150) {
		bug_report1.stateIndexBug = 1;
	} else {
		bug_report1.stateIndexBug = 0;
	}
	
}

function bug_report_dialogue(e) {
	
	relativeX = e.clientX - canvas_bug.offsetLeft;
	relativeY = e.clientY - canvas_bug.offsetTop;
	
	if (relativeX > 0 && relativeX < 160 && relativeY > 0 && relativeY < 150) {
		// open dialogue
		window.location.href = "mailto:nicoadelh47@gmail.com?subject=Kricki Bug Report";
		console.log('open dialogue...')
	}
	
}

function startLoop() {
	
	for (i=0; i < is.length; i++) {
		if (!is[i]) { return false }
	}
	
	// remove button from start page
	if (!button_deleted) {
		var button = document.getElementById("clickMe");
		button.parentNode.removeChild(button);
		button_deleted = true;
		
		// set canvas for bug report
		canvas_bug.width = 600;
		canvas_bug.height = 160;
		
		// set canvas for progress
		canvas_prog.width = 600;
		canvas_prog.height = 160;
		
	}
	
	gameLoop();
}

function display_start_screen() {
	
	canvas.getContext("2d").drawImage(
		loading_screen,
		0,
		0,
		480,
		344,
		0,
		0,
		480,
		344);
	
}

is = [];
for (i=0; i<16; i++) { is.push(false); } // replace '7' with number of pictures
gravity = 0.7;
maxjumpval = 20;
scroll_x = 0;
scroll_y = 0;
loading_screen.addEventListener("load", display_start_screen);
krickiImage.addEventListener("load", function () {is[0] = true;} );
krickiImageL.addEventListener("load", function () {is[1] = true;});
ground_test_image.addEventListener("load", function () {is[2] = true;});
sky_sun_image.addEventListener("load", function () {is[3] = true;});
cloud1_image.addEventListener("load", function () {is[4] = true;});
cloud2_image.addEventListener("load", function () {is[5] = true;});
cloud3_image.addEventListener("load", function () {is[6] = true;});
ufoImage.addEventListener("load", function () {is[7] = true;});
bug_image.addEventListener("load", function () {is[8] = true;});
bug_text_image.addEventListener("load", function () {is[9] = true;});
kricki_roll_l_image.addEventListener("load", function () {is[10] = true;});
kricki_roll_r_image.addEventListener("load", function () {is[11] = true;});
frame_image.addEventListener("load", function () {is[12] = true;});
bar_image.addEventListener("load", function () {is[13] = true;});
kr_bar_image.addEventListener("load", function () {is[14] = true;});
prog_text_image.addEventListener("load", function () {is[15] = true;});
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("mousemove", hover_bug);
canvas_bug.addEventListener("click", bug_report_dialogue);
leftPressed = false;
rightPressed = false;
upPressed = false;
downPressed = false;