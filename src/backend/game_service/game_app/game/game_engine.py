from .game_utils import send_websocket_info, get_map_dimension
from datetime import datetime, timedelta
from ..request import send_request
import asyncio
import json
import time
import math
import random

class PongGameEngine:

    active_games = [] # List containing all current game instances

 #//---------------------------------------> Game Constructor <--------------------------------------\\#

    def __init__(self, game_data):
        self.init_game_attributes(game_data)
        self.set_initial_game_state(player_one_score=self.player_one_score, player_two_score=self.player_two_score)
        PongGameEngine.add_active_games(self)

 #//---------------------------------------> Initial game attributes <--------------------------------------\\#

    def init_game_attributes(self, game_data):
        map_dimension = get_map_dimension() 
        self.game_id = str(game_data['game'])
        self.game_type = str(game_data['game_type'])
        self.player_one_id = str(game_data['player_one']['id'])
        self.player_two_id = str(game_data['player_two']['id'])
        self.player_one_user_infos = game_data['player_one']['user_infos']
        self.player_two_user_infos = game_data['player_two']['user_infos']
        self.player_one_connected = True
        self.player_two_connected = True
        self.player_one_score = 0
        self.player_two_score = 0
        self.game_active = False
        self.is_paused = False 
        self.is_round_started = True
        self.pause_time = 120
        self.pause_start_time = None
        self.winner_id = None
        self.loser_id = None
        self.ball_radius = 16
        self.ball_speed = 25
        self.speed_limit = 55
        self.ball_direction_x = random.choice([25, -25])
        random_angle = random.choice([(0.01, 0.03), (-0.03, -0.01)])
        angle_rad = (math.pi * random.uniform(random_angle[0], random_angle[1]))
        self.ball_direction_y = self.ball_direction_x * math.sin(angle_rad)
        self.max_score = 10
        self.has_ball_hit_wall = False
        self.is_player_one_collide = False
        self.is_player_two_collide = False
        self.is_surrend = False
        self.map = {
            'width': float(map_dimension['width']),
            'height': float(map_dimension['height']) 
        }
        self.player_size = {
            'width': self.map['width'] * 0.005,
            'height': self.map['height'] * 0.2,
        }
        self.last_emotes_timestamp = {
            'player_one': None,
            'player_two': None
        }

        
 #//---------------------------------------> Initial game state <--------------------------------------\\#

    def set_initial_game_state(self, player_one_score, player_two_score):
        self.state = {
            'game_type': self.game_type,
            'player_one': {
                'score': player_one_score,
                'id': self.player_one_id,
                'user_infos': self.player_one_user_infos,
                'position': {
                    'x': self.map['width'] * 0.015, 
                    'y': self.map['height'] * 0.5,
                },
            },
            'player_two': {
                'score': player_two_score,
                'id': self.player_two_id,
                'user_infos': self.player_two_user_infos,
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
        
 #//---------------------------------------> Game Class Method <--------------------------------------\\#

    @classmethod
    def add_active_games(cls, game_instance):
        cls.active_games.append(game_instance)


    @classmethod
    def get_active_game(cls, game_id):
        for game in cls.active_games:
            if game.game_id == game_id:
                return game
        return None


    @classmethod
    def get_user_game_data(cls, player_id):
        for game in cls.active_games:
            if game.player_is_in_game(player_id):
                return {
                    'game_id': game.game_id,
                    'game_state': game.state,
                    'map_dimension': get_map_dimension()
                }
        return None


    @classmethod
    def check_last_emote_timestamp(cls, player_id):
        for game in cls.active_games:
            if game.player_is_in_game(player_id):
                player = 'player_one' if player_id == game.player_one_id else 'player_two'

                if not game.last_emotes_timestamp[player]:
                    game.last_emotes_timestamp[player] = datetime.now()
                elif datetime.now() - game.last_emotes_timestamp[player] < timedelta(seconds=3.5):
                    return None
                else:
                    game.last_emotes_timestamp[player] = datetime.now()
                return game.player_one_id if player_id == game.player_one_id else game.player_two_id
        return None

 #//---------------------------------------> Game Engine <--------------------------------------\\#
       
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

 #//---------------------------------------> Ball movement <--------------------------------------\\#

    def move_ball(self):
        if self.is_paused:
            return
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
        if ball_y_next - self.ball_radius < player_y + player_height_half + self.ball_radius / 2 and ball_y_next + self.ball_radius > player_y - player_height_half - self.ball_radius / 2:
            if self.calculate_x_position(isPlayerOne):
                collide_point = (ball['y'] - player_y) / player_height_half
                angle_rad = collide_point * (math.pi * 0.2)
                direction = 1 if isPlayerOne else -1
                if self.ball_speed < self.speed_limit:
                    self.ball_speed += 0.5

                self.ball_direction_x = direction * (self.ball_speed * math.cos(angle_rad))
                self.ball_direction_y = self.ball_speed * math.sin(angle_rad)
                if isPlayerOne:
                    self.is_player_one_collide = True
                else:
                    self.is_player_two_collide = True
                if self.is_round_started == True:
                    self.is_round_started = False


    def calculate_x_position(self, isPlayerOne):
        if isPlayerOne:
            return self.state['ball_position']['x'] + self.ball_direction_x - self.ball_radius < self.state['player_one']['position']['x'] + self.player_size['width'] * 0.5
        else:
            return self.state['ball_position']['x'] + self.ball_direction_x + self.ball_radius > self.state['player_two']['position']['x'] - self.player_size['width'] * 0.5


    def wall_collision(self, ball):
        if (ball['y'] + self.ball_radius > self.map['height'] or ball['y'] - self.ball_radius < 0):
            self.ball_direction_y = self.ball_direction_y * -1
            self.has_ball_hit_wall = True


 #//---------------------------------------> Game update <--------------------------------------\\#

    async def manage_game_update(self):
        if not self.player_one_connected and not self.player_two_connected:
            return await self.handle_game_pause()
        update_state = self.update_score()
        await self.send_game_update()
        if update_state == 'reset':
            await asyncio.sleep(1)
        elif update_state == 'finish':
            await self.end_game(is_canceled=False)
            self.game_active = False

    async def handle_game_pause(self):
        if not self.is_paused: 
            self.is_paused = True
            self.pause_start_time = time.perf_counter()
        else:
            if time.perf_counter() - self.pause_start_time >= self.pause_time:
                self.game_active = False
                await self.end_game(is_canceled=True)
    
    def update_score(self):
        update_state = 'running'
        if self.state['ball_position']['x'] - self.ball_radius < 15 or self.state['ball_position']['x'] + self.ball_radius > self.map['width'] - 15:
            if self.state['ball_position']['x'] - self.ball_radius < 15:
                self.player_one_score += 1
                direction = -25
            if self.state['ball_position']['x'] + self.ball_radius > self.map['width'] - 15:
                self.player_two_score += 1
                direction = 25

            self.ball_speed = 25
            self.ball_direction_y = 0
            
            random_angle = random.choice([(0.01, 0.03), (-0.03, -0.01)])
            angle_rad = (math.pi * random.uniform(random_angle[0], random_angle[1]))
            self.ball_direction_x = direction *  math.cos(angle_rad)
            self.ball_direction_y = direction * math.sin(angle_rad)
            update_state = 'reset'
            self.set_initial_game_state(player_one_score=self.player_one_score, player_two_score=self.player_two_score)
            self.is_round_started = True


        if self.player_one_score == self.max_score or self.player_two_score == self.max_score:
            return 'finish'
        return update_state
        

    async def end_game(self, is_canceled):
        is_draw = False
        if not await self.set_winner_and_loser():
            is_draw = True
            self.winner_id = random.choice([self.player_one_id, self.player_two_id])
            self.loser_id = self.player_two_id if self.winner_id == self.player_one_id else self.player_two_id
        self.game_active = False
        PongGameEngine.active_games.remove(self)
        await self.manage_end_update(is_surrend=False, is_draw=is_draw, is_canceled=is_canceled)


    async def set_winner_and_loser(self):
        
        if self.player_one_score > self.player_two_score:
            self.winner_id = self.player_one_id
            self.loser_id = self.player_two_id
            return True
        elif self.player_one_score < self.player_two_score:
            self.winner_id = self.player_two_id
            self.loser_id = self.player_one_id
            return True 
        return False

 #//---------------------------------------> Player movement-(websocket receiver) <--------------------------------------\\#     
        
    async def update_player_position(self, player_id, action):
        if player_id == self.player_one_id:
            player_key = 'player_one'
        elif player_id == self.player_two_id:
            player_key = 'player_two'
        else:
            return
        player = self.state[player_key]
        if action == 'move_up':
            player['position']['y'] = max(player['position']['y'] - (self.map['width'] * 0.0075), self.player_size['height'] * 0.53)
        elif action == 'move_down':
            player['position']['y'] = min(player['position']['y'] + (self.map['width'] * 0.0075), self.map['height'] - self.player_size['height'] * 0.53)
            
 #//---------------------------------------> Connection management method <--------------------------------------\\#

    async def handle_player_disconnect(self, player_id):
        if player_id == self.player_one_id:
            self.player_one_connected = False
        elif player_id == self.player_two_id:
            self.player_two_connected = False
        await self.send_disconnect_update(player_id)


    async def handle_player_reconnect(self, player_id):
        if player_id == self.player_one_id:
            self.player_one_connected = True
        elif player_id == self.player_two_id:
            self.player_two_connected = True
        await self.send_reconnect_update(player_id)
        if self.is_paused and not (self.player_one_connected and self.player_two_connected):
            self.is_paused = False
            self.pause_start_time = None
            await self.send_resume_update()


    async def player_surrender(self, surrend_id):
        self.loser_id = surrend_id
        self.winner_id = self.player_one_id if surrend_id == self.player_two_id else self.player_two_id
        self.game_active = False
        self.is_surrend = True
        PongGameEngine.active_games.remove(self)
        is_draw = False if self.player_one_score != self.player_two_score else True
        await self.manage_end_update(is_surrend=True, is_draw=is_draw)

 #//---------------------------------------> Send message to client websocket method <--------------------------------------\\#

    async def send_game_update(self):
        payload = json.dumps({
            'type': 'data_update',
            'data': {
                'player_one_score': self.player_one_score,
                'player_two_score': self.player_two_score,
                'player_one_x': self.state['player_one']['position']['x'],
                'player_one_y': self.state['player_one']['position']['y'],
                'player_two_x': self.state['player_two']['position']['x'],
                'player_two_y': self.state['player_two']['position']['y'],
                'ball_x': self.state['ball_position']['x'],
                'ball_y': self.state['ball_position']['y'],
                'has_ball_hit_wall': self.has_ball_hit_wall,
                'ball_direction_x': self.ball_direction_x,
                'ball_direction_y': self.ball_direction_y,
                'is_round_started': self.is_round_started,
                'is_player_one_collide': self.is_player_one_collide,
                'is_player_two_collide': self.is_player_two_collide,
            }
        })
        if self.has_ball_hit_wall == True:
            self.has_ball_hit_wall = False
        if self.is_player_one_collide:
            self.is_player_one_collide = False
        if self.is_player_two_collide:
            self.is_player_two_collide = False
        await self.websocket_sender(payload)


    async def manage_end_update(self, is_surrend, is_draw, is_canceled=None):
        results = await self.send_results_to_statistics(is_surrend=is_surrend, is_draw=is_draw, is_canceled=is_canceled)
        if is_canceled:
            await self.send_game_canceled()
        elif is_surrend:
            await self.send_end_update(results)
        else:
            await self.send_end_update(results)


    async def send_results_to_statistics(self, is_surrend, is_draw, is_canceled):
        winner, loser = await self.get_winner_and_loser_dict()
        payload = {
            'game_id': self.game_id,
            'is_draw': is_draw,
            'is_surrend': is_surrend,
            'is_canceled': True if is_canceled is not None else False,
            'winner': winner,
            'loser': loser,
            'type': self.game_type
        }
        if self.game_type == 'tournament':
            result_response = await send_request(request_type='POST', url='http://tournament:8000/api/tournament/match_result/', payload=payload)
        result_response = await send_request(request_type='POST', url='http://statistics:8000/api/statistics/match_result/', payload=payload)
        return result_response.json() 

    async def get_winner_and_loser_dict(self):  
        if self.winner_id == self.player_one_id:
            winner = {
                'id': self.player_one_id,
                'score': self.player_one_score
            }
            loser = {
                'id': self.player_two_id,
                'score': self.player_two_score
            }
        else:
            winner = {
                'id': self.player_two_id,
                'score': self.player_two_score
            }
            loser = {
                'id': self.player_one_id,
                'score': self.player_one_score
            }
        return winner, loser

    async def send_end_update(self, results):
        winner_payload, loser_payload = await self.get_end_game_payload(results)
        await send_websocket_info(self.winner_id, winner_payload)
        await send_websocket_info(self.loser_id, loser_payload)

    async def get_end_game_payload(self, results):
        if self.game_type != 'ranked':
            winner_payload = {
                'type': 'game_update_info',
                'event': 'game_finished',
                'message': {
                    'is_win' : True,
                    'winner_id': self.winner_id,
                    'loser_id': self.loser_id
                }
            }
            loser_payload = {
                'type': 'game_update_info',
                'event': 'game_finished',
                'message': {
                    'is_win' : False, 
                    'winner_id': self.winner_id,
                    'loser_id': self.loser_id
                }
            }
        else:
            winner_payload = {
                'type': 'game_update_info',
                'event': 'game_finished',
                'message': {
                    'is_win' : True,
                    'winner_id': self.winner_id,
                    'loser_id': self.loser_id,
                    'old_rank_points': results['results']['winner']['old_rank_points'], 
                    'new_rank_points': results['results']['winner']['new_rank_points'],
                    'rank': results['results']['winner']['rank'],
                    'new_rank': results['results']['winner']['new_rank']
                }
            }
            loser_payload = {
                'type': 'game_update_info',
                'event': 'game_finished',
                'message': {
                    'is_win' : False,
                    'winner_id': self.winner_id,
                    'loser_id': self.loser_id,
                    'old_rank_points': results['results']['loser']['old_rank_points'],
                    'new_rank_points': results['results']['loser']['new_rank_points'],
                    'rank': results['results']['loser']['rank'],
                    'new_rank': results['results']['loser']['new_rank']
                }
            }
        return winner_payload, loser_payload


    async def send_game_canceled(self):
        payload = {
            'type': 'game_update_info',
            'event': 'game_canceled',
            'message': f'Game canceled: reconnection time to the paused game has been exceeded'
        }
        await self.websocket_sender(payload)


    async def send_surrender_update(self):
        payload = {
            'type': 'game_update_info',
            'event': 'game_surrended',
            'message': f'Player {self.loser_id} has surrendered. {self.winner_id} wins!'
        }
        await self.websocket_sender(payload)


    async def send_disconnect_update(self, player_id):
        payload = {
            'type': 'game_update_info',
            'event': 'player_disconnected',
            'message': f'player {player_id} has disconnected',
        }
        await self.websocket_sender(payload)


    async def send_reconnect_update(self, player_id):
        payload = {
            'type': 'game_update_info',
            'event': 'player_reconnected',
            'message': f'player {player_id} has reconnected',
        }
        await self.websocket_sender(payload)


    async def send_resume_update(self):
        payload = {
            'type': 'game_update_info',
            'event': 'game_resumed',
            'message': 'break is over, prepare to Pong !',
        }
        await self.websocket_sender(payload)


    async def websocket_sender(self, payload):
        if self.player_one_connected:
            await send_websocket_info(player_id=self.player_one_id, payload=payload)
        if self.player_two_connected:
            await send_websocket_info(player_id=self.player_two_id, payload=payload)

 #//---------------------------------------> Utils method <--------------------------------------\\#
        
    async def player_is_in_game(self, player_id):
        if (player_id == self.player_one_id or player_id == self.player_two_id):
            return True
        return False
