import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyEditionData, PuzzleCategory, PuzzleProgress, PuzzleStatus, UserStats } from "../models";

export type { DailyEditionData, PuzzleCategory, PuzzleProgress, PuzzleStatus, UserStats };

export const getTodayDateString = (date: Date = new Date()): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const STORAGE_KEYS = {
    DAILY_PREFIX: '@israeli_puzzle_hub_daily_',
    USER_STATS: '@israeli_puzzle_hub_user_stats',
};

const memoryStore = new Map<string, string>();

async function safeGetItem(key: string): Promise<string | null> {
  try {
    const val = await AsyncStorage.getItem(key);
    if (val !== null) return val;
  } catch (e) {
    // fallback to memoryStore if AsyncStorage/window unavailable
  }
  return memoryStore.get(key) || null;
}

async function safeSetItem(key: string, value: string): Promise<void> {
  memoryStore.set(key, value);
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    // fallback recorded in memoryStore
  }
}

// Default initial user stats
export const DEFAULT_USER_STATS: UserStats = {
  currentStreak: 5,
  longestStreak: 12,
  lastSolvedDate: new Date(2026, 7, 14), // '14.08.2026'
  totalPuzzlesCompleted: 34,
  categoryCounts: {
    nonogram: 18,
    sudoku: 6,
    tashbetz: 10,
  },
};

export const getHebrewFormattedDate = (date: Date | string = new Date()): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Generates default daily edition progress for a given date
 */
function createDefaultDailyEdition(dateString: Date): DailyEditionData {
  return {
    dateString,
    dateFormattedHebrew: getHebrewFormattedDate(dateString),
    puzzles: {
      nonogram: {
        puzzleId: `nonogram_${dateString.toLocaleDateString()}`,
        category: 'nonogram',
        dateString,
        status: 'in_progress',
        completionPercent: 55,
        elapsedSeconds: 145,
      },
      sudoku: {
        puzzleId: `sudoku_${dateString.toLocaleDateString()}`,
        category: 'sudoku',
        dateString,
        status: 'not_started',
        completionPercent: 0,
        elapsedSeconds: 0,
      },
      tashbetz: {
        puzzleId: `tashbetz_${dateString.toLocaleDateString()}`,
        category: 'tashbetz',
        dateString,
        status: 'completed',
        completionPercent: 100,
        elapsedSeconds: 210,
        completedAt: Date.now() - 3600000,
      },
    },
  };
}

export const puzzleRepository = {
  /**
   * Fetches daily edition progress for a specific date (defaults to today)
   */
  async getDailyProgress(dateInput: Date | string = new Date()): Promise<DailyEditionData> {
    const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const raw = await safeGetItem(`${STORAGE_KEYS.DAILY_PREFIX}${dateObj.toISOString().split('T')[0]}`);
    if (raw) {
      return JSON.parse(raw) as DailyEditionData;
    }
    const defaultData = createDefaultDailyEdition(dateObj);
    await this.saveDailyEditionData(defaultData);
    return defaultData;
  },

  /**
   * Saves complete daily edition data structure
   */
  async saveDailyEditionData(data: DailyEditionData): Promise<void> {
    const dateObj = typeof data.dateString === 'string' ? new Date(data.dateString) : data.dateString;
    await safeSetItem(
      `${STORAGE_KEYS.DAILY_PREFIX}${dateObj.toISOString().split('T')[0]}`,
      JSON.stringify(data)
    );
  },

  /**
   * Updates progress for a specific puzzle
   */
  async savePuzzleProgress(
    category: PuzzleCategory,
    completionPercent: number,
    status: PuzzleStatus,
    elapsedSeconds: number,
    savedGridState?: any,
    dateInput: Date | string = new Date(),
  ): Promise<DailyEditionData> {
    const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const dailyData = await this.getDailyProgress(dateObj);
    const existing = dailyData.puzzles[category];

    const isNewlyCompleted = existing.status !== 'completed' && status === 'completed';

    dailyData.puzzles[category] = {
        ...existing,
        status,
        completionPercent,
        elapsedSeconds,
        savedGridState: savedGridState !== undefined ? savedGridState : existing.savedGridState,
        completedAt: isNewlyCompleted ? Date.now() : existing.completedAt,
    };
    await this.saveDailyEditionData(dailyData);

    if (isNewlyCompleted) {
      await this.updateStreakOnSolve(dateObj, category);
    }

    return dailyData;
  },

  /**
   * Fetches overall user statistics & streak data
   */
  async getUserStats(): Promise<UserStats> {
    const raw = await safeGetItem(STORAGE_KEYS.USER_STATS);
    if (raw) {
      return JSON.parse(raw) as UserStats;
    }
    return DEFAULT_USER_STATS;
  },

  /**
   * Updates active streak and completion stats when a puzzle is solved
   */
  async updateStreakOnSolve(dateString: Date, category: PuzzleCategory): Promise<UserStats> {
    const stats = await this.getUserStats();
    let { currentStreak, longestStreak, lastSolvedDate, totalPuzzlesCompleted, categoryCounts } = stats;

    totalPuzzlesCompleted += 1;
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;

    if (lastSolvedDate !== dateString) {
      // Calculate day difference
      const lastDate = lastSolvedDate ? new Date(lastSolvedDate) : null;
      const currentDate = new Date(dateString);

      if (lastDate) {
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak += 1;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      longestStreak = Math.max(longestStreak, currentStreak);
      lastSolvedDate = dateString;
    }

    const updatedStats: UserStats = {
      currentStreak,
      longestStreak,
      lastSolvedDate,
      totalPuzzlesCompleted,
      categoryCounts,
    };

    await safeSetItem(STORAGE_KEYS.USER_STATS, JSON.stringify(updatedStats));
    return updatedStats;
  },

  /**
   * Fetches past archive editions for preview
   */
  async getArchiveEditions(limit: number = 3): Promise<DailyEditionData[]> {
    const archives: DailyEditionData[] = [];
    const today = new Date();

    for (let i = 1; i <= limit; i++) {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - i);
      const data = await this.getDailyProgress(pastDate);
      archives.push(data);
    }

    return archives;
  },
};
