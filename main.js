// JavaScript Code

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

document.addEventListener("mousedown", mouse_down, false);
document.addEventListener("mouseup", mouse_up, false);
document.addEventListener("mousemove", drag, false);

// predefined vars

var n_lines_h = 30;
var n_lines_v = 40;

// initialization of vars					

var vertices = [];
var polys = [];
var verts_finished = false;
var problematic_lines = [];
var mouse_down_listener = false;
var active_vert = [];
var active_vert_ind = 0;
var active_poly = [];
var active_poly_ind = 0;
var poly_drag = false;
var poly_drag_init = [];			// initial coords to calculate poly movement from
var dragged_poly_verts = [];

//TODO: sometimes when clicked on vert then poly is moved instead
//leftmost? not always
//TODO: new point-in-poly-function: not working when vertex at same height to the right
//TODO: vertex drag not possible anymore when poly marked
//TODO: find out why sometimes poly not selected
//TODO: why is sometimes line check selected --> no new poly can be started

function getXY(e) {
	
	// return rounded position according to grid, not actual coordinates
	
	var x = e.clientX - canvas.offsetLeft;
	var y = e.clientY - canvas.offsetTop;
	return create_vertex_pos(x, y);
	
}

function mouse_up(e) {
	
	mouse_down_listener = false;
	poly_drag = false;
	poly_drag_init = [];
	dragged_poly_verts = [];
	
}

function mouse_down(e) {
	
	mouse_down_listener = true;
	
	// either something at pos or nothing at pos
	
	poly_at_pos = find_poly(getXY(e).x, getXY(e).y);
	
	vert_at_pos = find_vertex(getXY(e).x, getXY(e).y);
	
	vert = create_vertex_pos(getXY(e).x, getXY(e).y);
	
	if (vert_at_pos) {
		
		if (check_whether_poly_complete(vert)) {
			
			finish_poly();
		
		} else {
			
			// dragging is handled in separate function by separate (mousemove) listener
			
		}
	
	} else if (poly_at_pos) {
		
		// all selection of polys etc. is already done in finding function
		
	} else {
		
		if (check_vertex(getXY(e).x, getXY(e).y)) {
			
			if (verts_finished) {
				verts_finished = false;
				vertices = [];
			}
			
			add_vertex(vert);
			
		}
	}
	
}

function drag(e) {
	
	if (mouse_down_listener) {
		move_vertex(e);
		
	} else if (poly_drag) {
		
		move_poly(e)
		
	}
	
}

function move_poly(e) {
	
	// if just clicked: store initial mouse position and store reference poly vert positions
	
	if (poly_drag_init.length == 0) {
		
		console.log("first clicked");
		
		poly_drag_init = [getXY(e).x, getXY(e).y];
		// make copy of vert coordinates, else not constant values but linked to actual poly position!
		for (vi = 0; vi < polys[active_poly_ind].verts.length; vi++) {
			dragged_poly_verts.push({x: polys[active_poly_ind].verts[vi].x, y: polys[active_poly_ind].verts[vi].y})
		}
		//dragged_poly_verts = polys[active_poly_ind].verts;
		
	}
	
	// get change coordinates
	// old coordinates need to be stored until LMB let go!
	
	dx = poly_drag_init[0] - getXY(e).x;
	dy = poly_drag_init[1] - getXY(e).y;
	
	// new_verts = [];
	
	for (vi = 0; vi < polys[active_poly_ind].verts.length; vi++) {
		
		//console.log("before", polys[active_poly_ind].verts[vi].x);
		polys[active_poly_ind].verts[vi].x = dragged_poly_verts[vi].x - dx;
		//console.log("after", polys[active_poly_ind].verts[vi].x);
		polys[active_poly_ind].verts[vi].y = dragged_poly_verts[vi].y - dy;
		
	}
	
	console.log(dx, dy);
	console.log("dragged", dragged_poly_verts[0]);
	console.log("active", polys[active_poly_ind].verts[0]);
	
}

function no_line_intersection_problems(input_verts) {
	
	// cycle through all input_verts (global var, i.e. no input arguments), make lines and check for intersections
	
	for (i = 0; i < input_verts.length-1; i ++) {
		
		for (j = 0; j < input_verts.length-1; j ++) {
			
			// exclude its own line
			
			if (i != j) {
				
				// order so that line1 is always prior in input_verts list
				
				if (i < j) {k = i; l = j;} else {k = j; l = i};
				line1 = {p1: input_verts[k], p2: input_verts[k+1]};
				line2 = {p1: input_verts[l], p2: input_verts[l+1]};
				
				if (parallel_lines(line1, line2) == true) {
				
					if (intersection_parallel_lines(line1, line2) == true) {
						problematic_lines = [line1, line2];
						return false;
					}
				
				}
				
				if (intersecting_lines(line1, line2) == true) {
					// catch case where the intersection is the joint point with last line
					if (k + 1 == l) {
						int_point = find_intersection_point(line1, line2);
						if (int_point.x == line1.p2.x && int_point.y == line1.p2.y 
						&& int_point.x == line2.p1.x && int_point.y == line2.p1.y) {;
							
							// do nothing, go on to next iteration!
						}
					} else {
						// else: invalid intersection
						problematic_lines = [line1, line2];
						return false;
					}
				}
				
			}
			
		}
		
	}
	
	// made it until here: no problems
	
	return true
	
}

function move_vertex(e) {
	
	// check if mouse position within canvas borderStyle
	
	check = getXY(e);
	
	if (check.x < 0 || check.x > canvas.width || check.y < 0 || check.y > canvas.height) {
		return false;
	}
	
	// also checks if any lines intersect (see below)
	
	// create vertex list anew
	
	new_vertices = [];
	
	// append previous vertices
	
	for (i=0; i < active_vert_ind; i++) {
		new_vertices.push(vertices[i]);
	}
	
	// append new position as well
	
	new_vertices.push(getXY(e));
	
	// append last vertices
	
	for (i=active_vert_ind+1; i < vertices.length; i++) {
		new_vertices.push(vertices[i]);
	}
	
	// check if any lines are problematic
	
	if (no_line_intersection_problems(new_vertices)) {
		
		// if valid, set as new vertex list
		problematic_lines = [];
		vertices = new_vertices;
		// adjust poly
		if (polys.length > 0 && verts_finished) {
			polys[active_poly_ind].verts = vertices;
		}
		return true;
		
	}
	
	return false;
	
}

function find_vertex(x, y) {
	
	// exclude case when click is the first vertex
	
	if (vertices.length == 0) {
		
		return false;
		
	}
	
	// sets global variable active_vert_ind, but also returns boolean value
	
	for (vert_ind = 0; vert_ind < vertices.length; vert_ind++) {
		
		// always set active_vert_ind to the first matching position
		// because if no match --> search until the end
		// --> active_vert_ind is equal to length of vertices,
		// i.e. the last element
		
		active_vert_ind = vert_ind;
		
		if (vertices[vert_ind].x == x && vertices[vert_ind].y == y) {
			
			// if match: stop search by returning
			
			return true;
			
		}
		
	}
	
	// exhaustive search: no match found
	
	return false;
	
}

function select_poly(poly_ind) {
	
	active_poly_ind = poly_ind;
	active_poly = [polys[active_poly_ind]];
	vertices = active_poly[0].verts;
	verts_finished = true;
	mouse_down_listener = false;
	poly_drag = true;
	
}

function find_poly(x, y) {
	
	if (polys.length == 0) {
		
		return false;
		
	}
	
	for (poly_ind = 0; poly_ind < polys.length; poly_ind++) {
		
		// always set active_vert_ind to the first matching position
		// because if no match --> search until the end
		// --> active_vert_ind is equal to length of vertices,
		// i.e. the last element
		
		//console.log(polys[poly_ind], polys[poly_ind].verts.length);
		
		testpoint = {x:x, y:y};
		intersection_test = isInside(polys[poly_ind].verts, testpoint);
		//point_inside_poly([x, y], poly_to_list(polys[poly_ind]));
		//robustPointInPolygon(poly_to_list(polys[poly_ind]), [x, y]);
		
		if (intersection_test) {// == -1) {
			
			// if match: stop search by returning
			
			select_poly(poly_ind);
			return true;
			
		}
		
	}
	
	// exhaustive search: no match found
	
	
	
	return false;
	
}

function draw_line(startx, endx, starty, endy, color) {
	ctx.beginPath();
	ctx.lineWidth="1";
	ctx.strokeStyle=color;
	ctx.moveTo(startx, starty);
	ctx.lineTo(endx, endy);
	ctx.stroke();
	ctx.closePath();
}

function draw_grid() {
	
	for (h = 0; h < canvas.height; h += canvas.height/n_lines_h) {
		draw_line(0, canvas.width, h, h, "white");
	}
	
	for (v = 0; v < canvas.width; v += canvas.width/n_lines_v) {
		draw_line(v, v, 0, canvas.height, "white");
	}
	
}

function check_for_double_vertices(vert) {

	valid = true;
	
	if (vertices.length == 0) {
		return valid;
	}

	for (v_ind = 0; v_ind < vertices.length; v_ind++) {
			if (vert.x == vertices[v_ind].x && vert.y == vertices[v_ind].y) {
				valid = false;
			}
		}
	
	return valid;
		
}

function check_whether_poly_complete(vert) {

	poly_complete = false;
	
	if (vertices.length == 0) {
		
		return poly_complete;
		
	}
	
	// prerequisites: 3 or more verts; first point clicked
	if (vert.x == vertices[0].x && vert.y == vertices[0].y && vertices.length >= 3 && !verts_finished) {
		problematic_lines = []; // set empty so that no problematic line is displayed in this case
		poly_complete = true;
	}
	
	return poly_complete;
	
}

function check_whether_lines_uncrossed(vert) {
	
	if (vertices.length >= 2) {
		
		// the new line
		line1 = {
			p1: vertices[vertices.length-1],
			p2: vert
		}
		
		// cycle through every existing line
		for (pos = 0; pos < vertices.length - 1; pos++) {
			
			line2 = {
				p1: vertices[pos],
				p2: vertices[pos+1]
			}
			
			if (parallel_lines(line1, line2) == true) {
				
				if (intersection_parallel_lines(line1, line2) == true) {
					problematic_lines = [line2];
					return false;
				}
			
			}
			
			if (intersecting_lines(line1, line2) == true) {
				// catch case where the intersection is the joint point with last line
				if (pos == vertices.length - 2) {
					int_point = find_intersection_point(line1, line2);
					if (int_point.x == line1.p1.x && int_point.y == line1.p1.y 
					&& int_point.x == line2.p2.x && int_point.y == line2.p2.y) {
						// do nothing, go on to next iteration
						// return true;
					}
				} else {
					// else: invalid intersection
					problematic_lines = [line2];
					return false;
				}
			}
			
		}
		
		return true;
		
	}
	
	return true;
	
}

function new_vertex(relativeX, relativeY) {
	
	vert = create_vertex_pos(relativeX, relativeY);
	vertex_valid = check_vertex(relativeX, relativeY);
	no_double_vertex = check_for_double_vertices(vert);
	var complete = false;
	
	// only append if valid vertex
	if (vertex_valid && no_double_vertex) {
		add_vertex(vert);
	} else if (!no_double_vertex) {
		// if double, it could be the first vertex
		complete = check_whether_poly_complete(vert);
	}
	
	// handle complete vertex list
	if (complete == true) {
		finish_poly();
	}
	
}

function finish_poly() {
	
	var poly = {
			verts: vertices
		};
	polys.push(poly);
	verts_finished = true;
	active_poly_ind = polys.length-1;
	mouse_down_listener = false;
	
}

function check_vertex(relativeX, relativeY) {
	
	// should only check whether any lines cross and if within canvas
	// assuming that already tested for an existing vertex at position
	
	// conditions for adding vertices:
	// 1. shd be inside canvas
	if (relativeX > 0 && relativeX < canvas.width && relativeY > 0 && relativeY < canvas.height) {
		vert = create_vertex_pos(relativeX, relativeY);
		// 2. no double vertices, except if the first and at least 3 vertices
		// var no_double_verts = check_for_double_vertices(vert);
		// 3. check whether lines intersect
		var no_problematic_lines = check_whether_lines_uncrossed(vert);
		
		if (!no_problematic_lines) {
			return false;
		}
			
	} else {
		return false;
	}
	
	// no problems
	return true;
	
}
	
function LMB_click(e) {

	var relativeX = e.clientX - canvas.offsetLeft;
	var relativeY = e.clientY - canvas.offsetTop;
	
	var vert = create_vertex_pos(relativeX, relativeY);
	var no_doubles = check_for_double_vertices(vert)
	
	// ignore function if vertex at position --> only execute drag functionality
	if (no_doubles) {
		
		// check if finished
		
		new_vertex(relativeX, relativeY);
		
	} else {
		
	}
	
	
}

function draw_polys() {
	for (p_ind = 0; p_ind < polys.length; p_ind++) {
		if (p_ind == active_poly_ind) {
			ctx.fillStyle = 'yellow';
		} else {
			ctx.fillStyle = 'blue';
		}
		ctx.beginPath();
		ctx.moveTo(polys[p_ind].verts[0].x, polys[p_ind].verts[0].y);
		for (pos = 1; pos < polys[p_ind].verts.length; pos++) {
			ctx.lineTo(polys[p_ind].verts[pos].x, polys[p_ind].verts[pos].y);
		}
		ctx.closePath();
		ctx.fill();
	}
}

function create_vertex_pos(x, y) {
	
	var x_ind = Math.round(x / (canvas.width/n_lines_v));
	var y_ind = Math.round(y / (canvas.height/n_lines_h));
	
	var x_ind_in_pos = (canvas.width / n_lines_v) * x_ind;
	var y_ind_in_pos = (canvas.height / n_lines_h) * y_ind;
	
	// make vertex object
	var vertex = {
		x: x_ind_in_pos,
		y: y_ind_in_pos
	}
	
	return vertex;
	
}

function add_vertex(vertex) {
	
	// append to vertex array
	vertices.push(vertex);
	active_vert.push(vertex);
	active_vert_ind = vertices.length-1;

}

function draw_lines_between_vertices() {
	
	for (v_ind = 0; v_ind < vertices.length - 1; v_ind++) {
		draw_line(vertices[v_ind].x,vertices[v_ind+1].x,vertices[v_ind].y,vertices[v_ind+1].y,"blue");
	}
	
	// close path if verts are finished
	
	if (verts_finished) {
		
		draw_line(vertices[0].x,vertices[vertices.length-1].x,vertices[0].y,vertices[vertices.length-1].y,"blue");
		
	}
	
}

function draw_vertices() {
	
	for (v_ind = 0; v_ind < vertices.length; v_ind++) {
		ctx.beginPath();
		ctx.lineWidth="1";
		if (v_ind == active_vert_ind) {
			ctx.strokeStyle="red";
		} else {
			ctx.strokeStyle="blue";
		}
		ctx.arc(vertices[v_ind].x,vertices[v_ind].y,5,0,2*Math.PI);
		ctx.stroke();
		ctx.closePath();
	}
	
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	draw_grid();
	draw_polys();
	draw_vertices();
	draw_lines_between_vertices();
	if (problematic_lines.length > 0) {
		draw_line(problematic_lines[0].p1.x, problematic_lines[0].p2.x, problematic_lines[0].p1.y, problematic_lines[0].p2.y, 'red');
	}
	
	if (vertices.length > 0) {
	}
	
	requestAnimationFrame(draw);
}

draw();