import React, {useState} from 'react';
import {router, Stack, useLocalSearchParams} from 'expo-router';
import {ParticularCollectionScreen} from '@/components/collections/ParticularCollectionScreen';
import {StyleSheet, Text, TouchableOpacity, useColorScheme, View} from 'react-native';
import {AntDesign, Feather} from '@expo/vector-icons';
import {getEmojiFromCode} from '@/lib/utils';
import BottomDrawer from '@/components/BottomDrawer/BottomDrawer';
import EditCollectionView from '@/components/BottomDrawer/EditCollectionView';

export default function CollectionScreen() {
  const params = useLocalSearchParams<{ title: string, emoji: string, id: string }>();
  const [currentTitle, setCurrentTitle] = useState(params.title || 'Collection');
  const [isEditDrawerVisible, setIsEditDrawerVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const handleEditPress = () => {
    setIsEditDrawerVisible(true);
  };

  const handleEditSuccess = (message: { title: string; description: string }) => {
    // Update the current title with the edited title
    setCurrentTitle(message.title);
    
    // Navigate back to refresh the screen with updated data
    router.replace({
      pathname: "/dashboard/collection",
      params: {
        id: params.id,
        title: message.title,
        emoji: params.emoji,
      },
    });
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerBackVisible: false, // Hide default back button
          headerTitle: () => (
            <View style={styles.headerTitle}>
              {params.emoji && (
                <Text style={isDark ? styles.emoji_dark : styles.emoji}>
                  {getEmojiFromCode(params.emoji)}
                </Text>
              )}
              <Text style={isDark ? styles.title_dark : styles.title}>{currentTitle}</Text>
            </View>
          ),
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={{ marginLeft: 10, marginRight: 16 }}
            >
              <AntDesign name="arrowleft" size={24} color={isDark ? "#FFFFFF" : "black"} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleEditPress} 
              style={{ marginRight: 16 }}
            >
              <Feather name="edit-2" size={20} color={isDark ? "#FFFFFF" : "black"} />
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
      <ParticularCollectionScreen />

      <View>
        <BottomDrawer
          isVisible={isEditDrawerVisible}
          onClose={() => setIsEditDrawerVisible(false)}
          customContent={
            <EditCollectionView
              collection={{ id: params.id, title: currentTitle, emoji: params.emoji }}
              onBack={() => setIsEditDrawerVisible(false)}
              onClose={() => setIsEditDrawerVisible(false)}
              onSuccess={handleEditSuccess}
            />
          }
        />
      </View>
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
    color: '#000000',
  },
  emoji_dark: {
    fontSize: 16,
    marginRight: 8,
    color: '#F0F0F0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C4A5A',
  },
  title_dark: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 