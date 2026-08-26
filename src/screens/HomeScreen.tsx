import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Caption, Heading } from '../components/ui/Typography';
import { useTheme } from '../context/ThemeContext';
import {
  DailyEditionData,
  PuzzleCategory,
  PuzzleProgress,
  puzzleRepository,
} from '../storage/puzzleRepository';

export interface HomeScreenProps {
  onOpenNonogram: () => void;
  onOpenSudoku?: () => void;
  onOpenTashbetz?: () => void;
  onOpenSettings?: () => void;
  onOpenArchive?: (category?: PuzzleCategory) => void;
  onOpenAdmin?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenNonogram,
  onOpenSudoku,
  onOpenTashbetz,
  onOpenSettings,
  onOpenArchive,
  onOpenAdmin,
}) => {
  const { theme, isDark } = useTheme();
  const [dailyData, setDailyData] = useState<DailyEditionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadHomeScreenData();
  }, []);

  const loadHomeScreenData = async () => {
    try {
      setLoading(true);
      const data = await puzzleRepository.getDailyProgress();
      setDailyData(data);
    } catch (e) {
      console.error('Failed loading daily hub data', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dailyData) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.colors.bgPrimary }]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Caption style={{ marginTop: 12 }}>טוען...</Caption>
      </SafeAreaView>
    );
  }

  const nonogramProgress = dailyData.puzzles.nonogram;
  const isNonogramCompleted =
    nonogramProgress.status === 'completed' || nonogramProgress.completionPercent === 100;

  const handleLaunchGame = (category: PuzzleCategory) => {
    if (category === 'nonogram') {
      onOpenNonogram();
    } else if (category === 'tashbetz' && onOpenTashbetz) {
      onOpenTashbetz();
    } else if (category === 'sudoku' && onOpenSudoku) {
      onOpenSudoku();
    } else {
      onOpenNonogram();
    }
  };

  const getPrimaryButtonText = (progress: PuzzleProgress) => {
    if (progress.status === 'completed' || progress.completionPercent === 100) {
      return 'צפה בפתרון';
    }
    return 'שחק';
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bgPrimary }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.bgPrimary} />
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={true}>
        
        {/* Clean Top Header Section (Title "המוסף" aligned to the RIGHT side) */}
        <View style={styles.headerContainer}>
          {/* Settings & Admin Icons on the LEFT */}
          <View style={styles.headerIconsRow}>
            {onOpenAdmin && (
              <Pressable
                style={[styles.iconCircle, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}
                onPress={onOpenAdmin}
              >
                <Text style={{ fontSize: 16 }}>🛡️</Text>
              </Pressable>
            )}
            {onOpenSettings && (
              <Pressable
                style={[styles.iconCircle, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}
                onPress={onOpenSettings}
              >
                <Text style={{ fontSize: 16 }}>⚙️</Text>
              </Pressable>
            )}
          </View>

          {/* Title & Date Column aligned to the RIGHT */}
          <View style={styles.headerTextCol}>
            <Heading variant="serif" style={styles.headerTitle}>המוסף</Heading>
            <Caption color={theme.colors.textSecondary} style={styles.dateSubtitle}>
              {dailyData.dateFormattedHebrew}
            </Caption>
          </View>
        </View>

        {/* =================================================== */}
        {/* GAME CARD: NONOGRAM                                 */}
        {/* =================================================== */}
        <View style={[styles.nytGameCard, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}>
          {/* Top Colored Block (Pastel Green) */}
          <View style={[styles.cardTopBlock, { backgroundColor: '#D8EAD0' }]}>
            <View style={styles.cardIconBox}>
              <Text style={{ fontSize: 32 }}>🔳</Text>
            </View>
            <Heading variant="serif" style={styles.cardTitleText}>שחור ופתור</Heading>
          </View>

          {/* Bottom Card Body */}
          <View style={styles.cardBottomBody}>
            {/* Pill Buttons Stack (Thin Border, No Background Fill) */}
            <View style={styles.pillButtonsStack}>
              {/* Primary Play / Solution Button */}
              <Pressable
                style={[
                  styles.pillButton,
                  { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border },
                  isNonogramCompleted && { backgroundColor: theme.colors.successBg, borderColor: theme.colors.successText },
                ]}
                onPress={() => handleLaunchGame('nonogram')}
              >
                <Text
                  style={[
                    styles.pillButtonText,
                    { color: isNonogramCompleted ? theme.colors.successText : theme.colors.textPrimary },
                  ]}
                >
                  {getPrimaryButtonText(nonogramProgress)}
                </Text>
              </Pressable>

              {/* Secondary Archive Button (Identical thin border & background) */}
              <Pressable
                style={[
                  styles.pillButton,
                  { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border },
                ]}
                onPress={() => onOpenArchive?.('nonogram')}
              >
                <Text style={[styles.pillButtonText, { color: theme.colors.textPrimary }]}>
                  ארכיון
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTextCol: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'right',
  },
  dateSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'right',
  },
  headerIconsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  nytGameCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardTopBlock: {
    width: '100%',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  cardIconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitleText: {
    fontSize: 22,
    fontWeight: '900',
  },
  cardBottomBody: {
    padding: 20,
  },
  pillButtonsStack: {
    gap: 10,
  },
  pillButton: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillButtonText: {
    fontSize: 16,
    fontWeight: '700',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
