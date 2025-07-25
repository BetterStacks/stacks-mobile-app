import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Image, Text, useColorScheme, View,} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import Animated, {interpolate, useAnimatedStyle, useSharedValue, withTiming,} from "react-native-reanimated";
import {styles} from "@/app/all-links/AllLinksStyles";
import {useLazyQuery, useMutation, useQuery, useReactiveVar,} from "@apollo/client";
import {isNeedRefreshVar, sharedLinkTextVar, userInfoVar, userTokenVar,} from "@/lib/apollo/store";
import {usePagination} from "@/hooks/usePagination";
import {useStacksPagination} from "@/hooks/useStacksPagination";
import {User} from "@/lib/types/User";
import {
  QUERY_DOMAIN_LINKS,
  QUERY_DOMAIN_LINKS_BY_STACKID,
  QUERY_LINKS,
  QUERY_STACK_LINKS,
  QUERY_STACKS,
  QUERY_USER,
} from "@/lib/api/graphql/queries";
import {
  setIsNeedRefresh,
  setIsNewLinkModalShown,
  setIsSuccessModalVisible,
  setSuccessModalMessage,
  setUserInfo,
} from "@/lib/apollo/store/handlers";
import client from "@/lib/apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {SELECTED_WORKSPACE_ID_KEY, SELECTED_WORKSPACE_KEY,} from "@/lib/constants";
import {Link} from "@/lib/types/Link";
import {MUTATION_SUBSCRIBE_NOTIFICATION} from "@/lib/api/graphql/mutations";
import {useIsFocused} from "@react-navigation/native";
import {clearUserInfo} from "@/utils/storage/setToStorage";
import {StacksCarousel} from "@/components/stacksCarousel/stacksCarousel";
import {HomeScreenContent} from "@/components/homeScreenContent/HomeScreenContent";
import {CardLinksList} from "@/components/cardLinkList/CardLinksList";
import {Loader} from "@/components/Loader";
import {MainButton, mainButtonStyles} from "@/components/ui/button";
import {selectStackName} from "@/lib/utils";
import {Stack, useLocalSearchParams} from "expo-router";
import AddLinkView from "@/components/BottomDrawer/AddLinkView";
import FileUploadView from "@/components/FileUploadView";
import BottomSheet, {BottomSheetView} from "@gorhom/bottom-sheet";

export default function AllLinksScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Bottom sheet setup
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '75%'], []);
  
  const params = useLocalSearchParams();
  const withAnnotations = params.withAnnotations === "true";
  const withNotes = params.withNotes === "true";
  const selectedFilter = params.selectedFilter as string | undefined;
  const screenTitle = typeof params.title === 'string' ? params.title : undefined;

  const defaultStack = "All links";
  const defaultDomain = "All";

  const userToken = useReactiveVar(userTokenVar);
  const sharedLinkText = useReactiveVar(sharedLinkTextVar);
  const isNeedRefresh = useReactiveVar(isNeedRefreshVar);
  const [repositoryId, setRepositoryId] = useState<string | null>(null);
  const [selectedStack, setSelectedStack] = useState(defaultStack);
  const [selectedDomain, setSelectedDomain] = useState(defaultDomain);
  const [isBottomModalVisible, setIsBottomModalVisible] = useState(false);
  const targetDomain = selectedDomain === defaultDomain ? "" : selectedDomain;
  const [isUserFetched, setIsUserFetched] = useState(false);
  const { isLoadMoreAvailable, page, setPage } = usePagination(targetDomain);
  const {
    isLoadMoreAvailable: isLoadMoreStacksAvailiable,
    page: stacksPage,
    setPage: setStackPage,
  } = useStacksPagination(targetDomain, selectedStack);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [getUser, { data: userData, loading: userLoading }] = useLazyQuery<{
    user: User;
  }>(QUERY_USER, {
    onCompleted: () => {
      if (userData) {
        setUserInfo(userData.user);
      }

      setIsUserFetched(true);

      client.refetchQueries({
        include: ["QUERY_LINKS", "QUERY_DOMAIN_LINKS"],
      });
    },
  });

  const { data: stacksData, loading: stacksLoading } = useQuery(QUERY_STACKS);

  const stackID = useMemo(
    () =>
      stacksData && selectedStack !== defaultStack
        ? stacksData.stacks.find(
            (stack: any) => stack.name === selectedStack.toLowerCase(),
          ).id
        : null,
    [selectedStack, stacksData],
  );

  const {
    data: linksData,
    loading: linksLoading,
    error,
    fetchMore,
    refetch,
  } = useQuery(QUERY_LINKS, {
    skip: selectedStack !== defaultStack,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    variables: {
      page: 1,
      domain: targetDomain,
      repositoryId: repositoryId || undefined,
      withAnnotations,
      withNotes,
    },
  });

  const {
    data: stackLinksData,
    loading: stackLinksLoading,
    refetch: stacksRefetch,
    fetchMore: fetchMoreStacks,
  } = useQuery(QUERY_STACK_LINKS, {
    skip: stackID === null,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    variables: {
      stackID,
      page,
      domain: targetDomain,
      repositoryId: repositoryId || undefined,
    },
  });

  useEffect(() => {
    getUser();
  }, [getUser, userToken]);

  useEffect(() => {
    const loadRepositoryId = async () => {
      try {
        const storedId = await AsyncStorage.getItem(SELECTED_WORKSPACE_ID_KEY);
        const newRepositoryId = storedId && storedId !== "" ? storedId : null;

        if (repositoryId !== newRepositoryId) {
          setRepositoryId(newRepositoryId);
          setPage(1);
          setStackPage(1);

          if (selectedStack === defaultStack) {
            refetch({
              page: 1,
              domain: targetDomain,
              repositoryId: newRepositoryId || undefined,
            });
          } else if (stackID) {
            stacksRefetch({
              page: 1,
              domain: targetDomain,
              stackID,
              repositoryId: newRepositoryId || undefined,
            });
          }
        }
      } catch (err) {
        console.error("Error loading repository ID:", err);
        setRepositoryId(null);
      }
    };

    loadRepositoryId();
  }, [
    selectedStack,
    stackID,
    targetDomain,
    refetch,
    stacksRefetch,
    setPage,
    setStackPage,
    repositoryId,
  ]);

  const { data: domainsData, loading: domainsLoading } = useQuery(
    QUERY_DOMAIN_LINKS,
    {
      skip: stackID !== null,
    },
  );

  const { data: stackDomainsData, loading: stackDomainsLoading } = useQuery(
    QUERY_DOMAIN_LINKS_BY_STACKID,
    {
      skip: stackID === null,
      variables: {
        stackID,
      },
    },
  );

  const onEndReached = useCallback(() => {
    if (linksLoading) {
      return;
    }

    const newPage = page + 1;
    // loads more links, merges them into cash and increments page
    fetchMore({
      variables: {
        page: newPage,
        domain: targetDomain,
        repositoryId: repositoryId,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        setPage(newPage);
        if (!fetchMoreResult) return prev;
        if (
          prev &&
          prev.links.find((el: Link) =>
            fetchMoreResult.links.find((newEl: Link) => {
              if (el.id === newEl.id) {
                console.log(el.id);
              }

              return el.id === newEl.id;
            }),
          )
        ) {
          console.log("YESESESE");

          return prev;
        }

        return Object.assign({}, prev, {
          links: [...prev.links, ...fetchMoreResult.links],
        });
      },
    });
  }, [page, fetchMore, targetDomain, setPage, linksLoading, repositoryId]);

  const onStacksEndReached = () => {
    const newPage = stacksPage + 1;
    // loads more links, merges them into cash and increments page
    fetchMoreStacks({
      variables: {
        page: newPage,
        domain: targetDomain || "",
        stackID,
        repositoryId: repositoryId || undefined,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        setStackPage(newPage);
        if (!fetchMoreResult) return prev;
        if (
          prev &&
          prev.stack.links.find((el: Link) =>
            fetchMoreResult.links.find((newEl: Link) => {
              if (el.id === newEl.id) {
                console.log(el.id);
              }

              return el.id === newEl.id;
            }),
          )
        ) {

          return prev;
        }

        return Object.assign({}, prev, {
          stack: {
            ...prev.stack,
            links: [...prev.stack.links, ...fetchMoreResult.stack.links],
          },
        });
      },
    });
  };

  const userInfo = useReactiveVar(userInfoVar);
  const [subscribeNotification] = useMutation(MUTATION_SUBSCRIBE_NOTIFICATION);

  // const requestUserPermission = useCallback(async () => {
  //   if (metrics.isAndroid) {
  //     await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  //     );
  //   }
  //   const authStatus = await messaging().requestPermission();
  //   const token = await messaging().getToken();
  //   const enabled =
  //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //   if (enabled) {
  //     console.log("Authorization status:", authStatus);

  //     if (!userInfo.is_notification_enabled) {
  //       console.log("Notifications enabled");
  //       subscribeNotification({
  //         variables: {
  //           token,
  //           device_type: metrics.isAndroid ? "android" : "ios",
  //         },
  //       }).then(() => {
  //         setUserInfo({ ...userInfo, is_notification_enabled: true });
  //       });
  //     }
  //   }
  // }, [userInfo, subscribeNotification]);

  // useEffect(() => {
  //   if (isUserFetched) {
  //     requestUserPermission();
  //   }
  // }, [isUserFetched, requestUserPermission]);

  const sharedValue = useSharedValue(0);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      sharedValue.value = withTiming(1);
    } else {
      sharedValue.value = 0;
    }
  }, [isFocused, sharedValue]);

  useEffect(() => {
    if (isFocused) {
      if (sharedLinkText) {
        setIsNewLinkModalShown(true, sharedLinkText, true);
      }
    }
  }, [isFocused, sharedLinkText]);

  const animViewStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(sharedValue.value, [0, 1], [0, 1]),
    };
  });

  const handleStackPressed = useCallback((title: string) => {
    setSelectedStack(title);
  }, []);

  const handleDomainChange = useCallback((domain: string) => {
    setSelectedDomain(domain);
  }, []);

  const showNewLinkModal = useCallback(() => {
    setIsNewLinkModalShown(true);
  }, []);

  useEffect(() => {
    console.log(error);

    if (error?.message === "Sign In again") {
      clearUserInfo();
    }
  }, [error]);

  const isAnyLoading = useMemo(
    () =>
      linksLoading ||
      stackLinksLoading ||
      domainsLoading ||
      stackDomainsLoading ||
      stacksLoading ||
      userLoading,
    [
      domainsLoading,
      linksLoading,
      stackLinksLoading,
      stackDomainsLoading,
      stacksLoading,
      userLoading,
    ],
  );

  const handleToggleBottomSheet = useCallback(() => {
    if (isBottomModalVisible) {
      bottomSheetRef.current?.close();
      setIsBottomModalVisible(false);
    } else {
      setIsBottomModalVisible(true);
      bottomSheetRef.current?.expand();
    }
  }, [isBottomModalVisible]);

  const isNoData = useMemo(() => {
    if (isAnyLoading || linksLoading || stackLinksLoading) {
      return false;
    }

    if (selectedStack === defaultStack) {
      return !linksData || linksData.links.length === 0;
    }

    return (
      !stackLinksData ||
      !stackLinksData.stack ||
      stackLinksData.stack.links.length === 0
    );
  }, [
    isAnyLoading,
    linksLoading,
    stackLinksLoading,
    linksData,
    stackLinksData,
    selectedStack,
  ]);

  useEffect(() => {
    // console.log("isNoData", isNoData);
  }, [isNoData]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);

    if (
      selectedStack &&
      selectedStack !== "Places" &&
      selectedStack !== defaultStack
    ) {
      stacksRefetch({
        page: 1,
        domain: targetDomain,
        stackID,
        repositoryId: repositoryId || undefined,
      }).finally(() => {
        setIsRefreshing(false);
        setStackPage(1);
      });
    } else {
      refetch({
        page: 1,
        domain: targetDomain,
        repositoryId: repositoryId || undefined,
      }).finally(() => {
        setIsRefreshing(false);
        setPage(1);
      });
    }
  }, [
    refetch,
    targetDomain,
    stackID,
    repositoryId,
    selectedStack,
    defaultStack,
    stacksRefetch,
    setPage,
    setStackPage,
  ]);

  useEffect(() => {
    if (isNeedRefresh) {
      onRefresh();

      setIsNeedRefresh(false);
    }
  }, [isNeedRefresh, onRefresh]);

  useEffect(() => {
    if (repositoryId !== undefined) {
      refetch({
        page: 1,
        domain: targetDomain,
        repositoryId: repositoryId || undefined,
      });

      if (stackID) {
        stacksRefetch({
          page: 1,
          domain: targetDomain,
          stackID,
          repositoryId: repositoryId || undefined,
        });
      }
    }
  }, [repositoryId, targetDomain, stackID, refetch, stacksRefetch]);

  const [workspaceName, setWorkspaceName] = useState<string>("All Workspaces");

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

  useEffect(() => {
    // Handle initial filter selection
    if (selectedFilter) {
      switch (selectedFilter) {
        case "media":
          setSelectedStack("Media");
          break;
        case "places":
          setSelectedStack("Places");
          break;
        default:
          setSelectedStack(defaultStack);
      }
    }
  }, [selectedFilter]);

  const handleCloseBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setIsBottomModalVisible(false);
  }, []);

  const handleSuccess = useCallback(
    (message: { title: string; description: string }) => {
      setSuccessModalMessage({
        ...message,
        closeText: "Got it!",
        preventNavigation: true,
      });
      setIsSuccessModalVisible(true);
    },
    [],
  );

  return (
    <>
      <SafeAreaView style={isDark ? styles.container__dark : styles.container} edges={['bottom', 'left', 'right']}>
        <Stack.Screen
          options={{
            title: screenTitle || selectedStack || "All Links",
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
        <Animated.View style={[isDark ? styles.container__dark : styles.container, animViewStyle]}>
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
          {selectedStack === "Places" ? (
            <>
              <StacksCarousel
                onPress={handleStackPressed}
                selectedStack={selectedStack}
                containerStyles={[styles.carouselContainer, styles.placesStacks]}
                // @ts-ignore
                colorScheme={colorScheme}
              />

              <HomeScreenContent
                contentContainer={[styles.contentContainer, styles.placesContent]}
                selectedStack={selectedStack}
                // @ts-ignore
                colorScheme={colorScheme}
              />
            </>
          ) : (
            <>
              {!isAnyLoading && !isNoData && (
                <CardLinksList
                  showList={true}
                  header={
                    <>
                      {/* <StacksCarousel
                           onPress={handleStackPressed}
                           selectedStack={selectedStack}
                           containerStyles={styles.carouselContainer}
                         /> */}
                      {/* {!isNoData && selectedStack !== "Places" && (
                        <PopularSitesSection
                          containerStyles={styles.popularSitesContainer}
                          selectedDomain={selectedDomain}
                          data={
                            (domainsData && domainsData.domain_links_count) ||
                            (stackDomainsData && stackDomainsData.domain_links_count)
                          }
                          onPress={handleDomainChange}
                        />
                      )} */}
                      <HomeScreenContent
                        contentContainer={styles.contentContainer}
                        selectedStack={selectedStack}
                        // @ts-ignore
                        colorScheme={colorScheme}
                      />
                    </>
                  }
                  onEndReached={
                    selectedStack &&
                    selectedStack !== "Places" &&
                    selectedStack !== defaultStack
                      ? onStacksEndReached
                      : onEndReached
                  }
                  currentPage={
                    selectedStack &&
                    selectedStack !== "Places" &&
                    selectedStack !== defaultStack
                      ? stacksPage
                      : page
                  }
                  style={styles.linksContainer}
                  isLoadMoreAvailable={
                    selectedStack &&
                    selectedStack !== "Places" &&
                    selectedStack !== defaultStack
                      ? isLoadMoreStacksAvailiable
                      : isLoadMoreAvailable
                  }
                  onRefresh={onRefresh}
                  isRefreshing={isRefreshing}
                  links={
                    selectedStack === defaultStack
                      ? linksData?.links || []
                      : stackLinksData?.stack?.links || []
                  }
                  colorScheme={colorScheme}
                />
              )}
            </>
          )}

          {isAnyLoading && selectedStack !== "Places" && (
            <View style={styles.loaderContainer}>
              <Loader />
            </View>
          )}

          {/* {selectedStack === "Places" && <PlacesMap />} */}

          {isNoData && selectedStack !== "Places" && !isAnyLoading && (
            <View style={styles.emptyContent}>
              <Image
                source={require("@/assets/png/HomeScreenImage.png")}
                // resizeMode={FastImage.resizeMode.contain}
                style={styles.image}
              />

              <Text style={isDark ? styles.noLinksTitle__dark : styles.noLinksTitle}>
                You haven't got recently saved items
              </Text>

              <Text style={isDark ? styles.noLinksText__dark : styles.noLinksText}>
                You haven't got recently saved items
              </Text>

              <View style={styles.buttonContainer}>
                <MainButton.Primary onPress={handleToggleBottomSheet}>
                  <Text style={mainButtonStyles.primary.buttonText}>
                    + Add your first {selectStackName(selectedStack)}
                  </Text>
                </MainButton.Primary>
              </View>
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
      
      {isBottomModalVisible && (
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          onClose={handleCloseBottomSheet}
          enablePanDownToClose={true}
          backgroundStyle={{
            backgroundColor: isDark ? "#171717" : "#FFFFFF",
          }}
          handleIndicatorStyle={{
            backgroundColor: isDark ? "#333333" : "#E5E5E5",
          }}
        >
          <BottomSheetView style={{ flex: 1, padding: 16 }}>
            {selectedStack === "Media" ? (
              <FileUploadView
                onBack={handleCloseBottomSheet}
                onClose={handleCloseBottomSheet}
                onSuccess={handleSuccess}
                fileType="media"
              />
            ) : (
              <AddLinkView
                onBack={handleCloseBottomSheet}
                onClose={handleCloseBottomSheet}
                onSuccess={handleSuccess}
              />
            )}
          </BottomSheetView>
        </BottomSheet>
      )}
    </>
  );
}
