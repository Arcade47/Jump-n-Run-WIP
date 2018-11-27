// event listeners
document.addEventListener("mousedown", mouse_down, false);
document.addEventListener("keydown", key_down, false);
document.addEventListener("mouseup", mouse_up, false);
document.addEventListener("mousemove", mouse_move, false);

var visible_counter = 0;
var pos = [];
var clickhold = false;
var drag = false;
var drag_start_pos = {x: 0, y: 0};
var current_pos = {x: 0, y: 0};

function update_first_call() {
	
	update(current_pos);
	draw_all();
	requestAnimationFrame(update_first_call);
	
}

function draw_all() {
	// console.log(drag);
	// each time: draw verts, lines, polys
	// refresh
	refresh_canvas();
	draw_timed(60);
	// draw_finished_polys("orange", "grey", polys, active_poly_ind);
	// draw_grid_occupancies(grid, "black", "red", "green", "blue");
	draw_active_vertices(open_poly_coords);
	draw_active_lines(open_poly_coords);
	for (var i=0; i<polys.length; i++) {
		draw_active_lines(polys[i]);
	}
	// draw_grid();
}

function refresh_canvas() {
	clear_canvas();
	draw_grid();
}

function draw_timed(n_frames) {
	if (visible_counter <= n_frames) {
		refresh_canvas();
		// draw stuff...
		visible_counter++;
	} else {
		refresh_canvas();
	}
}

function draw_open_poly_verts() {
	for (var i=0; i<open_poly_coords.length; i++) {
		var vert = open_poly_coords[i];
		draw_vertex(vert);
	}
}

function update(pos) {
	
	// console.log('XXXXXXXX active_vert_ind', active_vert_ind, 'clickhold', clickhold);
	
	// ...?
	if (drag) {
		// get distance
		var diff = drag_distance(pos);
		if (active_poly_ind > -1) {
			// ...
		} else {
			// drag vertex of open_poly
			console.log('inds vert poly', active_vert_ind, active_poly_ind);
			drag_vert(pos, active_vert_ind, active_poly_ind);
		}
	}
			
	
}

function arrow_keys(e) {
	if (e.keyCode == 37) { //left
		//...
	}
	if (e.keyCode == 39) { //right
		//...
	}
	if (e.keyCode == 38) { //up
		//...
	}
	if (e.keyCode == 40) { //down
		//...
	}
	
}


// TODO in general: should drag be called when something is created (vert/poly?)

function mouse_down(e) {
	
	// TODO: too cluttered!!
	
	clickhold = true;
	// get pos from e
	var pos = getXY(e);
	// debug
	print_cell_occupancies(pos);
	//TODO: click flow...
	// no poly open
	if (open_poly_coords.length == 0) {
		// place not occupied
		if (pos_not_occupied(pos)) {
			// start new poly
			append_vert(pos);
			// TODO check if drag is valid here
			if (drag && move_vert_of_open_poly_valid(pos, 0)) {
				move_single_vert(pos);
			}
		// place occupied: check if any vertex at pos
		} else if (vert_of_any_poly_at_pos(pos)) {
			select_vert(pos);
			// TODO add drag functionality
			// if (drag && 
		} else if (any_poly_at_pos(pos)) {
			deselect_vert();
			select_poly(pos);
			// TODO add drag functionality
		} else {
			deselect_poly();
		}
	} else { // open poly
		console.log('mouse down and open poly');
		if (pos_not_occupied(pos)) {
			console.log('exit 1');
			if (append_vert_valid(pos)) {
				append_vert(pos);
				// select the vert that was just created in case dragging is initiated already
				select_vert_of_open_poly(pos);
			}
		} else if (vert_of_open_poly_at_pos(pos)) {
			console.log('exit 2');
			if (first_vert_of_open_poly_at_pos(pos)) {
				// TODO call this part only upon button release!
				if (close_poly_valid(pos)) {
					close_poly(pos);
				}
			} else {
				console.log('exit 3');
				select_vert_of_open_poly(pos);
				// TODO add drag functionality
			}
		} else {
			deselect_vert();
		}
	}
}

function mouse_up(e) {
	// set switches accordingly off
	clickhold = false;
	drag = false;
	// deactivate all polys and verts
	deselect_poly();
	deselect_vert();
}

function mouse_move(e) {
	// set global current_pos value
	current_pos = getXY(e);
	if (clickhold) {
		// in case of first click --> set the drag_start_pos so difference can be calculated
		if (!drag) {
			drag_start_pos = getXY(e);
		}
		drag = true;
	}
	// move when selections and 
	if (drag) {
	}
}

function drag_distance(pos) {
	
	var diff = {x: drag_start_pos.x - current_pos.x, y: drag_start_pos.y - current_pos.y};
	return diff;
	
}

function switch_order() {
	poly_first = !poly_first;
}

function key_down(e) {
	if (e.keyCode == 13) { //enter
		//...
	}
	// highlight_correct_cell(e);
}

// start game loop
update_first_call();