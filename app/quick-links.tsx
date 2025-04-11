import React from 'react';
import { QuickLinksScreen } from '@/components/QuickLinks';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

export default function QuickLinksPage() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
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