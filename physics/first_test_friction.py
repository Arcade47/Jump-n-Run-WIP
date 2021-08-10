import pymunk
import pygame
import sys
import random
import math
from pymunk.vec2d import Vec2d

#############################
"""global variables"""
#############################

w, h = 600, 600
gravity_y = 500
jump_v = -math.sqrt(100 * abs(gravity_y))


############################
############################

def to_pygame(p):
    return round(p.x), round(p.y)

def draw_rectangle(screen, rect):
    rect_pos = rect.body.position
    # update the pygame coordinates with position
    pygame_verts = []
    for vert in rect.get_vertices():
        x = vert[0] + rect_pos[0]
        y = vert[1] + rect_pos[1]
        pygame_verts.append((x,y))
    # TODO read position information from rect
    pygame.draw.polygon(screen, (0,0,255), pygame_verts)

def draw_ball(screen, ball):
    # ball: pymunk shape
    pos = int(ball.body.position.x), int(ball.body.position.y)
    pygame.draw.circle(screen, (0,0,255), pos, int(ball.radius), 2)

def add_rectangle(space):
    # points hardcoded for now
    # as static object
    x1 = -0.25*w
    x2 = 0.25*w
    y1 = -50
    y2 = 50
    points = [(x1, y1), (x1, y2), (x2, y2), (x2, y1)]
    
    body = pymunk.Body(body_type = pymunk.Body.STATIC)
    body.position = (w/2, (4/5)*h)
    shape = pymunk.Poly(body, points)
    shape.friction = 1

    space.add(body, shape)
    return shape

def add_ball(space):
    mass = 3
    radius = 25
    body = pymunk.Body()
    body.position = w/2, h/2
    shape = pymunk.Circle(body, radius)
    shape.mass = mass
    shape.friction = 1
    space.add(body, shape)
    return shape

def main():
    pygame.init()
    screen = pygame.display.set_mode((600, 600))
    pygame.display.set_caption("first physics test") # TODO change in release version
    clock = pygame.time.Clock()

    space = pymunk.Space()
    space.gravity = (0.0, gravity_y)

    player = add_ball(space)
    landscape = add_rectangle(space)

    while True:

        # reset the grounding
        grounding = {
            "normal": Vec2d.zero(),
            "penetration": Vec2d.zero(),
            "impulse": Vec2d.zero(),
            "position": Vec2d.zero(),
            "body": None,
        }

        def f(arbiter):
            n = arbiter.contact_point_set.normal
            if n.y > grounding["normal"].y:
                grounding["normal"] = n
                grounding["penetration"] = -arbiter.contact_point_set.points[0].distance
                grounding["body"] = arbiter.shapes[1].body
                grounding["impulse"] = arbiter.total_impulse
                grounding["position"] = arbiter.contact_point_set.points[0].point_b

        player.body.each_arbiter(f)

        well_grounded = False
        if (
            grounding["body"] != None
            #and abs(grounding["normal"].x / grounding["normal"].y) < player.friction
        ):
            well_grounded = True

        # listen for quit
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                sys.exit(0)
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    sys.exit(0)
                if event.key == pygame.K_a:
                    player.surface_velocity = 200, 0
                if event.key == pygame.K_d:
                    player.surface_velocity = -200, 0

        if grounding["body"] != None:
            player.friction = 1#40/gravity_y
        else:
            player.friction = 0

        print(player.body.velocity.x)

        ##############################
        """draw functions"""
        ##############################

        # refresh screen
        screen.fill((255,255,255))

        space.step(1/60.0)

        if player.body.position.y > h:
            # debug: reset player position
            space.remove(player, player.body)
            player = add_ball(space)
        
        draw_ball(screen, player)
        draw_rectangle(screen, landscape)

        pygame.display.flip()
        clock.tick(60)

# event listener for keypress

if __name__ == '__main__':
    sys.exit(main())