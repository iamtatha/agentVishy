import React, { useState, useEffect } from 'react';
import ChessBoard from './ChessBoard';
import './GameBoard.css';

interface GameBoardProps {
    selectedMatch: number | null;
    isConfiguring: boolean;
}

interface MatchMetadata {
    match_id: number;
    players: {
        white: string;
        black: string;
    };
    total_moves: number;
    status: string;
    result?: string;
    winner?: string;
}

type ColorAssignment = 'white' | 'black' | 'random';

const GameBoard = ({ selectedMatch, isConfiguring }: GameBoardProps): JSX.Element => {
    const [metadata, setMetadata] = useState<MatchMetadata | null>(null);
    const [currentMove, setCurrentMove] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchMetadata = async () => {
            if (!selectedMatch) return;
            
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5000/matches/match_${selectedMatch}/metadata.json`);
                const data = await response.json();
                setMetadata(data);
                setCurrentMove(0);
                setIsPlaying(false);
            } catch (error) {
                console.error('Error fetching match metadata:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetadata();
    }, [selectedMatch]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        if (isPlaying && metadata) {
            interval = setInterval(() => {
                setCurrentMove(prev => {
                    if (prev < metadata.total_moves) {
                        return prev + 1;
                    } else {
                        setIsPlaying(false);
                        return prev;
                    }
                });
            }, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isPlaying, metadata]);

    if (isConfiguring) {
        return (
            <div className="panel game-board">
                <div className="panel-header">
                    <span className="panel-icon">⚙</span>
                    <h2>Configuring Match</h2>
                </div>
                <div className="board-container loading">
                    <div className="loading-message">
                        <div className="loading-spinner">⌛</div>
                        <p>Configuring match settings...</p>
                        <p className="loading-details">Setting up players and game parameters</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!selectedMatch) {
        return (
            <div className="panel game-board empty">
                <div className="panel-header">
                    <span className="panel-icon">▶</span>
                    <h2>Select a Match</h2>
                </div>
                <p className="panel-description">
                    Select a match from the left panel to begin.
                </p>
                <div className="board-placeholder">
                    <div className="placeholder-icon">⚔️</div>
                    <div className="placeholder-text">
                        Select a match from the left panel and click Start Selected Match to begin viewing the game.
                    </div>
                </div>
            </div>
        );
    }

    if (loading || !metadata) {
        return (
            <div className="panel game-board">
                <div className="panel-header">
                    <span className="panel-icon">▶</span>
                    <h2>Loading match data...</h2>
                </div>
                <div className="board-container loading">
                    Loading match information...
                </div>
            </div>
        );
    }

    return (
        <div className="panel game-board">
            <div className="panel-header">
                <span className="panel-icon">▶</span>
                <h2>Match {selectedMatch}: {metadata.players.white} vs {metadata.players.black}</h2>
            </div>
            <div className="game-info">
                <div className="game-info-header">
                    <span className="move-number">Move {currentMove} of {metadata.total_moves}</span>
                    <span>{metadata.status}</span>
                </div>
                <div className="player-info">
                    <span>White: {metadata.players.white}</span>
                    <span>Black: {metadata.players.black}</span>
                </div>
            </div>
            <div className="board-container">
                <ChessBoard 
                    matchId={selectedMatch}
                    currentMove={currentMove}
                />
            </div>
            <div className="playback-controls">
                <button 
                    onClick={() => setCurrentMove(0)}
                    disabled={currentMove === 0}
                >⏮</button>
                <button 
                    onClick={() => setCurrentMove(prev => Math.max(0, prev - 1))}
                    disabled={currentMove === 0}
                >⏪</button>
                <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={currentMove === metadata.total_moves}
                >
                    {isPlaying ? '⏸' : '▶'}
                </button>
                <button 
                    onClick={() => setCurrentMove(prev => Math.min(metadata.total_moves, prev + 1))}
                    disabled={currentMove === metadata.total_moves}
                >⏩</button>
                <button 
                    onClick={() => setCurrentMove(metadata.total_moves)}
                    disabled={currentMove === metadata.total_moves}
                >⏭</button>
                <button 
                    onClick={() => {
                        setCurrentMove(0);
                        setIsPlaying(true);
                    }}
                >↻</button>
            </div>
        </div>
    );
};

export default GameBoard; 