import assert from 'node:assert';
import { describe, it } from 'node:test';
import { validateNonogramSolvability } from '../../features/nonogram/logic/nonogramSolver';
import { generatorEngine } from '../generatorEngine';

describe('Nonogram Solver & Generator Engine', () => {
  it('validates solvability for 5x5 heart nonogram correctly', () => {
    const heartSolution = [
      [false, true, false, true, false],
      [true, true, true, true, true],
      [true, true, true, true, true],
      [false, true, true, true, false],
      [false, false, true, false, false],
    ];

    const { isSolvable } = validateNonogramSolvability(heartSolution);
    assert.strictEqual(isSolvable, true);
  });

  it('safely generates puzzle payload for date without throwing', async () => {
    const result = await generatorEngine.generatePuzzleForDate('2026-09-01');
    assert.strictEqual(typeof result.success, 'boolean');
    assert.strictEqual(typeof result.message, 'string');
  });
});
