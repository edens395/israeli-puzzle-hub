import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { CrosswordScreen } from './src/features/crossword/components/CrosswordScreen';
import { NonogramScreen } from './src/features/nonogram/components/NonogramScreen';
import { SudokuScreen } from './src/features/sudoku/components/SudokuScreen';
import { ArchiveScreen } from './src/screens/ArchiveScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { getHebrewFormattedDate, PuzzleCategory, puzzleRepository } from './src/storage/puzzleRepository';

type ScreenState = 'home' | 'nonogram' | 'sudoku' | 'tashbetz' | 'settings' | 'archive';

function MainAppContent() {
  const [activeScreen, setActiveScreen] = useState<ScreenState>('home');
  const [archiveCategory, setArchiveCategory] = useState<PuzzleCategory | 'all'>('all');
  const [formattedDate, setFormattedDate] = useState<string>('');
  const { theme } = useTheme();

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

  const handleOpenArchive = (category?: PuzzleCategory) => {
    setArchiveCategory(category || 'all');
    setActiveScreen('archive');
  };

  const handleOpenGameFromArchive = (category: PuzzleCategory) => {
    if (category === 'nonogram') {
      setActiveScreen('nonogram');
    } else if (category === 'sudoku') {
      setActiveScreen('sudoku');
    } else if (category === 'tashbetz') {
      setActiveScreen('tashbetz');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bgPrimary }]}>
      
      {/* Top Header Row: Left Back Arrow Button (◀) & Right Title "שחור ופתור" + Date at same height */}
      {activeScreen !== 'home' && activeScreen !== 'settings' && activeScreen !== 'archive' && (
        <View style={[styles.topNavHeader, { backgroundColor: theme.colors.bgPrimary }]}>
          {/* Left Side: Back Arrow Button */}
          <Pressable
            style={[styles.backArrowButton, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }]}
            onPress={() => setActiveScreen('home')}
          >
            <Text style={[styles.backArrowText, { color: theme.colors.textPrimary }]}>◀</Text>
          </Pressable>

          {/* Right Side: Title "שחור ופתור" and Date below it */}
          <View style={styles.headerRightCol}>
            <Text style={[styles.headerTitleText, { color: theme.colors.textPrimary }]}>
              {activeScreen === 'nonogram' ? 'שחור ופתור' : activeScreen === 'sudoku' ? 'סודוקו' : 'מיני-תשחץ'}
            </Text>
            {formattedDate !== '' && (
              <Text style={[styles.headerDateText, { color: theme.colors.textSecondary }]}>
                {formattedDate}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Active Screen Container */}
      <View style={styles.screenContent}>
        {activeScreen === 'home' ? (
          <HomeScreen
            onOpenNonogram={() => setActiveScreen('nonogram')}
            onOpenSudoku={() => setActiveScreen('sudoku')}
            onOpenTashbetz={() => setActiveScreen('tashbetz')}
            onOpenSettings={() => setActiveScreen('settings')}
            onOpenArchive={handleOpenArchive}
          />
        ) : activeScreen === 'sudoku' ? (
          <SudokuScreen onBackToHub={() => setActiveScreen('home')} />
        ) : activeScreen === 'tashbetz' ? (
          <CrosswordScreen onBackToHub={() => setActiveScreen('home')} />
        ) : activeScreen === 'settings' ? (
          <SettingsScreen onBackToHub={() => setActiveScreen('home')} />
        ) : activeScreen === 'archive' ? (
          <ArchiveScreen
            onBackToHub={() => setActiveScreen('home')}
            onOpenGame={handleOpenGameFromArchive}
            initialCategory={archiveCategory}
          />
        ) : (
          <NonogramScreen onBackToHub={() => setActiveScreen('home')} />
        )}
      </View>

    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <GestureHandlerRootView style={styles.container}>
        <MainAppContent />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  screenContent: {
    flex: 1,
  },
});
