import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  checkIsSolved,
  getBoxIndex,
  inSameBox,
  parseSudokuString,
  SAMPLE_SUDOKU_PUZZLES,
  validateSudokuConflicts,
} from '../logic/sudokuUtils';

describe('Sudoku Engine Logic Utilities', () => {
  const samplePuzzleStr =
    '530070000600195000098000060800060003400803001700020006060000280000419005000080079';
  const sampleSolutionStr =
    '534678912672195348198342567859761423426853791713924856961537284287419635345286179';

  describe('parseSudokuString', () => {
    it('parses 81-character string into 9x9 matrix correctly', () => {
      const { grid, solutionMatrix } = parseSudokuString(samplePuzzleStr, sampleSolutionStr);

      assert.equal(grid.length, 9);
      assert.equal(grid[0].length, 9);
      assert.equal(grid[0][0].value, 5);
      assert.equal(grid[0][0].isGiven, true);
      assert.equal(grid[0][2].value, 0); // Empty cell
      assert.equal(grid[0][2].isGiven, false);
      assert.equal(solutionMatrix[0][2], 4);
    });
  });

  describe('getBoxIndex and inSameBox', () => {
    it('calculates 3x3 sub-box index correctly', () => {
      assert.equal(getBoxIndex(0, 0), 0);
      assert.equal(getBoxIndex(0, 2), 0);
      assert.equal(getBoxIndex(0, 3), 1);
      assert.equal(getBoxIndex(8, 8), 8);
    });

    it('identifies cells in the same box', () => {
      assert.equal(inSameBox(0, 0, 2, 2), true);
      assert.equal(inSameBox(0, 0, 3, 3), false);
    });
  });

  describe('validateSudokuConflicts', () => {
    it('returns no errors for valid initial puzzle state', () => {
      const { grid } = parseSudokuString(samplePuzzleStr);
      const { hasError } = validateSudokuConflicts(grid);
      assert.equal(hasError, false);
    });

    it('detects row conflict when duplicate number is placed', () => {
      const { grid } = parseSudokuString(samplePuzzleStr);
      grid[0][1].value = 5; // Duplicate 5 in row 0
      const { conflictMap, hasError } = validateSudokuConflicts(grid);

      assert.equal(hasError, true);
      assert.equal(conflictMap[0][0], true);
      assert.equal(conflictMap[0][1], true);
    });

    it('detects column conflict when duplicate number is placed', () => {
      const { grid } = parseSudokuString(samplePuzzleStr);
      grid[1][0].value = 5; // Duplicate 5 in col 0 (row 0 has 5)
      const { conflictMap, hasError } = validateSudokuConflicts(grid);

      assert.equal(hasError, true);
      assert.equal(conflictMap[0][0], true);
      assert.equal(conflictMap[1][0], true);
    });
  });

  describe('checkIsSolved', () => {
    it('returns false for incomplete puzzle', () => {
      const { grid } = parseSudokuString(samplePuzzleStr, sampleSolutionStr);
      assert.equal(checkIsSolved(grid), false);
    });

    it('returns true for fully completed valid puzzle', () => {
      const { grid } = parseSudokuString(sampleSolutionStr, sampleSolutionStr);
      assert.equal(checkIsSolved(grid), true);
    });
  });
});
