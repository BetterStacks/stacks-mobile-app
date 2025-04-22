import React, { useState } from 'react';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ParticularCollectionScreen } from '@/components/collections/ParticularCollectionScreen';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import { getEmojiFromCode } from '@/lib/utils';
import BottomDrawer from '@/components/BottomDrawer/BottomDrawer';
import EditCollectionView from '@/components/BottomDrawer/EditCollectionView';
import { setIsSuccessModalVisible, setSuccessModalMessage } from '@/lib/apollo/store/handlers';

export default function CollectionScreen() {
  const params = useLocalSearchParams<{ title: string, emoji: string, id: string }>();
  const [currentTitle, setCurrentTitle] = useState(params.title || 'Collection');
  const [isEditDrawerVisible, setIsEditDrawerVisible] = useState(false);
  
  const handleEditPress = () => {
    setIsEditDrawerVisible(true);
  };

  const handleEditSuccess = (message: { title: string; description: string }) => {
    // Update the current title with the edited title
    setCurrentTitle(message.title);
    
    // Navigate back to refresh the screen with updated data
    router.replace({
      pathname: "/collection/[id]",
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
                <Text style={styles.emoji}>
                  {getEmojiFromCode(params.emoji)}
                </Text>
              )}
              <Text 
                style={styles.title}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {currentTitle}
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
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleEditPress} 
              style={{ marginRight: 16 }}
            >
              <Feather name="edit-2" size={20} color="black" />
            </TouchableOpacity>
          ),
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
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    maxWidth: 220,
  },
}); 