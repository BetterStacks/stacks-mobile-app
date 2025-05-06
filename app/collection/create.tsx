import React from 'react';
import {router, Stack} from 'expo-router';
import {CreateCollectionScreen} from '@/components/collections/CreateCollectionScreen';
import {StyleSheet, TouchableOpacity, useColorScheme} from 'react-native';
import {AntDesign} from '@expo/vector-icons';

export default function CreateCollectionRoute() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
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
              <AntDesign name="arrowleft" size={24} color={isDark ? "#FFFFFF" : "black"} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: isDark ? "#171717" : "white",
          },
          headerTitleStyle: {
            color: isDark ? "#FFFFFF" : "black",
          },
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