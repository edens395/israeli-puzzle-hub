import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatTimerSeconds } from '../usePuzzleTimer';

describe('usePuzzleTimer Logic Utility', () => {
  describe('formatTimerSeconds', () => {
    it('formats 0 seconds into 00:00', () => {
      assert.equal(formatTimerSeconds(0), '00:00');
    });

    it('formats 84 seconds into 01:24', () => {
      assert.equal(formatTimerSeconds(84), '01:24');
    });

    it('formats 605 seconds into 10:05', () => {
      assert.equal(formatTimerSeconds(605), '10:05');
    });
  });
});
