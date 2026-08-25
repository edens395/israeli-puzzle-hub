import { BoardDifficulty, SudokuBoard, SudokuCellState } from '../types/sudoku';

/**
 * Gets 3x3 sub-box index (0..8) from cell position (row, col).
 */
export function getBoxIndex(row: number, col: number): number {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

/**
 * Checks whether two cell positions belong to the same 3x3 sub-box.
 */
export function inSameBox(r1: number, c1: number, r2: number, c2: number): boolean {
  return getBoxIndex(r1, c1) === getBoxIndex(r2, c2);
}

/**
 * Parses an 81-character Sudoku string into a 9x9 SudokuCellState matrix.
 */
export function parseSudokuString(
  puzzleStr: string,
  solutionStr?: string
): { grid: SudokuCellState[][]; solutionMatrix: number[][] } {
  const cleanPuzzle = puzzleStr.replace(/[^0-9.]/g, '').replace(/\./g, '0');
  const cleanSolution = solutionStr
    ? solutionStr.replace(/[^0-9]/g, '')
    : cleanPuzzle;

  const grid: SudokuCellState[][] = [];
  const solutionMatrix: number[][] = [];

  for (let r = 0; r < 9; r++) {
    const gridRow: SudokuCellState[] = [];
    const solRow: number[] = [];

    for (let c = 0; c < 9; c++) {
      const idx = r * 9 + c;
      const valChar = cleanPuzzle[idx] || '0';
      const val = parseInt(valChar, 10) || 0;

      const solChar = cleanSolution[idx] || valChar;
      const solVal = parseInt(solChar, 10) || val;

      gridRow.push({
        row: r,
        col: c,
        value: val,
        solutionValue: solVal > 0 ? solVal : val,
        isGiven: val > 0,
        isError: false,
        notes: [],
      });

      solRow.push(solVal);
    }

    grid.push(gridRow);
    solutionMatrix.push(solRow);
  }

  return { grid, solutionMatrix };
}

/**
 * Validates real-time row, column, and 3x3 box duplicate conflicts across the 9x9 board.
 */
export function validateSudokuConflicts(grid: SudokuCellState[][]): {
  conflictMap: boolean[][];
  hasError: boolean;
} {
  const conflictMap: boolean[][] = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => false)
  );
  let hasError = false;

  // Check rows
  for (let r = 0; r < 9; r++) {
    const seenMap = new Map<number, number[]>();
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c].value;
      if (val > 0) {
        const existing = seenMap.get(val) || [];
        existing.push(c);
        seenMap.set(val, existing);
      }
    }
    seenMap.forEach((cols) => {
      if (cols.length > 1) {
        hasError = true;
        cols.forEach((c) => {
          conflictMap[r][c] = true;
        });
      }
    });
  }

  // Check columns
  for (let c = 0; c < 9; c++) {
    const seenMap = new Map<number, number[]>();
    for (let r = 0; r < 9; r++) {
      const val = grid[r][c].value;
      if (val > 0) {
        const existing = seenMap.get(val) || [];
        existing.push(r);
        seenMap.set(val, existing);
      }
    }
    seenMap.forEach((rows) => {
      if (rows.length > 1) {
        hasError = true;
        rows.forEach((r) => {
          conflictMap[r][c] = true;
        });
      }
    });
  }

  // Check 3x3 sub-boxes
  for (let boxIdx = 0; boxIdx < 9; boxIdx++) {
    const startRow = Math.floor(boxIdx / 3) * 3;
    const startCol = (boxIdx % 3) * 3;
    const seenMap = new Map<number, { r: number; c: number }[]>();

    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        const val = grid[r][c].value;
        if (val > 0) {
          const existing = seenMap.get(val) || [];
          existing.push({ r, c });
          seenMap.set(val, existing);
        }
      }
    }

    seenMap.forEach((positions) => {
      if (positions.length > 1) {
        hasError = true;
        positions.forEach((pos) => {
          conflictMap[pos.r][pos.c] = true;
        });
      }
    });
  }

  return { conflictMap, hasError };
}

/**
 * Checks if the Sudoku grid is completely solved.
 */
export function checkIsSolved(grid: SudokuCellState[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = grid[r][c];
      if (cell.value === 0 || cell.value !== cell.solutionValue) {
        return false;
      }
    }
  }

  const { hasError } = validateSudokuConflicts(grid);
  return !hasError;
}

/**
 * Removes a specified number from candidate pencil notes of all cells in the same row, col, and 3x3 box.
 */
export function removeNoteFromPeers(
  grid: SudokuCellState[][],
  targetRow: number,
  targetCol: number,
  num: number
): SudokuCellState[][] {
  return grid.map((row, r) =>
    row.map((cell, c) => {
      const isPeer =
        r === targetRow || c === targetCol || inSameBox(r, c, targetRow, targetCol);

      if (isPeer && cell.notes.includes(num)) {
        return {
          ...cell,
          notes: cell.notes.filter((n) => n !== num),
        };
      }
      return cell;
    })
  );
}

/**
 * Initializes a full SudokuBoard data object from 81-character puzzle & solution strings.
 */
export function createSudokuBoard(
  id: string,
  title: string,
  difficulty: BoardDifficulty,
  initialString: string,
  solutionString: string
): SudokuBoard {
  const { grid } = parseSudokuString(initialString, solutionString);

  return {
    id,
    title,
    difficulty,
    grid,
    initialString,
    solutionString,
    isCompleted: false,
    elapsedSeconds: 0,
  };
}

// Preset Sudoku Puzzles
export const SAMPLE_SUDOKU_PUZZLES = {
  easy: createSudokuBoard(
    'sudoku-easy-1',
    'סודוקו קל #1',
    'easy',
    '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
    '534678912672195348198342567859761423426853791713924856961537284287419635345286179'
  ),
  medium: createSudokuBoard(
    'sudoku-medium-1',
    'סודוקו בינוני #1',
    'medium',
    '000260701680070090190004500820100040004602900050003028009300074040050036703018000',
    '435269781682571493197834562826195347374682915951743628519326874248957136763418259'
  ),
  hard: createSudokuBoard(
    'sudoku-hard-1',
    'סודוקו קשה #1',
    'hard',
    '000000012000000003002300400001800005060070800000009000008500000900040500470006001',
    '635487912184295673792316458241839765563174829879652341318527964926741583475963218'
  ),
};
