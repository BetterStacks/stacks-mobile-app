import React from 'react';
import {ColorSchemeName, StyleSheet, View} from 'react-native';

// This is a shim for web and Android where the tab bar is generally opaque.
export default function TabBarBackground({colorScheme}: {colorScheme: ColorSchemeName}) {
  return (
    <View 
      style={colorScheme === 'light' ? styles.background : styles.background__dark} 
    />
  );
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF'
  },
  background__dark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#171717'
  }
});

export function useBottomTabOverflow() {
  return 0;
}
