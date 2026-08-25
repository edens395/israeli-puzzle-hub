import AsyncStorage from '@react-native-async-storage/async-storage';

const HAPTICS_STORAGE_KEY = '@hamusaf_haptics_enabled';

let hapticsEnabledMemory = true;

// Initialize haptic preference state from storage
AsyncStorage.getItem(HAPTICS_STORAGE_KEY)
  .then((val) => {
    if (val !== null) {
      hapticsEnabledMemory = val === 'true';
    }
  })
  .catch(() => {});

function safeExpoHaptics(): typeof import('expo-haptics') | null {
  if (typeof window === 'undefined') return null;
  try {
    return require('expo-haptics');
  } catch (e) {
    return null;
  }
}

/**
 * Ultra-light tap feedback (e.g. typing a letter in Crossword or selecting a cell in Sudoku).
 */
export function tapLight(): void {
  if (!hapticsEnabledMemory) return;
  const Haptics = safeExpoHaptics();
  if (Haptics) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}

/**
 * Medium toggle feedback (e.g. toggling a cell state in Nonogram).
 */
export function toggleMedium(): void {
  if (!hapticsEnabledMemory) return;
  const Haptics = safeExpoHaptics();
  if (Haptics) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }
}

/**
 * Drag selection pulse (e.g. continuous dragging over Nonogram rows).
 */
export function cellDrag(): void {
  if (!hapticsEnabledMemory) return;
  const Haptics = safeExpoHaptics();
  if (Haptics) {
    Haptics.selectionAsync().catch(() => {});
  }
}

/**
 * Error / conflict vibration notice.
 */
export function errorNotice(): void {
  if (!hapticsEnabledMemory) return;
  const Haptics = safeExpoHaptics();
  if (Haptics) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  }
}

/**
 * Multi-pulse celebratory victory sequence upon puzzle completion.
 */
export function gameWinCelebration(): void {
  if (!hapticsEnabledMemory) return;
  const Haptics = safeExpoHaptics();
  if (Haptics) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }, 150);
  }
}

/**
 * Sets whether tactile haptic feedback is enabled.
 */
export async function setHapticsEnabled(enabled: boolean): Promise<void> {
  hapticsEnabledMemory = enabled;
  try {
    await AsyncStorage.setItem(HAPTICS_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch (e) {
    // fallback
  }
}

/**
 * Gets whether tactile haptic feedback is enabled.
 */
export async function getHapticsEnabled(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(HAPTICS_STORAGE_KEY);
    if (val !== null) {
      hapticsEnabledMemory = val === 'true';
    }
  } catch (e) {
    // fallback
  }
  return hapticsEnabledMemory;
}
