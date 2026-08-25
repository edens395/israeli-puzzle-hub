import { calculateLineClue } from '../../src/features/nonogram/logic/nonogramUtils';
import { CellState, Clue, NonogramBoard } from '../../src/features/nonogram/types/nonogram';

/**
 * Calculates row clue number arrays for a boolean pixel-art matrix.
 */
export function calculateRowCluesFromMatrix(matrix: boolean[][]): Clue[] {
  return matrix.map((row) => calculateLineClue(row));
}

/**
 * Calculates column clue number arrays for a boolean pixel-art matrix.
 */
export function calculateColCluesFromMatrix(matrix: boolean[][]): Clue[] {
  if (matrix.length === 0) return [];
  const height = matrix.length;
  const width = matrix[0].length;
  const colClues: Clue[] = [];

  for (let c = 0; c < width; c++) {
    const colArray: boolean[] = [];
    for (let r = 0; r < height; r++) {
      colArray.push(matrix[r][c]);
    }
    colClues.push(calculateLineClue(colArray));
  }

  return colClues;
}

/**
 * Converts a boolean pixel-art matrix into a fully playable NonogramBoard.
 */
export function generateNonogramFromMatrix(
  id: string,
  title: string,
  matrix: boolean[][]
): NonogramBoard {
  const height = matrix.length;
  const width = height > 0 ? matrix[0].length : 0;

  const rowClues = calculateRowCluesFromMatrix(matrix);
  const colClues = calculateColCluesFromMatrix(matrix);

  const initialGrid = Array.from({ length: height }, () =>
    Array(width).fill(CellState.EMPTY)
  );

  return {
    id,
    title,
    width,
    height,
    rowClues,
    colClues,
    solution: matrix,
    grid: initialGrid,
    isCompleted: false,
    elapsedSeconds: 0,
  };
}
