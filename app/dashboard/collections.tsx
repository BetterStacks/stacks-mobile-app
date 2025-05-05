import React, {useCallback, useEffect, useMemo, useState} from "react";
import {ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View,} from "react-native";
import Animated, {interpolate, useAnimatedStyle, useSharedValue, withTiming,} from "react-native-reanimated";
import {SafeAreaView} from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import {useFocusEffect, useIsFocused} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {SELECTED_WORKSPACE_ID_KEY} from "@/lib/constants";
import {useQuery} from "@apollo/client";
import {QUERY_COLLECTIONS} from "@/lib/api/graphql/queries";
import {getEmojiFromCode} from "@/lib/utils";
import {Collection} from "@/lib/types/Collection";
import {router} from "expo-router";
import {Colors} from "@/components/design/colors";
import BottomDrawer from "@/components/BottomDrawer/BottomDrawer";
import EditCollectionView from "@/components/BottomDrawer/EditCollectionView";
import { setIsSuccessModalVisible, setSuccessModalMessage } from "@/lib/apollo/store/handlers";

interface Section {
  title: string;
  data: Collection[];
}

interface SectionProps {
  item: Section;
}

interface CollectionItemProps {
  item: Collection;
  onLongPress: (collection: Collection) => void;
}

export default function CollectionsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isEditDrawerVisible, setIsEditDrawerVisible] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadWorkspaceId = async () => {
        const id = await AsyncStorage.getItem(SELECTED_WORKSPACE_ID_KEY);
        setWorkspaceId(id && id !== "All Workspaces" ? id : null);
      };

      loadWorkspaceId();
    }, []),
  );

  const { data: workspaceCollections, loading: workspaceLoading, refetch: refetchWorkspaceCollections } = useQuery(
    QUERY_COLLECTIONS,
    {
      variables: {
        query: searchQuery,
        repositoryId: workspaceId,
      },
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
    },
  );

  const { data: allCollections, loading: allLoading, refetch: refetchAllCollections } = useQuery(
    QUERY_COLLECTIONS,
    {
      variables: {
        query: searchQuery,
        repositoryId: null,
      },
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
    },
  );

  useFocusEffect(
    useCallback(() => {
      refetchWorkspaceCollections();
      refetchAllCollections();
    }, [refetchWorkspaceCollections, refetchAllCollections])
  );

  const otherCollections = useMemo(() => {
    if (!allCollections?.collections) {
      return [];
    }

    if (!workspaceId || !workspaceCollections?.collections) {
      return allCollections.collections;
    }

    const workspaceIds = new Set(
      workspaceCollections.collections.map((c: any) => c.id),
    );
    return allCollections.collections.filter(
      (c: any) => !workspaceIds.has(c.id),
    );
  }, [allCollections, workspaceCollections, workspaceId]); // Make sure workspaceId is in deps

  const sharedValue = useSharedValue(0);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      sharedValue.value = withTiming(1);
    } else {
      sharedValue.value = 0;
    }
  }, [isFocused, sharedValue]);

  const animViewStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sharedValue.value, [0, 1], [0, 1]),
  }));

  const renderSections = useCallback(() => {
    const sections = [];

    if (workspaceId && workspaceCollections?.collections?.length > 0) {
      sections.push({
        title: "Workspace Collections",
        data: workspaceCollections.collections,
      });
    }

    if (otherCollections.length > 0) {
      sections.push({
        title: workspaceId ? "All Collections" : "Collections",
        data: otherCollections,
      });
    }

    return sections;
  }, [workspaceId, workspaceCollections, otherCollections]);

  const handleLongPress = useCallback((collection: Collection) => {
    setSelectedCollection(collection);
    setIsEditDrawerVisible(true);
  }, []);

  const handleEditSuccess = useCallback((message: { title: string; description: string }) => {
    setSuccessModalMessage({
      ...message,
      closeText: "Got it!",
      preventNavigation: true,
    });
    setIsSuccessModalVisible(true);
    
    // Refetch collections to update the list
    refetchWorkspaceCollections();
    refetchAllCollections();
  }, [refetchWorkspaceCollections, refetchAllCollections]);

  const renderCollectionItem = ({ item: collection, onLongPress }: CollectionItemProps) => (
    <TouchableOpacity 
      style={localStyles.collectionItem} 
      onPress={() => handleCollectionPress(collection)}
      onLongPress={() => onLongPress(collection)}
      delayLongPress={500}
    >
      <View style={localStyles.collectionContent}>
        <View style={localStyles.emojiContainer}>
          <Text style={localStyles.collectionEmoji} allowFontScaling={false}>
            {getEmojiFromCode(collection.emoji)}
          </Text>
        </View>
        <View style={localStyles.collectionInfo}>
          <Text style={localStyles.collectionTitle}>
            {collection.title}
            <Text style={localStyles.collectionCount}>
              {' '}({collection.links_count})
            </Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSeparator = () => <View style={localStyles.separator} />;

  const renderSection = ({ item: section }: SectionProps) => (
    <View style={localStyles.section}>
      <Text style={localStyles.sectionTitle}>{section.title}</Text>
      <FlatList
        data={section.data}
        renderItem={({ item }) => renderCollectionItem({ 
          item, 
          onLongPress: handleLongPress 
        })}
        ItemSeparatorComponent={renderSeparator}
        scrollEnabled={false}
      />
    </View>
  );

  const onAddCollectionPress = useCallback(() => {
    router.push('/collection/create');
    // navigation.navigate(EAfterAuthScreens.CreateCollectionScreen);
  }, []);

  const handleCollectionPress = useCallback(
    (collection: Collection) => {
      router.push({
        pathname: "/dashboard/collection",
        params: {
          id: collection.id,
          collectionId: collection.id,
          title: collection.title,
          emoji: collection.emoji,
        },
      });
    },
    [],
  );

  const localStyles = StyleSheet.create({
    addButtonWrapper: {
      padding: 8,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 50,
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: '#fff',
    },
    headerInfo: {
      flex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: '500',
      color: '#333',
    },
    text: {
      fontSize: 14,
      color: '#888',
    },
    addButton: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: '#f5f5f5',
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginBottom: 8,
    },
    searchWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: 8,
      paddingHorizontal: 10,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      height: 40,
      color: '#333',
    },
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '400',
      marginBottom: 8,
      paddingHorizontal: 16,
      color: '#666',
    },
    collectionItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    collectionContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    emojiContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#f7f7f7',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    collectionEmoji: {
      fontSize: 18,
    },
    collectionInfo: {
      flex: 1,
    },
    collectionTitle: {
      fontSize: 15,
      fontWeight: '400',
      color: '#333',
    },
    collectionCount: {
      fontSize: 13,
      color: '#888',
      marginLeft: 4,
    },
    separator: {
      height: 1,
      backgroundColor: '#f0f0f0',
      marginLeft: 68,
    },
    listContentContainer: {
      paddingBottom: 150,
    },
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
  });

  return (
    <SafeAreaView style={localStyles.container}>
      <Animated.View style={[animViewStyle]}>
        <View style={localStyles.header}>
          <TouchableOpacity
            style={localStyles.backButton}
            onPress={() => router.back()}
          >
            <AntDesign name="arrowleft" size={22} color="#666" />
          </TouchableOpacity>
          
          <View style={localStyles.headerInfo}>
            <Text style={localStyles.title}>Collections</Text>
            <Text style={localStyles.text}>Browse your collections</Text>
          </View>

            <TouchableOpacity
              onPress={onAddCollectionPress}
            style={localStyles.addButton}
            >
            <AntDesign name="plus" size={22} color="#666" />
            </TouchableOpacity>
        </View>

        <View style={localStyles.searchContainer}>
          <View style={localStyles.searchWrapper}>
            <AntDesign
              name="search1"
              size={16}
              color="#666"
              style={localStyles.searchIcon}
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search collections..."
              placeholderTextColor="#666"
              style={localStyles.searchInput}
            />
          </View>
        </View>

        {workspaceLoading || allLoading ? (
          <View style={localStyles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.TextColor.LignMainColor} />
          </View>
        ) : (
          <FlatList<Section>
            data={renderSections()}
            renderItem={renderSection}
            keyExtractor={(section) => section.title}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={localStyles.listContentContainer}
            extraData={workspaceId}
          />
        )}
      </Animated.View>

      {selectedCollection && (
        <View>
          <BottomDrawer
          isVisible={isEditDrawerVisible}
          onClose={() => setIsEditDrawerVisible(false)}
          customContent={
            <EditCollectionView
              collection={selectedCollection}
              onBack={() => setIsEditDrawerVisible(false)}
              onClose={() => setIsEditDrawerVisible(false)}
              onSuccess={handleEditSuccess}
            />
          }
        />
        </View>
      )}
    </SafeAreaView>
  );
}
