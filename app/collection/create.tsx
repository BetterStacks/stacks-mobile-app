import React from 'react';
import { Stack, router } from 'expo-router';
import { CreateCollectionScreen } from '@/components/collections/CreateCollectionScreen';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

export default function CreateCollectionRoute() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: "Create Collection",
          headerShown: true,
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <AntDesign name="arrowleft" size={24} color="black" />
            </TouchableOpacity>
          ),
        }} 
      />
      <CreateCollectionScreen />
    </>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginLeft: 10,
    marginRight: 16,
  }
}); 