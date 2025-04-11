import React from 'react';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ParticularCollectionScreen } from '@/components/collections/ParticularCollectionScreen';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { getEmojiFromCode } from '@/lib/utils';

export default function CollectionScreen() {
  const { title, emoji } = useLocalSearchParams<{ title: string, emoji: string }>();
  
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerBackVisible: false, // Hide default back button
          headerTitle: () => (
            <View style={styles.headerTitle}>
              {emoji && (
                <Text style={styles.emoji}>
                  {getEmojiFromCode(emoji)}
                </Text>
              )}
              <Text 
                style={styles.title}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {title || 'Collection'}
              </Text>
            </View>
          ),
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={{ marginLeft: 10, marginRight: 16 }}
            >
              <AntDesign name="arrowleft" size={24} color="black" />
            </TouchableOpacity>
          ),
        }} 
      />
      <ParticularCollectionScreen />
    </>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 16,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    maxWidth: 220,
  },
}); 