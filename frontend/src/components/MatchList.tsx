import React, { useState, useEffect } from 'react';
import './MatchList.css';

interface MatchListProps {
    selectedMatch: number;
    onMatchSelect: (matchId: number) => void;
    onStartMatch: () => void;
    isGameStarted: boolean;
}

interface MatchMetadata {
    match_id: number;
    players: {
        white: string;
        black: string;
    };
    status: string;
    total_moves: number;
}

const MatchList: React.FC<MatchListProps> = ({ selectedMatch, onMatchSelect, onStartMatch, isGameStarted }) => {
    const [matches, setMatches] = useState<MatchMetadata[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatchesMetadata = async () => {
            try {
                const response = await fetch('http://localhost:5000/matches');
                if (!response.ok) throw new Error('Failed to fetch matches');
                const data = await response.json();
                setMatches(data);
            } catch (error) {
                console.error('Error fetching matches:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMatchesMetadata();
    }, []);

    if (loading) {
        return (
            <div className="panel match-list">
                <div className="match-list-header">
                    <h2>
                        <span className="header-icon">♟</span>
                        Available Matches
                    </h2>
                </div>
                <div className="loading-state">Loading matches...</div>
            </div>
        );
    }

    return (
        <div className="panel match-list">
            <div className="match-list-header">
                <h2>
                    <span className="header-icon">♟</span>
                    Available Matches
                </h2>
            </div>
            <div className="matches-container">
                {matches.map((match) => (
                    <div
                        key={match.match_id}
                        className={`match-item ${selectedMatch === match.match_id ? 'selected' : ''}`}
                        onClick={() => onMatchSelect(match.match_id)}
                    >
                        <span className={`match-status ${match.status}`} />
                        <div className="match-title">
                            {`Match ${match.match_id}: ${match.players.white} vs ${match.players.black}`}
                        </div>
                    </div>
                ))}
            </div>
            <button 
                className="start-match-button"
                onClick={onStartMatch}
                disabled={isGameStarted || !selectedMatch}
            >
                {isGameStarted ? 'Match in Progress' : 'Start Selected Match'}
            </button>
        </div>
    );
};

export default MatchList; 