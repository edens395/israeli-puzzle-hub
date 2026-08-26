import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import { GameScreenLayout } from '../../../components/layout/GameScreenLayout';
import { Caption } from '../../../components/ui/Typography';
import { useTheme } from '../../../context/ThemeContext';
import { usePuzzleTimer } from '../../../hooks/usePuzzleTimer';
import { dailyPuzzleService } from '../../../services/dailyPuzzleService';
import { getTodayDateString, puzzleRepository } from '../../../storage/puzzleRepository';
import { SAMPLE_PUZZLES } from '../data/samplePuzzles';
import { useNonogramEngine } from '../hooks/useNonogramEngine';
import { CellState, Grid, NonogramBoard } from '../types/nonogram';
import { NonogramControls } from './NonogramControls';
import { NonogramGrid } from './NonogramGrid';

export interface NonogramScreenProps {
  onBackToHub?: () => void;
  targetDate?: Date | string;
}

export const NonogramScreen: React.FC<NonogramScreenProps> = ({
  onBackToHub = () => {},
  targetDate,
}) => {
  const { theme } = useTheme();
  const dateKey = useMemo(
    () => getTodayDateString(targetDate || new Date()),
    [typeof targetDate === 'string' ? targetDate : targetDate?.getTime?.()]
  );

  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [activeBoard, setActiveBoard] = useState<NonogramBoard>(SAMPLE_PUZZLES[0]);
  const [loading, setLoading] = useState<boolean>(true);
  const timer = usePuzzleTimer(true);
  const hasRestoredRef = useRef<boolean>(false);

  // Fetch target date's dynamic Nonogram from Supabase (auto-generates dynamic puzzle on the fly if missing)
  useEffect(() => {
    async function loadRemoteNonogram() {
      try {
        setLoading(true);
        const remoteBoard = await dailyPuzzleService.getDailyNonogram(dateKey);
        if (remoteBoard) {
          setActiveBoard(remoteBoard);
        } else {
          setActiveBoard(SAMPLE_PUZZLES[0]);
        }
      } catch (e) {
        console.warn('Error loading remote nonogram:', e);
        setActiveBoard(SAMPLE_PUZZLES[0]);
      } finally {
        setLoading(false);
      }
    }
    loadRemoteNonogram();
  }, [dateKey]);

  const engine = useNonogramEngine(activeBoard, {
    autoCrossCompletedLines: true,
    enableHistory: true,
    onSolve: async () => {
      timer.pauseTimer();
      setShowVictoryModal(true);
      try {
        await puzzleRepository.savePuzzleProgress(
          'nonogram',
          100,
          'completed',
          timer.elapsedSeconds,
          engine.grid,
          dateKey
        );
      } catch (e) {
        // fallback
      }
    },
  });

  // Helper to generate full solved grid matrix with both FILLED and CROSS cells visible
  const createSolvedGrid = (solution: boolean[][]): Grid => {
    return solution.map((row) =>
      row.map((cell) => (cell ? CellState.FILLED : CellState.CROSS))
    );
  };

  // Restore saved progress & timer on mount
  useEffect(() => {
    async function restoreProgress() {
      if (!activeBoard) return;
      try {
        const dailyData = await puzzleRepository.getDailyProgress(dateKey);
        const nonogramSaved = dailyData?.puzzles?.nonogram;
        if (nonogramSaved) {
          const isCompleted = nonogramSaved.status === 'completed' || nonogramSaved.completionPercent === 100;
          
          if (isCompleted) {
            const fullSolutionGrid = createSolvedGrid(activeBoard.solution);
            engine.setGridState(fullSolutionGrid, true);
            timer.pauseTimer();
          } else if (
            nonogramSaved.savedGridState &&
            Array.isArray(nonogramSaved.savedGridState) &&
            nonogramSaved.savedGridState.length === activeBoard.height &&
            nonogramSaved.savedGridState[0]?.length === activeBoard.width
          ) {
            engine.setGridState(nonogramSaved.savedGridState);
          }

          if (typeof nonogramSaved.elapsedSeconds === 'number' && nonogramSaved.elapsedSeconds > 0) {
            timer.setElapsedSeconds(nonogramSaved.elapsedSeconds);
          }
        }
      } catch (e) {
        console.warn('Failed restoring Nonogram progress', e);
      } finally {
        hasRestoredRef.current = true;
      }
    }
    if (!loading) {
      restoreProgress();
    }
  }, [activeBoard, dateKey, loading]);

  // Save progress periodically on grid or timer change (only after initial restore & if not completed)
  const engineGridRef = useRef(engine.grid);
  engineGridRef.current = engine.grid;

  const timerRef = useRef(timer.elapsedSeconds);
  timerRef.current = timer.elapsedSeconds;

  useEffect(() => {
    if (hasRestoredRef.current && !engine.isCompleted) {
      puzzleRepository.savePuzzleProgress(
        'nonogram',
        50,
        'in_progress',
        timerRef.current,
        engineGridRef.current,
        dateKey
      ).catch(() => {});
    }
  }, [engine.grid, timer.elapsedSeconds, dateKey]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.colors.bgPrimary }]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Caption style={{ marginTop: 12 }}>טוען חידה...</Caption>
      </SafeAreaView>
    );
  }

  return (
    <GameScreenLayout
      title="שחור ופתור"
      category="nonogram"
      onBackToHub={onBackToHub}
      elapsedSeconds={timer.elapsedSeconds}
      formattedTime={timer.formattedTime}
      showVictoryModal={showVictoryModal}
      onCloseVictoryModal={() => setShowVictoryModal(false)}
      puzzleTitle={engine.board.title}
      gridPreview={engine.board.solution}
      bottomControls={
        <NonogramControls
          inputMode={engine.inputMode}
          canUndo={engine.canUndo}
          canRedo={engine.canRedo}
          isCompleted={engine.isCompleted}
          onSetInputMode={engine.setInputMode}
          onToggleInputMode={engine.toggleInputMode}
          onUndo={engine.undo}
          onRedo={engine.redo}
          onReset={engine.reset}
        />
      }
    >
      <NonogramGrid
        grid={engine.grid}
        rowClues={engine.board.rowClues}
        colClues={engine.board.colClues}
        completedRows={engine.completedRows}
        completedCols={engine.completedCols}
        onCellTap={engine.handleCellTap}
        onDragStart={engine.handleDragStart}
        onDragMove={engine.handleDragMove}
        onDragEnd={engine.handleDragEnd}
        isReadOnly={engine.isCompleted}
      />
    </GameScreenLayout>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
