import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function DashboardHomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Dashboard</Text>
      <Text style={styles.subtitle}>Welcome to your dashboard!</Text>
      
      <View style={styles.card}>
        <Text>Recent Activity</Text>
        <Text>Your recent activity will appear here.</Text>
      </View>
      
      <View style={styles.card}>
        <Text>Quick Actions</Text>
        <Text>Quick action buttons will appear here.</Text>
      </View>
    </View>
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