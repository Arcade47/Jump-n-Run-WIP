// inputs: radius, position on canvas and context

// predefined vars
var n_rows = 40;
var n_cols = 40;
var canv_w = 480;	
var canv_h = 480;

// TODO implement scrolling

function clear_canvas() {
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
}

function draw_grid() {
	
	for (h = 0; h < canvas.height; h += canvas.height/n_rows) {
		coords = [
			{x: 0, y: h},
			{x: canvas.width, y: h}
		];
		draw_poly(coords, "white");
	}
	
	for (v = 0; v < canvas.width; v += canvas.width/n_cols) {
		coords = [
			{x: v, y: 0},
			{x: v, y: canvas.height}
		];
		draw_poly(coords, "white");
	}
}

function draw_line(coords, color) {
	ctx.beginPath();
	ctx.lineWidth="1";
	ctx.strokeStyle=color;
	ctx.moveTo(coords[0].x, coords[0].y);
	ctx.lineTo(coords[1].x, coords[1].y);
	ctx.stroke();
	ctx.closePath();
}

function draw_circ (r, pos) {
	ctx.beginPath();
	ctx.arc(pos.x, pos.y, r, 0, 2*Math.PI);
	ctx.fill();
}

function draw_poly(coords, color) {
	ctx.beginPath();
	ctx.moveTo(coords[0].x, coords[0].y);
	ctx.strokeStyle=color;
	ctx.fillStyle=color;
	for (i=1; i<coords.length; i++) {
		ctx.lineTo(coords[i].x, coords[i].y);
	}
	ctx.lineTo(coords[coords.length-1].x, coords[coords.length-1].y);
	ctx.closePath();
	ctx.stroke();
	ctx.fill();
}

function draw_vertex(coord) {
	
	ctx.beginPath();
	ctx.lineWidth="1";
	ctx.strokeStyle="blue";
	ctx.arc(coord.x,coord.y,5,0,2*Math.PI);
	ctx.stroke();
	ctx.closePath();
	
}

function draw_rect(coord, w, h, color) {
	ctx.beginPath();
	ctx.fillStyle=color;
	ctx.rect(coord.x, coord.y, w, h);
	ctx.fill();
}

function highlight_cell(cell, color) {
	var w = canvas.width/n_cols;
	var h = canvas.height/n_rows;
	draw_rect({x: cell.col*w, y: cell.row*h}, w, h, color);
}

function draw_problematic_cells(sec, pc, pcc) {
	
	// pc: problematic_cells
	// pcc: counter
	
	// draw problematic cells if any
	if (pc.length > 0 && pcc < sec*60) {
		for (var i=0; i<pc.length; i++) {
			highlight_cell({col: pc[i].col, row: pc[i].row}, "red");
			// move forward time
			pcc++;
			problematic_cells_counter = pcc;
		}
	}
	// reset if no problems or counter too long
	else {
		// set_values({probcells: [], probcount: 0});
		problematic_cells = [];
		problematic_cells_counter = 0;
	}
	
}

function draw_finished_polys(selectcolor, inactivecolor, list_of_polys, active_poly_ind) {
	
	for (var i=0; i<list_of_polys.length; i++) {
		// draw selected poly orange
		if (i == active_poly_ind) { var color = selectcolor; }
		else { var color = inactivecolor; }
		draw_poly(list_of_polys[i], color);
	}
	
}

function draw_grid_occupancies(grid, color1, color2, color3, color4) {
	
	for (var i=0; i<grid.length; i++) {
		for (var j=0; j<grid[i].length; j++) {
			// if (grid[i][j] == -1) {highlight_cell({col: i, row: j}, color1);}
			if (grid[i][j] == 1) {highlight_cell({col: i, row: j}, color2);}
			else if (grid[i][j] == 2) {highlight_cell({col: i, row: j}, color3);}
			else if (grid[i][j] == 3) {highlight_cell({col: i, row: j}, color4);}
		}
	}
	
}

function draw_active_cells(grid, color) {
	for (var i=0; i<grid.length; i++) {
		for (var j=0; j<grid[i].length; j++) {
			if (grid[i][j] == -1) {highlight_cell({col: i, row: j}, color);}
		}
	}
}

function testdraw_active_lines(color, active_cells_draw) {
	
	for (var i=0; i<active_cells_draw.length; i++) {
		highlight_cell(active_cells_draw[i], color);
	}
	
}

function testdraw_polys_cells(color, list_of_polys_cells) {
	
	for (var i=0; i<list_of_polys_cells.length; i++) {
		for (var j=0; j<list_of_polys_cells[i].length; j++) {
			highlight_cell({col: list_of_polys_cells[i][j].col, row: list_of_polys_cells[i][j].row}, color);
		}
	}
	
}

function testdraw_cell_occupations(linecolor, selectedcolor, inactivecolor, polys_grid_state, active_poly_ind) {
	
	for (var i=0; i<polys_grid_state.length; i++) {
		for (var j=0; j<polys_grid_state[i].length; j++) {
			// active line
			if (polys_grid_state[i][j] == -1) {
				highlight_cell({col: i, row: j}, linecolor);
			}
			if (polys_grid_state[i][j] > 0 && polys_grid_state[i][j] != active_poly_ind+1) {
				highlight_cell({col: i, row: j}, inactivecolor);
			}
			if (polys_grid_state[i][j] > 0 && polys_grid_state[i][j] == active_poly_ind+1) {
				highlight_cell({col: i, row: j}, selectedcolor);
			}
		}
	}
	
}

function draw_active_vertices(active_poly) {
	
	for (var i=0; i<active_poly.length; i++) {
		draw_vertex(active_poly[i]);
	}
	
}

function draw_active_lines(active_poly) {
	
	var lines = lines_from_coords(active_poly, false);
	for (var i=0; i<lines.length; i++) {
		draw_poly(lines[i], "blue");
	}
	
}

// control canvas prints - setup
var canvas = document.getElementById("GameCanvas");
canvas.width = canv_w;
canvas.height = canv_h;
ctx = canvas.getContext("2d");

draw_grid();