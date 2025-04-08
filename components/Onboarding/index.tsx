import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { OnboardingSlides } from '@/components/OnboardingSlides';
import { Text as ThemedText } from 'react-native';
import { Text as ThemedView } from 'react-native';

export const Onboarding = () => {
  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleSignIn = () => {
    router.push('/signin');
  };

  const handleSkip = () => {
    router.replace('/dashboard');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.slidesContainer}>
        <OnboardingSlides />
      </View>

      <ThemedView style={styles.actionsContainer}>
        <ThemedView style={styles.authButtonsContainer}>
          <TouchableOpacity 
            style={styles.authButton} 
            onPress={handleSignUp}
          >
            <ThemedText style={styles.authButtonText}>Sign Up</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.authButton, styles.signinButton]} 
            onPress={handleSignIn}
          >
            <ThemedText style={styles.authButtonText}>Sign In</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={handleSkip}
        >
          <ThemedText style={styles.skipButtonText}>Skip to Dashboard</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slidesContainer: {
    flex: 3,
  },
  actionsContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
    paddingHorizontal: 20,
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