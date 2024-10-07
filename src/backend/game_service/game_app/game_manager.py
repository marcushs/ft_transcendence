class PongGameEngine:
    def __init__(self):
        self.player1_pos = 0
        self.player2_pos = 0
        self.ball_position = [0, 0]
        self.ball_velocity = [1, 1]
        self.player1_score = 0
        self.player2_score = 0
        self.game_active = False
        self.winning_score = 11
        print('------> Game instance ready to start')
        
    def move_ball(self):
        pass
    
    def move_player(self):
        pass
    
    def check_collisions(self):
        pass
    
    def update_score(self):
        pass
    
    def end_game(self):
        pass

    def start_game(self):
        print('------> game starting !')
        self.game_active = True
        pass
    
    def reset_game(self):
        pass