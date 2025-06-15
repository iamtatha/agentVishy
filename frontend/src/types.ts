export interface ChessPiece {
    position: string;
    unicode: string;
}

export interface BoardState {
    [key: string]: [string, string]; // [position, unicode]
}

export interface MatchMetadata {
    match_id: number;
    players: {
        white: string;
        black: string;
    };
    start_time: string;
    status: string;
    total_moves: number;
    result: string | null;
    move_times: string[];
    winner: string | null;
    move_history: string[];
} 