import React from 'react';
import { QuickLinksScreen } from '@/components/QuickLinks';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function QuickLinksPage() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ title: "Quick Links" }} />
      <QuickLinksScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
}); 