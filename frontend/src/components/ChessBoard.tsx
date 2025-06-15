import React, { useEffect, useState, useMemo, useCallback } from 'react';
import './ChessBoard.css';

interface ChessBoardProps {
    matchId: number;
    currentMove: number;
}

interface Position {
    [key: string]: [string, string]; // Format: { pieceId: [square, symbol] }
}

// Convert algebraic notation (e.g., "E4") to board indices [row, col]
const squareToIndices = (square: string): [number, number] => {
    const file = square.toLowerCase().charCodeAt(0) - 97; // 'a' -> 0, 'b' -> 1, etc.
    const rank = 8 - parseInt(square[1]); // '1' -> 7, '2' -> 6, etc.
    return [rank, file];
};

const EMPTY_POSITION: Position = {};

const ChessBoard = ({ matchId, currentMove }: ChessBoardProps): JSX.Element => {
    const [position, setPosition] = useState<Position>(EMPTY_POSITION);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Memoize the empty board creation
    const emptyBoard = useMemo(() => 
        Array(8).fill(null).map(() => Array(8).fill('.')), 
        []
    );

    // Memoize the board with pieces
    const board = useMemo(() => {
        const newBoard = emptyBoard.map(row => [...row]);
        Object.entries(position).forEach(([pieceId, [square]]) => {
            const [row, col] = squareToIndices(square);
            if (row >= 0 && row < 8 && col >= 0 && col < 8) {
                newBoard[row][col] = pieceId.charAt(0);
            }
        });
        return newBoard;
    }, [position, emptyBoard]);

    const isLightSquare = useCallback((row: number, col: number) => 
        (row + col) % 2 === 0, 
        []
    );

    useEffect(() => {
        let isMounted = true;

        const fetchPosition = async () => {
            try {
                const response = await fetch(`http://localhost:5000/matches/match_${matchId}/move_${currentMove}.json`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch position (${response.status})`);
                }
                const data = await response.json();
                if (isMounted) {
                    setPosition(data);
                    setIsInitialLoad(false);
                    setError(null);
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error fetching position:', error);
                    setError(error instanceof Error ? error.message : 'Failed to load position');
                    setPosition(EMPTY_POSITION);
                }
            }
        };

        fetchPosition();
        return () => {
            isMounted = false;
        };
    }, [matchId, currentMove]);

    if (isInitialLoad) {
        return <div className="chess-board loading">Loading position...</div>;
    }

    if (error) {
        return <div className="chess-board error">Error: {error}</div>;
    }

    return (
        <div className="chess-board">
            <div className="board-grid">
                {board.map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        {row.map((piece, colIndex) => (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`square ${isLightSquare(rowIndex, colIndex) ? 'light' : 'dark'}`}
                            >
                                {piece !== '.' && (
                                    <div className="piece">
                                        {getPieceSymbol(piece)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
            <div className="board-labels">
                <div className="file-labels">
                    {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(file => (
                        <div key={file} className="label">{file}</div>
                    ))}
                </div>
                <div className="rank-labels">
                    {['8', '7', '6', '5', '4', '3', '2', '1'].map(rank => (
                        <div key={rank} className="label">{rank}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const getPieceSymbol = (piece: string): string => {
    const symbols: { [key: string]: string } = {
        'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };
    return symbols[piece] || piece;
};

export default React.memo(ChessBoard); 