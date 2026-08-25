import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { THEMES, ThemeMode, ThemePalette } from '../constants/theme';

const THEME_STORAGE_KEY = '@hamusaf_theme_mode';

export interface ThemeContextType {
  theme: ThemePalette;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  availableThemes: ThemePalette[];
}

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES.newsprint,
  themeMode: 'newsprint',
  isDark: false,
  setThemeMode: () => {},
  availableThemes: Object.values(THEMES),
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('newsprint');

  // Load saved theme on launch
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((savedMode) => {
        if (savedMode && THEMES[savedMode as ThemeMode]) {
          setThemeModeState(savedMode as ThemeMode);
        }
      })
      .catch(() => {});
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {});
  };

  const theme = THEMES[themeMode] || THEMES.newsprint;
  const isDark = themeMode === 'dark' || themeMode === 'classic';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        isDark,
        setThemeMode,
        availableThemes: Object.values(THEMES),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => useContext(ThemeContext);
