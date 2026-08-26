import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Caption, Heading, Title } from '../components/ui/Typography';
import { useTheme } from '../context/ThemeContext';
import { dailyPuzzleService } from '../services/dailyPuzzleService';
import { GenerationLogItem, UpcomingPuzzleItem, generatorEngine } from '../services/generatorEngine';

import { adminApiService } from '../services/adminApiService';

export interface AdminDashboardScreenProps {
  onBack?: () => void;
}

export type AdminViewTab = 'PUZZLES' | 'LOGS';

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onBack }) => {
  const { theme, isDark } = useTheme();
  const [logs, setLogs] = useState<GenerationLogItem[]>([]);
  const [puzzles, setPuzzles] = useState<UpcomingPuzzleItem[]>([]);
  const [nextMissingDate, setNextMissingDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<AdminViewTab>('PUZZLES');
  const [selectedPuzzle, setSelectedPuzzle] = useState<UpcomingPuzzleItem | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await dailyPuzzleService.repairAllPuzzleGaps();
      const [fetchedLogs, fetchedPuzzles, missingDate] = await Promise.all([
        generatorEngine.fetchGenerationLogs(30),
        generatorEngine.fetchUpcomingPuzzles(30),
        generatorEngine.getNextMissingDate(),
      ]);
      setLogs(fetchedLogs);
      setPuzzles(fetchedPuzzles);
      setNextMissingDate(missingDate);
    } catch (e) {
      console.error('Failed loading admin dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNextMissing = async () => {
    try {
      setGenerating(true);
      // Call the backend Edge Function to handle next-date determination and generation securely
      const result = await adminApiService.generateNextNonogram();
      
      if (result.success && result.nonogram) {
        alert(`נוצרה חידה חדשה (${result.nonogram.width}x${result.nonogram.height}) לתאריך ${result.date}:\n"${result.nonogram.title}"`);
      } else {
        alert(`שגיאה ביצירת החידה: ${result.error}`);
      }
      
      await loadDashboardData();
    } catch (e: any) {
      alert(`שגיאה ביצירת החידה: ${e?.message || e}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeletePuzzle = async (dateString: string, title: string) => {
    if (dateString <= todayStr) {
      alert('לא ניתן למחוק חידה שכבר פורסמה!');
      return;
    }

    const confirmDelete = window.confirm ? window.confirm(`האם למחוק את החידה "${title}" לתאריך ${dateString}?`) : true;
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const deleted = await dailyPuzzleService.deleteDailyPuzzle(dateString);
      if (deleted) {
        if (selectedPuzzle?.date_string === dateString) {
          setSelectedPuzzle(null);
        }
        await loadDashboardData();
      } else {
        alert('שגיאה במחיקת החידה');
      }
    } catch (e) {
      alert('שגיאה במחיקת החידה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bgPrimary }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.bgPrimary} />

      {/* Screen Header (Exact match to ArchiveScreen) */}
      <View style={[styles.headerContainer, { borderBottomColor: theme.colors.border }]}>
        {onBack ? (
          <Pressable
            style={[styles.backButton, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}
            onPress={onBack}
          >
            <Text style={[styles.backButtonText, { color: theme.colors.textPrimary }]}>◀ חזרה</Text>
          </Pressable>
        ) : <View />}

        <View style={styles.headerTextCol}>
          <Heading variant="serif" style={styles.headerTitle}>לוח בקרת מנהל</Heading>
          <Caption color={theme.colors.textSecondary} style={styles.dateSubtitle}>
            מחולל תשבצים ושחור ופתור אוטומטי
          </Caption>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={true}>
        
        {/* Editorial Stats Cards Row (Matching Archive Screen) */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}>
            <Caption color={theme.colors.textMuted}>חידות במלאי</Caption>
            <Title style={[styles.statValue, { color: theme.colors.textPrimary }]}>{puzzles.length}</Title>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}>
            <Caption color={theme.colors.textMuted}>סטטוס שרת</Caption>
            <Title style={[styles.statValue, { color: '#16A34A', fontSize: 18 }]}>🟢 פועל</Title>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}>
            <Caption color={theme.colors.textMuted}>היום הריק הבא</Caption>
            <Title style={[styles.statValue, { color: theme.colors.textPrimary, fontSize: 15 }]}>{nextMissingDate || '---'}</Title>
          </View>
        </View>

        {/* Generate Next Missing Date Action Button */}
        <Pressable
          style={[
            styles.generateButton,
            { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border },
            generating && { opacity: 0.5 },
          ]}
          onPress={handleGenerateNextMissing}
          disabled={generating || !nextMissingDate}
        >
          {generating ? (
            <ActivityIndicator size="small" color={theme.colors.textPrimary} />
          ) : (
            <Text style={[styles.generateButtonText, { color: theme.colors.textPrimary }]}>
              ⚡ צור חידה ליום הריק הבא ({nextMissingDate})
            </Text>
          )}
        </Pressable>

        {/* View Tabs: Scheduled Puzzles vs Server Logs */}
        <View style={styles.filterChipsRow}>
          <Pressable
            style={[
              styles.filterChip,
              { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border },
              activeTab === 'PUZZLES' && { backgroundColor: isDark ? '#F8FAFC' : '#1E293B' },
            ]}
            onPress={() => setActiveTab('PUZZLES')}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: activeTab === 'PUZZLES' ? (isDark ? '#0F172A' : '#FFFFFF') : theme.colors.textSecondary },
                activeTab === 'PUZZLES' && { fontWeight: '800' },
              ]}
            >
              חידות במערכת ({puzzles.length})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterChip,
              { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border },
              activeTab === 'LOGS' && { backgroundColor: isDark ? '#F8FAFC' : '#1E293B' },
            ]}
            onPress={() => setActiveTab('LOGS')}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: activeTab === 'LOGS' ? (isDark ? '#0F172A' : '#FFFFFF') : theme.colors.textSecondary },
                activeTab === 'LOGS' && { fontWeight: '800' },
              ]}
            >
              📜 יומן שרת ({logs.length})
            </Text>
          </Pressable>
        </View>

        {/* Dynamic Content Section */}
        {activeTab === 'LOGS' ? (
          /* Server Telemetry Logs Feed */
          <View style={[styles.tableContainer, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}>
            {logs.length === 0 ? (
              <Caption style={{ padding: 24, textAlign: 'center' }}>אין רישומי פעילות ביומן השרת</Caption>
            ) : (
              logs.map((log, idx) => (
                <View
                  key={log.id || idx}
                  style={[
                    styles.logRow,
                    { borderBottomColor: theme.colors.border },
                    idx === logs.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles.logStatusCol}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: log.status === 'success' ? '#16A34A' : '#DC2626' }}>
                      {log.status === 'success' ? '✓' : '✕'}
                    </Text>
                  </View>
                  
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={[styles.logMsgText, { color: theme.colors.textPrimary }]}>{log.message}</Text>
                    <Caption color={theme.colors.textSecondary}>
                      תאריך: {log.date_string} {log.duration_ms ? `• זמן: ${log.duration_ms}ms` : ''}
                    </Caption>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (
          /* Scheduled Puzzles Table */
          <>
            {/* Table Header Row */}
            <View style={[styles.tableHeaderRow, { borderBottomColor: theme.colors.border }]}>
              <Caption style={[styles.colNo, { color: theme.colors.textMuted }]}>מס׳</Caption>
              <Caption style={[styles.colDate, { color: theme.colors.textMuted }]}>חידה • תאריך</Caption>
              <Caption style={[styles.colScore, { color: theme.colors.textMuted }]}>גודל</Caption>
              <Caption style={[styles.colStatus, { color: theme.colors.textMuted }]}>סטטוס</Caption>
              <Caption style={[styles.colAction, { color: theme.colors.textMuted }]}>פעולה</Caption>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.textPrimary} />
              </View>
            ) : puzzles.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}>
                <Caption style={{ textAlign: 'center' }}>אין חידות מתוזמנות במסד הנתונים</Caption>
              </View>
            ) : (
              <View style={[styles.tableContainer, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}>
                {puzzles.map((item, idx) => {
                  const isPublished = item.date_string <= todayStr;
                  return (
                    <Pressable
                      key={item.id || idx}
                      style={[
                        styles.tableRow,
                        { borderBottomColor: theme.colors.border },
                        idx === puzzles.length - 1 && { borderBottomWidth: 0 },
                      ]}
                      onPress={() => setSelectedPuzzle(item)}
                    >
                      {/* Index Number */}
                      <Caption style={[styles.colNo, { color: theme.colors.textMuted }]}>#{idx + 1}</Caption>

                      {/* Title & Date Column */}
                      <View style={styles.colDateCol}>
                        <Text style={[styles.itemTitleText, { color: theme.colors.textPrimary }]}>
                          {item.title}
                        </Text>
                        <Caption color={theme.colors.textSecondary}>{item.date_string}</Caption>
                      </View>

                      {/* Grid Size Badge */}
                      <Text style={[styles.colScoreText, { color: theme.colors.textPrimary }]}>
                        {item.width}x{item.height}
                      </Text>

                      {/* Status Pill (Accurate: Published vs Scheduled) */}
                      <View style={styles.colStatusCol}>
                        {isPublished ? (
                          <View style={[styles.statusPillBtn, { backgroundColor: '#DCFCE7', borderColor: '#16A34A' }]}>
                            <Text style={[styles.statusPillBtnText, { color: '#15803D' }]}>
                              פורסם ✓
                            </Text>
                          </View>
                        ) : (
                          <View style={[styles.statusPillBtn, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.border }]}>
                            <Text style={[styles.statusPillBtnText, { color: theme.colors.textSecondary }]}>
                              מתוזמן ⏳
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Delete Action Button (Only rendered for future scheduled puzzles) */}
                      <View style={styles.colActionCol}>
                        {!isPublished ? (
                          <Pressable
                            style={[styles.deleteBtn, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.border }]}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleDeletePuzzle(item.date_string, item.title);
                            }}
                          >
                            <Text style={{ fontSize: 13 }}>🗑️</Text>
                          </Pressable>
                        ) : <View style={{ width: 28 }} />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </>
        )}

      </ScrollView>

      {/* Solution Inspector Modal */}
      {selectedPuzzle && (
        <Modal transparent visible={!!selectedPuzzle} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}>
              <Heading variant="serif" style={{ fontSize: 22, textAlign: 'center', marginBottom: 4, color: theme.colors.textPrimary }}>
                {selectedPuzzle.title}
              </Heading>
              <Caption style={{ textAlign: 'center', marginBottom: 16 }}>
                תאריך: {selectedPuzzle.date_string} • גודל: {selectedPuzzle.width}x{selectedPuzzle.height} • סטטוס: {selectedPuzzle.date_string <= todayStr ? 'פורסם ✓' : 'מתוזמן ⏳'}
              </Caption>

              {/* Pixel Art Matrix Preview */}
              <View style={[styles.matrixContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.bgPrimary }]}>
                {selectedPuzzle.solution && Array.isArray(selectedPuzzle.solution) && (
                  selectedPuzzle.solution.map((row, rIdx) => (
                    <View key={rIdx} style={styles.matrixRow}>
                      {row.map((cell, cIdx) => (
                        <View
                          key={cIdx}
                          style={[
                            styles.matrixCell,
                            {
                              width: selectedPuzzle.width > 10 ? 14 : 22,
                              height: selectedPuzzle.width > 10 ? 14 : 22,
                              backgroundColor: cell ? (isDark ? '#F8FAFC' : '#1E293B') : (isDark ? '#0F172A' : '#FFFFFF'),
                              borderColor: theme.colors.border,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  ))
                )}
              </View>

              <View style={styles.modalActionsRow}>
                {selectedPuzzle.date_string > todayStr && (
                  <Pressable
                    style={[styles.deleteModalBtn, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}
                    onPress={() => handleDeletePuzzle(selectedPuzzle.date_string, selectedPuzzle.title)}
                  >
                    <Text style={{ fontWeight: '700', color: '#B91C1C' }}>🗑️ מחק חידה זו</Text>
                  </Pressable>
                )}

                <Pressable
                  style={[styles.closeBtn, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}
                  onPress={() => setSelectedPuzzle(null)}
                >
                  <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>סגור</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    padding: 16,
    gap: 16,
  },
  headerContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTextCol: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 24,
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
  statsRow: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  generateButton: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonText: {
    fontSize: 15,
    fontWeight: '700',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  filterChipsRow: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tableHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  colNo: {
    width: 32,
    textAlign: 'center',
  },
  colDate: {
    flex: 1,
    textAlign: 'right',
  },
  colScore: {
    width: 54,
    textAlign: 'center',
  },
  colStatus: {
    width: 74,
    textAlign: 'center',
  },
  colAction: {
    width: 44,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyBox: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
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
  itemTitleText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
  },
  colScoreText: {
    width: 54,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  colStatusCol: {
    width: 74,
    alignItems: 'center',
  },
  colActionCol: {
    width: 44,
    alignItems: 'center',
  },
  statusPillBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusPillBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  deleteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  logRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  logStatusCol: {
    width: 24,
    alignItems: 'center',
  },
  logMsgText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  matrixContainer: {
    alignSelf: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 20,
  },
  matrixRow: {
    flexDirection: 'row',
  },
  matrixCell: {
    borderWidth: 0.5,
  },
  modalActionsRow: {
    gap: 10,
  },
  deleteModalBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  closeBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
});
