import { useCallback, useEffect, useState } from 'react';
import {
  DailyEditionData,
  getTodayDateString,
  PuzzleCategory,
  puzzleRepository,
  PuzzleStatus,
  UserStats,
} from '../storage/puzzleRepository';

export interface UseDailyProgressReturn {
  dailyData: DailyEditionData | null;
  userStats: UserStats | null;
  archiveData: DailyEditionData[];
  isLoading: boolean;
  updateProgress: (
    category: PuzzleCategory,
    completionPercent: number,
    status: PuzzleStatus,
    elapsedSeconds: number,
    savedGridState?: any
  ) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useDailyProgress(dateString: string = getTodayDateString()): UseDailyProgressReturn {
  const [dailyData, setDailyData] = useState<DailyEditionData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [archiveData, setArchiveData] = useState<DailyEditionData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [edition, stats, archives] = await Promise.all([
        puzzleRepository.getDailyProgress(dateString),
        puzzleRepository.getUserStats(),
        puzzleRepository.getArchiveEditions(3),
      ]);
      setDailyData(edition);
      setUserStats(stats);
      setArchiveData(archives);
    } catch (error) {
      console.warn('Error loading daily progress', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateString]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateProgress = useCallback(
    async (
      category: PuzzleCategory,
      completionPercent: number,
      status: PuzzleStatus,
      elapsedSeconds: number,
      savedGridState?: any
    ) => {
      const updatedEdition = await puzzleRepository.savePuzzleProgress(
        category,
        completionPercent,
        status,
        elapsedSeconds,
        savedGridState,
        dateString
      );
      const updatedStats = await puzzleRepository.getUserStats();
      setDailyData(updatedEdition);
      setUserStats(updatedStats);
    },
    [dateString]
  );

  return {
    dailyData,
    userStats,
    archiveData,
    isLoading,
    updateProgress,
    refresh: loadData,
  };
}
