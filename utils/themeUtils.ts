import AsyncStorage from '@react-native-async-storage/async-storage';
import {Appearance} from 'react-native';

export const THEME_PREFERENCE_KEY = "theme_preference";

export const saveThemePreference = async (theme: 'light' | 'dark'): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_PREFERENCE_KEY, theme);
    Appearance.setColorScheme(theme);
  } catch (error) {
    console.error('Failed to save theme preference:', error);
    throw error;
  }
};

export const getThemePreference = async (): Promise<'light' | 'dark' | null> => {
  try {
    const savedTheme = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    return null;
  } catch (error) {
    console.error('Failed to get theme preference:', error);
    return null;
  }
};

export const toggleTheme = async (currentTheme: 'light' | 'dark'): Promise<'light' | 'dark'> => {
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  await saveThemePreference(newTheme);
  return newTheme;
};

export const clearThemePreference = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(THEME_PREFERENCE_KEY);
  } catch (error) {
    console.error('Failed to clear theme preference:', error);
    throw error;
  }
}; 