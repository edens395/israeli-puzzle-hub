import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GameScreenLayout } from '../../../components/layout/GameScreenLayout';
import { useTheme } from '../../../context/ThemeContext';
import { usePuzzleTimer } from '../../../hooks/usePuzzleTimer';
import { puzzleRepository } from '../../../storage/puzzleRepository';
import { useCrosswordEngine } from '../hooks/useCrosswordEngine';
import { SAMPLE_CROSSWORD_PUZZLES } from '../logic/crosswordUtils';
import { ClueBar } from './ClueBar';
import { CrosswordGrid } from './CrosswordGrid';
import { HebrewKeyboard } from './HebrewKeyboard';

export interface CrosswordScreenProps {
  onBackToHub?: () => void;
}

export const CrosswordScreen: React.FC<CrosswordScreenProps> = ({ onBackToHub = () => {} }) => {
  const { theme } = useTheme();
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);

  const timer = usePuzzleTimer(true);
  const initialPuzzle = SAMPLE_CROSSWORD_PUZZLES[0];

  const engine = useCrosswordEngine(initialPuzzle, {
    autoAdvanceOnType: true,
    onSolve: async () => {
      timer.pauseTimer();
      setShowVictoryModal(true);
      try {
        await puzzleRepository.savePuzzleProgress('tashbetz', 100, 'completed', timer.elapsedSeconds);
      } catch (e) {
        // fallback
      }
    },
  });

  return (
    <GameScreenLayout
      title="מיני-תשחץ"
      category="tashbetz"
      onBackToHub={onBackToHub}
      elapsedSeconds={timer.elapsedSeconds}
      formattedTime={timer.formattedTime}
      showVictoryModal={showVictoryModal}
      onCloseVictoryModal={() => setShowVictoryModal(false)}
      puzzleTitle={engine.puzzle.title}
      bottomControls={
        <View style={styles.controlsStack}>
          {/* Quick Actions Row (Check, Reveal, Reset) */}
          <View style={styles.actionsRow}>
            <Pressable
              style={[styles.actionButtonPrimary, { backgroundColor: theme.colors.bgHighlight }]}
              onPress={engine.checkSolution}
            >
              <Text style={styles.actionButtonTextPrimary}>✓ בדוק פתרון</Text>
            </Pressable>

            <Pressable
              style={[styles.actionButtonSecondary, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}
              onPress={() => {
                if (engine.selectedCell) {
                  engine.revealCell(engine.selectedCell.row, engine.selectedCell.col);
                }
              }}
            >
              <Text style={[styles.actionButtonTextSecondary, { color: theme.colors.textPrimary }]}>💡 רמז</Text>
            </Pressable>

            <Pressable
              style={[styles.actionButtonSecondary, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}
              onPress={engine.reset}
            >
              <Text style={[styles.actionButtonTextSecondary, { color: theme.colors.textPrimary }]}>↺ איפוס</Text>
            </Pressable>
          </View>

          {/* Compact Hebrew Virtual Keyboard */}
          <HebrewKeyboard
            onKeyPress={engine.typeLetter}
            onBackspace={engine.backspace}
          />
        </View>
      }
    >
      {/* Clue Navigation Bar */}
      <ClueBar
        activeClue={engine.activeClue}
        selectedDirection={engine.selectedDirection}
        onNextClue={engine.selectNextClue}
        onPrevClue={engine.selectPrevClue}
        onToggleDirection={engine.toggleDirection}
      />

      {/* 5x5 Crossword Grid */}
      <CrosswordGrid
        grid={engine.grid}
        selectedCell={engine.selectedCell}
        activeClue={engine.activeClue}
        onSelectCell={engine.selectCell}
      />
    </GameScreenLayout>
  );
};

const styles = StyleSheet.create({
  controlsStack: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  actionsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 8,
  },
  actionButtonPrimary: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionButtonTextPrimary: {
    color: '#1A1A1C',
    fontSize: 13,
    fontWeight: '800',
  },
  actionButtonSecondary: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionButtonTextSecondary: {
    fontSize: 13,
    fontWeight: '600',
  },
});
