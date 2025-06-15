from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
import os
import json
import time
import random
from playMatch import StartMatch
app = Flask(__name__)
CORS(app)

@app.route('/matches/<path:path>')
def serve_match_file(path):
    return send_from_directory('matches', path)

@app.route('/matches')
def list_matches():
    matches = []
    for match_dir in os.listdir('matches'):
        if os.path.isdir(os.path.join('matches', match_dir)):
            try:
                with open(os.path.join('matches', match_dir, 'metadata.json')) as f:
                    metadata = json.load(f)
                    matches.append(metadata)
            except:
                continue
    return jsonify(matches)

@app.route('/configure-match', methods=['POST'])
def configure_match():
    try:
        print("\n=== Request Information ===")
        print(f"Content-Type: {request.headers.get('Content-Type')}")
        print(f"Request Method: {request.method}")
        
        if not request.is_json:
            print("Error: Request is not JSON")
            return jsonify({"status": "error", "message": "Request must be JSON"}), 400
            
        config = request.get_json()
        if config is None:
            print("Error: Could not parse JSON data")
            return jsonify({"status": "error", "message": "Invalid JSON data"}), 400
            
        print("\n=== New Match Configuration ===")
        print(f"White Player: {config.get('white_player', 'Not specified')}")
        print(f"Black Player: {config.get('black_player', 'Not specified')}")
        print(f"Time Control: {config.get('time_control', 'Not specified')}")
        
        # Print color assignment information
        color_info = config.get('color_assignment', {})
        print("\n=== Color Assignment ===")
        assignment_method = color_info.get('assignment_method', 'Unknown')
        print(f"Assignment Method: {assignment_method}")
        
        if assignment_method == 'random':
            choice = random.choice(['white', 'black'])
            color_info['first_player_color'] = choice
            color_info['second_player_color'] = 'black' if choice == 'white' else 'white'
        first_player_color = color_info.get('first_player_color', 'Unknown')
        second_player_color = 'black' if first_player_color == 'white' else 'white'
        # print(f"First Player ({color_info.get('first_player', 'Unknown')}): {first_player_color}")
        # print(f"Second Player ({color_info.get('second_player', 'Unknown')}): {second_player_color}")
        
        # print("\nFinal Assignment:")
        # print(f"White: {color_info.get('white_player', 'Unknown')}")
        # print(f"Black: {color_info.get('black_player', 'Unknown')}")
        
        # print("\n=== API Keys Configuration ===")
        settings = config.get('settings', {})
        # print(f"White Player API Keys: {list(settings.get('white_player_api_keys', {}).keys())}")
        # print(f"Black Player API Keys: {list(settings.get('black_player_api_keys', {}).keys())}")
        # print("==============================\n")


        start_match = StartMatch(config, first_player_color, second_player_color)
        

        return jsonify({
            "status": "success",
            "message": "Configuration received",
            "config": {
                "white_player": config.get('white_player'),
                "black_player": config.get('black_player'),
                "time_control": config.get('time_control'),
                "color_assignment": config.get('color_assignment')
            }
        })
        
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Server error: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 