import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ExploreScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Explore</ThemedText>
      <ThemedText style={styles.subtitle}>Discover new content</ThemedText>
      
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Featured Content</ThemedText>
        <ThemedText>Featured content will appear here.</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Popular</ThemedText>
        <ThemedText>Popular content will appear here.</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
}); 