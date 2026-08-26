import assert from 'node:assert';
import { describe, it } from 'node:test';
import { cloudDatabaseService } from '../cloudDatabaseService';
import { deviceIdService } from '../deviceIdService';

describe('Persistent Device ID & Cloud Database Sync Engine', () => {
  it('generates a valid UUID string and persists it', async () => {
    const id1 = await deviceIdService.getDeviceId();
    assert.strictEqual(typeof id1, 'string');
    assert.ok(id1.length > 20);

    const id2 = await deviceIdService.getDeviceId();
    assert.strictEqual(id1, id2, 'Device ID should remain constant across calls');
  });

  it('safely handles cloud puzzle progress sync payload without throwing', async () => {
    const res = await cloudDatabaseService.syncPuzzleProgress({
      puzzleId: 'nonogram_2026-08-25',
      category: 'nonogram',
      dateString: new Date('2026-08-25'),
      status: 'completed',
      completionPercent: 100,
      elapsedSeconds: 84,
      savedGridState: [[1, 0], [0, 1]],
    });
    assert.strictEqual(typeof res, 'boolean');
  });

  it('safely handles cloud user stats sync payload without throwing', async () => {
    const res = await cloudDatabaseService.syncUserStats({
      currentStreak: 6,
      longestStreak: 12,
      lastSolvedDate: new Date('2026-08-25'),
      totalPuzzlesCompleted: 35,
      categoryCounts: { nonogram: 19, sudoku: 6, tashbetz: 10 },
    });
    assert.strictEqual(typeof res, 'boolean');
  });
});
