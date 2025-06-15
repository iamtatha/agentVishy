import React, { useState } from 'react';
import MatchList from './components/MatchList';
import { default as GameBoard } from './components/GameBoard';
import GameConfig from './components/GameConfig';
import ThemeToggle from './components/ThemeToggle';
import Footer from './components/Footer';
import { ThemeProvider } from './ThemeContext';
import './App.css';

const App: React.FC = () => {
    const [selectedMatch, setSelectedMatch] = useState<number>(1);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [isConfiguring, setIsConfiguring] = useState(false);

    const handleMatchSelect = (matchId: number) => {
        setSelectedMatch(matchId);
        setIsGameStarted(false);
    };

    const handleStartMatch = () => {
        setIsGameStarted(true);
    };

    const handleLoadingChange = (loading: boolean) => {
        setIsConfiguring(loading);
    };

    return (
        <ThemeProvider>
            <div className="App">
                <div className="app-content">
                    <ThemeToggle />
                    <MatchList 
                        selectedMatch={selectedMatch}
                        onMatchSelect={handleMatchSelect}
                        onStartMatch={handleStartMatch}
                        isGameStarted={isGameStarted}
                    />
                    <GameBoard 
                        selectedMatch={isGameStarted ? selectedMatch : null}
                        isConfiguring={isConfiguring}
                    />
                    <GameConfig 
                        selectedMatch={selectedMatch}
                        onStartMatch={handleStartMatch}
                        isGameStarted={isGameStarted}
                        onLoadingChange={handleLoadingChange}
                    />
                </div>
                <Footer />
            </div>
        </ThemeProvider>
    );
};

export default App; 