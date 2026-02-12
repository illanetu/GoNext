import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@gonext_theme';
const PRIMARY_COLOR_STORAGE_KEY = '@gonext_primary_color';

/** Палитра из 10 цветов для выбора основного цвета темы (кружки в настройках). */
export const THEME_COLOR_PALETTE = [
  '#6750A4', // фиолетовый (MD3 default)
  '#2196F3', // синий
  '#03A9F4', // голубой
  '#009688', // бирюзовый
  '#4CAF50', // зелёный
  '#8BC34A', // светло-зелёный
  '#FF9800', // оранжевый
  '#F44336', // красный
  '#E91E63', // розовый
  '#9C27B0', // пурпурный
] as const;

export type ThemePrimaryColor = (typeof THEME_COLOR_PALETTE)[number];

const DEFAULT_PRIMARY = THEME_COLOR_PALETTE[0];

export type ThemeMode = 'light' | 'dark';

type ThemeContextType = {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  isDark: boolean;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

function isValidPaletteColor(color: string): color is ThemePrimaryColor {
  return (THEME_COLOR_PALETTE as readonly string[]).includes(color);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [primaryColor, setPrimaryColorState] = useState<string>(DEFAULT_PRIMARY);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark') {
        setThemeState(stored);
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(PRIMARY_COLOR_STORAGE_KEY).then((stored) => {
      if (stored && isValidPaletteColor(stored)) {
        setPrimaryColorState(stored);
      }
    });
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  }, []);

  const setPrimaryColor = useCallback((color: string) => {
    if (!isValidPaletteColor(color)) return;
    setPrimaryColorState(color);
    AsyncStorage.setItem(PRIMARY_COLOR_STORAGE_KEY, color);
  }, []);

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark: theme === 'dark',
    primaryColor,
    setPrimaryColor,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
