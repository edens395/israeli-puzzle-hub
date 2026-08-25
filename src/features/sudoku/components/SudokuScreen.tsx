import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { VictoryModal } from '../../../components/common/VictoryModal';
import { Caption, Title } from '../../../components/ui/Typography';
import { useTheme } from '../../../context/ThemeContext';
import { usePuzzleTimer } from '../../../hooks/usePuzzleTimer';
import { puzzleRepository } from '../../../storage/puzzleRepository';
import { useSudokuEngine } from '../hooks/useSudokuEngine';
import { SAMPLE_SUDOKU_PUZZLES } from '../logic/sudokuUtils';
import { BoardDifficulty } from '../types/sudoku';
import { SudokuGrid } from './SudokuGrid';
import { SudokuKeypad } from './SudokuKeypad';

export interface SudokuScreenProps {
  onBackToHub?: () => void;
}

export const SudokuScreen: React.FC<SudokuScreenProps> = ({ onBackToHub }) => {
  const { theme, isDark } = useTheme();
  const [selectedDifficulty, setSelectedDifficulty] = useState<BoardDifficulty>('medium');
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [streakDays, setStreakDays] = useState<number>(5);

  const timer = usePuzzleTimer(true);

  const currentBoard =
    (SAMPLE_SUDOKU_PUZZLES as Record<string, any>)[selectedDifficulty] ||
    SAMPLE_SUDOKU_PUZZLES.medium;

  const engine = useSudokuEngine(currentBoard, {
    autoRemoveNotesOnInsert: true,
    onSolve: async () => {
      timer.pauseTimer();
      setShowVictoryModal(true);
      try {
        await puzzleRepository.savePuzzleProgress('sudoku', 100, 'completed', timer.elapsedSeconds);
        const userStats = await puzzleRepository.getUserStats();
        setStreakDays(userStats.currentStreak);
      } catch (e) {
        // fallback
      }
    },
  });

  const handleSelectDifficulty = (diff: BoardDifficulty) => {
    setSelectedDifficulty(diff);
    setShowVictoryModal(false);
    timer.resetTimer();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bgPrimary }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.bgPrimary} />
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        
        {/* App Title Header & Timer */}
        <View style={styles.headerContainer}>
          <Caption color={theme.colors.accent} style={styles.appTitle}>המוסף • סודוקו יומי</Caption>
          <Title variant="serif">{engine.board.title}</Title>
          <View style={[styles.timerBadge, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.border }]}>
            <Text style={[styles.timerBadgeText, { color: theme.colors.textPrimary }]}>⏱️ {timer.formattedTime}</Text>
          </View>
        </View>

        {/* Difficulty Chips */}
        <View style={styles.selectorRow}>
          {(['easy', 'medium', 'hard'] as BoardDifficulty[]).map((diff) => {
            const labels: Record<BoardDifficulty, string> = {
              easy: 'קל',
              medium: 'בינוני',
              hard: 'קשה',
              expert: 'מומחה',
            };
            const isSelected = diff === selectedDifficulty;

            return (
              <Pressable
                key={`diff-${diff}`}
                style={[
                  styles.chip,
                  { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border },
                  isSelected && { backgroundColor: theme.colors.bgHighlight, borderColor: theme.colors.borderStrong },
                ]}
                onPress={() => handleSelectDifficulty(diff)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: theme.colors.textSecondary },
                    isSelected && { color: '#1A1A1C', fontWeight: '800' },
                  ]}
                >
                  {labels[diff]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Sudoku 9x9 Grid Container */}
        <SudokuGrid
          grid={engine.grid}
          selectedCell={engine.selectedCell}
          onSelectCell={engine.selectCell}
        />

        {/* Keypad & Control Toolbar */}
        <SudokuKeypad
          inputMode={engine.inputMode}
          canUndo={engine.canUndo}
          numberCounts={engine.numberCounts}
          onInsertNumber={engine.insertNumber}
          onErase={engine.erase}
          onToggleInputMode={engine.toggleInputMode}
          onUndo={engine.undo}
          onHint={engine.getHint}
        />

      </ScrollView>

      {/* Celebratory Victory Modal */}
      <VictoryModal
        visible={showVictoryModal}
        category="sudoku"
        puzzleTitle={engine.board.title}
        elapsedSeconds={timer.elapsedSeconds}
        streakDays={streakDays}
        difficulty={selectedDifficulty}
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
  headerContainer: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  appTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  timerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
  },
  timerBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  selectorRow: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
