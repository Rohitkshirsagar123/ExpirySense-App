import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  // Load theme preference on app start
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      if (savedTheme) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem('appTheme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Light Theme
export const lightTheme = {
  colors: {
    primary: '#7B2FF7',
    primaryLight: '#A64FFF',
    background: '#F3F4F6',
    surface: '#FFFFFF',
    surfaceAlt: '#F9FAFB',
    text: '#1F2937',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    errorLight: '#FEE2E2',
  },
  shadows: {
    small: {
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    medium: {
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    large: {
      elevation: 6,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
    },
  },
};

// Dark Theme
export const darkTheme = {
  colors: {
    primary: '#A78BFA',
    primaryLight: '#C4B5FD',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceAlt: '#334155',
    text: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    border: '#475569',
    success: '#16A34A',
    warning: '#D97706',
    error: '#DC2626',
    errorLight: '#7F1D1D',
  },
  shadows: {
    small: {
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    medium: {
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.4,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    large: {
      elevation: 6,
      shadowColor: '#000',
      shadowOpacity: 0.5,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
    },
  },
};
