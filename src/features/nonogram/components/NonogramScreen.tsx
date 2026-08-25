import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { VictoryModal } from '../../../components/common/VictoryModal';
import { useTheme } from '../../../context/ThemeContext';
import { usePuzzleTimer } from '../../../hooks/usePuzzleTimer';
import { puzzleRepository } from '../../../storage/puzzleRepository';
import { SAMPLE_PUZZLES } from '../data/samplePuzzles';
import { useNonogramEngine } from '../hooks/useNonogramEngine';
import { CellState, Grid } from '../types/nonogram';
import { NonogramControls } from './NonogramControls';
import { NonogramGrid } from './NonogramGrid';

export interface NonogramScreenProps {
  onBackToHub?: () => void;
}

export const NonogramScreen: React.FC<NonogramScreenProps> = ({ onBackToHub }) => {
  const { theme, isDark } = useTheme();
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [streakDays, setStreakDays] = useState<number>(5);

  const timer = usePuzzleTimer(true);
  const initialBoard = SAMPLE_PUZZLES[0];

  const engine = useNonogramEngine(initialBoard, {
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
          engine.grid
        );
        const userStats = await puzzleRepository.getUserStats();
        setStreakDays(userStats.currentStreak);
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
      try {
        const dailyData = await puzzleRepository.getDailyProgress();
        const nonogramSaved = dailyData?.puzzles?.nonogram;
        if (nonogramSaved) {
          const isCompleted = nonogramSaved.status === 'completed' || nonogramSaved.completionPercent === 100;
          
          if (isCompleted) {
            // When watching a completed solution, display full solved drawing with X cells visible & pause timer
            if (nonogramSaved.savedGridState && Array.isArray(nonogramSaved.savedGridState)) {
              const completeSavedGrid = nonogramSaved.savedGridState.map((r: CellState[]) =>
                r.map((c: CellState) => (c === CellState.EMPTY ? CellState.CROSS : c))
              );
              engine.setGridState(completeSavedGrid);
            } else {
              const fullSolutionGrid = createSolvedGrid(initialBoard.solution);
              engine.setGridState(fullSolutionGrid);
            }
            timer.pauseTimer();
          } else if (nonogramSaved.savedGridState && Array.isArray(nonogramSaved.savedGridState)) {
            engine.setGridState(nonogramSaved.savedGridState);
          }

          if (typeof nonogramSaved.elapsedSeconds === 'number' && nonogramSaved.elapsedSeconds > 0) {
            timer.setElapsedSeconds(nonogramSaved.elapsedSeconds);
          }
        }
      } catch (e) {
        console.warn('Failed restoring Nonogram progress', e);
      }
    }
    restoreProgress();
  }, []);

  // Save progress periodically on grid or timer change (only if not already completed)
  const engineGridRef = useRef(engine.grid);
  engineGridRef.current = engine.grid;

  const timerRef = useRef(timer.elapsedSeconds);
  timerRef.current = timer.elapsedSeconds;

  useEffect(() => {
    if (!engine.isCompleted) {
      puzzleRepository.savePuzzleProgress(
        'nonogram',
        50,
        'in_progress',
        timerRef.current,
        engineGridRef.current
      ).catch(() => {});
    }
  }, [engine.grid, timer.elapsedSeconds]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bgPrimary }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.bgPrimary} />
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        
        {/* Timer Bar (Centered below top navigation header) */}
        <View style={styles.timerRow}>
          <View style={[styles.timerBadge, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.border }]}>
            <Text style={[styles.timerBadgeText, { color: theme.colors.textPrimary }]}>⏱️ {timer.formattedTime}</Text>
          </View>
        </View>

        {/* Nonogram Grid Container (Row clues on the LEFT side) */}
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
        />

        {/* Control Toolbar */}
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

      </ScrollView>

      {/* Celebratory Victory Modal revealing the drawing */}
      <VictoryModal
        visible={showVictoryModal}
        category="nonogram"
        puzzleTitle={engine.board.title}
        elapsedSeconds={timer.elapsedSeconds}
        streakDays={streakDays}
        gridPreview={engine.board.solution}
        onClose={() => setShowVictoryModal(false)}
        onBackToHub={() => {
          setShowVictoryModal(false);
          onBackToHub?.();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
  timerRow: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  timerBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  timerBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
