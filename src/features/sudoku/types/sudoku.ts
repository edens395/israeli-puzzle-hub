/**
 * Core Sudoku (סודוקו) TypeScript Data Models & Types
 */

export type BoardDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type SudokuInputMode = 'NORMAL' | 'NOTES';

export interface CellPosition {
  row: number;
  col: number;
}

/**
 * State representation for a single cell inside the 9x9 Sudoku grid.
 */
export interface SudokuCellState {
  row: number; // 0..8
  col: number; // 0..8
  value: number; // 0 = empty, 1..9 = user or given number
  solutionValue: number; // Correct 1..9 target number
  isGiven: boolean; // True if pre-filled in original puzzle clue
  isError: boolean; // True if cell causes a conflict (row/col/box duplicate)
  notes: number[]; // Array of active pencil candidate numbers [1..9]
}

/**
 * Full logic data model for a Sudoku board.
 */
export interface SudokuBoard {
  id: string;
  title: string;
  difficulty: BoardDifficulty;
  grid: SudokuCellState[][];
  initialString: string; // 81 character string representation (0s for empty)
  solutionString: string; // 81 character solution representation
  isCompleted: boolean;
  elapsedSeconds: number;
}

/**
 * Undo history action step.
 */
export interface HistoryStep {
  row: number;
  col: number;
  prevValue: number;
  nextValue: number;
  prevNotes: number[];
  nextNotes: number[];
}

/**
 * Options for configuring the useSudokuEngine hook.
 */
export interface UseSudokuEngineOptions {
  /** Automatically remove inserted number from candidate notes in same row/col/box */
  autoRemoveNotesOnInsert?: boolean;
  /** Optional solve callback */
  onSolve?: () => void;
}

/**
 * Public interface exposed by the useSudokuEngine hook.
 */
export interface UseSudokuEngineReturn {
  board: SudokuBoard;
  grid: SudokuCellState[][];
  selectedCell: CellPosition | null;
  inputMode: SudokuInputMode;
  isCompleted: boolean;
  canUndo: boolean;
  numberCounts: Record<number, number>; // Maps 1..9 to count of filled instances

  // Game Handlers
  selectCell: (row: number, col: number) => void;
  insertNumber: (num: number) => void;
  erase: () => void;
  setInputMode: (mode: SudokuInputMode) => void;
  toggleInputMode: () => void;
  undo: () => void;
  getHint: () => void;
  reset: () => void;
}
