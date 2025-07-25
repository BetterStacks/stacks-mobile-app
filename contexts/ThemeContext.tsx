import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {Appearance} from 'react-native';
import {getThemePreference, saveThemePreference} from '@/utils/themeUtils';

type ThemeContextType = {
  colorScheme: 'light' | 'dark';
  toggleTheme: () => Promise<void>;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({children}: ThemeProviderProps) {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await getThemePreference();
        if (savedTheme) {
          setColorScheme(savedTheme);
          Appearance.setColorScheme(savedTheme);
        } else {
          // If no saved preference, use system preference or default to light
          const systemTheme = Appearance.getColorScheme() ?? 'light';
          setColorScheme(systemTheme);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
        // Fallback to system preference or light mode
        const systemTheme = Appearance.getColorScheme() ?? 'light';
        setColorScheme(systemTheme);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();

    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme: systemColorScheme }) => {
      // Only update if we don't have a saved preference
      getThemePreference().then(savedTheme => {
        if (!savedTheme && systemColorScheme) {
          setColorScheme(systemColorScheme);
        }
      });
    });

    return () => subscription?.remove();
  }, []);

  const toggleTheme = async () => {
    try {
      const newTheme = colorScheme === 'dark' ? 'light' : 'dark';
      await saveThemePreference(newTheme);
      setColorScheme(newTheme);
    } catch (error) {
      console.error('Failed to toggle theme:', error);
      throw error;
    }
  };

  const value: ThemeContextType = {
    colorScheme,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 