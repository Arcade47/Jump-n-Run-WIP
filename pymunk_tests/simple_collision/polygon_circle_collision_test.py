import pygame
import pymunk

# game states
# these can be changed by pressing the enter key
state = "set" # set run

# unchanging assets
space = pymunk.Space(gravity=(0.0, 900.0))

ball_body = pymunk.Body(position=(100, 100))
ball_shape = pymunk.Circle(ball_body, radius=25, mass=3, friction=1)

# draw functions


# updating loop:
while True:

    # catch closing events
    for event in pygame.event.get():
            if event.type == pygame.QUIT:
                sys.exit(0)
            elif event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
                sys.exit(0)

    # listen for mouse clicks to set polygon and ball pos
    if state == "set":
        pass # TODO
    
    # clear screen
    screen.fill((255,255,255))

    # calculate physics iteration
    if state == "run":
        space.step(1/60.0)