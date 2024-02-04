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

obstacles = []
key_vel = 4
gravity = 0.07
gravity_cap = 6.5

# instantiating world objects
player = PlayerCircle(
    window, screen_w/2, screen_h/2, 20, gravity, gravity_cap
    )
for obst_ind in range(20):
    randx = random.random()
    randy = random.random()
    randr = random.random()
    obstacle = CircleObject(
        window, screen_w*randx, screen_h*randy, 80*randr
    )
    obstacles.append(obstacle)
platform = Platform(
    window,
    50, screen_h-100, 
    screen_w-50, screen_h-100
    )

# Main game loop
running = True
fps_display_interval = 1  # seconds
last_fps_display_time = 0

while running:
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
    if keys[pygame.K_DOWN]:  # Check if the spacebar is being held down
        player.update_pos(0, -0.2)
    
    # Update game state here
    player.check_for_collisions(obstacles)
    player.update()
    
    # Draw everything here
    window.fill((0, 0, 0))  # Fill the window with black
    player.draw()
    platform.draw()
    for obstacle in obstacles: obstacle.draw()
    
    # Update the display
    pygame.display.flip()
    
    # Cap the frame rate to 60 frames per second
    clock.tick(60)

# Clean up Pygame and exit
pygame.quit()
sys.exit()