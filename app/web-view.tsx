import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, useColorScheme, Share } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function WebViewScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const decodedUrl = decodeURIComponent(url);
  const decodedTitle = title ? decodeURIComponent(title) : 'Web View';

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleShare = useCallback(() => {
    Share.share({
      url: decodedUrl,
      title: decodedTitle,
    });
  }, [decodedUrl, decodedTitle]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    webViewRef.current?.reload();
    // We'll reset the refreshing state when the page finishes loading
  }, []);

  const handleNavigationStateChange = useCallback((navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
  }, []);

  return (
    <View style={[
      styles.container,
      isDark ? styles.containerDark : styles.containerLight,
      { paddingTop: insets.top }
    ]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight]}>
        <View style={styles.leftControls}>
          <TouchableOpacity 
            onPress={handleGoBack} 
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={isDark ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>
        </View>
        
        <Text 
          numberOfLines={1} 
          style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}
        >
          {decodedTitle}
        </Text>
        
        <View style={styles.rightControls}>
          <TouchableOpacity 
            onPress={handleShare}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={22} color={isDark ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* WebView with Pull to Refresh */}
      <Animated.View 
        style={[
          styles.webViewContainer,
          isDark ? styles.webViewContainerDark : styles.webViewContainerLight
        ]}
        entering={FadeIn.duration(300)}
      >
        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: decodedUrl }}
          style={styles.webView}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => {
            setLoading(false);
            setRefreshing(false);
          }}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState={true}
          pullToRefreshEnabled={true}
          renderLoading={() => (
            <View style={[
              styles.loadingContainer, 
              isDark ? styles.loadingContainerDark : styles.loadingContainerLight
            ]}>
              <ActivityIndicator
                size="large"
                color={isDark ? "#FFFFFF" : "#000000"}
              />
            </View>
          )}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#171717',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerLight: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#EEEEEE',
  },
  headerDark: {
    backgroundColor: '#171717',
    borderBottomColor: '#333333',
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  disabledButton: {
    opacity: 0.7,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  titleLight: {
    color: '#000000',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  webViewContainer: {
    flex: 1,
  },
  webViewContainerLight: {
    backgroundColor: '#FFFFFF',
  },
  webViewContainerDark: {
    backgroundColor: '#171717',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainerLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingContainerDark: {
    backgroundColor: '#171717',
  },
}); 