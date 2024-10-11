from .websocket_utils import send_websocket_info
from asgiref.sync import async_to_sync
from django.http import JsonResponse
from time import sleep
import redis
import json
import time
import math

redis_instance = redis.Redis(host='redis', port=6379, db=0)

class PongGameEngine:
    def __init__(self, game_id, player_one_id, player_two_id):
        self.game_id = game_id
        self.player_one_id = player_one_id
        self.player_two_id = player_two_id
        self.game_active = False
        self.ball_radius = 16
        self.ball_speed = 10 
        self.speed_limit = 45
        self.ball_direction_x = self.ball_speed;
        self.ball_direction_y = 0;
        map_dimension = get_map_dimension()
        self.map = {
            'width': float(map_dimension['width']),
            'height': float(map_dimension['height'])
        }
        self.player_size = {
            'width': self.map['width'] * 0.005,
            'height': self.map['height'] * 0.2,
        }
        self.state = {
            'player_one': {
                'score': 0,
                'position': {
                    'x': self.map['width'] * 0.015, 
                    'y': self.map['height'] * 0.5,
                },
            },
            'player_two': {
                'score': 0,
                'position': {
                    'x': self.map['width'] - self.map['width'] * 0.015,
                    'y' : self.map['height'] * 0.5,
                },
            },
            'player_size': {
                'width': self.map['width'] * 0.005,
                'height': self.map['height'] * 0.2,
            },
            'ball_position': {
                'x': self.map['width'] * 0.5,
                'y': self.map['height'] * 0.5,
            },
            'ball_speed': self.ball_speed,
            'speed_limit': self.speed_limit
        }
        redis_instance.set(self.game_id, json.dumps(self.state))
    
    def game_loop(self):
        self.game_active = True
        while self.game_active:
            self.state = json.loads(redis_instance.get(self.game_id))
            self.move_player()
            self.move_ball()
            self.send_update()
            redis_instance.set(self.game_id, json.dumps(self.state))
            sleep(0.016)
            
    def move_player(self):
        pass
      
    def move_ball(self):
        self.check_ball_hitbox(self.state['ball_position'])
        self.state['ball_position']['x'] += self.ball_direction_x
        self.state['ball_position']['y'] += self.ball_direction_y

    def check_ball_hitbox(self, ball):
        self.player_collision(ball=ball, player=self.state['player_one'], isPlayerOne=True)
        self.player_collision(ball=ball, player=self.state['player_two'], isPlayerOne=False)
        self.wall_collision(ball=ball)

    
    def player_collision(self, ball, player, isPlayerOne):
        if ((ball['y'] + self.ball_direction_y - self.ball_radius < player['position']['y'] + self.player_size['height'] * 0.5 + self.ball_radius * 0.5) and
        (ball['y'] + self.ball_direction_y + self.ball_radius > player['position']['y'] - self.player_size['height'] * 0.5 - self.ball_radius * 0.5) and
        self.calculate_x_position(isPlayerOne)):
            collide_point = ball['y'] - player['position']['y']
            collide_point /= (self.player_size['height'] * 0.5)
            angle_rad = collide_point * (math.pi * 0.25)
            direction = 1 if isPlayerOne else -1
            if self.ball_speed < self.speed_limit:
                self.ball_speed += 0.5
            self.ball_direction_x = direction * (self.ball_speed * math.cos(angle_rad))
            self.ball_direction_y = self.ball_speed * math.sin(angle_rad)

    def calculate_x_position(self, isPlayerOne):
        if isPlayerOne:
            return self.state['ball_position']['x'] + self.ball_direction_x - self.ball_radius < self.state['player_one']['position']['x'] + self.player_size['width'] * 0.5
        else:
            return self.state['ball_position']['x'] + self.ball_direction_x + self.ball_radius > self.state['player_two']['position']['x'] - self.player_size['width'] * 0.5

    def wall_collision(self, ball):
        if (ball['x'] + self.ball_radius > self.map['width'] or ball['x'] - self.ball_radius < 0):
            self.ball_direction_x = self.ball_direction_x * -1
        if (ball['y'] + self.ball_radius > self.map['height'] or ball['y'] - self.ball_radius < 0):
            self.ball_direction_y = self.ball_direction_y * -1
    
    def send_update(self):
        payload = json.dumps({
            'type': 'data_update',
            'data': self.state 
        })
        async_to_sync(send_websocket_info)(player_id=self.player_one_id, payload=payload)
        async_to_sync(send_websocket_info)(player_id=self.player_two_id, payload=payload)
    
    def update_score(self):
        pass
    
    def end_game(self):
        pass
    
    def reset_game(self):
        pass
    
# ---------------------- utils ----------------------------- #

def update_players_state(data):
    # set new value for players concerned by the websocket here
    # need for have it in the game loop upper
        pass
    
def get_map_dimension():
    return {'width': 1587.30, 'height': 1000}

def send_map_dimension():
    map_dimension = get_map_dimension()
    return JsonResponse({'message': json.dumps(map_dimension)}, status=200)