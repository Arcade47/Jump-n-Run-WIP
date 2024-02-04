import pygame
from utility_functions import *

# TODO collision detection

class CircleObject:
    def __init__(self, window, start_x, start_y, radius):
        self.window = window
        self.x = start_x
        self.y = start_y
        self.vel_x = 0
        self.vel_y = 0
        self.acc_x = 0
        self.acc_y = 0
        self.radius = radius
        self.color = "grey"

    def draw(self):
        pygame.draw.circle(self.window, self.color, (self.x, self.y), self.radius, width=0)

class PlayerCircle(CircleObject):
    def __init__(self, window, start_x, start_y, radius, gravity, gravity_cap):
        self.window = window
        self.x = start_x
        self.y = start_y
        self.vel_x = 0
        self.vel_y = 0
        self.acc_x = 0
        self.acc_y = gravity # note: did not consider it necessary to make it a class var since gravity stays
        self.radius = radius
        self.color = "white"
        self.gravity_cap = gravity_cap

    def check_for_collisions(self, others):
        # depending on velocity vector: run intermediate checks
        # via linear interpolation
        virt_end_x = self.x + self.vel_x + self.acc_x # TODO check if this does not change the original value!!
        virt_end_y = self.y + self.vel_y + self.acc_y # TODO check if this does not change the original value!!

        # vector from current pos to virtual end pos
        virt_vec_x = virt_end_x - self.x
        virt_vec_y = virt_end_y - self.y
        virt_len = vec_len(self.x, self.y, virt_end_x, virt_end_y)

        # divide the vec by steps depending on player velocity
        n_steps = int(vec_len(0, 0, self.vel_x, self.vel_y)/2)
        step_len = virt_len/n_steps if n_steps > 0 else 1 # no velocity in beginning means 0 steps: correct

        virt_vec_norm_x = virt_vec_x/virt_len
        virt_vec_norm_y = virt_vec_y/virt_len

        for n_step in range(n_steps):
            test_x = self.x + virt_vec_norm_x*(n_step*step_len)
            test_y = self.y + virt_vec_norm_y*(n_step*step_len)

            # TODO not clear what happens when a correction is done - need to adjust virtually first?

            for other in others:
                # assuming that others are circles for now
                if overlaps(test_x, test_y, self.radius, other.x, other.y, other.radius):
                    vec_x, vec_y = overlap_correction_vector(test_x, test_y, self.radius, other.x, other.y, other.radius)
                    self.update_pos(vec_x, vec_y)

    def update_pos(self, x, y):
        self.x += x
        self.y += y

    def update(self):
        self.vel_x += self.acc_x
        self.vel_y += self.acc_y

        # apply gravity cap
        if self.vel_y > self.gravity_cap: self.vel_y = self.gravity_cap

        self.x += self.vel_x
        self.y += self.vel_y

        # wrap around the screen (mostly for debugging)
        if self.x < -self.radius: self.x = self.window.get_width() + self.radius
        elif self.x > self.radius + self.window.get_width(): self.x = -self.radius
        if self.y < -self.radius: self.y = self.window.get_height() + self.radius
        elif self.y > self.radius + self.window.get_height(): self.y = -self.radius

class Platform:
    # for now just a line
    # for now only stationary: tuples hold the coords
    def __init__(self, window, start_x, start_y, stop_x, stop_y):
        self.window = window
        self.pos_start = (start_x, start_y)
        self.pos_stop = (stop_x, stop_y)
        
    def draw(self):
        pygame.draw.line(self.window, "white", self.pos_start, self.pos_stop, width=1)