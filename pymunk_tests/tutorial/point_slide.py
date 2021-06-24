import sys, random
import pygame
import pymunk

def to_pygame(p):
    return round(p.x), round(p.y)

def add_ball(space):
    mass = 3
    radius = 25
    body = pymunk.Body()
    x = random.randint(120, 300)
    body.position = x, 50
    shape = pymunk.Circle(body, radius)
    shape.mass = mass
    shape.friction = 1
    space.add(body, shape)
    return shape

def add_L(space):
    rotation_center_body = pymunk.Body(body_type=pymunk.Body.STATIC)
    rotation_center_body.position = (300, 300)

    rotation_limit_body = pymunk.Body(body_type=pymunk.Body.STATIC)
    rotation_limit_body.position = (200, 300)

    body = pymunk.Body()
    body.position = (300, 300)
    l1 = pymunk.Segment(body, (-150, 0), (255, 0), 5)
    l2 = pymunk.Segment(body, (-150, 0), (-150, -50), 5)
    l1.friction = 1
    l2.friction = 1
    l1.mass = 8
    l2.mass = 1
    rotation_center_joint = pymunk.PinJoint(
        body, rotation_center_body, (0, 0), (0, 0)
    )
    joint_limit = 25
    rotation_limit_joint = pymunk.SlideJoint(
        body, rotation_limit_body, (-100, 0), (0, 0), 0, joint_limit)

    space.add(l1, l2, body, rotation_center_joint, rotation_limit_joint)
    return l1, l2

def draw_ball(screen, ball):
    pos = int(ball.body.position.x), int(ball.body.position.y)
    pygame.draw.circle(screen, (0,0,255), pos, int(ball.radius), 2)

def draw_lines(screen, lines):
    for line in lines:
        body = line.body
        pv1 = body.position + line.a.rotated(body.angle)
        pv2 = body.position + line.b.rotated(body.angle)
        p1 = to_pygame(pv1)
        p2 = to_pygame(pv2)
        pygame.draw.lines(screen, "orange", False, [p1,p2])


def main():
    pygame.init()
    screen = pygame.display.set_mode((600, 600))
    pygame.display.set_caption("bla bla bla...")
    clock = pygame.time.Clock()

    space = pymunk.Space()
    space.gravity = (0.0, 900.0)

    lines = add_L(space)
    balls = []

    ticks_to_next_ball = 10

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                sys.exit(0)
            elif event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
                sys.exit(0)

        ticks_to_next_ball -= 1
        if ticks_to_next_ball <= 0:
            ticks_to_next_ball = 25
            ball_shape = add_ball(space)
            balls.append(ball_shape)

        screen.fill((255,255,255))

        space.step(1/60.0)

        balls_to_remove = []
        for ball in balls:
            if ball.body.position.y < 0:
                balls_to_remove.append(ball)
        
        for ball in balls_to_remove:
            space.remove(ball, ball.body)
            balls.remove(ball)

        for ball in balls:
            draw_ball(screen, ball)
        draw_lines(screen, lines)

        pygame.display.flip()
        clock.tick(60)

if __name__ == '__main__':
    sys.exit(main())