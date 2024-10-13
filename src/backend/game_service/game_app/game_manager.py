from .websocket_utils import send_websocket_info
from .redis_utils import init_redis
# from asgiref.sync import async_to_sync
from django.http import JsonResponse
# from time import sleep
# import aioredis
import asyncio
# import redis
import json
import time
import math

class PongGameEngine:
    active_games = []
    
    def __init__(self, game_id, player_one_id, player_two_id):
        self.game_id = str(game_id)
        self.player_one_id = str(player_one_id)
        self.player_two_id = str(player_two_id)
        self.player_one_score = 0
        self.player_two_score = 0
        self.game_active = False
        self.ball_radius = 16
        self.ball_speed = 15
        self.speed_limit = 45
        self.ball_direction_x = self.ball_speed
        self.ball_direction_y = 0;
        self.max_score = 3
        map_dimension = get_map_dimension()
        self.map = {
            'width': float(map_dimension['width']),
            'height': float(map_dimension['height'])
        }
        self.player_size = {
            'width': self.map['width'] * 0.005,
            'height': self.map['height'] * 0.2,
        }
        self.set_initial_game_state(player_one_score=self.player_one_score, player_two_score=self.player_two_score)
        PongGameEngine.add_active_games(self)
    
    
    @classmethod
    def add_active_games(cls, game_instance):
        cls.active_games.append(game_instance)
        
        
    @classmethod
    def get_active_game(cls, game_id):
        for game in cls.active_games:
            if game.game_id == game_id:
                return game
        return None
    
    def get_game_state(self):
        return self.state
    
    def set_initial_game_state(self, player_one_score, player_two_score):
        self.state = {
            'player_one': {
                'score': player_one_score,
                'id': self.player_one_id,
                'position': {
                    'x': self.map['width'] * 0.015, 
                    'y': self.map['height'] * 0.5,
                },
            },
            'player_two': {
                'score': player_two_score,
                'id': self.player_two_id,
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
        
        
    async def game_loop(self):
        self.game_active = True
        last_update_time = time.perf_counter()
        while self.game_active:
            current_time = time.perf_counter()
            elapsed_time = current_time - last_update_time
            if elapsed_time >=  0.01667: # 60 fps render
                self.move_ball()
                await self.manage_game_update()
                last_update_time = current_time
            else:
                await asyncio.sleep(0.01)


    async def manage_game_update(self):
        update_state = self.update_score()
        await self.send_client_update()
        if update_state == 'reset':
            await asyncio.sleep(1)
        elif update_state == 'finish':
            await self.end_game()
            self.game_active = False


    def update_score(self):
        update_state = 'running'
        if self.state['ball_position']['x'] - self.ball_radius < 15:
            self.ball_direction_x = self.ball_speed
            self.ball_direction_y = 0
            self.ball_speed = 15
            self.player_one_score += 1
            update_state = 'reset'
            self.set_initial_game_state(player_one_score=self.player_one_score, player_two_score=self.player_two_score)
        elif self.state['ball_position']['x'] + self.ball_radius > self.map['width'] - 15:
            self.ball_direction_x = self.ball_speed
            self.ball_direction_y = 0
            self.ball_speed = 15
            self.player_two_score += 1
            update_state = 'reset'
            self.set_initial_game_state(player_one_score=self.player_one_score, player_two_score=self.player_two_score)
        if self.player_one_score == self.max_score or self.player_two_score == self.max_score:
            return 'finish'
        return update_state


    async def end_game(self):
        self.game_active = False
        PongGameEngine.active_games.remove(self)
        winner_id = self.player_one_id if self.player_one_score == self.max_score else self.player_two_id
        payload = json.dumps({
            'type': 'game_finished',
            'winner': winner_id
        })
        await send_websocket_info(player_id=self.player_one_id, payload=payload)
        await send_websocket_info(player_id=self.player_two_id, payload=payload)
            
        
    async def update_player_position(self, player_id, action):
        if player_id == self.player_one_id:
            player_key = 'player_one'
        elif player_id == self.player_two_id:
            player_key = 'player_two'
        else:
            return
        player = self.state[player_key]
        if action == 'move_up':
            player['position']['y'] = max(player['position']['y'] - 4, self.player_size['height'] * 0.5)
        elif action == 'move_down':
            player['position']['y'] = min(player['position']['y'] + 4, self.map['height'] - self.player_size['height'] * 0.5)
            
    def move_ball(self):
        self.check_ball_hitbox(self.state['ball_position'])
        self.state['ball_position']['x'] += self.ball_direction_x
        self.state['ball_position']['y'] += self.ball_direction_y


    def check_ball_hitbox(self, ball):
        self.player_collision(ball=ball, player=self.state['player_one'], isPlayerOne=True)
        self.player_collision(ball=ball, player=self.state['player_two'], isPlayerOne=False)
        self.wall_collision(ball=ball)

    
    def player_collision(self, ball, player, isPlayerOne):
        ball_y_next = ball['y'] + self.ball_direction_y
        player_y = player['position']['y']
        player_height_half = self.player_size['height'] * 0.5
        ball_radius_half = self.ball_radius * 0.5
        if (ball_y_next - ball_radius_half < player_y + player_height_half) and (ball_y_next + ball_radius_half > player_y - player_height_half):
            if self.calculate_x_position(isPlayerOne):
                collide_point = (ball['y'] - player_y) / player_height_half
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
    
    
    async def send_client_update(self):
        payload = json.dumps({
            'type': 'data_update',
            'data': {
                'player_one_score': self.player_one_score,
                'player_one_x': self.state['player_one']['position']['x'],
                'player_one_y': self.state['player_one']['position']['y'],
                'player_two_score': self.player_two_score,
                'player_two_x': self.state['player_two']['position']['x'],
                'player_two_y': self.state['player_two']['position']['y'],
                'ball_x': self.state['ball_position']['x'],
                'ball_y': self.state['ball_position']['y'],   
            }
        })
        await send_websocket_info(player_id=self.player_one_id, payload=payload)
        await send_websocket_info(player_id=self.player_two_id, payload=payload)


# ---------------------- utils ----------------------------- #
    
def get_map_dimension():
    return {'width': 1587.30, 'height': 1000}

def send_map_dimension():
    map_dimension = get_map_dimension()
    return JsonResponse({'message': json.dumps(map_dimension)}, status=200)