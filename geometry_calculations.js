function testprint() { console.log("this works at least"); }

function intersecting_lines(line1, line2) {
	
	// assuming lines are not parallel
	
	// adjust nomenclature
	var p0_x = line1.p1.x;
	var p1_x = line1.p2.x;
	var p2_x = line2.p1.x;
	var p3_x = line2.p2.x;
	var p0_y = line1.p1.y;
	var p1_y = line1.p2.y;
	var p2_y = line2.p1.y;	
	var p3_y = line2.p2.y;
	
	var s1_x = p1_x - p0_x;
	var s1_y = p1_y - p0_y;
    var s2_x = p3_x - p2_x;
	var s2_y = p3_y - p2_y;
	
	var denom = -s2_x * s1_y + s1_x * s2_y;
	
	var s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
	var t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);
	
	if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
		return true;
	}

	return false;
	
}

function intersection_parallel_lines(line1, line2) {
	
	// adjust nomenclature
	x1 = Math.min(line1.p1.x, line1.p2.x);
	x2 = Math.max(line1.p1.x, line1.p2.x);
	x3 = Math.min(line2.p1.x, line2.p2.x);
	x4 = Math.max(line2.p1.x, line2.p2.x);
	y1 = Math.min(line1.p1.y, line1.p2.y);
	y2 = Math.max(line1.p1.y, line1.p2.y);
	y3 = Math.min(line2.p1.y, line2.p2.y);
	y4 = Math.max(line2.p1.y, line2.p2.y);

	// horizontal lines
	if (y1 == y2) {
		// check whether there is a gap perpendicular to line direction
		if (y2 == y4) {
			// check whether there is a gap parallel to line direction
			return projection_overlap(x1, x2, x3, x4);
		} else {
			return false;
		}
	}
	
	// vertical lines
	if (x1 == x2) {
		// check whether there is a gap perpendicular to line direction
		if (x2 == x4) {
			// check whether there is a gap parallel to line direction
			return projection_overlap(y1, y2, y3, y4);
		} else {
			return false;
		}
	}
	
	// diagonal lines; check if line parameters are the same
	var line_eq1 = get_line_parameters(line1);
	var line_eq2 = get_line_parameters(line2);
	// check whether there is a gap perpendicular to line direction
	if (line_eq1.m == line_eq2.m && line_eq1.n == line_eq2.n) {
		// check whether there is a gap parallel to line direction
		return projection_overlap(x1, x2, x3, x4);
	}
	
	return false;
	
}

function projection_overlap(val1, val2, val3, val4) {
	if (val1 < val4 && val1 > val3) // If val1 is between val3 and val4
	{
		return true;
	}

	if (val2 < val4 && val2 > val3) // If val2 is between val3 and val4
	{
		return true;
	}

	if (val3 < val2 && val3 > val1) // If val3 is between val1 and val2
	{
		return true;
	}

	if (val4 < val2 && val4 > val1) // If val4 is between val1 and val2
	{
		return true;
	}
	
	return false;
	
}

function get_line_parameters(line) {
	
	p1 = line.p1;
	p2 = line.p2;
	
	m = (p2.y - p1.y) / (p2.x - p1.x);
	n = p1.y - m*p1.x;
	
	return {
		m: m,
		n: n
	};
	
}

function find_intersection_point(line1, line2) {
	
	// only call function when there is intersection!!
	// does not catch cases when there is no intersection.
	
	// adjust nomenclature
	var p0_x = line1.p1.x;
	var p1_x = line1.p2.x;
	var p2_x = line2.p1.x;
	var p3_x = line2.p2.x;
	var p0_y = line1.p1.y;
	var p1_y = line1.p2.y;
	var p2_y = line2.p1.y;	
	var p3_y = line2.p2.y;
	
	var s1_x = p1_x - p0_x;
	var s1_y = p1_y - p0_y;
    var s2_x = p3_x - p2_x;
	var s2_y = p3_y - p2_y;
	
	// catch special case that lines are parallel
	
	var s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
	var t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);
	
	i_x = p0_x + (t * s1_x);
    i_y = p0_y + (t * s1_y);
	
	return {
		x: i_x,
		y: i_y
	}
	
}

function parallel_lines(line1, line2) {
	
	// adjust nomenclature
	var p0_x = line1.p1.x;
	var p1_x = line1.p2.x;
	var p2_x = line2.p1.x;
	var p3_x = line2.p2.x;
	var p0_y = line1.p1.y;
	var p1_y = line1.p2.y;
	var p2_y = line2.p1.y;	
	var p3_y = line2.p2.y;
	
	var s1_x = p1_x - p0_x;
	var s1_y = p1_y - p0_y;
    var s2_x = p3_x - p2_x;
	var s2_y = p3_y - p2_y;
	
	var den = -s2_x * s1_y + s1_x * s2_y;
	
	if (den == 0) {
		return true;
	}
	
	return false;
	
}

// copied from https://github.com/mikolalysenko/robust-point-in-polygon/blob/master/robust-pnp.js

function poly_to_list(poly) {
		
	coord_list = [];
	//console.log(poly.length);
	
	for (coord_ind = 0; coord_ind < poly.verts.length; coord_ind++) {
		
		//console.log("here");
		
		coord_list.push([poly.verts[coord_ind].x, poly.verts[coord_ind].y]);
		
	}
	
	//console.log("coord list:", coord_list);
	return coord_list;
	
}

function point_inside_poly(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};



// Define Infinite (Using INT_MAX caused overflow problems)
var INF = 10000;
 
// struct Point
// {
    // int x;
    // int y;
// };
 
// Given three colinear points p, q, r, the function checks if
// point q lies on line segment 'pr'
function onSegment(p, q, r)
{
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
			{ return true; }
    return false;
}
 
// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are colinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function orientation(p, q, r)
{
    val = (q.y - p.y) * (r.x - q.x) -
              (q.x - p.x) * (r.y - q.y);
 
    if (val == 0) { return 0; }  // colinear
    return (val > 0)? 1: 2; // clock or counterclock wise
}
 
// The function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
function doIntersect(p1, q1, p2, q2)
{
    // Find the four orientations needed for general and
    // special cases
    var o1 = orientation(p1, q1, p2);
    var o2 = orientation(p1, q1, q2);
    var o3 = orientation(p2, q2, p1);
    var o4 = orientation(p2, q2, q1);
 
    // General case
    if (o1 != o2 && o3 != o4)
		{ return true; }
 
    // Special Cases
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) { return true; }
 
    // p1, q1 and p2 are colinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) { return true; }
 
    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) { return true; }
 
     // p2, q2 and q1 are colinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) { return true; }
 
    return false; // Doesn't fall in any of the above cases
}
 
// Returns true if the point p lies inside the polygon[] with n vertices
function isInside(polygon, p)
{
	
	// store intersection points
	var ip = [];
	same_p_count = 0;
	
	//soemhow doesnt work when right vertex at same y coordinate
	
	// derive n: number of vertices in polygon
	n = polygon.length;
	
    // There must be at least 3 vertices in polygon[]
    if (n < 3)  { return false; }
 
    // Create a point for line segment from p to infinite
    extreme = {x: INF, y: p.y};
	
	// try another line
	extreme2 = {x: -INF, y: p.y};
	
	extreme3 = {x: p.x, y: INF};
	
	extreme4 = {x: p.x, y: -INF};
 
    // Count intersections of the above line with sides of polygon
    count = 0;
	i = 0;
    do
    {
		console.log(ip);
        next = (i+1)%n; // loop over all poly coordinates
 
        // Check if the line segment from 'p' to 'extreme' intersects
        // with the line segment from 'polygon[i]' to 'polygon[next]'
        if (doIntersect(polygon[i], polygon[next], p, extreme))
        {
            // If the point 'p' is colinear with line segment 'i-next',
            // then check if it lies on segment. If it lies, return true,
            // otherwise false
            if (orientation(polygon[i], p, polygon[next]) == 0)
               return onSegment(polygon[i], p, polygon[next]);
		   
		   // specifiy intersection point
		   current_inters = find_intersection_point({p1: polygon[i], p2: polygon[next]}, {p1: p, p2: extreme});
		   
			if (ip.length == 0) {
			   
			   // make copy, else will stay the same always
				ip.push({x:current_inters.x, y:current_inters.y});
				console.log('way1');
				
			} else if (current_inters.x == ip[0].x && current_inters.y == ip[0].y) {
				
				console.log(ip[0], current_inters);
				ip = [];
				ip.push({x:current_inters.x, y:current_inters.y});
				
				if (same_p_count == 0) {
					
					same_p_count++;
					
				}
				console.log('way2');
					
			} else {
				
				//TODO why not into this part? why array ip empty?
				
				console.log('here');
				count++
				console.log('way3');
				
			}
		   
		   // problem: double count if on corner! --> check if intersection at exact same point.
		   // probably only need to check last found intersection (?)
            //count++;
			
		// if other infinity point checked: now it seems it's only valid when point to the right
		
        // } else if (doIntersect(polygon[i], polygon[next], p, extreme2)) {
			
			 // If the point 'p' is colinear with line segment 'i-next',
            // then check if it lies on segment. If it lies, return true,
            // otherwise false
            // if (orientation(polygon[i], p, polygon[next]) == 0)
               // return onSegment(polygon[i], p, polygon[next]);
 
            // count++;
			
		// } else if (doIntersect(polygon[i], polygon[next], extreme3, p)) {
			
			 // If the point 'p' is colinear with line segment 'i-next',
            // then check if it lies on segment. If it lies, return true,
            // otherwise false
            // if (orientation(polygon[i], p, polygon[next]) == 0)
               // return onSegment(polygon[i], p, polygon[next]);
 
            // count++;
			
		// } else if (doIntersect(polygon[i], polygon[next], extreme4, p)) {
			
			 // If the point 'p' is colinear with line segment 'i-next',
            // then check if it lies on segment. If it lies, return true,
            // otherwise false
            // if (orientation(polygon[i], p, polygon[next]) == 0)
               // return onSegment(polygon[i], p, polygon[next]);
 
            // count++;
			
		}
		
        i = next;
		
    } while (i != 0);
 
    // Return true if count is odd, false otherwise
	console.log(count);
    return ((count+same_p_count)%2 == 1);  // Same as (count%2 == 1)
}