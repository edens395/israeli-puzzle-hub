import AsyncStorage from '@react-native-async-storage/async-storage';
import { SAMPLE_PUZZLES } from '../features/nonogram/data/samplePuzzles';
import { SAMPLE_CROSSWORD_PUZZLES } from '../features/crossword/logic/crosswordUtils';
import { SAMPLE_SUDOKU_PUZZLES } from '../features/sudoku/logic/sudokuUtils';

const SYNC_STATUS_KEY = '@hamusaf_sync_status';
const EDITION_KEY_PREFIX = '@hamusaf_edition_';

const memoryStore = new Map<string, string>();

async function safeGetItem(key: string): Promise<string | null> {
  try {
    const val = await AsyncStorage.getItem(key);
    if (val !== null) return val;
  } catch (e) {
    // fallback to memoryStore if AsyncStorage/window unavailable in Node test environment
  }
  return memoryStore.get(key) || null;
}

async function safeSetItem(key: string, value: string): Promise<void> {
  memoryStore.set(key, value);
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    // recorded in memoryStore
  }
}

export interface DailyEditionPackage {
  dateISO: string;
  editionNumber: number;
  hebrewDate: string;
  nonogram: any;
  sudoku: any;
  tashbetz: any;
}

export interface SyncStatus {
  lastSyncISO: string;
  cachedDaysCount: number;
}

/**
 * Builds default offline pre-bundled edition package for a given date.
 */
export function buildDefaultEditionPackage(dateISO: string): DailyEditionPackage {
  return {
    dateISO,
    editionNumber: 42,
    hebrewDate: 'כ״ג באב תשפ״ו',
    nonogram: SAMPLE_PUZZLES[0],
    sudoku: SAMPLE_SUDOKU_PUZZLES.medium,
    tashbetz: SAMPLE_CROSSWORD_PUZZLES[0],
  };
}

/**
 * Retrieves cached daily edition package for a specific date (ISO YYYY-MM-DD), with offline fallback.
 */
export async function getCachedDailyEdition(
  dateISO: string
): Promise<DailyEditionPackage> {
  try {
    const raw = await safeGetItem(`${EDITION_KEY_PREFIX}${dateISO}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (error) {
    // ignore
  }

  return buildDefaultEditionPackage(dateISO);
}

/**
 * Syncs daily puzzle packages for the next 7 days, storing them in local cache.
 */
export async function syncDailyPuzzles(
  forceRemote: boolean = false
): Promise<{ syncedCount: number; isOfflineFallback: boolean }> {
  const today = new Date();
  let syncedCount = 0;
  let isOfflineFallback = false;

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateISO = d.toISOString().split('T')[0];

    const key = `${EDITION_KEY_PREFIX}${dateISO}`;
    const existing = await safeGetItem(key);

    if (!existing || forceRemote) {
      const pkg = buildDefaultEditionPackage(dateISO);
      await safeSetItem(key, JSON.stringify(pkg));
      syncedCount++;
    }
  }

  const nowISO = new Date().toISOString();
  await safeSetItem(
    SYNC_STATUS_KEY,
    JSON.stringify({ lastSyncISO: nowISO, cachedDaysCount: 7 })
  );

  return { syncedCount, isOfflineFallback };
}

/**
 * Gets the current sync status metadata.
 */
export async function getSyncStatus(): Promise<SyncStatus> {
  try {
    const raw = await safeGetItem(SYNC_STATUS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (error) {
    // ignore
  }

  return {
    lastSyncISO: new Date().toISOString(),
    cachedDaysCount: 7,
  };
}
