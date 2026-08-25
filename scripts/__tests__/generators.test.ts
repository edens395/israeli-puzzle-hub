import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validateCrosswordIntersections } from '../generators/crosswordValidator';
import { generateNonogramFromMatrix } from '../generators/nonogramGenerator';
import { generateSudokuBoard } from '../generators/sudokuGenerator';

describe('Puzzle Generator & Validation Utility Scripts', () => {
  describe('nonogramGenerator', () => {
    it('generates NonogramBoard from boolean pixel matrix', () => {
      const matrix = [
        [true, false, true],
        [true, true, true],
      ];
      const board = generateNonogramFromMatrix('test-mono', 'טסט', matrix);

      assert.equal(board.width, 3);
      assert.equal(board.height, 2);
      assert.deepEqual(board.rowClues, [[1, 1], [3]]);
      assert.deepEqual(board.colClues, [[2], [1], [2]]);
    });
  });

  describe('sudokuGenerator', () => {
    it('generates valid 81-character Sudoku board and solution strings', () => {
      const sudoku = generateSudokuBoard('medium');

      assert.equal(sudoku.initialBoard.length, 81);
      assert.equal(sudoku.solution.length, 81);
      assert.equal(sudoku.difficulty, 'medium');
    });
  });

  describe('crosswordValidator', () => {
    it('validates matching Hebrew letter intersections with Sofiot tolerance', () => {
      const result = validateCrosswordIntersections([
        {
          id: 'a1',
          number: 1,
          direction: 'across',
          text: 'עיר הבירה',
          answer: 'ירושלים',
          startRow: 0,
          startCol: 4,
        },
        {
          id: 'd1',
          number: 1,
          direction: 'down',
          text: 'מדינה',
          answer: 'ישראל',
          startRow: 0,
          startCol: 4,
        },
      ]);

      assert.equal(result.isValid, true);
      assert.equal(result.errors.length, 0);
    });

    it('flags conflicting Hebrew letter intersections', () => {
      const result = validateCrosswordIntersections([
        {
          id: 'a1',
          number: 1,
          direction: 'across',
          text: 'מזג אוויר',
          answer: 'שרב',
          startRow: 0,
          startCol: 4,
        },
        {
          id: 'd1',
          number: 1,
          direction: 'down',
          text: 'מדינה',
          answer: 'ישראל', // Intersection at (0, 4) has 'ש' vs 'י'
          startRow: 0,
          startCol: 4,
        },
      ]);

      assert.equal(result.isValid, false);
      assert.ok(result.errors.length > 0);
    });
  });
});
