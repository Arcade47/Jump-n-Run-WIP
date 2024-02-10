# shoutout to ChatGPT

from classes import *
import sys
import random

# Initialize Pygame
pygame.init()

# Set up the display
screen_w = 640
screen_h = 480
window_size = (screen_w, screen_h)
window = pygame.display.set_mode(window_size)

# Set up the clock for managing the frame rate
clock = pygame.time.Clock()

world = World()
obstacles = []
key_vel = 4
max_vel = 10

# instantiating world objects
player = PlayerCircle(
    window, screen_w/2, screen_h/2, 20, world, max_vel
    )
for obst_ind in range(10):
    randx = random.random()
    randy = random.random()
    randr = random.random()
    obstacle = CircleObject(
        window, screen_w*randx, screen_h*randy, 5+80*randr
    )
    obstacles.append(obstacle)

# lower obstacle
# obstacle = CircleObject(
#     window, screen_w/2, screen_h*0.75, 40
# )
# obstacles.append(obstacle)

# upper obstacle
# obstacle = CircleObject(
#     window, screen_w/2, screen_h*0.25, 40
# )
# obstacles.append(obstacle)

# platform = Platform(
#     window,
#     50, screen_h-100, 
#     screen_w-50, screen_h-100
#     )
debugtext = DebugText(window, "TEST")

# Main game loop
running = True
fps_display_interval = 1  # seconds
last_fps_display_time = 0

while running:

    # go_to_next_frame = False

    # # Button press event
    # if not go_to_next_frame:
    #     # Perform action based on the key pressed
    #     for event in pygame.event.get():
    #         if event.type == pygame.QUIT:
    #             running = False
    #         if event.type == pygame.KEYDOWN:
    #             if event.key == pygame.K_SPACE:  # For example, waiting for the space bar
    #                 go_to_next_frame = True

    # if go_to_next_frame:

        current_time = pygame.time.get_ticks()  # Get current time in milliseconds
        # Event handling loop
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                # Check for specific key presses
                if event.key == pygame.K_ESCAPE:
                    running = False

        # continuous key presses
        keys = pygame.key.get_pressed()
        for vel, key in zip(
            [(0, -key_vel), (0, key_vel), (-key_vel, 0), (key_vel, 0)], 
            [pygame.K_UP, pygame.K_DOWN, pygame.K_LEFT, pygame.K_RIGHT]
            ):
            if keys[key]: player.update_pos(*vel)
        
        # Update game state here
        # if player.ground_underneath(obstacles): 
        #     # player.acc_y = 0 # gravity "not active"
        #     # player.vel_y = 0 # make player stop immediately (accumulated gravity is stopped)
        #     pass
        # else: 
        #     player.acc_y = gravity
            
        # importantly, collisions need to be checked before the update,
        # otherwise keypresses will allow player to move through obstacles
        player.correct_for_collisions(obstacles)
        player.update()
        if player.no_vel: debugtext.text = "NO VELOCITY"
        else: debugtext.text = ""
        
        # Draw everything here
        window.fill((0, 0, 0))  # Fill the window with black
        player.draw()
        debugtext.draw()
        # platform.draw()
        for obstacle in obstacles: obstacle.draw()
        
        # Update the display
        pygame.display.flip()
        
        # Cap the frame rate to n frames per second
        clock.tick(30)

        # while not go_to_next_frame:

        #     if event.type == pygame.KEYDOWN:
        #         # Check if the key pressed is the space bar
        #         if event.key == pygame.K_SPACE:
        #             go_to_next_frame = True

        #     clock.tick(30)

# Clean up Pygame and exit
pygame.quit()
sys.exit()