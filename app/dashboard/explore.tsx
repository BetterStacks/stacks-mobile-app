import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Explore</Text>
      <Text style={styles.subtitle}>Discover new content</Text>
      
      <View style={styles.card}>
        <Text>Featured Content</Text>
        <Text>Featured content will appear here.</Text>
      </View>
      
      <View style={styles.card}>
        <Text>Popular</Text>
        <Text>Popular content will appear here.</Text>
      </View>
    </SafeAreaView>
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