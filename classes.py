import pygame
from utility_functions import *

# TODO collision detection

class World:
    def __init__(self, gravity = 0.5, friction = 0.9):
        self.gravity = gravity # acceleration in y dir
        self.friction = friction # percentage of velocity kept between frames

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
    def __init__(self, window, start_x, start_y, radius, world, max_vel):
        self.window = window
        self.x = start_x
        self.y = start_y
        self.vel_x = 0
        self.vel_y = 0
        self.acc_x = 0
        self.acc_y = world.gravity # note: did not consider it necessary to make it a class var since gravity stays
        self.radius = radius
        self.color = "white"
        self.world = world
        self.max_vel = max_vel
        self.found_overlap = False
        self.found_ground = False
        self.no_vel = True

    # def ground_underneath(self):
    #     # bool function
    #     # given current position, check one ??? down from the underside of the player circle
    #     current_feet_y = self.y + self.radius
    #     pass # TODO remove if not needed anymore

    def ground_underneath(self, others):
        # bool function
        virt_end_x = self.x
        virt_end_y = self.y + self.radius

        # only check a small portion of the underside of the player, since only the feet area should be tested
        check_radius = self.radius*0.05

        self.found_ground = False
        for other in others:
            # assuming that others are circles for now
            if overlaps(virt_end_x, virt_end_y, check_radius, other.x, other.y, other.radius):
                self.color = "red"
                self.found_ground = True
                return True
        
        self.color = "white"
        return False

    def correct_for_collisions(self, others):

        # TODO problems/observations:
        # - immersing quite deeply into obstacle at first before correcting - esp. visible when pressing keys
        # - (seems solved) no collision detected when constant acceleration
        # - (seems solved) velocity after adjustment is very difficult to predict intuitively, definitely not the same velocity as before 

        # depending on velocity vector: run intermediate checks
        # via linear interpolation
        virt_end_x = self.x + self.vel_x + self.acc_x # TODO check if this does not change the original value!!
        virt_end_y = self.y + self.vel_y + self.acc_y # TODO check if this does not change the original value!!

        # vector from current pos to virtual end pos
        virt_vec_x = virt_end_x - self.x
        virt_vec_y = virt_end_y - self.y
        virt_len = vec_len(self.x, self.y, virt_end_x, virt_end_y)

        # divide the vec by steps depending on player velocity
        n_steps = 60 #int(vec_len(0, 0, self.vel_x, self.vel_y)/2) # TODO make a reasonable number, also based on acceleration!
        step_len = virt_len/n_steps if n_steps > 0 else 1 # no velocity in beginning means 0 steps: correct

        if virt_len > 0:
            self.no_vel = False
            virt_vec_norm_x = virt_vec_x/virt_len
            virt_vec_norm_y = virt_vec_y/virt_len

            self.found_overlap = False

            for i, other in enumerate(others):

                for n_step in range(n_steps):
                    test_x = self.x + virt_vec_norm_x*(n_step*step_len)
                    test_y = self.y + virt_vec_norm_y*(n_step*step_len)

                    # TODO not clear what happens when a correction is done - need to adjust virtually first?

                    # assuming that others are circles for now
                    if overlaps(test_x, test_y, self.radius, other.x, other.y, other.radius):
                        vec_x, vec_y = overlap_correction_vector(test_x, test_y, self.radius, other.x, other.y, other.radius)
                        self.update_pos(vec_x, vec_y)
                        self.found_overlap = True
                        break # this guy hopefully prevents weird bouncy behavior
                        # # TODO very experimental!
                        # self.vel_x, self.vel_y = 0, 0
        else:
            self.no_vel = True


    def update_pos(self, x, y):
        # adds to the velocity, but velocity is kept within bounds of self.max_vel 
        # (see self.update() function)
        # maybe only allow this direct setting in a certain mode
        self.vel_x += x
        self.vel_y += y

    def update(self):

        # friction only applied in orthogonal directions --> slight disregard of diagonal dirs
        # but accept for now as a compromise for computation
        # don't want to apply friction to acc (such as gravity) - so applying to vel before acc
        self.vel_x *= self.world.friction
        self.vel_y *= self.world.friction

        self.vel_x += self.acc_x
        self.vel_y += self.acc_y

        # cap the velocity
        # check the current speed
        vel = dist([0, 0], [self.vel_x, self.vel_y])
        if vel > self.max_vel:
            # adjust velocity
            self.vel_x = (self.vel_x/vel)*self.max_vel
            self.vel_y = (self.vel_y/vel)*self.max_vel
        # new_vel = dist([0, 0], [self.vel_x, self.vel_y])
        # print(self.max_vel, vel, new_vel)
            
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

class DebugText:

    def __init__(self, window, text):
        self.window = window
        self.text = text
        self.font = pygame.font.SysFont(None, 48)

    def draw(self):
        pygame_text = self.font.render(self.text, True, (255, 255, 255))
        self.window.blit(pygame_text, (50, 50))