import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  autoCrossLineInGrid,
  calculateColClues,
  calculateLineClue,
  calculateRowClues,
  checkIsSolved,
  createInitialBoard,
  getLineInterpolatedCells,
  getNextCellState,
} from '../logic/nonogramUtils';
import { CellState } from '../types/nonogram';

describe('Nonogram Logic Utilities', () => {
  describe('calculateLineClue', () => {
    it('returns [0] for an empty sequence', () => {
      assert.deepEqual(calculateLineClue([]), [0]);
      assert.deepEqual(calculateLineClue([false, false, false]), [0]);
    });

    it('calculates single block correctly', () => {
      assert.deepEqual(calculateLineClue([true, true, true]), [3]);
    });

    it('calculates multiple blocks with spaces correctly', () => {
      assert.deepEqual(calculateLineClue([true, true, false, true]), [2, 1]);
      assert.deepEqual(calculateLineClue([true, false, true, true, false, true]), [1, 2, 1]);
    });
  });

  describe('calculateRowClues and calculateColClues', () => {
    const solution = [
      [true, false, true],
      [false, false, false],
      [true, true, true],
    ];

    it('calculates row clues for 3x3 grid', () => {
      const rowClues = calculateRowClues(solution);
      assert.deepEqual(rowClues, [[1, 1], [0], [3]]);
    });

    it('calculates column clues for 3x3 grid', () => {
      const colClues = calculateColClues(solution);
      assert.deepEqual(colClues, [[1, 1], [1], [1, 1]]);
    });
  });

  describe('createInitialBoard', () => {
    it('creates board with correct dimensions and calculated clues', () => {
      const solution = [
        [true, false],
        [false, true],
      ];
      const board = createInitialBoard('test-1', 'Test Puzzle', solution);

      assert.equal(board.id, 'test-1');
      assert.equal(board.title, 'Test Puzzle');
      assert.equal(board.width, 2);
      assert.equal(board.height, 2);
      assert.deepEqual(board.rowClues, [[1], [1]]);
      assert.deepEqual(board.colClues, [[1], [1]]);
      assert.deepEqual(board.grid, [
        [CellState.EMPTY, CellState.EMPTY],
        [CellState.EMPTY, CellState.EMPTY],
      ]);
      assert.equal(board.isCompleted, false);
    });
  });

  describe('checkIsSolved', () => {
    const solution = [
      [true, false],
      [false, true],
    ];

    it('returns false for initial empty grid', () => {
      const grid = [
        [CellState.EMPTY, CellState.EMPTY],
        [CellState.EMPTY, CellState.EMPTY],
      ];
      assert.equal(checkIsSolved(grid, solution), false);
    });

    it('returns true when FILLED cells match solution, ignoring CROSS cells', () => {
      const grid = [
        [CellState.FILLED, CellState.CROSS],
        [CellState.CROSS, CellState.FILLED],
      ];
      assert.equal(checkIsSolved(grid, solution), true);
    });

    it('returns false if extra cells are FILLED', () => {
      const grid = [
        [CellState.FILLED, CellState.FILLED],
        [CellState.CROSS, CellState.FILLED],
      ];
      assert.equal(checkIsSolved(grid, solution), false);
    });
  });

  describe('getNextCellState', () => {
    it('toggles EMPTY to FILLED and FILLED to EMPTY in FILL mode', () => {
      assert.equal(getNextCellState(CellState.EMPTY, 'FILL'), CellState.FILLED);
      assert.equal(getNextCellState(CellState.CROSS, 'FILL'), CellState.FILLED);
      assert.equal(getNextCellState(CellState.FILLED, 'FILL'), CellState.EMPTY);
    });

    it('toggles EMPTY to CROSS and CROSS to EMPTY in CROSS mode', () => {
      assert.equal(getNextCellState(CellState.EMPTY, 'CROSS'), CellState.CROSS);
      assert.equal(getNextCellState(CellState.FILLED, 'CROSS'), CellState.CROSS);
      assert.equal(getNextCellState(CellState.CROSS, 'CROSS'), CellState.EMPTY);
    });
  });

  describe('getLineInterpolatedCells', () => {
    it('interpolates horizontal line', () => {
      const cells = getLineInterpolatedCells({ row: 0, col: 0 }, { row: 0, col: 3 });
      assert.deepEqual(cells, [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
      ]);
    });

    it('interpolates vertical line', () => {
      const cells = getLineInterpolatedCells({ row: 1, col: 2 }, { row: 3, col: 2 });
      assert.deepEqual(cells, [
        { row: 1, col: 2 },
        { row: 2, col: 2 },
        { row: 3, col: 2 },
      ]);
    });
  });

  describe('autoCrossLineInGrid', () => {
    it('replaces EMPTY cells with CROSS while preserving FILLED cells', () => {
      const grid = [
        [CellState.FILLED, CellState.EMPTY, CellState.FILLED, CellState.CROSS],
      ];
      const { newGrid, updatedCells } = autoCrossLineInGrid(grid, 'row', 0);
      assert.deepEqual(newGrid[0], [
        CellState.FILLED,
        CellState.CROSS,
        CellState.FILLED,
        CellState.CROSS,
      ]);
      assert.deepEqual(updatedCells, [{ row: 0, col: 1 }]);
    });
  });
});

