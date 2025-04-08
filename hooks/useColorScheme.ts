import { useColorScheme as _useColorScheme } from 'react-native';

export function useColorScheme(): 'light' | 'dark' {
  // Always return 'light' to force light mode throughout the app
  return 'light';
}
