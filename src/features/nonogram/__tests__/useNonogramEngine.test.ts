import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createInitialBoard } from '../logic/nonogramUtils';

const boardA = createInitialBoard('board-a', 'Board A', [
  [true, false],
  [false, true],
]);

const boardB = createInitialBoard('board-b', 'Board B (Magen David)', [
  [true, true, true],
  [true, false, true],
  [true, true, true],
]);

describe('useNonogramEngine Integration & Board Synchronization', () => {
  it('correctly builds initial boards with distinct dimensions', () => {
    assert.equal(boardA.id, 'board-a');
    assert.equal(boardA.width, 2);
    assert.equal(boardA.height, 2);

    assert.equal(boardB.id, 'board-b');
    assert.equal(boardB.width, 3);
    assert.equal(boardB.height, 3);
  });
});
