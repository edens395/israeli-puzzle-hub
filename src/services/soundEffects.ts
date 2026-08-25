import AsyncStorage from '@react-native-async-storage/async-storage';

const SOUND_STORAGE_KEY = '@hamusaf_sound_enabled';

let soundEnabledMemory = true;

// Initialize sound preference state from storage
AsyncStorage.getItem(SOUND_STORAGE_KEY)
  .then((val) => {
    if (val !== null) {
      soundEnabledMemory = val === 'true';
    }
  })
  .catch(() => {});

// Web Audio API Synth Engine for zero-asset instant sound FX
function playWebTone(frequency: number, durationMs: number, type: OscillatorType = 'sine', gainVal: number = 0.05): void {
  if (typeof window === 'undefined' || !soundEnabledMemory) return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch (e) {
    // Ignore audio context autoplay restriction or errors
  }
}

/**
 * Short, crisp mechanical paper click on key/cell tap.
 */
export function playPaperTap(): void {
  if (!soundEnabledMemory) return;
  playWebTone(600, 40, 'triangle', 0.04);
}

/**
 * Subtle pencil scratch tone when writing candidate notes.
 */
export function playPencilScratch(): void {
  if (!soundEnabledMemory) return;
  playWebTone(900, 60, 'sine', 0.03);
}

/**
 * Soft cross-off sound when completing a word or clue line.
 */
export function playCrossOff(): void {
  if (!soundEnabledMemory) return;
  playWebTone(440, 80, 'sine', 0.05);
}

/**
 * Warm acoustic victory chord upon puzzle completion.
 */
export function playVictoryChime(): void {
  if (!soundEnabledMemory) return;
  // Elegant major chord (C5, E5, G5, C6)
  const chord = [523.25, 659.25, 783.99, 1046.5];
  chord.forEach((freq, idx) => {
    setTimeout(() => {
      playWebTone(freq, 400, 'sine', 0.06);
    }, idx * 100);
  });
}

/**
 * Sets whether sound effects are enabled.
 */
export async function setSoundEnabled(enabled: boolean): Promise<void> {
  soundEnabledMemory = enabled;
  try {
    await AsyncStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch (e) {
    // fallback
  }
}

/**
 * Gets whether sound effects are enabled.
 */
export async function getSoundEnabled(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(SOUND_STORAGE_KEY);
    if (val !== null) {
      soundEnabledMemory = val === 'true';
    }
  } catch (e) {
    // fallback
  }
  return soundEnabledMemory;
}
