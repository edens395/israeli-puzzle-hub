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
import { useCrosswordEngine } from '../hooks/useCrosswordEngine';
import { SAMPLE_CROSSWORD_PUZZLES } from '../logic/crosswordUtils';
import { ClueBar } from './ClueBar';
import { CrosswordGrid } from './CrosswordGrid';
import { HebrewKeyboard } from './HebrewKeyboard';

export interface CrosswordScreenProps {
  onBackToHub?: () => void;
}

export const CrosswordScreen: React.FC<CrosswordScreenProps> = ({ onBackToHub }) => {
  const { theme, isDark } = useTheme();
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [streakDays, setStreakDays] = useState<number>(5);

  const timer = usePuzzleTimer(true);
  const initialPuzzle = SAMPLE_CROSSWORD_PUZZLES[0];

  const engine = useCrosswordEngine(initialPuzzle, {
    autoAdvanceOnType: true,
    onSolve: async () => {
      timer.pauseTimer();
      setShowVictoryModal(true);
      try {
        await puzzleRepository.savePuzzleProgress('tashbetz', 100, 'completed', timer.elapsedSeconds);
        const userStats = await puzzleRepository.getUserStats();
        setStreakDays(userStats.currentStreak);
      } catch (e) {
        // fallback
      }
    },
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bgPrimary }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.bgPrimary} />
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        
        {/* App Title Header & Timer */}
        <View style={styles.headerContainer}>
          <Caption color={theme.colors.accent} style={styles.appTitle}>המוסף • מיני-תשחץ יומי</Caption>
          <Title variant="serif">{engine.puzzle.title}</Title>
          <View style={[styles.timerBadge, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.border }]}>
            <Text style={[styles.timerBadgeText, { color: theme.colors.textPrimary }]}>⏱️ {timer.formattedTime}</Text>
          </View>
        </View>

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
            style={[styles.actionButtonReset, { backgroundColor: theme.colors.errorBg, borderColor: theme.colors.errorText }]}
            onPress={engine.reset}
          >
            <Text style={[styles.actionButtonTextReset, { color: theme.colors.errorText }]}>↺ איפוס</Text>
          </Pressable>
        </View>

        {/* Custom Compact Hebrew Virtual Keyboard */}
        <HebrewKeyboard
          onKeyPress={engine.typeLetter}
          onBackspace={engine.backspace}
        />

      </ScrollView>

      {/* Celebratory Victory Modal */}
      <VictoryModal
        visible={showVictoryModal}
        category="tashbetz"
        puzzleTitle={engine.puzzle.title}
        elapsedSeconds={timer.elapsedSeconds}
        streakDays={streakDays}
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
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
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
  actionButtonReset: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionButtonTextReset: {
    fontSize: 13,
    fontWeight: '600',
  },
});
