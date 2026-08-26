import assert from 'node:assert';
import { describe, it } from 'node:test';
import { addOneCalendarDay, dailyPuzzleService, subtractOneCalendarDay } from '../dailyPuzzleService';

describe('Daily Puzzle Dynamic Fetcher & Service', () => {
  it('correctly adds and subtracts 1 calendar day without timezone shifts', () => {
    assert.strictEqual(subtractOneCalendarDay('2026-08-26'), '2026-08-25');
    assert.strictEqual(subtractOneCalendarDay('2026-09-01'), '2026-08-31');
    assert.strictEqual(subtractOneCalendarDay('2026-01-01'), '2025-12-31');

    assert.strictEqual(addOneCalendarDay('2026-08-25'), '2026-08-26');
    assert.strictEqual(addOneCalendarDay('2026-08-31'), '2026-09-01');
    assert.strictEqual(addOneCalendarDay('2025-12-31'), '2026-01-01');
  });

  it('safely queries daily nonogram from Supabase without throwing', async () => {
    const board = await dailyPuzzleService.getDailyNonogram(new Date());
    if (board !== null) {
      assert.strictEqual(typeof board.title, 'string');
      assert.ok(Array.isArray(board.solution));
    } else {
      assert.strictEqual(board, null);
    }
  });

  it('safely handles deleteAndShiftDailyPuzzles and repairAllPuzzleGaps without throwing', async () => {
    const res1 = await dailyPuzzleService.repairAllPuzzleGaps();
    assert.strictEqual(typeof res1, 'boolean');

    const res2 = await dailyPuzzleService.deleteAndShiftDailyPuzzles('2099-12-31');
    assert.strictEqual(typeof res2, 'boolean');
  });
});
