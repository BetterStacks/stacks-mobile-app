import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function DashboardHomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Dashboard</ThemedText>
      <ThemedText style={styles.subtitle}>Welcome to your dashboard!</ThemedText>
      
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Recent Activity</ThemedText>
        <ThemedText>Your recent activity will appear here.</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Quick Actions</ThemedText>
        <ThemedText>Quick action buttons will appear here.</ThemedText>
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