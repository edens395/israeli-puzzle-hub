import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildDefaultEditionPackage,
  getCachedDailyEdition,
  getSyncStatus,
  syncDailyPuzzles,
} from '../puzzleSyncService';

describe('Remote Puzzle Sync & Caching Service', () => {
  const sampleDate = '2026-08-16';

  describe('buildDefaultEditionPackage', () => {
    it('creates complete edition package containing all 3 MVP puzzle games', () => {
      const pkg = buildDefaultEditionPackage(sampleDate);

      assert.equal(pkg.dateISO, sampleDate);
      assert.ok(pkg.nonogram);
      assert.ok(pkg.sudoku);
      assert.ok(pkg.tashbetz);
    });
  });

  describe('syncDailyPuzzles and getCachedDailyEdition', () => {
    it('caches next 7 daily editions cleanly', async () => {
      const res = await syncDailyPuzzles(true);
      assert.equal(res.syncedCount, 7);

      const status = await getSyncStatus();
      assert.equal(status.cachedDaysCount, 7);
    });

    it('retrieves cached package for given date', async () => {
      const pkg = await getCachedDailyEdition(sampleDate);
      assert.ok(pkg);
      assert.equal(pkg.dateISO, sampleDate);
    });
  });
});
