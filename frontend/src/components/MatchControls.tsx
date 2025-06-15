import React from 'react';

interface MatchControlsProps {
    currentMove: number;
    totalMoves: number;
    onMoveChange: (move: number) => void;
    isPlaying: boolean;
    onPlayPause: () => void;
}

const MatchControls: React.FC<MatchControlsProps> = ({
    currentMove,
    totalMoves,
    onMoveChange,
    isPlaying,
    onPlayPause
}) => {
    return (
        <div className="match-controls">
            <button
                onClick={() => onMoveChange(0)}
                disabled={currentMove === 0}
            >
                ⏮️ Start
            </button>
            <button
                onClick={() => onMoveChange(currentMove - 1)}
                disabled={currentMove === 0}
            >
                ⏪ Previous
            </button>
            <button onClick={onPlayPause}>
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
            <button
                onClick={() => onMoveChange(currentMove + 1)}
                disabled={currentMove === totalMoves}
            >
                ⏩ Next
            </button>
            <button
                onClick={() => onMoveChange(totalMoves)}
                disabled={currentMove === totalMoves}
            >
                ⏭️ End
            </button>
            <div className="move-slider">
                <input
                    type="range"
                    min={0}
                    max={totalMoves}
                    value={currentMove}
                    onChange={(e) => onMoveChange(Number(e.target.value))}
                />
                <span>{currentMove} / {totalMoves}</span>
            </div>
        </div>
    );
};

export default MatchControls; 