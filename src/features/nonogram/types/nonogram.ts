/**
 * Core Nonogram (שחור ופתור) TypeScript Data Models & Types
 */

/**
 * State of a single cell in the Nonogram matrix.
 * 0 = EMPTY (Unmarked cell)
 * 1 = FILLED (Filled/Black square)
 * 2 = CROSS (Marked with X / eliminated cell)
 */
export enum CellState {
  EMPTY = 0,
  FILLED = 1,
  CROSS = 2,
}

/**
 * Active input mode selected by the user.
 * FILL = Interacting with cells places or removes FILLED state.
 * CROSS = Interacting with cells places or removes CROSS state.
 */
export type InputMode = 'FILL' | 'CROSS';

/**
 * 2D position within the board matrix (0-indexed).
 */
export interface CellPosition {
  row: number;
  col: number;
}

/**
 * 2D matrix representing the target solution grid (true = filled cell, false = empty cell).
 */
export type SolutionGrid = boolean[][];

/**
 * 2D matrix representing the user's current board state.
 */
export type Grid = CellState[][];

/**
 * Clue sequence for a single row or column.
 * e.g., [3, 1] represents 3 consecutive filled cells followed by 1 filled cell.
 * Empty lines are represented by [0].
 */
export type Clue = number[];

/**
 * Complete logic data model for a Nonogram puzzle board.
 */
export interface NonogramBoard {
  id: string;
  title: string;
  width: number;
  height: number;
  solution: SolutionGrid;
  grid: Grid;
  rowClues: Clue[];
  colClues: Clue[];
  isCompleted: boolean;
  elapsedSeconds: number;
}

/**
 * Change record for a single cell transition.
 */
export interface CellChange {
  row: number;
  col: number;
  prev: CellState;
  next: CellState;
}

/**
 * Entry in the undo/redo stack representing a single atomic action (tap or drag stroke).
 */
export interface HistoryStep {
  changes: CellChange[];
}

/**
 * Configuration options for the engine hook.
 */
export interface UseNonogramEngineOptions {
  /** Automatically fill remaining empty cells with CROSS when a row or column clue is solved */
  autoCrossCompletedLines?: boolean;
  /** Enable undo / redo stack tracking */
  enableHistory?: boolean;
  /** Initial saved grid state if resuming progress */
  initialGrid?: Grid;
  /** Optional callback triggered immediately when the board is solved */
  onSolve?: () => void;
}

/**
 * Public interface exposed by the useNonogramEngine hook.
 */
export interface UseNonogramEngineReturn {
  board: NonogramBoard;
  grid: Grid;
  inputMode: InputMode;
  isDragging: boolean;
  isCompleted: boolean;
  completedRows: boolean[];
  completedCols: boolean[];
  canUndo: boolean;
  canRedo: boolean;
  
  // Interaction Handlers
  handleCellTap: (row: number, col: number) => void;
  handleDragStart: (row: number, col: number) => void;
  handleDragMove: (row: number, col: number) => void;
  handleDragEnd: () => void;
  setInputMode: (mode: InputMode) => void;
  toggleInputMode: () => void;
  autoCrossLine: (type: 'row' | 'col', index: number) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  setGridState: (grid: Grid, isCompletedOverride?: boolean) => void;
}
