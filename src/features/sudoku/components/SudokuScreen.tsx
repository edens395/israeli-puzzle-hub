import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GameScreenLayout } from '../../../components/layout/GameScreenLayout';
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

export const SudokuScreen: React.FC<SudokuScreenProps> = ({ onBackToHub = () => {} }) => {
  const { theme } = useTheme();
  const [selectedDifficulty, setSelectedDifficulty] = useState<BoardDifficulty>('medium');
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);

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
    <GameScreenLayout
      title="סודוקו"
      category="sudoku"
      onBackToHub={onBackToHub}
      elapsedSeconds={timer.elapsedSeconds}
      formattedTime={timer.formattedTime}
      showVictoryModal={showVictoryModal}
      onCloseVictoryModal={() => setShowVictoryModal(false)}
      puzzleTitle={engine.board.title}
      bottomControls={
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
      }
    >
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

      {/* Sudoku 9x9 Grid */}
      <SudokuGrid
        grid={engine.grid}
        selectedCell={engine.selectedCell}
        onSelectCell={engine.selectCell}
      />
    </GameScreenLayout>
  );
};

const styles = StyleSheet.create({
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
