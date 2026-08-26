import React, { useEffect, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { usePuzzleTimer } from '../../hooks/usePuzzleTimer';
import { getHebrewFormattedDate, PuzzleCategory, puzzleRepository } from '../../storage/puzzleRepository';
import { VictoryModal } from '../common/VictoryModal';

export interface GameScreenLayoutProps {
  /** Title of the active game (e.g., "שחור ופתור", "סודוקו", "מיני-תשחץ") */
  title: string;
  /** Category identifier */
  category: PuzzleCategory;
  /** Callback to return back to home hub */
  onBackToHub: () => void;
  /** Elapsed seconds from puzzle timer */
  elapsedSeconds: number;
  /** Formatted timer string (e.g. 02:45) */
  formattedTime: string;
  /** Primary game grid / interactive board component */
  children: React.ReactNode;
  /** Custom bottom control bar component */
  bottomControls?: React.ReactNode;
  /** Whether victory modal is currently visible */
  showVictoryModal?: boolean;
  /** Optional victory modal close handler */
  onCloseVictoryModal?: () => void;
  /** Revealed puzzle title / drawing name for victory modal */
  puzzleTitle?: string;
  /** 2D grid solution preview for victory modal */
  gridPreview?: boolean[][];
}

export const GameScreenLayout: React.FC<GameScreenLayoutProps> = ({
  title,
  category,
  onBackToHub,
  elapsedSeconds,
  formattedTime,
  children,
  bottomControls,
  showVictoryModal = false,
  onCloseVictoryModal,
  puzzleTitle = '',
  gridPreview,
}) => {
  const { theme, isDark } = useTheme();
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    async function loadDate() {
      try {
        const dailyData = await puzzleRepository.getDailyProgress();
        if (dailyData?.dateFormattedHebrew) {
          setFormattedDate(dailyData.dateFormattedHebrew);
        } else {
          setFormattedDate(getHebrewFormattedDate());
        }
      } catch (e) {
        setFormattedDate(getHebrewFormattedDate());
      }
    }
    loadDate();
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bgPrimary }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.bgPrimary} />
      
      {/* Generic Top Header: Left Back Arrow (◀) & Right Game Title + Date at same height */}
      <View style={[styles.topNavHeader, { backgroundColor: theme.colors.bgPrimary }]}>
        <Pressable
          style={[styles.backArrowButton, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}
          onPress={onBackToHub}
        >
          <Text style={[styles.backArrowText, { color: theme.colors.textPrimary }]}>◀</Text>
        </Pressable>

        <View style={styles.headerRightCol}>
          <Text style={[styles.headerTitleText, { color: theme.colors.textPrimary }]}>
            {title}
          </Text>
          {formattedDate !== '' && (
            <Text style={[styles.headerDateText, { color: theme.colors.textSecondary }]}>
              {formattedDate}
            </Text>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        {/* Timer Badge Centered Below Navigation Bar */}
        <View style={styles.timerRow}>
          <View style={[styles.timerBadge, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.border }]}>
            <Text style={[styles.timerBadgeText, { color: theme.colors.textPrimary }]}>⏱️ {formattedTime}</Text>
          </View>
        </View>

        {/* Interactive Game Board Slot */}
        <View style={styles.gameSlot}>
          {children}
        </View>

        {/* Bottom Control Toolbar Slot */}
        {bottomControls && (
          <View style={styles.controlsSlot}>
            {bottomControls}
          </View>
        )}
      </ScrollView>

      {/* Celebratory Victory Modal */}
      {showVictoryModal && (
        <VictoryModal
          visible={showVictoryModal}
          category={category}
          puzzleTitle={puzzleTitle || title}
          elapsedSeconds={elapsedSeconds}
          streakDays={0}
          gridPreview={gridPreview}
          onClose={() => onCloseVictoryModal?.()}
          onBackToHub={onBackToHub}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topNavHeader: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  backArrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrowText: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerRightCol: {
    alignItems: 'flex-end',
  },
  headerTitleText: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'right',
  },
  headerDateText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 1,
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
  gameSlot: {
    width: '100%',
    alignItems: 'center',
  },
  controlsSlot: {
    width: '100%',
    alignItems: 'center',
  },
});
