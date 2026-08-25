/**
 * Core Hebrew Mini-Crossword (מיני-תשחץ) TypeScript Data Models & Types
 */

export type CrosswordDirection = 'across' | 'down';

export interface CellPosition {
  row: number;
  col: number;
}

/**
 * Metadata definition for a single Hebrew crossword clue.
 */
export interface ClueItem {
  id: string;
  number: number;
  direction: CrosswordDirection;
  text: string; // Hebrew prompt text (e.g. "עיר הבירה של ישראל")
  answer: string; // Target Hebrew answer string (un-voweled)
  startRow: number;
  startCol: number;
  length: number;
  cellPositions: CellPosition[]; // Ordered positions from first letter to last letter
}

/**
 * State representation for a single cell inside the crossword matrix.
 */
export interface CrosswordCellState {
  row: number;
  col: number;
  solutionLetter: string; // Target Hebrew letter (e.g. 'כ' or 'ך')
  userLetter: string; // User entered letter (or empty '')
  isBlocked: boolean; // True for black / non-playable grid square
  clueNumber?: number; // Corner clue number displayed if word starts here
  acrossClueId?: string; // ID of across clue passing through cell
  downClueId?: string; // ID of down clue passing through cell
  isAcrossEnd?: boolean; // True if last letter of across word
  isDownEnd?: boolean; // True if last letter of down word
  isError?: boolean;
  isRevealed?: boolean;
}

/**
 * Complete data structure for a Crossword Puzzle.
 */
export interface CrosswordPuzzle {
  id: string;
  title: string;
  rows: number;
  cols: number;
  clues: {
    across: ClueItem[];
    down: ClueItem[];
  };
  grid: CrosswordCellState[][];
  isCompleted: boolean;
  elapsedSeconds: number;
}

/**
 * Options for configuring the useCrosswordEngine hook.
 */
export interface UseCrosswordEngineOptions {
  autoAdvanceOnType?: boolean;
  onSolve?: () => void;
}

/**
 * Public interface exposed by the useCrosswordEngine hook.
 */
export interface UseCrosswordEngineReturn {
  puzzle: CrosswordPuzzle;
  grid: CrosswordCellState[][];
  selectedCell: CellPosition | null;
  selectedDirection: CrosswordDirection;
  activeClue: ClueItem | null;
  isCompleted: boolean;

  // Interaction Handlers
  selectCell: (row: number, col: number) => void;
  typeLetter: (char: string) => void;
  backspace: () => void;
  setSelectedDirection: (direction: CrosswordDirection) => void;
  toggleDirection: () => void;
  selectNextClue: () => void;
  selectPrevClue: () => void;
  checkSolution: () => { isCorrect: boolean; incorrectCells: CellPosition[] };
  revealCell: (row: number, col: number) => void;
  revealWord: (clueId: string) => void;
  revealPuzzle: () => void;
  reset: () => void;
}
