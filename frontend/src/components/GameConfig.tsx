import React, { useState } from 'react';
import './GameConfig.css';

interface GameConfigProps {
    selectedMatch: number | null;
    onStartMatch: (config?: NewMatchConfig) => void;
    isGameStarted: boolean;
    onLoadingChange?: (loading: boolean) => void;
}

interface NewMatchConfig {
    whitePlayer: string;
    blackPlayer: string;
    turnLimit: number;
    apiKeys: {
        firstPlayer: { [key: string]: string };
        secondPlayer: { [key: string]: string };
    };
}

const AVAILABLE_LLMS = [
    { id: 'gpt-4', name: 'GPT-4', family: 'OpenAI', requiresKey: true },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', family: 'OpenAI', requiresKey: true },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', family: 'Anthropic', requiresKey: true },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', family: 'Anthropic', requiresKey: true },
    { id: 'gemini-pro', name: 'Gemini Pro', family: 'Google', requiresKey: true },
    { id: 'llama-2-70b', name: 'LLaMA 2 70B', family: 'Meta', requiresKey: true },
];

type ColorAssignment = 'white' | 'black' | 'random';

const GameConfig: React.FC<GameConfigProps> = ({ selectedMatch, onStartMatch, isGameStarted, onLoadingChange }) => {
    const [firstPlayer, setFirstPlayer] = useState<string>('');
    const [secondPlayer, setSecondPlayer] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<ColorAssignment>('white');
    const [turnLimit, setTurnLimit] = useState<number>(50);
    const [firstPlayerApiKeys, setFirstPlayerApiKeys] = useState<{[key: string]: string}>({});
    const [secondPlayerApiKeys, setSecondPlayerApiKeys] = useState<{[key: string]: string}>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleStartMatch = async () => {
        if (!firstPlayer || !secondPlayer) {
            alert('Please select both players');
            return;
        }

        // Set loading state
        setIsLoading(true);
        onLoadingChange?.(true);

        // Check if API keys are provided for models that require them
        const firstPlayerModel = AVAILABLE_LLMS.find(llm => llm.id === firstPlayer);
        const secondPlayerModel = AVAILABLE_LLMS.find(llm => llm.id === secondPlayer);

        if (firstPlayerModel?.requiresKey && !firstPlayerApiKeys[firstPlayerModel.family]) {
            alert(`Please provide API key for First Player (${firstPlayerModel.family})`);
            return;
        }

        if (secondPlayerModel?.requiresKey && !secondPlayerApiKeys[secondPlayerModel.family]) {
            alert(`Please provide API key for Second Player (${secondPlayerModel.family})`);
            return;
        }

        let whitePlayer, blackPlayer, whitePlayerKeys, blackPlayerKeys;
        let actualColorAssignment: 'white' | 'black';

        // Handle color assignment
        if (selectedColor === 'random') {
            // Randomly assign colors
            const isFirstPlayerWhite = Math.random() < 0.5;
            actualColorAssignment = isFirstPlayerWhite ? 'white' : 'black';
            console.log(`Random assignment: First player (${firstPlayer}) got ${actualColorAssignment}`);
        } else {
            actualColorAssignment = selectedColor;
        }

        // Assign players based on the determined color
        if (actualColorAssignment === 'white') {
            whitePlayer = firstPlayer;
            blackPlayer = secondPlayer;
            whitePlayerKeys = firstPlayerApiKeys;
            blackPlayerKeys = secondPlayerApiKeys;
        } else {
            whitePlayer = secondPlayer;
            blackPlayer = firstPlayer;
            whitePlayerKeys = secondPlayerApiKeys;
            blackPlayerKeys = firstPlayerApiKeys;
        }

        const colorAssignmentInfo = {
            first_player_color: actualColorAssignment,
            first_player: firstPlayer,
            second_player: secondPlayer,
            assignment_method: selectedColor === 'random' ? 'random' : 'manual',
            white_player: whitePlayer,
            black_player: blackPlayer
        };

        const configData = {
            white_player: whitePlayer,
            black_player: blackPlayer,
            time_control: turnLimit,
            settings: {
                white_player_api_keys: whitePlayerKeys,
                black_player_api_keys: blackPlayerKeys
            },
            color_assignment: colorAssignmentInfo
        };

        try {
            const response = await fetch('http://localhost:5000/configure-match', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(configData)
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                console.log('Configuration sent successfully:', data);
                // Call the original onStartMatch with the local config
                onStartMatch({
                    whitePlayer,
                    blackPlayer,
                    turnLimit,
                    apiKeys: {
                        firstPlayer: firstPlayerApiKeys,
                        secondPlayer: secondPlayerApiKeys
                    }
                });
            } else {
                console.error('Error from server:', data.message);
                alert('Failed to configure match: ' + data.message);
            }
        } catch (error) {
            console.error('Error sending configuration:', error);
            alert('Failed to send configuration to server. Please try again.');
        } finally {
            setIsLoading(false);
            onLoadingChange?.(false);
        }
    };

    const groupedLLMs = AVAILABLE_LLMS.reduce((acc, llm) => {
        if (!acc[llm.family]) {
            acc[llm.family] = [];
        }
        acc[llm.family].push(llm);
        return acc;
    }, {} as { [key: string]: typeof AVAILABLE_LLMS });

    const handleFirstPlayerApiKeyChange = (provider: string, value: string) => {
        setFirstPlayerApiKeys(prev => ({
            ...prev,
            [provider]: value
        }));
    };

    const handleSecondPlayerApiKeyChange = (provider: string, value: string) => {
        setSecondPlayerApiKeys(prev => ({
            ...prev,
            [provider]: value
        }));
    };

    const renderApiKeyInput = (modelId: string, isFirstPlayer: boolean) => {
        const model = AVAILABLE_LLMS.find(llm => llm.id === modelId);
        if (!model) return null;

        const apiKeys = isFirstPlayer ? firstPlayerApiKeys : secondPlayerApiKeys;
        const handleChange = isFirstPlayer ? handleFirstPlayerApiKeyChange : handleSecondPlayerApiKeyChange;
        const playerLabel = isFirstPlayer ? "First" : "Second";

        return (
            <div className="form-group api-key-input">
                <label>{playerLabel} Player - {model.name} API Key</label>
                <input
                    type="password"
                    value={apiKeys[model.family] || ''}
                    onChange={(e) => handleChange(model.family, e.target.value)}
                    disabled={isGameStarted}
                    placeholder={`Enter ${playerLabel} Player API key for ${model.family}`}
                />
            </div>
        );
    };

    return (
        <div className="panel game-config">
            <div className="panel-header">
                <span className="panel-icon">⚙</span>
                <h2>Game Configuration</h2>
            </div>
            <div className="config-content">
                <div className="config-section">
                    <div className="form-group">
                        <label>First Player</label>
                        <select 
                            value={firstPlayer} 
                            onChange={(e) => setFirstPlayer(e.target.value)}
                            disabled={isGameStarted}
                        >
                            <option value="">Select First Player</option>
                            {Object.entries(groupedLLMs).map(([family, models]) => (
                                <optgroup key={family} label={family}>
                                    {models.map(model => (
                                        <option key={model.id} value={model.id}>
                                            {model.name}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                    {firstPlayer && renderApiKeyInput(firstPlayer, true)}

                    <div className="form-group">
                        <label>Second Player</label>
                        <select 
                            value={secondPlayer} 
                            onChange={(e) => setSecondPlayer(e.target.value)}
                            disabled={isGameStarted}
                        >
                            <option value="">Select Second Player</option>
                            {Object.entries(groupedLLMs).map(([family, models]) => (
                                <optgroup key={family} label={family}>
                                    {models.map(model => (
                                        <option key={model.id} value={model.id}>
                                            {model.name}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                    {secondPlayer && renderApiKeyInput(secondPlayer, false)}

                    <div className="form-group">
                        <label>Color Assignment</label>
                        <div className="color-assignment">
                            <div className="color-option">
                                <input
                                    type="radio"
                                    id="white"
                                    name="color"
                                    value="white"
                                    checked={selectedColor === 'white'}
                                    onChange={(e) => setSelectedColor(e.target.value as ColorAssignment)}
                                />
                                <label htmlFor="white">White</label>
                            </div>
                            <div className="color-option">
                                <input
                                    type="radio"
                                    id="black"
                                    name="color"
                                    value="black"
                                    checked={selectedColor === 'black'}
                                    onChange={(e) => setSelectedColor(e.target.value as ColorAssignment)}
                                />
                                <label htmlFor="black">Black</label>
                            </div>
                            <div className="color-option">
                                <input
                                    type="radio"
                                    id="random"
                                    name="color"
                                    value="random"
                                    checked={selectedColor === 'random'}
                                    onChange={(e) => setSelectedColor(e.target.value as ColorAssignment)}
                                />
                                <label htmlFor="random">Random</label>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Game Turn Limit</label>
                        <input
                            type="number"
                            min="1"
                            max="200"
                            value={turnLimit}
                            onChange={(e) => setTurnLimit(Number(e.target.value))}
                            disabled={isGameStarted}
                        />
                        <small>Maximum moves for each player</small>
                    </div>
                </div>

                <button 
                    className="start-button"
                    onClick={handleStartMatch}
                    disabled={isGameStarted || !firstPlayer || !secondPlayer || isLoading}
                >
                    {isLoading ? 'Configuring Match...' : 
                     isGameStarted ? 'Match in Progress' : 
                     'Start New Match'}
                </button>
{/* 
                <div className="playback-controls">
                    <button disabled={!isGameStarted}><span>⏮</span></button>
                    <button disabled={!isGameStarted}><span>⏪</span></button>
                    <button disabled={!isGameStarted}><span>⏯</span></button>
                    <button disabled={!isGameStarted}><span>⏩</span></button>
                    <button disabled={!isGameStarted}><span>⏭</span></button>
                    <button disabled={!isGameStarted}><span>↻</span></button>
                </div> */}

                <p className="controls-note">
                    {isGameStarted ? 'Use controls to navigate through the game' :
                     'Configure players to start a new match'}
                </p>
            </div>
        </div>
    );
};

export default GameConfig; 