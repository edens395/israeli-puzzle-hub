import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getHebrewFormattedDate,
  getTodayDateString,
  puzzleRepository,
} from '../puzzleRepository';

describe('Puzzle Local Storage & Repository Pattern', () => {
  describe('Date Helpers', () => {
    it('returns valid ISO date string YYYY-MM-DD', () => {
      const today = getTodayDateString();
      assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
    });

    it('formats date into Hebrew string', () => {
      const formatted = getHebrewFormattedDate('2026-08-15');
      assert.ok(formatted.includes('2026'));
      assert.ok(formatted.includes('15'));
      assert.ok(formatted.includes('באוגוסט'));
    });
  });

  describe('puzzleRepository Operations', () => {
    it('fetches default daily edition data for today', async () => {
      const dailyData = await puzzleRepository.getDailyProgress('2026-08-15');
      assert.equal(new Date(dailyData.dateString).toISOString().split('T')[0], '2026-08-15');
      assert.ok(dailyData.puzzles.nonogram);
      assert.ok(dailyData.puzzles.sudoku);
      assert.ok(dailyData.puzzles.tashbetz);
    });

    it('fetches user stats and calculates streak', async () => {
      const stats = await puzzleRepository.getUserStats();
      assert.ok(typeof stats.currentStreak === 'number');
      assert.ok(typeof stats.totalPuzzlesCompleted === 'number');
    });

    it('updates puzzle progress cleanly', async () => {
      const updated = await puzzleRepository.savePuzzleProgress(
        'nonogram',
        100,
        'completed',
        180,
        null,
        '2026-08-15'
      );
      assert.equal(updated.puzzles.nonogram.status, 'completed');
      assert.equal(updated.puzzles.nonogram.completionPercent, 100);
      assert.equal(updated.puzzles.nonogram.elapsedSeconds, 180);
    });
  });
});
