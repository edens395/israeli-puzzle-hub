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
import { BodyText, Caption, Heading, Title } from '../components/ui/Typography';
import { useTheme } from '../context/ThemeContext';
import { DailyEditionData, PuzzleCategory, puzzleRepository } from '../storage/puzzleRepository';

export interface ArchiveScreenProps {
  onBackToHub: () => void;
  onOpenGame: (category: PuzzleCategory, date?: Date) => void;
  initialCategory?: PuzzleCategory | 'all';
}

type StatusFilter = 'ALL' | 'COMPLETED' | 'TO_PLAY';

interface ArchiveItem {
  id: string;
  numStr: string;
  dateStr: string;
  dayOfWeek: string;
  category: PuzzleCategory;
  categoryName: string;
  isCompleted: boolean;
  elapsedSeconds: number;
  scoreText: string;
  dateObj: Date;
}

export const ArchiveScreen: React.FC<ArchiveScreenProps> = ({
  onBackToHub,
  onOpenGame,
  initialCategory = 'all',
}) => {
  const { theme, isDark } = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [editions, setEditions] = useState<DailyEditionData[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<PuzzleCategory | 'all'>(initialCategory);

  useEffect(() => {
    loadArchiveData();
  }, []);

  const loadArchiveData = async () => {
    try {
      setLoading(true);
      // Fetch 30 past daily editions
      const archives = await puzzleRepository.getArchiveEditions(30);
      setEditions(archives);
    } catch (e) {
      console.error('Failed loading archive data', e);
    } finally {
      setLoading(false);
    }
  };

  const formatSeconds = (sec: number) => {
    if (sec <= 0) return '--:--';
    const mins = Math.floor(sec / 60);
    const remainderSecs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainderSecs).padStart(2, '0')}`;
  };

  // Convert editions to archive table rows
  const allItems: ArchiveItem[] = [];
  editions.forEach((ed, idx) => {
    const numStr = String(30 - idx).padStart(3, '0');
    const dateObj = new Date(ed.dateString);
    const isToday = idx === 0;

    const formattedMonthDay = dateObj.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
    });
    const dayOfWeek = dateObj.toLocaleDateString('he-IL', { weekday: 'short' });
    const dateDisplay = isToday ? `${formattedMonthDay} • היום` : formattedMonthDay;

    const categories: { cat: PuzzleCategory; name: string }[] = [
      { cat: 'nonogram', name: 'שחור ופתור' },
      { cat: 'sudoku', name: 'סודוקו' },
      { cat: 'tashbetz', name: 'מיני-תשחץ' },
    ];

    categories.forEach(({ cat, name }) => {
      const pProgress = ed.puzzles[cat];
      const isDone = pProgress?.status === 'completed';
      const elapsed = pProgress?.elapsedSeconds || 0;

      allItems.push({
        id: `${numStr}_${cat}`,
        numStr,
        dateStr: dateDisplay,
        dayOfWeek,
        category: cat,
        categoryName: name,
        isCompleted: isDone,
        elapsedSeconds: elapsed,
        scoreText: isDone ? formatSeconds(elapsed) : '--:--',
        dateObj,
      });
    });
  });

  // Filter items
  const filteredItems = allItems.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) {
      return false;
    }
    if (statusFilter === 'COMPLETED' && !item.isCompleted) {
      return false;
    }
    if (statusFilter === 'TO_PLAY' && item.isCompleted) {
      return false;
    }
    return true;
  });

  const totalPlayed = allItems.filter((i) => i.isCompleted).length;
  const totalCount = allItems.length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bgPrimary }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.bgPrimary} />
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={true}>
        
        {/* Top Header Navigation */}
        <View style={[styles.headerContainer, { borderColor: theme.colors.border }]}>
          <Pressable
            style={[styles.backButton, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}
            onPress={onBackToHub}
          >
            <Text style={[styles.backButtonText, { color: theme.colors.accent }]}>◀ חזרה</Text>
          </Pressable>
          <Heading variant="serif" style={styles.headerTitle}>ארכיון</Heading>
        </View>

        {/* Subtitle */}
        <View style={styles.subtitleRow}>
          <BodyText color={theme.colors.textSecondary} style={styles.subtitleText}>
            כל החידות מהיום הראשון. שחק בכל אחת מהן.
          </BodyText>
        </View>

        {/* 3 Summary Stat Cards */}
        <View style={styles.statCardsRow}>
          <EditorialCard style={styles.statCard}>
            <Caption color={theme.colors.textMuted} style={styles.statLabel}>חידות שנפתרו</Caption>
            <Title variant="serif" style={styles.statValue}>{totalPlayed} / {totalCount}</Title>
          </EditorialCard>

          <EditorialCard style={styles.statCard}>
            <Caption color={theme.colors.textMuted} style={styles.statLabel}>זמן ממוצע</Caption>
            <Title variant="serif" style={styles.statValue}>01:45</Title>
          </EditorialCard>

          <EditorialCard style={styles.statCard}>
            <Caption color={theme.colors.textMuted} style={styles.statLabel}>היום הטוב ביותר</Caption>
            <Title variant="serif" style={styles.statValue}>00:42</Title>
          </EditorialCard>
        </View>

        {/* Category Selector Chips */}
        <View style={styles.categoryChipsRow}>
          {[
            { id: 'all', label: 'כל המשחקים' },
            { id: 'nonogram', label: 'שחור ופתור' },
            { id: 'sudoku', label: 'סודוקו' },
            { id: 'tashbetz', label: 'מיני-תשחץ' },
          ].map((catObj) => {
            const isSelected = categoryFilter === catObj.id;
            return (
              <Pressable
                key={`cat-filter-${catObj.id}`}
                style={[
                  styles.catChip,
                  { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border },
                  isSelected && { backgroundColor: theme.colors.bgHighlight, borderColor: theme.colors.borderStrong },
                ]}
                onPress={() => setCategoryFilter(catObj.id as any)}
              >
                <Text
                  style={[
                    styles.catChipText,
                    { color: theme.colors.textSecondary },
                    isSelected && { color: '#1A1A1C', fontWeight: '800' },
                  ]}
                >
                  {catObj.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Status Filter Chips (ALL, COMPLETED, TO PLAY) */}
        <View style={styles.statusChipsRow}>
          <Pressable
            style={[
              styles.statusChip,
              statusFilter === 'ALL' && [styles.statusChipActive, { backgroundColor: theme.colors.textPrimary }],
            ]}
            onPress={() => setStatusFilter('ALL')}
          >
            <Text style={[styles.statusChipText, statusFilter === 'ALL' && { color: theme.colors.bgCard }]}>
              הכל
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.statusChip,
              statusFilter === 'COMPLETED' && [styles.statusChipActive, { backgroundColor: theme.colors.textPrimary }],
            ]}
            onPress={() => setStatusFilter('COMPLETED')}
          >
            <Text style={[styles.statusChipText, statusFilter === 'COMPLETED' && { color: theme.colors.bgCard }]}>
              הושלמו
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.statusChip,
              statusFilter === 'TO_PLAY' && [styles.statusChipActive, { backgroundColor: theme.colors.textPrimary }],
            ]}
            onPress={() => setStatusFilter('TO_PLAY')}
          >
            <Text style={[styles.statusChipText, statusFilter === 'TO_PLAY' && { color: theme.colors.bgCard }]}>
              למשחק
            </Text>
          </Pressable>
        </View>

        {/* Table Header Row */}
        <View style={[styles.tableHeaderRow, { borderBottomColor: theme.colors.border }]}>
          <Caption style={[styles.colNo, { color: theme.colors.textMuted }]}>מס׳</Caption>
          <Caption style={[styles.colDate, { color: theme.colors.textMuted }]}>תאריך • משחק</Caption>
          <Caption style={[styles.colScore, { color: theme.colors.textMuted }]}>זמן</Caption>
          <Caption style={[styles.colStatus, { color: theme.colors.textMuted }]}>סטטוס</Caption>
        </View>

        {/* Loading Indicator */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.accent} />
          </View>
        ) : (
          /* Archive List Rows */
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
                  <Text style={[styles.dateText, { color: theme.colors.textPrimary }]}>{item.dateStr}</Text>
                  <Caption color={theme.colors.textSecondary}>{item.categoryName} • {item.dayOfWeek}</Caption>
                </View>

                <Text style={[styles.colScoreText, { color: item.isCompleted ? theme.colors.accentGold : theme.colors.textMuted }]}>
                  {item.scoreText}
                </Text>

                <View style={styles.colStatusCol}>
                  <Pressable
                    style={[
                      styles.statusPillBtn,
                      item.isCompleted
                        ? { backgroundColor: theme.colors.successBg }
                        : { backgroundColor: theme.colors.textPrimary },
                    ]}
                    onPress={() => onOpenGame(item.category, item.dateObj)}
                  >
                    <Text
                      style={[
                        styles.statusPillBtnText,
                        { color: item.isCompleted ? theme.colors.successText : theme.colors.bgCard },
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
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  subtitleRow: {
    marginTop: -4,
  },
  subtitleText: {
    fontSize: 14,
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
  categoryChipsRow: {
    flexDirection: 'row-reverse',
    gap: 6,
    flexWrap: 'wrap',
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
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
    width: 60,
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
    width: 60,
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
