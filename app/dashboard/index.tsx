import {CategoryItem} from "@/components/dashboard/CategoryItem";
import {QuickActionCard} from "@/components/dashboard/QuickActionCard";
import {WorkspaceSelector} from "@/components/dashboard/WorkspaceSelector";
import {UserAvatar} from "@/components/ui/user-avatar";
import {Colors as colors} from "@/components/design/colors";
import {QUERY_QUICK_LINKS, QUERY_STACKS, QUERY_USER_REPOSITORIES,} from "@/lib/api/graphql/queries";
import {SELECTED_WORKSPACE_ID_KEY, SELECTED_WORKSPACE_KEY,} from "@/lib/constants";
import {useQuery} from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {useEffect, useState} from "react";
import {Text, TouchableOpacity, useColorScheme, View} from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {SafeAreaView} from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import {router} from "expo-router";
import {useIsFocused} from "@react-navigation/native";
import {styles} from "@/components/dashboard/HomeScreenStyles";
import BottomDrawer from "@/components/BottomDrawer/BottomDrawer";
import {StatusBar} from "expo-status-bar";
import {LinearGradient} from 'expo-linear-gradient';
import {Toast} from "toastify-react-native";

export default function DashboardHomeScreen() {
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
  const { data: repositoriesData } = useQuery(QUERY_USER_REPOSITORIES);
  const { data: quickLinksData } = useQuery(QUERY_QUICK_LINKS);
  const { data: stacksData } = useQuery(QUERY_STACKS);

  let colorScheme = useColorScheme()

  const scrollY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);
  const fabAnimation = useSharedValue(1);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentScrollY = event.contentOffset.y;
      if (currentScrollY > lastScrollY.value && currentScrollY > 10) {
        // Scrolling down - hide FAB
        fabAnimation.value = withSpring(0);
      } else {
        // Scrolling up - show FAB
        fabAnimation.value = withSpring(1);
      }
      lastScrollY.value = currentScrollY;
      scrollY.value = currentScrollY;
    },
  });

  const fabStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: fabAnimation.value,
        },
      ],
      opacity: fabAnimation.value,
    };
  });

  const [isBottomDrawerVisible, setIsBottomDrawerVisible] = useState(false);

  useEffect(() => {
    const loadSelectedWorkspace = async () => {
      try {
        const stored = await AsyncStorage.getItem(SELECTED_WORKSPACE_KEY);
        if (stored) {
          setSelectedWorkspace(stored);
          if (stored !== "All Workspaces") {
            const selectedRepo = repositoriesData?.user?.repositories.find(
                (repo: any) => repo.name === stored,
            );
            if (selectedRepo) {
              await AsyncStorage.setItem(
                  SELECTED_WORKSPACE_ID_KEY,
                  selectedRepo.id,
              );
            }
          }
        } else if (repositoriesData?.user?.repositories) {
          const personalRepo = repositoriesData.user.repositories.find(
              (repo: any) => repo.repository_type === "personal",
          );

          if (personalRepo) {
            setSelectedWorkspace(personalRepo.name);
            await AsyncStorage.setItem(
                SELECTED_WORKSPACE_KEY,
                personalRepo.name,
            );
            await AsyncStorage.setItem(
                SELECTED_WORKSPACE_ID_KEY,
                personalRepo.id,
            );
          } else {
            setSelectedWorkspace("All Workspaces");
            await AsyncStorage.setItem(
                SELECTED_WORKSPACE_KEY,
                "All Workspaces",
            );
            await AsyncStorage.setItem(SELECTED_WORKSPACE_ID_KEY, "");
          }
        }
      } catch (error) {
        console.error("Error loading workspace:", error);
      }
    };

    loadSelectedWorkspace();
  }, [repositoriesData]);

  const handleWorkspaceChange = async (workspace: string) => {
    try {
      await AsyncStorage.setItem(SELECTED_WORKSPACE_KEY, workspace);

      if (workspace === "All Workspaces") {
        await AsyncStorage.setItem(SELECTED_WORKSPACE_ID_KEY, "");
      } else {
        const selectedRepo = repositoriesData?.user?.repositories.find(
            (repo: any) => repo.name === workspace,
        );
        if (selectedRepo) {
          const repoId = selectedRepo.id.toString();
          await AsyncStorage.setItem(SELECTED_WORKSPACE_ID_KEY, repoId);
        }
      }

      setSelectedWorkspace(workspace);
    } catch (error) {
      console.error("Error saving workspace:", error);
    }
  };

  const handleAllLinksPress = () => {
    router.push({
      pathname: "/all-links",
      params: {
        withAnnotations: "false",
        withNotes: "false",
      },
    });
  };

  const handleNotesPress = () => {
    // Comment out previous implementation
    // router.push({
    //   pathname: "/all-links",
    //   params: {
    //     withNotes: "true",
    //     title: "Notes"
    //   }
    // });
    
    // Navigate to new quick notes screen
    router.push("/quick-notes" as any);
  };

  const handleHighlightsPress = () => {
    router.push({
      pathname: "/all-links",
      params: {
        withAnnotations: "true",
        title: "Highlights"
      }
    });
  };

  const handleCommentsPress = () => {
    router.push({
      pathname: "/all-links",
      params: {
        withAnnotations: "true",
        title: "Comments"
      }
    });
  };

  // Define quick actions data
  const quickActions = [
    {
      emoji: "🔗",
      title: "All Links",
      count: 10,
      onPress: handleAllLinksPress,
    },
    {
      emoji: "📌",
      title: "Quick Links",
      count: quickLinksData?.quick_links?.length || 0,
      onPress: () => {
        router.push("/quick-links");
      },
    },
    {
      emoji: "📑",
      title: "Quick Notes",
      count: 0,
      onPress: handleNotesPress,
    },
    {
      emoji: "💡",
      title: "Highlights",
      count: 2,
      onPress: handleHighlightsPress,
    },
    {
      emoji: "📂",
      title: "Collections",
      count: 0,
      onPress: () => {
        router.push("/dashboard/collections");
      },
    },
    {
      emoji: "💬",
      title: "Comments",
      count: 0,
      onPress: handleCommentsPress,
    },
  ];

  const handleLinksPress = () => {
    // navigation.navigate(EHomeScreens.AllLinksScreen, {});
    router.push("/all-links");
  };

  const handleMediaPress = () => {
    // navigation.navigate(EHomeScreens.AllLinksScreen, {
    //   title: "Media",
    //   selectedFilter: "media",
    // });
    router.push({
      pathname: "/all-links",
      params: {
        title: "Media",
        selectedFilter: "media"
      }
    });
  };

  const handleArticlesPress = () => {
    // Find the articles stack ID
    const articlesStack = stacksData?.stacks?.find(
      (stack: any) => stack.name === "articles"
    );
    
    if (articlesStack) {
      router.push({
        pathname: "/smart-collections",
        params: {
          stackId: articlesStack.id,
          title: "Articles"
        }
      } as any);
    } else {
      Toast.warn("Articles collection not found");
    }
  };

  const handlePlacesPress = () => {
    // Find the places stack ID
    const placesStack = stacksData?.stacks?.find(
      (stack: any) => stack.name === "places"
    );
    
    if (placesStack) {
      router.push({
        pathname: "/smart-collections",
        params: {
          stackId: placesStack.id,
          title: "Places"
        }
      } as any);
    } else {
      Toast.warn("Places collection not found");
    }
  };

  const categories = [
    {
      emoji: "🔗",
      title: "Links",
      onPress: handleLinksPress,
    },
    {
      emoji: "🎬",
      title: "Media",
      onPress: handleMediaPress,
    },
    {
      emoji: "📍",
      title: "Places",
      onPress: handlePlacesPress,
    },
    {
      emoji: "📄",
      title: "Articles",
      onPress: handleArticlesPress,
    },
    {
      emoji: "📝",
      title: "Quick Notes",
      onPress: handleNotesPress,
    },
    {
      emoji: "✨",
      title: "Highlights",
      onPress: handleHighlightsPress,
    },
    {
      emoji: "💬",
      title: "Comments",
      onPress: handleCommentsPress,
    },
  ];

  const handleSearchPress = () => {
    router.push("/dashboard/search");
  };

  const isFocused = useIsFocused();

  // Add this effect to handle shared links
  // useEffect(() => {
  //   if (isFocused) {
  //     if (sharedLinkText) {
  //       setIsNewLinkModalShown(true, sharedLinkText, true);
  //     }
  //   }
  // }, [isFocused, sharedLinkText]);

  const handleFABPress = () => {
    setIsBottomDrawerVisible(true);
  };

  const handleCloseBottomSheet = () => {
    setIsBottomDrawerVisible(false);
  };

  return (
      <SafeAreaView style={colorScheme === 'light' ? styles.container : styles.container__dark}>
        {isFocused && <StatusBar backgroundColor={colors.TextColor.LignMainColor} style="light" />}
        <View style={colorScheme === 'light' ? styles.container : styles.container__dark}>
          <Animated.ScrollView
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              style={styles.scrollView}
          >
            {/* Header */}
            <View style={styles.header}>
              {/*<Image*/}
              {/*  source={require("@/assets/png/HeaderTop.png")}*/}
              {/*  style={styles.headerBackground}*/}
              {/*  // resizeMode={Image.resizeMode.contain}*/}
              {/*/>*/}
              <LinearGradient
                  colors={[colors.TextColor.LignMainColor, '#074855']} // Main color to a darker shade
                  style={styles.headerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
              />

              <View style={styles.workspaceHeader}>
                <WorkspaceSelector
                    selectedWorkspace={selectedWorkspace}
                    onSelect={handleWorkspaceChange}
                />
                <UserAvatar />
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <TouchableOpacity
                    style={styles.searchBar}
                    onPress={handleSearchPress}
                >
                  <View style={styles.searchIconContainer}>
                    <AntDesign name="search1" size={20} color="#FFFFFF" />
                  </View>
                  <Text style={styles.searchPlaceholder}>
                    Search links, notes, highlights...
                  </Text>
                </TouchableOpacity>
                {/* <TouchableOpacity style={styles.filterButton}>
                <View style={styles.filterIconContainer}>
                  <SlidersHorizontal size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity> */}
              </View>
            </View>

            {/* Quick Actions Section */}
            <View style={styles.section}>
              <Text style={colorScheme === 'light' ? styles.sectionTitle : styles.sectionTitle__dark}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                {quickActions.map((action, index) => (
                    <QuickActionCard
                        key={index}
                        emoji={action.emoji}
                        title={action.title}
                        count={action.count}
                        onPress={action.onPress}
                        colorScheme={colorScheme}
                    />
                ))}
              </View>
            </View>

            {/* Categories Section */}
            <View style={styles.section}>
              <Text style={colorScheme === 'light' ? styles.sectionTitle : styles.sectionTitle__dark}>Categories</Text>
              <View style={colorScheme === 'light' ? styles.categoriesContainer : styles.categoriesContainer__dark}>
                {categories.map((category, index) => (
                    <CategoryItem
                        key={index}
                        emoji={category.emoji}
                        title={category.title}
                        isLast={index === categories.length - 1}
                        onPress={category.onPress}
                        colorScheme={colorScheme}
                    />
                ))}
              </View>
            </View>
          </Animated.ScrollView>

          <Animated.View style={[styles.fab, fabStyle]}>
            <TouchableOpacity style={styles.fabButton} onPress={handleFABPress}>
              <AntDesign name="plus" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </View>
        <View>
          <BottomDrawer
              isVisible={isBottomDrawerVisible}
              onClose={handleCloseBottomSheet}
          />
        </View>
      </SafeAreaView>
  );
}