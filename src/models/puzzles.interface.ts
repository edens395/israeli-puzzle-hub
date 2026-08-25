export type PuzzleCategory = 'nonogram' | 'sudoku' | 'tashbetz';
export type PuzzleStatus = 'not_started' | 'in_progress' | 'completed';

export interface PuzzleProgress {
    puzzleId: string;
    category: PuzzleCategory;
    dateString: Date;
    status: PuzzleStatus;
    completionPercent: number;
    elapsedSeconds: number;
    savedGridState?: any;
    completedAt?: number;
}

export interface UserStats {
    currentStreak: number;
    longestStreak: number;
    lastSolvedDate: Date | null;
    totalPuzzlesCompleted: number;
    categoryCounts: Record<PuzzleCategory, number>;
}

export interface DailyEditionData {
    dateString: Date;
    dateFormattedHebrew: string;
    puzzles: Record<PuzzleCategory, PuzzleProgress>;
}