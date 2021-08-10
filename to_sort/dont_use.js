function move_vertex(relativeX, relativeY) {
	
	var vertex_valid = true;
	var complete = false;
	
	// conditions for adding vertices:
	// 1. shd be inside canvas
	if (relativeX > 0 && relativeX < canvas.width && relativeY > 0 && relativeY < canvas.height) {
		vert = create_vertex_pos(relativeX, relativeY);
		// 2. no double vertices, except if the first and at least 3 vertices
		var no_double_verts = check_for_double_vertices(vert);
		// 3. check whether lines intersect
		problematic_lines = [];
		var no_problematic_lines = check_whether_lines_uncrossed(vert);
		// only valid if no cases identified as invalid
		if (!no_double_verts || !no_problematic_lines) {
			vertex_valid = false;
		}
			
	} else {
		vertex_valid = false;
	}
	
	// only append if valid vertex
	if (vertex_valid == true) {
		add_vertex(vert);
	} else {
		// if double, it could be the first vertex
		complete = check_whether_poly_complete(vert);
	}
	
	// handle complete vertex list
	if (complete == true) {
		var poly = {
			verts: vertices
		};
		polys.push(poly);
		vertices = [];
	}
	
}



function move_vertex(relativeX, relativeY) {
	
	// take current vertex position in list and change position (only if valid)
	// first check if vertex valid
	var vertex_is_valid = check_vertex(relativeX, relativeY);
	
	if (vertex_is_valid) {
		
		vertices[active_vert_ind] = create_vertex_pos(relativeX, relativeY);
	
		// .x = relativeX;
		// vertices[vertices.length-1].y = relativeY;
		active_vert[0] = vertices[vertices.length-1];
		
	}
	
}


function select_vertex(e) {
	
	// take index and check if valid
	
	if (check_vertex(getXY(e))) {
		
		document.getElementById("active_vert").innerHTML = active_vert_ind;
		
		// move vertex
		move_vertex(e);
		
	}
	
}


function drag(e) {
	
	// function is called when mouse is moving
	
	if (mouse_down == true) {
		
		var relativeX = e.clientX - canvas.offsetLeft;
		var relativeY = e.clientY - canvas.offsetTop;
		
		// check length of active vertex list:
		if (active_vert.length == 0) {
			
			// first: check if there already is a vertex at position
			if (find_vertex(relativeX, relativeY)) {
				
				active_vert = vertices[active_vert_ind];
				move_vertex(relativeX, relativeY);
				
			} else {
			
				// if zero, and nothing at clicked position, add new vertex
				new_vertex(relativeX, relativeY);
				
			}
		
		} else {
			
			// still clicked: move vertex around
			move_vertex(relativeX, relativeY);
			
		}
		
	} else {
		
		// mouse not clicked --> no active vertex
		
		active_vert = [];
		
	}
	
}