import json
from gpt import GPTAgent

class StartMatch:
    def __init__(self, config, first_player_color, second_player_color):
        self.white_player = config.get('white_player', 'Not specified')
        self.black_player = config.get('black_player', 'Not specified')
        self.time_control = config.get('time_control', 'Not specified')
        self.settings = config.get('settings', {})

        if first_player_color == 'black':
            self.white_player, self.black_player = self.black_player, self.white_player

        print(f"White Player: {self.white_player}")
        print(f"Black Player: {self.black_player}")
        print(f"Time Control: {self.time_control}")
        print(f"Settings: {self.settings}")
        print(f"Settings: {self.settings['white_player_api_keys']}")
        print(f"Settings: {self.settings['black_player_api_keys']}")

        
        # White Player: gpt-3.5-turbo
        # Black Player: claude-3-opus
        # Time Control: 50
        # Settings: {'OpenAI': 'XCV X'}


    def get_players(self):
        white_player = self.white_player.split('-')[0]
        black_player = self.black_player.split('-')[0]

        if white_player == 'gpt':
            white_agent = GPTAgent(self.white_player, self.settings['white_player_api_keys']['OpenAI'])

        if black_player == 'gpt':
            black_agent = GPTAgent(self.black_player, self.settings['black_player_api_keys']['OpenAI'])


