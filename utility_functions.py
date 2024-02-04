import math

def vec_len(x1, y1, x2, y2):
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

# distance function
def dist(p1, p2):
    x1, y1 = p1
    x2, y2 = p2
    return vec_len(x1, y1, x2, y2)

def overlap(x1, y1, r1, x2, y2, r2):
    return dist((x1, y1), (x2, y2)) - (r1 + r2)

# check overlap
def overlaps(x1, y1, r1, x2, y2, r2):
    # is distance shorter than the smaller radius?
    return overlap(x1, y1, r1, x2, y2, r2) < 0

def overlap_correction_vector(x1, y1, r1, x2, y2, r2):
    # assuming that player is 1 and other is 2
    veclen = dist((x1, y1), (x2, y2))
    vec_x = x2 - x1
    vec_y = y2 - y1
    vec_x_norm = vec_x/veclen
    vec_y_norm = vec_y/veclen
    scale_by = overlap(x1, y1, r1, x2, y2, r2)
    return (vec_x_norm*scale_by, vec_y_norm*scale_by)