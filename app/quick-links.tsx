import React from 'react';
import {QuickLinksScreen} from '@/components/QuickLinks';
import {StatusBar} from 'expo-status-bar';
import {StyleSheet, useColorScheme, View} from 'react-native';
import {Stack} from 'expo-router';

export default function QuickLinksPage() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={isDark ? styles.container_dark : styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack.Screen options={{ 
        title: "Quick Links",
        headerStyle: {
          backgroundColor: isDark ? '#171717' : undefined
        },
        headerTitleStyle: {
          color: isDark ? '#FFFFFF' : undefined
        },
        headerTintColor: isDark ? '#FFFFFF' : undefined
      }} />
      <QuickLinksScreen colorScheme={colorScheme} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container_dark: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
}); 