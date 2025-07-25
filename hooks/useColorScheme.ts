import {Appearance} from 'react-native';

export function useColorScheme(): 'light' | 'dark' {
  // Always return 'light' to force light mode throughout the app
  return Appearance.getColorScheme() ?? 'light'
}
