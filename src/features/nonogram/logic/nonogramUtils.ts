import { CellState } from '../types/nonogram';
import type {
  CellPosition,
  Clue,
  Grid,
  InputMode,
  NonogramBoard,
  SolutionGrid,
} from '../types/nonogram';

/**
 * Calculates clue numbers for a 1D sequence of solution booleans.
 */
export function calculateLineClue(line: boolean[]): Clue {
  const clue: number[] = [];
  let currentBlock = 0;

  for (let i = 0; i < line.length; i++) {
    if (line[i]) {
      currentBlock++;
    } else if (currentBlock > 0) {
      clue.push(currentBlock);
      currentBlock = 0;
    }
  }

  if (currentBlock > 0) {
    clue.push(currentBlock);
  }

  return clue.length > 0 ? clue : [0];
}

/**
 * Calculates row clues for a 2D solution matrix.
 */
export function calculateRowClues(solution: SolutionGrid): Clue[] {
  return solution.map((row) => calculateLineClue(row));
}

/**
 * Calculates column clues for a 2D solution matrix.
 */
export function calculateColClues(solution: SolutionGrid): Clue[] {
  if (solution.length === 0) return [];
  const width = solution[0].length;
  const colClues: Clue[] = [];

  for (let col = 0; col < width; col++) {
    const colLine: boolean[] = [];
    for (let row = 0; row < solution.length; row++) {
      colLine.push(solution[row][col]);
    }
    colClues.push(calculateLineClue(colLine));
  }

  return colClues;
}

/**
 * Creates an empty cell matrix of given height and width.
 */
export function createEmptyGrid(height: number, width: number): Grid {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => CellState.EMPTY)
  );
}

/**
 * Initializes a new NonogramBoard data object with calculated clues and empty grid.
 */
export function createInitialBoard(
  id: string,
  title: string,
  solution: SolutionGrid
): NonogramBoard {
  const height = solution.length;
  const width = height > 0 ? solution[0].length : 0;

  const rowClues = calculateRowClues(solution);
  const colClues = calculateColClues(solution);
  const grid = createEmptyGrid(height, width);

  return {
    id,
    title,
    width,
    height,
    solution,
    grid,
    rowClues,
    colClues,
    isCompleted: false,
    elapsedSeconds: 0,
  };
}

/**
 * Checks if the user's grid matches the target solution.
 * A board is solved iff all FILLED cells match true in the solution,
 * and no non-solution cells are FILLED.
 */
export function checkIsSolved(grid: Grid, solution: SolutionGrid): boolean {
  const height = solution.length;
  if (height === 0) return true;
  const width = solution[0].length;

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const isUserFilled = grid[r][c] === CellState.FILLED;
      const isSolutionFilled = solution[r][c];
      if (isUserFilled !== isSolutionFilled) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Checks whether a single row matches the solution's filled cells.
 */
export function checkRowCompleted(
  grid: Grid,
  solution: SolutionGrid,
  rowIndex: number
): boolean {
  const row = grid[rowIndex];
  const solRow = solution[rowIndex];
  if (!row || !solRow) return false;

  for (let col = 0; col < row.length; col++) {
    const isFilled = row[col] === CellState.FILLED;
    if (isFilled !== solRow[col]) {
      return false;
    }
  }
  return true;
}

/**
 * Checks whether a single column matches the solution's filled cells.
 */
export function checkColCompleted(
  grid: Grid,
  solution: SolutionGrid,
  colIndex: number
): boolean {
  for (let row = 0; row < grid.length; row++) {
    const isFilled = grid[row][colIndex] === CellState.FILLED;
    if (isFilled !== solution[row][colIndex]) {
      return false;
    }
  }
  return true;
}

/**
 * Determines the target state when toggling/marking a cell starting from a initial state.
 */
export function getNextCellState(
  currentState: CellState,
  mode: InputMode
): CellState {
  if (mode === 'FILL') {
    return currentState === CellState.FILLED ? CellState.EMPTY : CellState.FILLED;
  } else {
    return currentState === CellState.CROSS ? CellState.EMPTY : CellState.CROSS;
  }
}

/**
 * Interpolates line positions between start and end cell using Bresenham's line algorithm.
 * Crucial for smooth cell dragging during rapid touch gestures.
 */
export function getLineInterpolatedCells(
  start: CellPosition,
  end: CellPosition
): CellPosition[] {
  const cells: CellPosition[] = [];
  let r0 = start.row;
  let c0 = start.col;
  const r1 = end.row;
  const c1 = end.col;

  const dr = Math.abs(r1 - r0);
  const dc = Math.abs(c1 - c0);
  const sr = r0 < r1 ? 1 : -1;
  const sc = c0 < c1 ? 1 : -1;
  let err = dr - dc;

  while (true) {
    cells.push({ row: r0, col: c0 });
    if (r0 === r1 && c0 === c1) break;

    const e2 = 2 * err;
    if (e2 > -dc) {
      err -= dc;
      r0 += sr;
    }
    if (e2 < dr) {
      err += dr;
      c0 += sc;
    }
  }

  return cells;
}

/**
 * Applies automated CROSS markings to all empty cells in a completed row or column.
 */
export function autoCrossLineInGrid(
  grid: Grid,
  type: 'row' | 'col',
  index: number
): { newGrid: Grid; updatedCells: CellPosition[] } {
  const newGrid = grid.map((r) => [...r]);
  const updatedCells: CellPosition[] = [];

  if (type === 'row') {
    const row = newGrid[index];
    if (!row) return { newGrid, updatedCells };
    for (let c = 0; c < row.length; c++) {
      if (row[c] === CellState.EMPTY) {
        row[c] = CellState.CROSS;
        updatedCells.push({ row: index, col: c });
      }
    }
  } else {
    for (let r = 0; r < newGrid.length; r++) {
      if (newGrid[r][index] === CellState.EMPTY) {
        newGrid[r][index] = CellState.CROSS;
        updatedCells.push({ row: r, col: index });
      }
    }
  }

  return { newGrid, updatedCells };
}
