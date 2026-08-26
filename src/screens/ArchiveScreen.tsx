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
import { EditorialCard } from '../components/ui/EditorialCard';
import { Caption, Title } from '../components/ui/Typography';
import { useTheme } from '../context/ThemeContext';
import { dailyPuzzleService } from '../services/dailyPuzzleService';
import { DailyEditionData, getHebrewFormattedDate, getTodayDateString, PuzzleCategory, puzzleRepository } from '../storage/puzzleRepository';

export interface ArchiveScreenProps {
  onBackToHub: () => void;
  onOpenGame: (category: PuzzleCategory, date?: Date | string) => void;
  initialCategory?: PuzzleCategory | 'all';
}

type StatusFilter = 'ALL' | 'COMPLETED' | 'TO_PLAY';

interface ArchiveItem {
  id: string;
  numStr: string;
  puzzleTitle: string;
  dateStr: string;
  category: PuzzleCategory;
  categoryName: string;
  isCompleted: boolean;
  elapsedSeconds: number;
  scoreText: string;
  dateObj: Date | string;
}

export const ArchiveScreen: React.FC<ArchiveScreenProps> = ({
  onBackToHub,
  onOpenGame,
  initialCategory = 'nonogram',
}) => {
  const { theme, isDark } = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [archiveItems, setArchiveItems] = useState<ArchiveItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const categoryNames: Record<string, string> = {
    nonogram: 'שחור ופתור',
    sudoku: 'סודוקו',
    tashbetz: 'מיני-תשחץ',
  };
  const targetCategory: PuzzleCategory = initialCategory === 'all' ? 'nonogram' : initialCategory;
  const currentCategoryName = categoryNames[targetCategory] || 'שחור ופתור';

  useEffect(() => {
    loadArchiveData();
  }, [initialCategory]);

  const formatSeconds = (sec: number) => {
    if (sec <= 0) return '--:--';
    const mins = Math.floor(sec / 60);
    const remainderSecs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainderSecs).padStart(2, '0')}`;
  };

  const loadArchiveData = async () => {
    try {
      setLoading(true);
      const todayStr = getTodayDateString(new Date());
      const remotePuzzles = await dailyPuzzleService.getPastDailyPuzzles(targetCategory);

      const puzzlesList = remotePuzzles.length > 0 ? remotePuzzles : [
        { id: `nonogram_${todayStr}`, date_string: todayStr, category: targetCategory, title: 'מגן דוד ✡️' },
        { id: `nonogram_2026-08-25`, date_string: '2026-08-25', category: targetCategory, title: 'לב ❤️' },
      ];

      const items: ArchiveItem[] = [];
      for (let i = 0; i < puzzlesList.length; i++) {
        const p = puzzlesList[i];
        const dailyData = await puzzleRepository.getDailyProgress(p.date_string);
        const catProgress = dailyData?.puzzles?.[p.category as PuzzleCategory];
        const isDone = catProgress?.status === 'completed' || catProgress?.completionPercent === 100;
        const elapsed = catProgress?.elapsedSeconds || 0;

        items.push({
          id: p.id || `${p.category}_${p.date_string}`,
          numStr: String(puzzlesList.length - i).padStart(3, '0'),
          puzzleTitle: p.title || 'חידה',
          dateStr: getHebrewFormattedDate(p.date_string),
          category: p.category as PuzzleCategory,
          categoryName: categoryNames[p.category] || 'שחור ופתור',
          isCompleted: isDone,
          elapsedSeconds: elapsed,
          scoreText: isDone && elapsed > 0 ? formatSeconds(elapsed) : '--:--',
          dateObj: p.date_string,
        });
      }

      setArchiveItems(items);
    } catch (e) {
      console.error('Failed loading archive data', e);
    } finally {
      setLoading(false);
    }
  };

  // Filter items
  const filteredItems = archiveItems.filter((item) => {
    if (statusFilter === 'COMPLETED' && !item.isCompleted) return false;
    if (statusFilter === 'TO_PLAY' && item.isCompleted) return false;
    return true;
  });

  const totalPlayed = archiveItems.filter((i) => i.isCompleted).length;
  const totalCount = archiveItems.length;

  // Calculate user's average solve time across all played games
  const completedItems = archiveItems.filter((i) => i.isCompleted && i.elapsedSeconds > 0);
  const avgSeconds = completedItems.length > 0
    ? Math.round(completedItems.reduce((acc, curr) => acc + curr.elapsedSeconds, 0) / completedItems.length)
    : 0;
  const avgTimeDisplay = avgSeconds > 0 ? formatSeconds(avgSeconds) : '--:--';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bgPrimary }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.bgPrimary} />
      
      {/* Clean Top Navigation Header */}
      <View style={[styles.headerContainer, { backgroundColor: theme.colors.bgPrimary }]}>
        <Pressable
          style={[styles.backArrowButton, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}
          onPress={onBackToHub}
        >
          <Text style={[styles.backArrowText, { color: theme.colors.textPrimary }]}>◀</Text>
        </Pressable>

        <View style={styles.headerRightCol}>
          <Title variant="serif" style={styles.headerTitle}>ארכיון - {currentCategoryName}</Title>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={true}>
        
        {/* Summary Stat Cards */}
        <View style={styles.statCardsRow}>
          <EditorialCard style={styles.statCard}>
            <Caption color={theme.colors.textMuted} style={styles.statLabel}>חידות שנפתרו</Caption>
            <Title variant="serif" style={styles.statValue}>{totalPlayed} / {totalCount}</Title>
          </EditorialCard>

          <EditorialCard style={styles.statCard}>
            <Caption color={theme.colors.textMuted} style={styles.statLabel}>זמן ממוצע</Caption>
            <Title variant="serif" style={styles.statValue}>{avgTimeDisplay}</Title>
          </EditorialCard>
        </View>

        {/* Status Filter Chips (ALL, COMPLETED, TO PLAY) */}
        <View style={styles.statusChipsRow}>
          <Pressable
            style={[
              styles.statusChip,
              statusFilter === 'ALL' && [styles.statusChipActive, { backgroundColor: isDark ? '#F8FAFC' : '#1E293B' }],
            ]}
            onPress={() => setStatusFilter('ALL')}
          >
            <Text
              style={[
                styles.statusChipText,
                { color: statusFilter === 'ALL' ? (isDark ? '#0F172A' : '#FFFFFF') : theme.colors.textSecondary },
              ]}
            >
              הכל
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.statusChip,
              statusFilter === 'COMPLETED' && [styles.statusChipActive, { backgroundColor: isDark ? '#F8FAFC' : '#1E293B' }],
            ]}
            onPress={() => setStatusFilter('COMPLETED')}
          >
            <Text
              style={[
                styles.statusChipText,
                { color: statusFilter === 'COMPLETED' ? (isDark ? '#0F172A' : '#FFFFFF') : theme.colors.textSecondary },
              ]}
            >
              הושלמו
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.statusChip,
              statusFilter === 'TO_PLAY' && [styles.statusChipActive, { backgroundColor: isDark ? '#F8FAFC' : '#1E293B' }],
            ]}
            onPress={() => setStatusFilter('TO_PLAY')}
          >
            <Text
              style={[
                styles.statusChipText,
                { color: statusFilter === 'TO_PLAY' ? (isDark ? '#0F172A' : '#FFFFFF') : theme.colors.textSecondary },
              ]}
            >
              למשחק
            </Text>
          </Pressable>
        </View>

        {/* Table Header Row */}
        <View style={[styles.tableHeaderRow, { borderBottomColor: theme.colors.border }]}>
          <Caption style={[styles.colNo, { color: theme.colors.textMuted }]}>מס׳</Caption>
          <Caption style={[styles.colDate, { color: theme.colors.textMuted }]}>חידה • תאריך</Caption>
          <Caption style={[styles.colScore, { color: theme.colors.textMuted }]}>זמן</Caption>
          <Caption style={[styles.colStatus, { color: theme.colors.textMuted }]}>סטטוס</Caption>
        </View>

        {/* Loading Indicator or Archive Table */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.accent} />
          </View>
        ) : (
          <View style={[styles.tableContainer, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}>
            {filteredItems.map((item, idx) => (
              <Pressable
                key={item.id}
                style={[
                  styles.tableRow,
                  { borderBottomColor: theme.colors.border },
                  idx === filteredItems.length - 1 && { borderBottomWidth: 0 },
                ]}
                onPress={() => onOpenGame(item.category, item.dateObj)}
              >
                <Caption style={[styles.colNo, { color: theme.colors.textMuted }]}>{item.numStr}</Caption>
                
                <View style={styles.colDateCol}>
                  <Text style={[styles.dateText, { color: theme.colors.textPrimary }]}>
                    {item.categoryName} ({item.puzzleTitle})
                  </Text>
                  <Caption color={theme.colors.textSecondary}>{item.dateStr}</Caption>
                </View>

                <Text style={[styles.colScoreText, { color: item.isCompleted ? theme.colors.textPrimary : theme.colors.textMuted }]}>
                  {item.scoreText}
                </Text>

                <View style={styles.colStatusCol}>
                  <Pressable
                    style={[
                      styles.statusPillBtn,
                      item.isCompleted
                        ? { backgroundColor: theme.colors.successBg }
                        : { backgroundColor: isDark ? '#F8FAFC' : '#1E293B' },
                    ]}
                    onPress={() => onOpenGame(item.category, item.dateObj)}
                  >
                    <Text
                      style={[
                        styles.statusPillBtnText,
                        { color: item.isCompleted ? theme.colors.successText : (isDark ? '#0F172A' : '#FFFFFF') },
                      ]}
                    >
                      {item.isCompleted ? 'הושלם ✓' : 'שחק'}
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        )}

      </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 16,
  },
  headerContainer: {
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'right',
  },
  statCardsRow: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'right',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'right',
  },
  statusChipsRow: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  statusChipActive: {
    borderRadius: 20,
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tableHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  colNo: {
    width: 40,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '800',
  },
  colDate: {
    flex: 1,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '800',
  },
  colScore: {
    width: 65,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
  },
  colStatus: {
    width: 85,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  tableContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  colDateCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
  },
  colScoreText: {
    width: 65,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
  },
  colStatusCol: {
    width: 85,
    alignItems: 'center',
  },
  statusPillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  statusPillBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
