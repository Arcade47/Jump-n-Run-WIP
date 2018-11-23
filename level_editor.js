// step one: click and add vertex
// step two: identify all affected cells w/ current line --> print red
// step three: grid variable that stores poly identity for each cell
// step four: complete and fill up poly
// step five: set up new poly
// step six: implement dragging

// event listeners
document.addEventListener("mousedown", mouse_down, false);
document.addEventListener("mouseup", mouse_up, false);
document.addEventListener("mousemove", mouse_move, false);

// storage vars
var list_of_polys = []; // only stored as coordinates
var list_of_polys_cells = []; // stored as cells
var list_of_polys_edges = []; // outermost cells from all 4 dirs in this order: l,t,r,b
var dirs_labels = ['l','t','r','b'];
var active_poly = []; // only coords
var active_vertex = -1; // for dragging
// initialization of grid
var polys_grid_state = initialize_grid(n_cols, n_rows);
// active poly: per definition the last activated (defaults to -1 which means none)
var active_poly_ind = list_of_polys.length-1;
// attempt to make plotting faster: no need to search whole grid
var active_cells_draw = [];
var problematic_cells = [];
var problematic_cells_counter = 0;	// only display problematic cells for a short time
// keeping track of mouse position when started dragging
var drag_start_pos = {x: -1, y: -1}; // line coordinates, not cell inds!

// bools ("switches")
var drag = false;
var drag_within_poly = false;
//...

function set_values(input) {
	
	problematic_cells = input.probcells;
	problematic_cells_counter = input.probcount;
	
}

function set_drag_within_poly_active() {
	
	drag_within_poly = true;
	document.body.style.cursor = 'none';
	
}

function set_drag_within_poly_inactive() {
	
	drag_within_poly = false;
	document.body.style.cursor = 'default';
	
}

function draw_all() {
	
	// called every frame
	
	clear_canvas();
	
	// testdraw_active_lines("yellow", active_cells_draw);
	
	draw_finished_polys("orange", "grey", list_of_polys, active_poly_ind);
	
	// testdraw_polys_cells("blue", list_of_polys_cells);
	
	draw_problematic_cells(0.5, problematic_cells, problematic_cells_counter);
	
	// testdraw_cell_occupations("yellow", "orange", "green", polys_grid_state, active_poly_ind);
	
	draw_grid();
	
	draw_active_vertices(active_poly);
	
	draw_active_lines(active_poly);
	
}

function set_invalid_cells(occ_cells) {
	
	// searches the grid for the input cells; if not free, return them
	// also set the global variable problematic cells
	
	var cells = [];
	// prevent the same items to get into the the problematic cells storage variable
	// TODO: figure out if this var is used in other places!
	problematic_cells = [];
	for (var i=0; i<occ_cells.length; i++) {
		// grid state variable: 0 means 'free' (-1 means active poly)
		if (polys_grid_state[occ_cells[i].col][occ_cells[i].row] != 0) {
			cells.push(occ_cells[i]);
			problematic_cells.push(occ_cells[i]);
		}
	}
	return cells;
	
}

function close_poly() {
	
	// append last coordinate
	active_poly.push(active_poly[0]);
	// set the active cells of the last line (--> last = true)
	set_active_cells(true);
	complete_poly(list_of_polys.length + 1);
	
}

function is_poly_closed(e) {
	
	if (active_poly.length > 2) {
		if (getXY(e).x == active_poly[0].x && getXY(e).y == active_poly[0].y) {
			close_poly();
			return true;
		}
	}
	
	return false;
	
}

function line_cells_overlapping_occupied_cell(e) {
	
	// assumes it is clicked within canvas && at least second coordinate
	// store hypothetical new line
	var new_line = [active_poly[active_poly.length-1], getXY(e)];
	// store the hypothetical occupied cells by new line
	var new_occ = line_to_grid_cells(new_line);
	// loop through and check for similarities
	var problem_cells = set_invalid_cells(new_occ);
	// if any problems, then not valid
	if (problem_cells.length > 0) {
		return true;
	} else {
		return false;
	}
	
}

function two_lines_cells_overlapping_occupied_cell(e, v_ind) {
	
	// remove the two lines in question from grid
	
	// define points for line
	if (v_ind > 0) { var lp1 = active_poly[v_ind-1]; } else { var lp1 = active_poly.length-1; }
	var lp2 = v_ind;
	if (v_ind < active_poly.length-1) { var lp3 = active_poly[v_ind+1]; } else { var lp3 = 0; }
	
	// assumes it is clicked within canvas && at least second coordinate
	// store hypothetical new lines
	var old_line1 = [lp1, lp2];
	var old_line2 = [lp2, lp3];
	var line1_cells = line_to_grid_cells(old_line1);
	var line2_cells = line_to_grid_cells(old_line2);
	
	// delete them (temporarily) from grid
	for (var i=0; i<line1_cells.length; i++) {
		polys_grid_state(line1_cells[i]) = 0;
	}
	for (var i=0; i<line2_cells.length; i++) {
		polys_grid_state(line2_cells[i]) = 0;
	}
	
	// get the new line cells
	var new_line1 = [lp1, getXY(e)];
	var new_line2 = [getXY(e), lp3];
	var new_occ1 = line_to_grid_cells(new_line1);
	var new_occ2 = line_to_grid_cells(new_line2);
	
	// loop through and check for similarities
	var problem_cells1 = set_invalid_cells(new_occ1);
	var problem_cells2 = set_invalid_cells(new_occ2);
	var all_problem_cells = [];
	for (var i=0; i<problem_cells1.length; i++) {
		all_problem_cells.push(problem_cells1[i]);
	}
	for (var i=0; i<problem_cells2.length; i++) {
		all_problem_cells.push(problem_cells2[i]);
	}
	
	// if any problems, then not valid
	if (all_problem_cells.length > 0) {
		// reset the old lines to grid
		for (var i=0; i<line1_cells.length; i++) {
			polys_grid_state(line1_cells[i]) = -1;
		}
		for (var i=0; i<line2_cells.length; i++) {
			polys_grid_state(line2_cells[i]) = -1;
		}
		return true;
	} else {
		return false;
	}
	
}

function clicked_within_active_poly(e) {
	
	// check all inds around vertex
	var poly_check = get_inds_around_vertex(getXY(e));
	
	// check if list empty when outside canvas
	
	
	for (var i=0; i<poly_check.length; i++) {
		if (polys_grid_state[poly_check[i].col][poly_check[i].row] == active_poly_ind + 1) {
			return true;
		}
	}
	// not found
	return false;
	
}

function clicked_within_any_poly(e) {
	
	// check all inds around vertex
	var poly_check = get_inds_around_vertex(getXY(e));
	for (var i=0; i<poly_check.length; i++) {
		if (polys_grid_state[poly_check[i].col][poly_check[i].row] > 0) {
			// set active poly ind
			select_poly(polys_grid_state[poly_check[i].col][poly_check[i].row] - 1);
			return true;
		}
	}
	
	// no poly found --> deactivate all polys (= -1)
	select_poly(-1);
	return false;
	
}

function select_poly(ind) {
	
	active_poly_ind = ind;
	
	// show vertices
	if (list_of_polys.length > 0) {
		active_poly = list_of_polys[active_poly_ind];
	}
	
}

function select_vertex(e) {
	
	// returns ind of vertex (-1 if none selected)
	
	for (var i=0; i<active_poly.length; i++) {
		if (getXY(e).x == active_poly[i].x && getXY(e).y == active_poly[i].y) {
			active_vertex = i;
			return true
		}
	}
	
	active_vertex = -1;
	return false;
	
}

function check_if_valid(e) {
	
	// valid here means: new point for poly
	
	// inside canvas?
	if (!is_inside_canvas(e)) { console.log('not valid1'); return false; }
	
	// if fourth point and same pos as first --> poly complete (overlap ignored)
	if (is_poly_closed(e)) { console.log('not valid2'); return false; } // return false so no double vertex at first position
	
	// is same point as some previous vertex --> drag vertex
	if (select_vertex(e)) { console.log('not valid3'); return false; }
	
	// not first point --> need to check line
	if (active_poly.length > 0 && line_cells_overlapping_occupied_cell(e)) { console.log('not valid4'); return false; }
	
	// if first point --> inside already existing polygon?
	if (active_poly.length == 0 && clicked_within_any_poly(e)) { console.log('not valid5'); return false; }
	
	// no hurdles: valid
	return true;
}

// adjusted function for moving vertex in completed poly
function vertex_move_valid(e) {
	
	// inside canvas
	if (!is_inside_canvas(e)) { console.log('vmi1'); return false; }
	
	// same point as any other point
	//TODO
	
	// invalid two new lines
	if (two_lines_cells_overlapping_occupied_cell(e, active_vertex)) { console.log('vmi2'); return false; }
	
}

function move_vertex(e) {
	
	active_poly[active_vertex] = getXY(e);
	list_of_polys[active_poly_ind][active_vertex] = getXY(e);
	
}

function set_grid_state_line_active(cells) {
	
	for (var i=0; i<cells.length; i++) {
		polys_grid_state[cells[i].col][cells[i].row] = -1;
	}
}

function last_line_coords(coords) {
	
	var p1 = coords[coords.length-1];
	var p2 = coords[coords.length-2];
	return [p1, p2];
	
}

function deactivate_grid_around_last_vert(active_poly) {
	
	var cells_around_vert = get_inds_around_vertex(active_poly[active_poly.length-1]);
	for (var i=0; i<cells_around_vert.length; i++) {
		polys_grid_state[cells_around_vert[i].col][cells_around_vert[i].row] = 0;
	}
	
}

function set_active_cells(last) {
	
	// apart from setting cells in grid variable:
	// returns all active cells for the last line
	
	var last_line = last_line_coords(active_poly);
	var line_cells = line_to_grid_cells(last_line);
	set_grid_state_line_active(line_cells);
	
	// deactivate grid cells around last vertex (only if not last vertex)
	// only for the grid necessary; not the draw function. makes it easier
	if (!last) { deactivate_grid_around_last_vert(active_poly); }
	
	return last_line;
	
}

function handle_valid_click(e) {
	
	var coord = getXY(e);
	
	// append coord to active poly
	active_poly.push(coord);
	// if line: set the active occupied cells
	if (active_poly.length > 1) {
		// not last vertex --> false
		var line_cells = set_active_cells(false);
		// test: append them to drawing variable
		for (var i=0; i<line_cells.length; i++) {
			active_cells_draw.push(line_cells[i]);
		}
	}
	
}

function set_drag_active(e) {
	
	drag = true;
	var coord = getXY(e);
	// set the coordinates as current pos
	drag_start_pos = coord;
	
}

function set_drag_inactive() {
	
	drag = false;
	set_drag_within_poly_inactive();
	
}

function mouse_down(e) {
	
	// set drag to true (until mouse press release)
	if (is_inside_canvas(e)) { set_drag_active(e); }
	
	// for test: get states around clicked position
	// var inds_vert = get_inds_around_vertex(coord);
	// var states = [];
	// for (var i=0; i<inds_vert.length; i++) {
		// states.push(polys_grid_state[inds_vert[i].col][inds_vert[i].row]);
	// }
	
	// check if space for new vertex
	valid = check_if_valid(e);
	if (valid) { handle_valid_click(e); }
	
}

function mouse_up(e) {
	// set drag to false
	set_drag_inactive();
}

function translate_poly(poly, diff) {
	
	var transl = apply_coord_diff(poly, diff);
	return transl;
	
}

function translate_poly_cells(poly_cells, ind, diff) {
	
	// also sets global grid variable
	
	// 1. remove the old cells from grid
	remove_cells_from_grid(poly_cells);
	// 2. get the new cells from difference coordinates
	var diff_cell = cell_from_coord_diff(diff);
	poly_cells = apply_cell_diff(poly_cells, diff_cell);
	// 3. apply these new values to grid
	place_cells_to_grid(poly_cells, active_poly_ind);
	
	return poly_cells;
	
}

function translate_poly_edges(edges, diff) {
	
	var diff_cell = cell_from_coord_diff(diff);
	
	for (var i=0; i<edges.length; i++) {
		var current_cells = edges[i];
		var new_cells = apply_cell_diff(current_cells, diff_cell);
		edges[i] = new_cells;
	}
	
	return edges;
	
}

function set_new_poly_pos_drag(diff) {
	
	// input: difference coordinates (x and y; not cell inds!)
	
	// adjust poly coordinates
	list_of_polys[active_poly_ind] = translate_poly(list_of_polys[active_poly_ind], diff);
	
	// adjust the active poly list (for drawing vertices)
	active_poly = list_of_polys[active_poly_ind];
	
	// adjust cells
	list_of_polys_cells[active_poly_ind] = translate_poly_cells(list_of_polys_cells[active_poly_ind], active_poly_ind, diff);
	
	// also adjust the edges
	list_of_polys_edges[active_poly_ind] = translate_poly_edges(list_of_polys_edges[active_poly_ind], diff);
	
}

function remove_cells_from_grid(cells) {
	for (var i=0; i<cells.length; i++) {
		polys_grid_state[cells[i].col][cells[i].row] = 0;
	}
}

function place_cells_to_grid(cells, index) {
	for (var i=0; i<cells.length; i++) {
		polys_grid_state[cells[i].col][cells[i].row] = index+1;
	}
}

function drag_move(e) {
	
	var current_pos = getXY(e);
	return (drag_start_pos.x != current_pos.x || drag_start_pos.y != current_pos.y);
	
}

function drag_distance(e) {
	
	var current_pos = getXY(e);
	var diff = {x: drag_start_pos.x - current_pos.x, y: drag_start_pos.y - current_pos.y};
	return diff;
	
}

function drag_poly(e) {
	
	// first check if mouse is outside canvas
	if (!is_inside_canvas(e)) { set_drag_within_poly_inactive(); return false; }
	
	// only proceed when cursor inside poly (also includes case when outside canvas!)
	// only resume drag when inside poly!
	if (!drag_within_poly && !clicked_within_active_poly(e)) { set_drag_within_poly_inactive(); return false; }
	
	// get difference
	var diff = drag_distance(e);
	
	// loop alternating dim diffs
	var check_diffs = gradual_diff_list(cell_from_coord_diff(diff));
	for (var i=check_diffs.length-1; i>=0; i--) {
		
		// apply difference to active poly as soon as collision
		// TODO is case clicked outside canvas also catched?
		if (check_poly_collisions(check_diffs[i])) {
			
			// set the new poly position at stopping position (go one back --> i+1)
			// input needs to be coords
			var diff = cell_to_coord(check_diffs[i+1]);
			set_new_poly_pos_drag(diff);
			
			// deactivate drag if not in poly (else mouse moves too far apart)
			// only deactivate the drag within poly because:
			// when moved over the polys pos, then it should go back to drag!
			if (!clicked_within_active_poly(e)) {
				set_drag_within_poly_inactive();
			} else {
				set_drag_within_poly_active();
			}
			
			// stop search if collision found
			return true;
		}
	}
	// no collisions all the way --> mouse definitely in poly
	set_drag_within_poly_active();
	var diff = cell_to_coord(check_diffs[0]);
	set_new_poly_pos_drag(diff);
	
	return true;
	
}

function drag_vertex(e) {
	
	if (vertex_move_valid(e)) {
		move_vertex(e);
		return true;
	}
	
	return false;
	
}

function reset_current_cursor_pos(e) {
	drag_start_pos = getXY(e);
}

function mouse_move(e) {
	
	// drag functions
	if (drag) {
		// move poly (if there's an active one
		if (drag_move(e)) {
			if (active_poly_ind >= 0) {
				// only drag poly if not vertex is selected
				if (active_vertex >= 0) {
					drag_vertex(e);
				} else {
					drag_poly(e);
				}
			}
			// set current position as new drag position --> do not add up!
			reset_current_cursor_pos(e);
		}
	}
}

function poly_moved_out_of_canvas(celldiff) {
	
	var moved_poly_cells = apply_cell_diff(list_of_polys_cells[active_poly_ind], celldiff);
	var check_aabb = aabb_from_cell_inds(moved_poly_cells);
	if (!aabb_cell_within_canvas(check_aabb)) { return true; }
	return false;
	
}

function get_relevant_edges(celldiff) {
	
	// poly is moved --> relevant edges for collision checks
	
	// get dirs (diagonal: two dirs, else one)
	var dirs_from_celldiff = get_dirs_from_celldiff(celldiff);
	var dirs_check_i = inds_from_dirs(dirs_from_celldiff);
	
	// append these dirs to new variable
	var dirs_check = [];
	for (var i=0; i<dirs_check_i.length; i++) {
		// apply diff to edges
		var old_edge = list_of_polys_edges[active_poly_ind][dirs_check_i[i]];
		var new_edge = apply_cell_diff(old_edge, celldiff);
		dirs_check.push(new_edge);
	}
	
	return dirs_check;
	
}

function add_to_problematic_cells(cells) {
	// add to global variable of problematic cells
	for (var i=0; i<cells.length; i++) {
		problematic_cells.push(cells);
	}
}

function any_edge_overlap(relevant_edges) {
	
	// loop through all polys
	for (var poly_i = 0; poly_i<list_of_polys.length; poly_i++) {
		// do not check w/ itself
		if (poly_i == active_poly_ind) { continue; }
		// in every other case: loop over the edges of other poly
		for (var edge_io = 0; edge_io < dirs_labels.length; edge_io++) {
			// loop over the dirs of movement
			for (edge_is = 0; edge_is < relevant_edges.length; edge_is++) {
				// check if there are overlaps
				var overlap = cells_overlap(list_of_polys_edges[poly_i][edge_io], relevant_edges[edge_is]);
				if (overlap.length > 0) {
					add_to_problematic_cells(overlap);
					return true;
				}
			}
		}
	}
	
}

function check_poly_collisions(celldiff) {
	
	// takes as global variable the grid state
	// also the active poly ind
	// checks against all others
	
	// first check bounding box: within canvas?
	if (poly_moved_out_of_canvas(celldiff)) { return true; }
	
	// check all edges of other variables
	var dirs_check = get_relevant_edges(celldiff);
	if (any_edge_overlap(dirs_check)) { return true; }
	
	// no hurdles until here: no collision
	return false;
	
}

function set_poly_cell_vals_to_grid(new_cells, poly_ind) {
	// no output; sets global variable
	for (var i=0; i<new_cells.length; i++) {
		polys_grid_state[new_cells[i].col][new_cells[i].row] = poly_ind;
	}
}

function set_new_edges(cells) {
	
	var new_edges = get_all_edges(cells);
	list_of_polys_edges.push(new_edges);
	
}

function set_last_poly_active() {
	
	active_poly_ind = list_of_polys.length-1; // -1 because indexing starts at 0
	active_poly = list_of_polys[active_poly_ind];
	
}

function complete_poly(poly_ind) {
	var new_cells = fill_poly(active_poly, polys_grid_state);
	// set poly vals to grid
	set_poly_cell_vals_to_grid(new_cells, poly_ind);
	// add coords
	list_of_polys.push(active_poly);
	// add cells
	list_of_polys_cells.push(new_cells);
	// add edges (for collision detection with other polys)
	set_new_edges(new_cells);
	// reset and set poly ind
	set_last_poly_active();
	
}

function draw() {
	draw_all();
	requestAnimationFrame(draw);
}

draw();