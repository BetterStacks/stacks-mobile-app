import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { router } from 'expo-router';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';

export default function OnboardingScreen() {
  // Function to handle successful sign in (proceed to dashboard)
  const handleSuccessfulAuth = () => {
    router.replace('/dashboard');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <View style={styles.titleContainer}>
        <Text>Welcome to MyApp!</Text>
        <HelloWave />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.description}>
          A powerful app with amazing features that will help you be more productive and enjoy your day.
        </Text>
      </View>
      
      <View style={styles.authButtonsContainer}>
        <TouchableOpacity 
          style={styles.authButton} 
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.authButtonText}>Sign Up</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.authButton, styles.signinButton]}
          onPress={() => router.push('/signin')}
        >
          <Text style={styles.authButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
      
      {/* For development convenience, direct access to dashboard */}
      <TouchableOpacity 
        style={styles.skipButton} 
        onPress={handleSuccessfulAuth}
      >
        <Text style={styles.skipButtonText}>Skip to Dashboard</Text>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  contentContainer: {
    marginBottom: 30,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  authButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  authButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  signinButton: {
    backgroundColor: '#4CAF50',
  },
  authButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  skipButton: {
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
  },
  skipButtonText: {
    textDecorationLine: 'underline',
  }
}); 