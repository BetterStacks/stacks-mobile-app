import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { styles } from "./CollectionsScreenStyle";
import SmallButton from "shared/components/SmallButton";
import { EIconName } from "shared/utils/icons/_models";
import { useQuery } from "@apollo/client";
import { QUERY_COLLECTIONS } from "api/graphql/queries";
import Loader from "shared/components/Loader";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useIsFocused,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import {
  ECollectionsStackScreens,
  TCollectionsStackNavigationProp,
} from "navigation/StackNavigators/CollectionsStacksNavigator/constants";
import { Collection } from "types/Collection";
import {
  EAfterAuthScreens,
  TAfterAuthStackNavigationProp,
} from "navigation/AfterAuthNavigator/constants";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SELECTED_WORKSPACE_ID_KEY } from "shared/constants/storage";
import { Search } from "lucide-react-native";
import { getEmojiFromCode } from "shared/helpers/utilities";

interface Section {
  title: string;
  data: Collection[];
}

interface SectionProps {
  item: Section;
}

interface CollectionItemProps {
  item: Collection;
}

export const CollectionsScreen = () => {
  const navigation = useNavigation<
    TAfterAuthStackNavigationProp & TCollectionsStackNavigationProp
  >();
  const [searchQuery, setSearchQuery] = useState("");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadWorkspaceId = async () => {
        const id = await AsyncStorage.getItem(SELECTED_WORKSPACE_ID_KEY);
        setWorkspaceId(id && id !== "All Workspaces" ? id : null);
      };

      loadWorkspaceId();
    }, []),
  );

  const { data: workspaceCollections, loading: workspaceLoading } = useQuery(
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

  const { data: allCollections, loading: allLoading } = useQuery(
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

  const renderCollectionItem = ({ item: collection }: CollectionItemProps) => (
    <TouchableOpacity
      style={styles.collectionItem}
      onPress={() => handleCollectionPress(collection)}>
      <View style={styles.collectionContent}>
        <View style={styles.emojiContainer}>
          <Text style={styles.collectionEmoji} allowFontScaling={false}>
            {getEmojiFromCode(collection.emoji)}
          </Text>
        </View>
        <View style={styles.collectionInfo}>
          <Text style={styles.collectionTitle}>
            {collection.title}
            <Text style={styles.collectionCount}>
              ({collection.links_count})
            </Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSeparator = () => <View style={styles.separator} />;

  const renderSection = ({ item: section }: SectionProps) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <FlatList
        data={section.data}
        renderItem={renderCollectionItem}
        ItemSeparatorComponent={renderSeparator}
        scrollEnabled={false}
      />
    </View>
  );

  const onAddCollectionPress = useCallback(() => {
    navigation.navigate(EAfterAuthScreens.CreateCollectionScreen);
  }, [navigation]);

  const handleCollectionPress = useCallback(
    (collection: Collection) => {
      navigation.navigate(ECollectionsStackScreens.ParticularCollectionScreen, {
        collectionId: collection.id,
        title: collection.title,
      });
    },
    [navigation],
  );

  return (
    <Animated.View style={[styles.container, animViewStyle]}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Collections</Text>
          <Text style={styles.text}>Browse your collections</Text>
        </View>

        <View style={styles.addButton}>
          <SmallButton
            onPress={onAddCollectionPress}
            iconName={EIconName.WhitePlusIcon}
            additionalStyles={styles.addButton}
          />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Search size={16} color="#666" style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search collections..."
            placeholderTextColor="#666"
            style={styles.searchInput}
          />
        </View>
      </View>

      {workspaceLoading || allLoading ? (
        <Loader />
      ) : (
        <FlatList<Section>
          data={renderSections()}
          renderItem={renderSection}
          keyExtractor={section => section.title}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContentContainer}
          extraData={workspaceId}
        />
      )}
    </Animated.View>
  );
};
