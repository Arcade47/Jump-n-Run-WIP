// global boolean variables

var open_poly = false;			// is there an uncompleted poly

// global identity vars (for selecting and such)

var selected_poly_ind = -1;		// -1 if none
var selected_vert_ind = -1;		// -1 if none
var open_poly_coords = [];		// empty list if none
var polys = [];					// list of lists of coordinates
var polys_cells = [];			// list of lists of 
var grid = initialize_grid(n_rows, n_cols); // function and values specified in other files
var active_vert_ind	= -1;		// selected vert (-1 if none)
var active_poly_ind	= polys.length-1;		// selected poly (-1 if none or open)

// nomenclature:
// pos: x and y coordinates
// cell: row and col indices in grid

// important to remember:
// poly_ind is always 1 less than grid values! convert accordingly.
// exception: open_poly, always -1 (both ind and grid value)

// TODO set the active verts in respective functions

// general function (move to geometry)

function one_line_valid(pos, p1, p2) {
	// pos replaces p2 (make sure when calling function that order of inputs is correct)
	// make copy of grid
	var gridcopy = grid;
	// remove the old line
	var oldline = [p1, p2];
	var oldline_cells = line_to_grid_cells(oldline);
	for (var i=0; i<oldline_cells.length; i++) {
		gridcopy[oldline_cells[i].col][oldline_cells[i].row] = 0;
	}
	// check one line
	var line = [p1, pos];
	// get cells from line
	var line_cells = line_to_grid_cells(line);
	// check if any occupancies
	for (var i=0; i<line_cells.length; i++) {
		if (gridcopy[line_cells[i].col][line_cells[i].row] != 0) {
			return false;
		}
	}
	// no problems --> valid
	return true;
}

function two_lines_valid(pos, p1, p2, p3) {
	// pos replaces p2 (make sure when calling function that order of inputs is correct)
	// make copy of grid
	var gridcopy = grid;
	// remove the old line
	var oldline1 = [p1, p2];
	var oldline2 = [p2, p3];
	var oldline1_cells = line_to_grid_cells(oldline1);
	var oldline2_cells = line_to_grid_cells(oldline2);
	for (var i=0; i<oldline1_cells.length; i++) {
		gridcopy[oldline1_cells[i].col][oldline1_cells[i].row] = 0;
	}
	for (var i=0; i<oldline2_cells.length; i++) {
		gridcopy[oldline2_cells[i].col][oldline2_cells[i].row] = 0;
	}
	// check two lines
	var line1 = [p1, pos];
	var line2 = [pos, p3];
	// get cells from line
	var line1_cells = line_to_grid_cells(line1);
	var line2_cells = line_to_grid_cells(line2);
	// check if any occupancies
	for (var i=0; i<line1_cells.length; i++) {
		if (gridcopy[line1_cells[i].col][line1_cells[i].row] != 0) {
			return false;
		}
	}
	for (var i=0; i<line2_cells.length; i++) {
		if (gridcopy[line2_cells[i].col][line2_cells[i].row] != 0) {
			return false;
		}
	}
	// no problems --> valid
	return true;
}


// boolean functions (check whether something is the case)

function pos_not_occupied(pos) {
	// checks if a non-zero value at pos in grid (global var)
	// 1. get all the cells (1, 2 or 4) around pos
	var cells = pos_to_cells(pos);
	// 2. check in grid if no occupancies
	for (var i=0; i<cells.length; i++) {
		if (grid[cells[i].col][cells[i].row] != 0) {
			return false;
		}
	}
	// 3. no occupancies --> return true
	return true;
}

function first_vert_of_open_poly(pos) {
	
	// given that space is occupied --> is first vert, i.e. close poly?
	// check empty open_poly first to avoid index error
	if (open_poly_coords.length == 0) { return false; }
	// check identity
	var vert = open_poly_coords[0];
	if (pos.x == vert.x && pos.y == vert.y) {
		return true;
	}
	
	// not same vert
	return false;
	
}

function vert_of_any_poly_at_pos(pos) {
	// loops through all verts of all polys & compares with input pos
	// 2. loop through all polys
	for (var pi=0; pi<polys.length; pi++) {
		// 3. loop through all verts
		for (var vi=0; vi<polys[pi].length; vi++) {
			// 4. compare if pos and vert match
			if (pos.x == polys[pi][vi].x && pos.y == polys[pi][vi].y) {
				return true;
			}
		}
	}
	// 5. no match found
	return false;
}

function any_poly_at_pos(pos) {
	// check if cells of pos has any larger value than 0
	// another function returns this value!
	// 1. get all the cells (1, 2 or 4) around pos
	var cells = pos_to_cells(pos);
	// 2. check if any cell has a poly (larger than zero)
	for (var i=0; i<cells.length; i++) {
		if (grid[cells[i].col][cells[i].row] > 0) {
			return true;
		}
	}
	// 3. no occupancies --> return false
	return false;
}

function vert_of_open_poly_at_pos(pos) {
	// loops through all verts of open poly & compares with input pos
	// 3. loop through all verts of open poly
	for (var vi=0; vi<open_poly_coords.length; vi++) {
		// 4. compare if pos and vert match
		if (pos.x == open_poly_coords[vi].x && pos.y == open_poly_coords[vi].y) {
			return true;
		}
	}
	// 5. no match found
	return false;
}

function move_vert_of_closed_poly_valid(pos, poly_ind, vert_ind) {
	// temporarily removes 2 lines from grid, then adds adjusted lines
	// check if cells of these lines overlap with any non-zero cell in grid
	// 1. make local copy of grid
	var gridcopy = grid;
	// 2. get the vert_inds left and right
	var poly = polys[poly_ind];
	if (vert_ind == 0) {var l = poly.length-1;} else {var l = vert_ind - 1;}
	if (vert_ind == poly.length-1) {var r = 0;} else {var r = vert_ind + 1;}
	var m = vert_ind;
	// check two new lines
	return two_lines_valid(pos, poly[l], poly[m], poly[r]);
}

function move_poly_valid(diffpos, poly_ind) {
	// temporarily remove poly cells from grid and check if adjusted cells
	// overlap with any non-zero cells in grid
	// 1. make local copy of grid
	var gridcopy = grid;
	// 2. remove the cells of this poly from grid
	var poly_cells = polys_cells[poly_ind];
	for (var i=0; i<poly_cells.length; i++) {
		gridcopy[poly_cells[i].col][poly_cells[i].row] = 0;
	}
	// 3. apply difference to poly cells
	var diffcell = cell_from_coord_diff(diffpos);
	var new_cells = apply_cell_diff(poly_cells, diffcell);
	// 4. check in gridcopy for occupancies
	for (var i=0; i<new_cells.length; i++) {
		if (gridcopy[new_cells[i].col][new_cells[i].row] != 0) {
			return false;
		}
	}
	// 5. no problems encountered --> valid
	return true;
}

function append_vert_valid(pos) {
	// check line cells if at least second vert, else only the cells at position
	// 1. case distinction: zero or at least one vert in open_poly
	if (open_poly_coords.length == 0) {
		// 2. only check if no occupancies in cells around pos
		return pos_not_occupied(pos);
	} else {
		// 3. make a line
		var line = [open_poly_coords[open_poly_coords.length-1], pos];
		// 4. get cells from line
		var line_cells = line_to_grid_cells(line);
		// 5. check if any occupancies
		for (var i=0; i<line_cells.length; i++) {
			if (grid[line_cells[i].col][line_cells[i].row] != 0) {
				// do not consider the cells around the last vert
				var cells_around_last_vert = pos_to_cells(open_poly_coords[open_poly_coords.length-1]);
				if (!cell_in_cells(line_cells[i], cells_around_last_vert)) {
					return false;
				}
			}
		}
		// 6. no problems --> valid
		return true;
	}
}

function move_vert_of_open_poly_valid(pos, vert_ind) {
	// check cells of one or two new lines for overlap with non-zero grid values
	// make grid copy (because current pos needs to be deleted
	// case distinction: one or >= two coords in open_poly (then check if first/last or in between coord)
	if (open_poly.length == 1) {
		// here: check one vert
		return pos_not_occupied(pos);
	} else if (open_poly.length == 2) { // more than one (move check requires at least one vertex to be there already)
		// check one line
		if (vert_ind == 0) { var other_vert_ind = 1; } else { var other_vert_ind = 0; }
		return one_line_valid(pos, open_poly_coords[other_vert_ind], open_poly_coords[vert_ind]);
	} else { // at least 3 verts --> differentiate between one and two lines
		// one line if first or last vert
		if (vert_ind == 0 || vert_ind == open_poly_coords.length - 1) {
			// check one line
			if (vert_ind == 0) {var other_vert = 1;} else {other_vert = open_poly_coords.length - 2;}
			var p1 = open_poly_coords[other_vert_ind];
			var p2 = open_poly_coords[vert_ind];
			return one_line_valid(pos, p1, p2);
		} else {
			// check two lines
			var p1 = open_poly_coords[vert_ind-1];
			var p2 = open_poly_coords[vert_ind];
			var p3 = open_poly_coords[vert_ind+1];
			return two_lines_valid(pos, p1, p2, p3);
		}
	}
}

function first_vert_of_open_poly_at_pos(pos) {
	// important function if poly is closed
	var first_vert = open_poly_coords[0];
	if (pos.x == first_vert.x && pos.y == first_vert.y) {
		return true;
	}
	return false;
}

function close_poly_valid() {
	
	// just test that at least triangle
	return open_poly_coords.length > 2;
	
}


// setting and selection functions (alter values of global variables)

function start_new_poly(vert_pos) {
	// appends verts to global open_poly variable & appends to polys list
	if (open_poly_coords.length > 2) {
		polys.push(open_poly_coords);
	}
	// restart open_poly_coords list
	open_poly_coords = [vert_pos];
}

function select_vert(pos) {
	// find which poly is selected (only when no open poly existing)
	// 1. loop through open poly
	// 2. loop through all polys
	console.log('select vert closed poly');
	for (var pi=0; pi<polys.length; pi++) {
		console.log('select vert closed poly start');
		// 3. loop through all verts
		for (var vi=0; vi<polys[pi].length; vi++) {
			// 4. compare if pos and vert match
			if (pos.x == polys[pi][vi].x && pos.y == polys[pi][vi].y) {
				active_poly_ind = pi;
				active_vert_ind = vi;
				// stop search
				break;
			}
		}
	}
	// set global var of index which vert in active poly is selected
	active_vert_ind = vert_ind;
}

function select_vert_of_open_poly(pos) {
	// assumes that selected vert is in open poly
	// loops through all verts of open poly & compares with input pos
	// loop through all verts of open poly
	console.log('in function to select poly');
	for (var vi=0; vi<open_poly_coords.length; vi++) {
		// 4. compare if pos and vert match
		if (pos.x == open_poly_coords[vi].x && pos.y == open_poly_coords[vi].y) {
			active_vert_ind = vi;
			console.log('found vert in open poly to select');
			// stop search
			break;
		}
	}
}

function select_poly(pos) {
	// set global var of index which poly is selected (for moving etc)
	// first find which poly is selected
	var cells = pos_to_cells(pos);
	// 2. check if any cell has a poly (larger than zero)
	console.log('select poly');
	for (var i=0; i<cells.length; i++) {
		if (grid[cells[i].col][cells[i].row] > 0) {
			// -1 because indexing starts at 0
			// set global variable
			active_poly_ind =  grid[cells[i].col][cells[i].row] - 1;
			// stop search
			break;
		}
	}
}

function deselect_vert() {
	
	// important if no vert is to be dragged
	active_vert_ind	= -1;
	
}

function deselect_poly() {
	
	// important if no vert is to be dragged
	active_poly_ind	= -1;
	
}


// placing and moving functions (changes global grid variable)

function close_poly(pos) {
	
	//TODO some problem here: last line is not identified in cells
	
	// append the last coord to close
	open_poly_coords.push(pos);
	// appends coords to polys list
	polys.push(open_poly_coords);
	// set poly cells to grid
	// get poly cells
	console.log('open_poly_coords', open_poly_coords);
	var poly_cells = fill_poly_from_coords(open_poly_coords);
	// sets last poly active (-1 because indexing starts at 0)
	active_poly_ind = polys.length-1;
	console.log('poly cells', poly_cells);
	// set these cells to grid
	for (var i=0; i<poly_cells.length; i++) {
		// make sure to round
		var cell = {col: Math.round(poly_cells[i].col), row: Math.round(poly_cells[i].row)};
		// poly_ind + 1 because 0 in grid is reserved for 'empty'
		grid[cell.col][cell.row] = active_poly_ind + 1;
	}
	// empties the open_poly list
	open_poly_coords = [];
}

function drag_vert(pos, vert_i, poly_i) {
	// second order function, calls the respective move functions
	if (active_poly_ind == -1) { //i.e. open poly
		if (open_poly_coords.length == 1) {
			// always only one coord (up to 4 cells)
			move_single_vert(pos);
		} else if (open_poly_coords.length == 2) {
			// always only one line
			move_vert_len_2(pos, vert_i);
		} else { // at least 3 verts
			// one line if first or last vert
			if (vert_i == 0 || vert_i == open_poly_coords.length-1) {
				// TODO call function that makes one new line
				move_verts_len_over2(pos, vert_i, poly_i);
			}
		}
	} else { //i.e. some closed poly
		// always making two new lines
		move_verts_len_over2(pos, vert_i, poly_i);
	}
}

function move_single_vert(vertdest) {
	// removes old occupied cells, creates new occupied cells, overwrites vert
	// sets global vars, i.e. no return
	// assumes there is only single vert, so must be open_poly!
	
	// derive vert previous position from vert ind
	var vertprev = open_poly_coords[0];
	// remove from grid
	var oldcells = pos_to_cells(vertprev);
	for (var i=0; i<oldcells.length; i++) {
		grid[oldcells[i].col][oldcells.row] = 0;
	}
	// set new pos to grid
	var newcells = pos_to_cells(vertdest);
	for (var i=0; i<newcells.length; i++) {
		// index for grid -1, because always open_poly
		grid[newcells.col][newcells.row] = -1;
	}
	// replace vert in open_poly_coords var
	open_poly_coords[0] = vertdest;
}

function move_vert_len_2(vertdest, vert_i) {
	// removes old occupied cells, creates new occupied cells, overwrites vert
	// sets global vars, i.e. no return
	// assumes there are exactly 2 verts, so must be open_poly!
	
	// derive old pos
	var thisvert = open_poly_coords[vert_i];
	// derive other pos
	var othervert = open_poly_coords[switch_0_1(vert_i)];
	// derive all occupied cells from grid
	console.log('debug vert_i, thisvert', vert_i, thisvert);
	var oldcells = line_to_grid_cells([thisvert, othervert]);
	console.log('oldcells', oldcells);
	// remove from grid
	for (var i=0; i<oldcells.length; i++) {
		grid[oldcells[i].col][oldcells[i].row] = 0;
	}
	// set new pos to grid
	var newcells = line_to_grid_cells([othervert, vertdest]);
	for (var i=0; i<newcells.length; i++) {
		// index for grid -1, because always open_poly
		grid[newcells.col][newcells.row] = -1;
	}
	// replace vert in open_poly_coords var
	open_poly_coords[vert_i] = vertdest;
}

function move_verts_len_over2(vertdest, vert_i, poly_i) {
	// removes old occupied cells, creates new occupied cells, overwrites vert
	// sets global vars, i.e. no return
	// assumes there are > 2 verts, so can be either open or closed poly!
	
	// case distinction: open or closed poly?
	// if closed poly: always move two lines
	// if open poly: move one or two new lines
	// case distinction: open_poly?
	if (poly_i == -1) {
		if (vert_ind == 0 || vert_ind == open_poly_coords.length - 1) {
			// make one line
			if (vert_ind == 0) {var other_vert = 1;} else {other_vert = open_poly_coords.length - 2;}
			var p1 = open_poly_coords[other_vert_ind];
			var p2 = open_poly_coords[vert_ind];
			var oldline = [p1, p2];
			// get the old cells
			var oldcells = line_to_grid_cells(oldline);
			// get new cells
			var newline = [p1, vertdest];
			var newcells = line_to_grid_cells(newline);
		} else { // vert in between, not at start or end --> always 2 lines are affected
			// make two lines
			var p1 = open_poly_coords[vert_ind-1];
			var p2 = open_poly_coords[vert_ind];
			var p3 = open_poly_coords[vert_ind+1];
			var oldline1 = [p1, p2];
			var oldline2 = [p2, p3];
			// get the old cells
			var oldcells = line_to_grid_cells(oldline1);
			var oldcells2 = line_to_grid_cells(oldline2);
			oldcells = append_cells_avoid_doubles(oldcells, oldcells2);
			// get the new cells
			var newline1 = [p1, vertdest];
			var newline2 = [vertdest, p2];
			var newcells = line_to_grid_cells(newline1);
			var newcells2 = line_to_grid_cells(newline2);
			newcells = append_cells_avoid_doubles(newcells, newcells2);
		}
		// set vert in poly to new position
		open_poly_coords[vert_i] = vertdest;
	} else { // vert of finished poly is affected
		// just calculate new cells for new poly
		// store the old cells
		var oldcells = polys[poly_i];
		// first refresh the vert before the poly can be refreshed
		console.log('poly_i',poly_i);
		polys[poly_i][vert_i] = vertdest;
		// get the new cells
		var newcells = fill_poly_from_coords(polys[poly_i]);
	}
	// remove the old cells from grid
	for (var i=0; i<oldcells.length; i++) {
		grid[oldcells[i].col][oldcells[i].row] = 0;
	}
	// add the new cells from grid
	for (var i=0; i<newcells.length; i++) {
		grid[newcells[i].col][newcells[i].row] = poly_i;
	}
}

function drag_poly(diffpos, poly_i) {
	// removes old grid cells, sets new grid cells, adjusts verts
	// assuming movement is valid
	
	// store the old cells
	var oldcells = polys[poly_i];
	// apply diff to coords (loop over verts)
	for (var i=0; i<polys[poly_i].length; i++) {
		polys[poly_i][i].x += diffpos.x;
		polys[poly_i][i].y += diffpos.y;
	}
	// get the new cells
	var newcells = fill_poly_from_coords(polys[poly_i]);
	// remove the old cells from grid
	for (var i=0; i<oldcells.length; i++) {
		grid[oldcells[i].col][oldcells[i].row] = 0;
	}
	// add the new cells from grid
	for (var i=0; i<newcells.length; i++) {
		grid[newcells[i].col][newcells[i].row] = poly_i;
	}
}

function append_vert(pos) {
	// only sets global vars --> no return!:
	// add line cells to grid and append vert pos at pos to open_poly
	if (open_poly_coords.length > 0) {
		// make line of last vert of open_poly and pos
		var line = [open_poly_coords[open_poly_coords.length-1], pos];
		// create cells from line
		var cells_line = line_to_grid_cells(line);
	} else { // empty open_poly
		// create cells around vert
		var cells_line = pos_to_cells(pos);
	}
	// append to grid
	for (var i=0; i<cells_line.length; i++) {
		grid[cells_line[i].col][cells_line[i].row] = -1;
	}
	// append to open_poly
	open_poly_coords.push(pos);
}


// debugging functions (prints stuff to the console)

function print_cell_occupancies(pos) {
	// outputs cell identities of each cell around clicked pos
	var cells = pos_to_cells(pos);
	// loop and console log
	var output = [];
	for (var i=0; i<cells.length; i++) {
		var c = cells[i];
		output.push(grid[c.col][c.row]);
	}
	console.log('cells at pos', output);
}