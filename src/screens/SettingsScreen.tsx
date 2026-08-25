import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { ThemeMode } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { getHapticsEnabled, setHapticsEnabled } from '../services/haptics';
import {
  cancelDailyEditionNotifications,
  isNotificationScheduled,
  requestNotificationPermissions,
  scheduleDailyEditionNotification,
} from '../services/notifications';
import { syncDailyPuzzles } from '../services/puzzleSyncService';
import { getSoundEnabled, setSoundEnabled } from '../services/soundEffects';

export interface SettingsScreenProps {
  onBackToHub: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBackToHub }) => {
  const { theme, themeMode, setThemeMode, availableThemes, isDark } = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [hapticsEnabled, setHapticsEnabledState] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>('');

  useEffect(() => {
    checkNotificationStatus();
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const soundVal = await getSoundEnabled();
    const hapticsVal = await getHapticsEnabled();
    setSoundEnabledState(soundVal);
    setHapticsEnabledState(hapticsVal);
  };

  const handleToggleSound = async (value: boolean) => {
    setSoundEnabledState(value);
    await setSoundEnabled(value);
  };

  const handleToggleHaptics = async (value: boolean) => {
    setHapticsEnabledState(value);
    await setHapticsEnabled(value);
  };

  const checkNotificationStatus = async () => {
    try {
      const scheduled = await isNotificationScheduled();
      setNotificationsEnabled(scheduled);
    } catch (e) {
      setNotificationsEnabled(false);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await scheduleDailyEditionNotification();
        setNotificationsEnabled(true);
      } else {
        setNotificationsEnabled(false);
      }
    } else {
      await cancelDailyEditionNotifications();
      setNotificationsEnabled(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const res = await syncDailyPuzzles(true);
      if (res) {
        setSyncMessage('✓ החידות החדשות סונכרנו בהצלחה!');
      } else {
        setSyncMessage('⚠️ לא ניתן להתחבר לשרת. משתמש בחידות השמורות.');
      }
    } catch (e) {
      setSyncMessage('⚠️ שגיאה בסנכרון החידות.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bgPrimary }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.bgPrimary} />
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={true}>
        
        {/* Screen Header */}
        <View style={[styles.headerContainer, { borderColor: theme.colors.border }]}>
          <Pressable
            style={[styles.backButton, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}
            onPress={onBackToHub}
          >
            <Text style={[styles.backButtonText, { color: theme.colors.accent }]}>◀ חזרה</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>הגדרות המוסף</Text>
        </View>

        {/* Section 1: Appearance Theme */}
        <View style={[styles.card, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            🎨 ערכת נושא לעיתון
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            בחר את הסגנון הויזואלי המועדף עליך לקריאה ולפתרון
          </Text>

          <View style={styles.themeChipsRow}>
            {availableThemes.map((t) => {
              const isSelected = t.mode === themeMode;
              return (
                <Pressable
                  key={`theme-${t.mode}`}
                  style={[
                    styles.themeChip,
                    { backgroundColor: theme.colors.bgPrimary, borderColor: theme.colors.border },
                    isSelected && { backgroundColor: theme.colors.bgHighlight, borderColor: theme.colors.borderStrong },
                  ]}
                  onPress={() => setThemeMode(t.mode)}
                >
                  <Text
                    style={[
                      styles.themeChipText,
                      { color: theme.colors.textPrimary },
                      isSelected && { color: '#1A1A1C', fontWeight: '800' },
                    ]}
                  >
                    {t.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Section 2: Sound & Tactile Haptics */}
        <View style={[styles.card, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}>
          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                🔊 צלילי משחק ומשוב קולי
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                השמע צלילי נייר, הקשות מקלדת ונכונות פתרון
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
              thumbColor={soundEnabled ? '#FFFFFF' : '#94A3B8'}
            />
          </View>

          <View style={[styles.switchRow, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
            <View style={styles.switchTextContainer}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                📳 משוב רטט מגע (Haptics)
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                רטט נעים וקל בלחיצה על משבצות והשלמת חידה
              </Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={handleToggleHaptics}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
              thumbColor={hapticsEnabled ? '#FFFFFF' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Section 3: Daily Notifications */}
        <View style={[styles.card, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}>
          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                🗞️ התראת מוסף יומי (08:00 בבוקר)
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                קבל תזכורת יומית למכשיר לשמירה על הרצף
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Section 3: Puzzle Sync */}
        <View style={[styles.card, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            🔄 סנכרון חידות וכיווץ
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            הורד את מהדורות החידות של השבוע הקרוב למשחק מלא במצב אופליין
          </Text>

          <Pressable
            style={[styles.syncButton, { backgroundColor: theme.colors.bgHighlight }]}
            onPress={handleManualSync}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator size="small" color="#1A1A1C" />
            ) : (
              <Text style={styles.syncButtonText}>סנכרן חידות עכשיו</Text>
            )}
          </Pressable>

          {syncMessage !== '' && (
            <Text style={[styles.syncMessageText, { color: theme.colors.textPrimary }]}>
              {syncMessage}
            </Text>
          )}
        </View>

        {/* Section 4: About & Version */}
        <View style={[styles.card, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}>
          <Text style={[styles.aboutTitle, { color: theme.colors.accent }]}>המסוף • גרסה 1.0.0 (MVP)</Text>
          <Text style={[styles.aboutSubtitle, { color: theme.colors.textMuted }]}>
            כל חידות הסופ"ש במקום אחד: שחור ופתור, סודוקו ומיני-תשחץ.
          </Text>
          <Text style={[styles.aboutFooter, { color: theme.colors.textSecondary }]}>
            פותח באהבה עבור חובבי תשחצים, סודוקו ושחור ופתור בישראל 🇮🇱
          </Text>
        </View>

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
    padding: 16,
    gap: 16,
  },
  headerContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
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
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'right',
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'right',
    marginTop: -4,
  },
  themeChipsRow: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginTop: 8,
  },
  themeChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  themeChipText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  switchRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTextContainer: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 12,
  },
  syncButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  syncButtonText: {
    color: '#1A1A1C',
    fontSize: 14,
    fontWeight: '800',
  },
  syncMessageText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  aboutSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  aboutFooter: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
});
