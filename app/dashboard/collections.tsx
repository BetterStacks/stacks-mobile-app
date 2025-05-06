import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
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
import {setIsSuccessModalVisible, setSuccessModalMessage} from "@/lib/apollo/store/handlers";
import {scaleHeight, scaleWidth} from "@/components/design/scale";
import metrics from "@/components/design/metrics";
import {getFont} from "@/components/design/fonts/fonts";
import {EFontWeight} from "@/components/design/fonts/types";

interface Section {
  title: string;
  data: Collection[];
}

interface SectionProps {
  item: Section;
  colorScheme?: string;
}

interface CollectionItemProps {
  item: Collection;
  onLongPress: (collection: Collection) => void;
  colorScheme?: string;
}

export default function CollectionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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

  const renderCollectionItem = ({ item: collection, onLongPress, colorScheme }: CollectionItemProps) => {
    const isDark = colorScheme === 'dark';
    return (
      <TouchableOpacity
        style={localStyles.collectionItem}
        onPress={() => handleCollectionPress(collection)}
        onLongPress={() => onLongPress(collection)}
        delayLongPress={500}
      >
        <View style={localStyles.collectionContent}>
          <View style={localStyles.emojiContainer}>
            <Text style={isDark ? localStyles.collectionEmoji__dark : localStyles.collectionEmoji} allowFontScaling={false}>
              {getEmojiFromCode(collection.emoji)}
            </Text>
          </View>
          <View style={localStyles.collectionInfo}>
            <Text style={isDark ? localStyles.collectionTitle__dark : localStyles.collectionTitle}>
              {collection.title}
              <Text style={isDark ? localStyles.collectionCount__dark : localStyles.collectionCount}>
                ({collection.links_count})
              </Text>
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSeparator = () => (
    <View style={isDark ? localStyles.separator__dark : localStyles.separator} />
  );

  const renderSection = ({ item: section, colorScheme }: SectionProps) => {
    const isDark = colorScheme === 'dark';
    return (
      <View style={localStyles.section}>
        <Text style={isDark ? localStyles.sectionTitle__dark : localStyles.sectionTitle}>{section.title}</Text>
        <FlatList
          data={section.data}
          renderItem={({ item }) => renderCollectionItem({
            item,
            onLongPress: handleLongPress,
            colorScheme
          })}
          ItemSeparatorComponent={renderSeparator}
          scrollEnabled={false}
        />
      </View>
    );
  };

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
    container: {
      flex: 1,
      backgroundColor: Colors.OtherColor.UsualWhite,
      paddingHorizontal: scaleWidth(16),
      paddingTop: metrics.isAndroid ? scaleHeight(24) : scaleHeight(12),
    },
    container__dark: {
      flex: 1,
      backgroundColor: "#0A0A0A",
      paddingHorizontal: scaleWidth(16),
      paddingTop: metrics.isAndroid ? scaleHeight(24) : scaleHeight(12),
    },
    header: {
      marginTop: scaleHeight(13),
      justifyContent: "space-between",
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
    },
    headerInfo: {
      gap: scaleHeight(4),
    },
    text: {
      color: Colors.TextColor.SecondaryColor,
      ...getFont(EFontWeight.Medium),
      fontSize: scaleHeight(14),
      lineHeight: scaleHeight(17.5),
    },
    text__dark: {
      color: "#A0B3BC",
      ...getFont(EFontWeight.Medium),
      fontSize: scaleHeight(14),
      lineHeight: scaleHeight(17.5),
    },
    title: {
      ...getFont(EFontWeight.Bold),
      fontSize: scaleHeight(20),
      color: Colors.TextColor.MainColor,
      lineHeight: scaleHeight(24),
    },
    title__dark: {
      ...getFont(EFontWeight.Bold),
      fontSize: scaleHeight(20),
      color: "#FFFFFF",
      lineHeight: scaleHeight(24),
    },
    addButton: {
      backgroundColor: Colors.ButtonsColor.MainButton,
      borderRadius: 12,
    },
    listContainer: {
      marginTop: scaleHeight(28),
    },
    searchContainer: {
      marginTop: scaleHeight(16),
      marginBottom: scaleHeight(24),
    },
    searchWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors.OtherColor.UsualWhite,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors.OtherColor.InputGrayBorder,
      paddingHorizontal: scaleWidth(12),
      height: scaleHeight(40),
    },
    searchWrapper__dark: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#171717",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#262626",
      paddingHorizontal: scaleWidth(12),
      height: scaleHeight(40),
    },
    searchIcon: {
      marginRight: scaleWidth(8),
    },
    searchInput: {
      flex: 1,
      height: "100%",
      padding: 0,
      color: Colors.TextColor.MainColor,
      ...getFont(EFontWeight.Regular),
      fontSize: scaleHeight(14),
    },
    searchInput__dark: {
      flex: 1,
      height: "100%",
      padding: 0,
      color: "#FFFFFF",
      ...getFont(EFontWeight.Regular),
      fontSize: scaleHeight(14),
    },
    collectionItem: {
      paddingVertical: scaleHeight(12),
    },
    collectionContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    collectionEmoji: {
      fontSize: scaleHeight(18),
      marginRight: scaleWidth(12),
      includeFontPadding: false,
      textAlignVertical: "center",
      color: "#000",
      ...Platform.select({
        ios: {
          lineHeight: scaleHeight(22),
        },
        android: {
          lineHeight: scaleHeight(20),
        },
      }),
    },
    collectionEmoji__dark: {
      fontSize: scaleHeight(18),
      marginRight: scaleWidth(12),
      includeFontPadding: false,
      textAlignVertical: "center",
      color: "#F0F0F0",
      ...Platform.select({
        ios: {
          lineHeight: scaleHeight(22),
        },
        android: {
          lineHeight: scaleHeight(20),
        },
      }),
    },
    collectionInfo: {
      flex: 1,
    },
    collectionTitle: {
      ...getFont(EFontWeight.Medium),
      fontSize: scaleHeight(16),
      color: Colors.TextColor.MainColor,
    },
    collectionTitle__dark: {
      ...getFont(EFontWeight.Medium),
      fontSize: scaleHeight(16),
      color: "#FFFFFF",
    },
    collectionCount: {
      ...getFont(EFontWeight.Regular),
      fontSize: scaleHeight(14),
      color: Colors.TextColor.SecondaryColor,
      marginLeft: scaleWidth(4),
    },
    collectionCount__dark: {
      ...getFont(EFontWeight.Regular),
      fontSize: scaleHeight(14),
      color: "#8F8F8F",
      marginLeft: scaleWidth(4),
    },
    separator: {
      height: 1,
      backgroundColor: Colors.OtherColor.InputGrayBorder,
    },
    separator__dark: {
      height: 1,
      backgroundColor: "#262626",
    },
    section: {
      marginBottom: scaleHeight(24),
    },
    sectionTitle: {
      ...getFont(EFontWeight.SemiBold),
      fontSize: scaleHeight(14),
      color: Colors.TextColor.SecondaryColor,
      marginBottom: scaleHeight(8),
      // textTransform: "uppercase",
    },
    sectionTitle__dark: {
      ...getFont(EFontWeight.SemiBold),
      fontSize: scaleHeight(14),
      color: "#8EACB7",
      marginBottom: scaleHeight(8),
      // textTransform: "uppercase",
    },
    listContentContainer: {
      paddingBottom: scaleHeight(24),
    },
    emojiContainer: {
      width: scaleWidth(32),
      height: scaleHeight(32),
      justifyContent: "center",
      alignItems: "center",
    }
  });

  return (
    <SafeAreaView style={isDark ? localStyles.container__dark : localStyles.container}>
      <Animated.View style={[animViewStyle]}>
        <View style={localStyles.header}>
          <View style={localStyles.headerInfo}>
            <Text style={isDark ? localStyles.title__dark : localStyles.title}>Collections</Text>
            <Text style={isDark ? localStyles.text__dark : localStyles.text}>Browse your collections</Text>
          </View>

          <View style={localStyles.addButton}>
            <TouchableOpacity
              onPress={onAddCollectionPress}
              style={[localStyles.addButton, localStyles.addButtonWrapper]}
            >
              <AntDesign name="plus" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={localStyles.searchContainer}>
          <View style={isDark ? localStyles.searchWrapper__dark : localStyles.searchWrapper}>
            <AntDesign
              name="search1"
              size={16}
              color={isDark ? "#8F8F8F" : "#666"}
              style={localStyles.searchIcon}
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search collections..."
              placeholderTextColor={isDark ? "#8F8F8F" : "#666"}
              style={isDark ? localStyles.searchInput__dark : localStyles.searchInput}
            />
          </View>
        </View>

        {workspaceLoading || allLoading ? (
          <View style={localStyles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.TextColor.LignMainColor} />
          </View>
        ) : (
          <FlatList<Section>
            data={renderSections()} // @ts-ignore
            renderItem={({ item }) => renderSection({ item, colorScheme })}
            keyExtractor={(section) => section.title}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={localStyles.listContentContainer}
            extraData={[workspaceId, colorScheme]}
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
