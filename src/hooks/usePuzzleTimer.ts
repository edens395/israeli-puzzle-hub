import { useCallback, useEffect, useRef, useState } from 'react';

export interface UsePuzzleTimerReturn {
  elapsedSeconds: number;
  isRunning: boolean;
  formattedTime: string;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setElapsedSeconds: (sec: number) => void;
}

/**
 * Formats seconds into a clean mm:ss string (e.g. 02:45).
 */
export function formatTimerSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Custom hook managing accurate real-time puzzle playing timer.
 */
export function usePuzzleTimer(autoStart: boolean = true, initialSeconds: number = 0): UsePuzzleTimerReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setElapsedSeconds(initialSeconds);
  }, [initialSeconds]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setElapsedSeconds(0);
    setIsRunning(true);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  return {
    elapsedSeconds,
    isRunning,
    formattedTime: formatTimerSeconds(elapsedSeconds),
    startTimer,
    pauseTimer,
    resetTimer,
    setElapsedSeconds,
  };
}
