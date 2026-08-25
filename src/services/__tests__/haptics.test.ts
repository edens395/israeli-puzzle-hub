import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  cellDrag,
  errorNotice,
  gameWinCelebration,
  getHapticsEnabled,
  setHapticsEnabled,
  tapLight,
  toggleMedium,
} from '../haptics';

describe('Tactile Haptic Feedback Service', () => {
  it('toggles haptics preference and retrieves saved state', async () => {
    await setHapticsEnabled(false);
    let enabled = await getHapticsEnabled();
    assert.equal(enabled, false);

    await setHapticsEnabled(true);
    enabled = await getHapticsEnabled();
    assert.equal(enabled, true);
  });

  it('safely invokes haptic trigger functions without throwing in Node test environment', () => {
    assert.doesNotThrow(() => {
      tapLight();
      toggleMedium();
      cellDrag();
      errorNotice();
      gameWinCelebration();
    });
  });
});
