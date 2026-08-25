import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getSoundEnabled,
  playCrossOff,
  playPaperTap,
  playPencilScratch,
  playVictoryChime,
  setSoundEnabled,
} from '../soundEffects';

describe('Sound Effects Service', () => {
  it('toggles sound preference and retrieves saved state', async () => {
    await setSoundEnabled(false);
    let enabled = await getSoundEnabled();
    assert.equal(enabled, false);

    await setSoundEnabled(true);
    enabled = await getSoundEnabled();
    assert.equal(enabled, true);
  });

  it('safely invokes audio playback triggers without throwing in Node test environment', () => {
    assert.doesNotThrow(() => {
      playPaperTap();
      playPencilScratch();
      playCrossOff();
      playVictoryChime();
    });
  });
});
