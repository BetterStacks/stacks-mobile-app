import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLazyQuery, useQuery, useReactiveVar } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { styles } from "@/app/smart-collections/SmartCollectionsStyles";
import { QUERY_STACK_DETAILS, QUERY_USER } from "@/lib/api/graphql/queries";
import { SELECTED_WORKSPACE_ID_KEY, SELECTED_WORKSPACE_KEY } from "@/lib/constants";
import { CardLinksList } from "@/components/cardLinkList/CardLinksList";
import { Loader } from "@/components/Loader";
import { isNeedRefreshVar, userTokenVar } from "@/lib/apollo/store";
import { setUserInfo } from "@/lib/apollo/store/handlers";
import { User } from "@/lib/types/User";
import client from "@/lib/apollo/client";
import { useIsFocused } from "@react-navigation/native";

export default function SmartCollectionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isFocused = useIsFocused();
  
  // Get params from the route
  const params = useLocalSearchParams();
  const stackId = params.stackId as string;
  const screenTitle = params.title as string;

  // State
  const [repositoryId, setRepositoryId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUserFetched, setIsUserFetched] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadMoreAvailable, setIsLoadMoreAvailable] = useState(true);
  const [workspaceName, setWorkspaceName] = useState("All Workspaces");
  
  // Use reactive vars
  const userToken = useReactiveVar(userTokenVar);
  const isNeedRefresh = useReactiveVar(isNeedRefreshVar);

  // Load workspace name
  useEffect(() => {
    const loadWorkspaceName = async () => {
      try {
        const name = await AsyncStorage.getItem(SELECTED_WORKSPACE_KEY);
        setWorkspaceName(name || "All Workspaces");
      } catch (err) {
        console.error("Error loading workspace name:", err);
        setWorkspaceName("All Workspaces");
      }
    };

    loadWorkspaceName();
  }, []);

  // Fetch user data
  const [getUser, { data: userData, loading: userLoading }] = useLazyQuery<{
    user: User;
  }>(QUERY_USER, {
    onCompleted: (data) => {
      if (data?.user) {
        setUserInfo(data.user);
      }
      setIsUserFetched(true);
    },
  });

  // Fetch stack details data
  const {
    data: stackData,
    loading: stackLoading,
    refetch: refetchStack,
    fetchMore: fetchMoreStack,
  } = useQuery(QUERY_STACK_DETAILS, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    variables: {
      id: stackId,
      page: 1,
      perPage: 20,
    },
    onCompleted: (data) => {
      // Check if we should enable "load more" based on received data
      if (data?.stack?.links && data.stack.links.length < 20) {
        setIsLoadMoreAvailable(false);
      } else {
        setIsLoadMoreAvailable(true);
      }
    },
  });

  // Get user data on mount
  useEffect(() => {
    if (isFocused) {
      getUser();
    }
  }, [getUser, userToken, isFocused]);

  // Load repository ID from storage
  useEffect(() => {
    const loadRepositoryId = async () => {
      try {
        const storedId = await AsyncStorage.getItem(SELECTED_WORKSPACE_ID_KEY);
        const newRepositoryId = storedId && storedId !== "" ? storedId : null;

        if (repositoryId !== newRepositoryId) {
          setRepositoryId(newRepositoryId);
          setPage(1);

          refetchStack({
            id: stackId,
            page: 1,
            perPage: 20,
          });
        }
      } catch (err) {
        console.error("Error loading repository ID:", err);
        setRepositoryId(null);
      }
    };

    if (isFocused) {
      loadRepositoryId();
    }
  }, [stackId, refetchStack, repositoryId, isFocused]);

  // Handle refresh trigger
  useEffect(() => {
    if (isNeedRefresh && isFocused) {
      onRefresh();
    }
  }, [isNeedRefresh, isFocused]);

  // Refresh data
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPage(1);
    
    refetchStack({
      id: stackId,
      page: 1,
      perPage: 20,
    }).then((result) => {
      // Check if we should enable "load more" based on received data
      if (result?.data?.stack?.links && result.data.stack.links.length < 20) {
        setIsLoadMoreAvailable(false);
      } else {
        setIsLoadMoreAvailable(true);
      }
      
      setIsRefreshing(false);
      
      // Refetch related queries to ensure data is fresh
      client.refetchQueries({
        include: ["QUERY_STACKS"],
      });
    }).catch(() => {
      setIsRefreshing(false);
    });
  }, [stackId, refetchStack]);

  // Handle loading more links
  const onEndReached = useCallback(() => {
    if (stackLoading || !isLoadMoreAvailable) {
      return;
    }

    const newPage = page + 1;
    
    fetchMoreStack({
      variables: {
        id: stackId,
        page: newPage,
        perPage: 20,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult || !fetchMoreResult.stack || !fetchMoreResult.stack.links) {
          setIsLoadMoreAvailable(false);
          return prev;
        }
        
        // Check if we received fewer items than requested
        if (fetchMoreResult.stack.links.length < 20) {
          setIsLoadMoreAvailable(false);
        }
        
        setPage(newPage);
        
        // Handle empty results
        if (fetchMoreResult.stack.links.length === 0) {
          return prev;
        }
        
        // Merge previous and new links, avoiding duplicates
        const prevLinks = prev.stack.links || [];
        const newLinks = fetchMoreResult.stack.links;
        
        // Filter out duplicates
        const combinedLinks = [
          ...prevLinks,
          ...newLinks.filter(
            (newLink: any) => !prevLinks.some((prevLink: any) => prevLink.id === newLink.id)
          )
        ];
        
        return {
          ...prev,
          stack: {
            ...prev.stack,
            links: combinedLinks,
          },
        };
      },
    });
  }, [page, fetchMoreStack, stackId, stackLoading, isLoadMoreAvailable]);

  // Render loading state
  if (stackLoading && !stackData) {
    return (
      <SafeAreaView style={isDark ? styles.container__dark : styles.container} edges={['bottom', 'left', 'right']}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack.Screen 
          options={{
            title: screenTitle || "Smart Collection",
            headerTitleStyle: {
              fontWeight: "bold",
              color: isDark ? "#FFFFFF" : undefined
            },
            headerStyle: {
              backgroundColor: isDark ? "#171717" : undefined
            },
            headerTintColor: isDark ? "#FFFFFF" : undefined
          }}
        />
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      </SafeAreaView>
    );
  }

  // Get links from data
  const links = stackData?.stack?.links || [];
  const stackName = stackData?.stack?.name || "";

  return (
    <SafeAreaView style={isDark ? styles.container__dark : styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack.Screen 
        options={{
          title: screenTitle || stackName || "Smart Collection",
          headerTitleStyle: {
            fontWeight: "bold",
            color: isDark ? "#FFFFFF" : undefined
          },
          headerStyle: {
            backgroundColor: isDark ? "#171717" : undefined
          },
          headerTintColor: isDark ? "#FFFFFF" : undefined
        }}
      />
      
      <View style={isDark ? styles.headerContainer__dark : styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text style={isDark ? styles.headerDescription__dark : styles.headerDescription}>
            You are browsing links from{" "}
          </Text>
          <Text style={isDark ? styles.workspaceName__dark : styles.workspaceName} numberOfLines={1}>
            {workspaceName}
          </Text>
        </View>
      </View>
      
      {links.length === 0 && !stackLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.noLinksTitle, isDark ? styles.noLinksTitle__dark : {}]}>
            No items found
          </Text>
          <Text style={[styles.noLinksText, isDark ? styles.noLinksText__dark : {}]}>
            This collection doesn't have any items yet
          </Text>
        </View>
      ) : (
        <CardLinksList
          links={links}
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
          onEndReached={onEndReached}
          isLoadMoreAvailable={isLoadMoreAvailable}
          currentPage={page}
          showList={true}
          colorScheme={colorScheme}
          style={styles.linksContainer}
        />
      )}
    </SafeAreaView>
  );
} 