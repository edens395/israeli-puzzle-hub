/**
 * Core Hebrew Word Game & Tashbetzim (תשבצים) TypeScript Data Models & Types
 */

export type Orientation = 'across' | 'down';

export interface CellPosition {
  row: number;
  col: number;
}

/**
 * Definition of a single crossword clue and its metadata.
 */
export interface WordClue {
  id: string;
  number: number;
  clue: string;
  answer: string; // Target Hebrew word (un-voweled)
  startCell: CellPosition;
  length: number;
  orientation: Orientation;
  cellPositions: CellPosition[]; // Ordered positions from start to end of word
}

/**
 * Data structure representing a single cell inside the crossword matrix.
 */
export interface WordCell {
  row: number;
  col: number;
  solutionLetter: string; // Target Hebrew letter (e.g. 'כ' or 'ך')
  userLetter: string; // Current user-entered Hebrew letter (or empty '')
  isBlocked: boolean; // True for black / non-playable grid square
  clueNumber?: number; // Clue number displayed in cell corner if word starts here
  acrossWordId?: string; // ID of the across word passing through this cell
  acrossIndex?: number; // Index (0..N-1) within the across word
  downWordId?: string; // ID of the down word passing through this cell
  downIndex?: number; // Index (0..N-1) within the down word
  isAcrossEnd?: boolean; // True if this cell is the last letter of its across word
  isDownEnd?: boolean; // True if this cell is the last letter of its down word
  isRevealed?: boolean; // True if user asked for hint reveal
  isError?: boolean; // True if highlighted as incorrect after check
}

/**
 * Complete logic data model for a Word Puzzle / Mini-Tashbetz.
 */
export interface WordPuzzle {
  id: string;
  title: string;
  rows: number;
  cols: number;
  clues: {
    across: WordClue[];
    down: WordClue[];
  };
  grid: WordCell[][];
  isCompleted: boolean;
  elapsedSeconds: number;
}

/**
 * Options for configuring the useWordPuzzleEngine hook.
 */
export interface UseWordPuzzleEngineOptions {
  autoAdvanceOnType?: boolean;
  autoCheckOnComplete?: boolean;
  onSolve?: () => void;
}

/**
 * Public interface exposed by the useWordPuzzleEngine hook.
 */
export interface UseWordPuzzleEngineReturn {
  puzzle: WordPuzzle;
  grid: WordCell[][];
  selectedCell: CellPosition | null;
  selectedDirection: Orientation;
  activeClue: WordClue | null;
  isCompleted: boolean;
  
  // Navigation & Input Handlers
  selectCell: (row: number, col: number) => void;
  typeLetter: (char: string) => void;
  backspace: () => void;
  setSelectedDirection: (direction: Orientation) => void;
  toggleDirection: () => void;
  selectNextClue: () => void;
  selectPrevClue: () => void;
  
  // Verification & Hints
  checkSolution: () => { isCorrect: boolean; incorrectCells: CellPosition[] };
  revealCell: (row: number, col: number) => void;
  revealWord: (wordId: string) => void;
  revealPuzzle: () => void;
  reset: () => void;
}
