import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AdminPasscodeModal } from './src/components/AdminPasscodeModal';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { CrosswordScreen } from './src/features/crossword/components/CrosswordScreen';
import { NonogramScreen } from './src/features/nonogram/components/NonogramScreen';
import { SudokuScreen } from './src/features/sudoku/components/SudokuScreen';
import { AdminDashboardScreen } from './src/screens/AdminDashboardScreen';
import { ArchiveScreen } from './src/screens/ArchiveScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { PuzzleCategory } from './src/storage/puzzleRepository';

type ScreenState = 'home' | 'nonogram' | 'sudoku' | 'tashbetz' | 'settings' | 'archive' | 'admin';

function MainAppContent() {
  const [activeScreen, setActiveScreen] = useState<ScreenState>('home');
  const [archiveCategory, setArchiveCategory] = useState<PuzzleCategory | 'all'>('all');
  const [selectedGameDate, setSelectedGameDate] = useState<Date | string | undefined>(undefined);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState<boolean>(false);
  const { theme } = useTheme();

  const handleOpenArchive = (category?: PuzzleCategory) => {
    setArchiveCategory(category || 'all');
    setActiveScreen('archive');
  };

  const handleOpenGameFromArchive = (category: PuzzleCategory, date?: Date | string) => {
    setSelectedGameDate(date);
    if (category === 'nonogram') {
      setActiveScreen('nonogram');
    } else if (category === 'sudoku') {
      setActiveScreen('sudoku');
    } else if (category === 'tashbetz') {
      setActiveScreen('tashbetz');
    }
  };

  const handleRequestAdminAccess = () => {
    if (isAdminAuthenticated) {
      setActiveScreen('admin');
    } else {
      setShowPasscodeModal(true);
    }
  };

  const handleAdminPasscodeSuccess = () => {
    setIsAdminAuthenticated(true);
    setShowPasscodeModal(false);
    setActiveScreen('admin');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bgPrimary }]}>
      <View style={styles.screenContent}>
        {activeScreen === 'home' ? (
          <HomeScreen
            onOpenNonogram={() => {
              setSelectedGameDate(undefined);
              setActiveScreen('nonogram');
            }}
            onOpenSudoku={() => setActiveScreen('sudoku')}
            onOpenTashbetz={() => setActiveScreen('tashbetz')}
            onOpenSettings={() => setActiveScreen('settings')}
            onOpenArchive={handleOpenArchive}
            onOpenAdmin={handleRequestAdminAccess}
          />
        ) : activeScreen === 'sudoku' ? (
          <SudokuScreen onBackToHub={() => setActiveScreen('home')} />
        ) : activeScreen === 'tashbetz' ? (
          <CrosswordScreen onBackToHub={() => setActiveScreen('home')} />
        ) : activeScreen === 'settings' ? (
          <SettingsScreen onBackToHub={() => setActiveScreen('home')} onOpenAdmin={handleRequestAdminAccess} />
        ) : activeScreen === 'archive' ? (
          <ArchiveScreen
            onBackToHub={() => setActiveScreen('home')}
            onOpenGame={handleOpenGameFromArchive}
            initialCategory={archiveCategory}
          />
        ) : activeScreen === 'admin' ? (
          <AdminDashboardScreen onBack={() => setActiveScreen('home')} />
        ) : (
          <NonogramScreen onBackToHub={() => setActiveScreen('home')} targetDate={selectedGameDate} />
        )}
      </View>

      {/* Admin Passcode Authentication Modal */}
      <AdminPasscodeModal
        visible={showPasscodeModal}
        onClose={() => setShowPasscodeModal(false)}
        onSuccess={handleAdminPasscodeSuccess}
      />
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
  screenContent: {
    flex: 1,
  },
});
