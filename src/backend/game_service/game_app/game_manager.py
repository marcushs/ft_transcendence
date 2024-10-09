from time import sleep
from .websocket_utils import send_websocket_info
from asgiref.sync import async_to_sync
import redis
import json

redis_instance = redis.Redis(host='redis', port=6379, db=0)

class PongGameEngine:
    def __init__(self, game_id, width, height, player_one_id, player_two_id):
        self.game_id = game_id
        self.player_one_id = player_one_id
        self.player_two_id = player_two_id
        self.game_active = False
        self.map = {
            'width': float(width),
            'height': float(height)
        }
        self.player_size = {
            'width': self.map['width'] * 0.005,
            'height': self.map['height'] * 0.2,
        }
        self.ball_speed = 5 
        self.speed_limit = 45
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
            'ball_position': {
                'x': self.map['width'] * 0.5,
                'y': self.map['height'] * 0.5,
            },
        }
        print('Pong game initialisation done !')
        redis_instance.set(self.game_id, json.dumps(self.state))
    
    def game_loop(self):
        print('------> game loop start !') 
        self.game_active = True
        while self.game_active:
            game_state = json.loads(redis_instance.get(self.game_id))
            self.move_player(game_state=game_state)
            self.move_ball(game_state=game_state)
            self.send_update()
            redis_instance.set(self.game_id, json.dumps(self.state))
            sleep(0.3)
            
    def move_player(self, game_state):
        pass
      
    def move_ball(self, game_state):
        ball = self.state['ball_position']  
        ball['x'] += self.ball_speed
        ball['y'] += self.ball_speed
        
        if ball['y'] <= 0 or ball['y'] >= self.map['height']:
            self.ball_speed *= -1
    
    def send_update(self):
        payload = json.dumps({
            'type': 'data_update',
            'game_info': self.state 
        })
        async_to_sync(send_websocket_info)(player_id=self.player_one_id, payload=payload)
        async_to_sync(send_websocket_info)(player_id=self.player_two_id, payload=payload)
    
    def check_collisions(self):
        pass
    
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