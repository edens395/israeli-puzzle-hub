import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createCrosswordBoard, SAMPLE_CROSSWORD_PUZZLES } from '../logic/crosswordUtils';

describe('Hebrew Mini-Crossword (תשחץ) Logic Utilities', () => {
  describe('createCrosswordBoard', () => {
    it('creates 5x5 board matrix with RTL across word flow', () => {
      const board = createCrosswordBoard('test-cw-1', 'תשחץ בדיקה', 5, 5, [
        {
          id: 'a1',
          number: 1,
          direction: 'across',
          text: 'עיר הקודש (5 אותיות)',
          answer: 'ירושלים',
          startRow: 0,
          startCol: 4, // Starts at col 4, flows left to 0
        },
      ]);

      assert.equal(board.rows, 5);
      assert.equal(board.cols, 5);

      // Check RTL across vector
      assert.equal(board.grid[0][4].solutionLetter, 'י');
      assert.equal(board.grid[0][4].clueNumber, 1);
      assert.equal(board.grid[0][3].solutionLetter, 'ר');
      assert.equal(board.grid[0][2].solutionLetter, 'ו');
      assert.equal(board.grid[0][1].solutionLetter, 'ש');
      assert.equal(board.grid[0][0].solutionLetter, 'ל');

      // Check unpopulated cell remains blocked
      assert.equal(board.grid[1][0].isBlocked, true);
    });

    it('loads sample puzzle #1 correctly', () => {
      const sample = SAMPLE_CROSSWORD_PUZZLES[0];
      assert.equal(sample.id, 'mini-tashbetz-1');
      assert.ok(sample.clues.across.length > 0);
      assert.ok(sample.clues.down.length > 0);
    });
  });
});
