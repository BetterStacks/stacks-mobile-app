import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, useColorScheme, Share, Animated as RNAnimated, Pressable, Platform, Image } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInDown, SlideOutDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';

// Extract text script to inject in WebView
const extractTextScript = `
(function() {
  function extractMainContent() {
    try {
      // Remove scripts, styles, etc.
      const elementsToRemove = document.querySelectorAll('script, style, nav, header, footer, aside, [role="complementary"], [role="banner"], [role="navigation"], .nav, .navigation, .menu, .sidebar, .comments, .ad, .ads, .advertisement');
      elementsToRemove.forEach(el => {
        try { el.remove(); } catch(e) {}
      });
      
      // Try to get article content
      let content = '';
      const article = document.querySelector('article') || 
                    document.querySelector('.article') || 
                    document.querySelector('.post') || 
                    document.querySelector('[role="main"]') || 
                    document.querySelector('main');
                    
      if (article) {
        content = article.innerText;
      } else {
        // Fallback to paragraphs
        const paragraphs = document.querySelectorAll('p');
        content = Array.from(paragraphs).map(p => p.innerText).join('\\n\\n');
        
        // If still no content, get all text
        if (!content.trim()) {
          // Get all text nodes directly
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
          );
          
          let textNodes = [];
          let node;
          while (node = walker.nextNode()) {
            const text = node.nodeValue.trim();
            if (text && text.length > 20) { // Only consider substantial text
              textNodes.push(text);
            }
          }
          
          content = textNodes.join('\\n\\n');
          
          // Last resort: just get body text
          if (!content.trim()) {
            content = document.body.innerText;
          }
        }
      }
      
      // Process content to make it more TTS-friendly
      content = content
        .replace(/\\s+/g, ' ')                 // Replace multiple spaces with single space
        .replace(/\\n+/g, '\\n')               // Replace multiple newlines with single newline
        .replace(/([.!?])\\s+/g, '$1\\n')      // Add newlines after sentences for TTS pausing
        .replace(/([\\w])- ([\\w])/g, '$1$2')  // Fix hyphenated words
        .trim();
      
      // Get the title and image
      const title = document.title || '';
      
      // Find main image
      let imageUrl = '';
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && ogImage.content) {
        imageUrl = ogImage.content;
      } else {
        const firstImg = document.querySelector('article img, .post img, main img');
        if (firstImg && firstImg.src) {
          imageUrl = firstImg.src;
        }
      }
      
      // Combine data
      const result = {
        title: title,
        content: content,
        imageUrl: imageUrl
      };
      
      // Send data back to React Native
      window.ReactNativeWebView.postMessage(JSON.stringify(result));
    } catch (error) {
      // Send error information back
      window.ReactNativeWebView.postMessage(JSON.stringify({
        error: 'Error extracting content: ' + error.message
      }));
    }
  }
  
  // Run after a delay to ensure the page is fully loaded
  setTimeout(extractMainContent, 1500);
})();
`;

export default function WebViewScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  
  // TTS states
  const [pageContent, setPageContent] = useState({ title: '', content: '', imageUrl: '' });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsReady, setTtsReady] = useState(false);
  const [showTtsPlayer, setShowTtsPlayer] = useState(false);
  
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const decodedUrl = decodeURIComponent(url);
  const decodedTitle = title ? decodeURIComponent(title) : 'Web View';
  
  // Handle TTS extraction from webpage
  const handleWebViewMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.error) {
        console.error('WebView extraction error:', data.error);
        // Still set ttsReady to true so user can try, but with a fallback message
        setPageContent({
          title: decodedTitle,
          content: 'Sorry, we could not extract content from this page. The page might be protected or use a format we cannot process.',
          imageUrl: `https://www.google.com/s2/favicons?domain=${new URL(decodedUrl).hostname}&sz=128`
        });
        setTtsReady(true);
        return;
      }
      
      if (data.title && data.content) {
        // Process the content to ensure it's TTS-friendly
        let processedContent = data.content;
        
        // If content is too long, truncate it to avoid TTS issues
        const MAX_CHARS = 4000;
        if (processedContent.length > MAX_CHARS) {
          processedContent = processedContent.substring(0, MAX_CHARS) + 
            '... The rest of the content has been truncated for better playback.';
        }
        
        setPageContent({
          ...data,
          content: processedContent
        });
        setTtsReady(true);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
      // Set a fallback in case of parsing error
      setPageContent({
        title: decodedTitle,
        content: 'Sorry, we could not process the content of this page.',
        imageUrl: `https://www.google.com/s2/favicons?domain=${new URL(decodedUrl).hostname}&sz=128`
      });
      setTtsReady(true);
    }
  }, [decodedTitle, decodedUrl]);
  
  // TTS Functionality
  const startSpeaking = useCallback(async () => {
    if (!pageContent.content) return;
    
    try {
      // Stop any existing speech first
      await Speech.stop();
      
      const options = {
        rate: 1.0,
        pitch: 1.0,
        language: 'en-US', // Default to English
      };
      
      // Split long text into paragraphs for more reliable TTS
      const paragraphs = pageContent.content.split('\n');
      let currentIndex = 0;
      
      const speakNextParagraph = async () => {
        if (currentIndex >= paragraphs.length) {
          setIsSpeaking(false);
          return;
        }
        
        let paragraph = paragraphs[currentIndex];
        currentIndex++;
        
        // Skip empty paragraphs
        if (!paragraph.trim()) {
          speakNextParagraph();
          return;
        }
        
        await Speech.speak(paragraph, {
          ...options,
          onStart: () => {
            setIsSpeaking(true);
          },
          onDone: () => {
            // Speak the next paragraph
            speakNextParagraph();
          },
          onStopped: () => {
            setIsSpeaking(false);
          },
          onError: (error) => {
            console.error('TTS Error:', error);
            setIsSpeaking(false);
            // Try to continue with the next paragraph
            speakNextParagraph();
          },
        });
      };
      
      // Start the speaking process
      speakNextParagraph();
      
    } catch (error) {
      console.error('Error with TTS:', error);
      setIsSpeaking(false);
    }
  }, [pageContent.content]);
  
  const stopSpeaking = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
  }, []);
  
  const toggleSpeech = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      startSpeaking();
    }
  }, [isSpeaking, startSpeaking, stopSpeaking]);
  
  const toggleTtsPlayer = useCallback(() => {
    const newState = !showTtsPlayer;
    setShowTtsPlayer(newState);
    
    // Auto-start playing when opening the player
    if (newState && !isSpeaking && ttsReady) {
      setTimeout(startSpeaking, 300); // Slight delay to allow animation to start
    } else if (!newState && isSpeaking) {
      // Stop speaking when closing the player
      stopSpeaking();
    }
  }, [showTtsPlayer, isSpeaking, ttsReady, startSpeaking, stopSpeaking]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

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
  
  const handleWebViewLoad = useCallback(() => {
    // Extract text from the webpage for TTS
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(extractTextScript);
    }
    setLoading(false);
    setRefreshing(false);
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
          
          <TouchableOpacity 
            onPress={toggleTtsPlayer}
            style={[
              styles.iconButton,
              showTtsPlayer ? styles.ttsHeaderButtonActive : { backgroundColor: 'transparent' }
            ]}
            activeOpacity={0.7}
            disabled={!ttsReady}
          >
            <Ionicons 
              name="headset-outline" 
              size={22} 
              color={showTtsPlayer ? (isDark ? "#FFFFFF" : "#000000") : (isDark ? "#FFFFFF" : "#000000")} 
              style={{ opacity: ttsReady ? 1 : 0.3 }}
            />
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
          onLoadEnd={handleWebViewLoad}
          onMessage={handleWebViewMessage}
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
      
      {/* Minimalist TTS Player */}
      {showTtsPlayer && (
        <Animated.View 
          style={[
            styles.ttsContainer,
            {paddingBottom: 0, marginBottom: insets.bottom ? insets.bottom + 16 : 24}
          ]}
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(300)}
        >
          <LinearGradient
            colors={isDark ? ['#222222', '#111111'] : ['#FFFFFF', '#F8F8F8']}
            style={[
              styles.ttsGradient,
              isDark ? styles.ttsGradientDark : styles.ttsGradientLight
            ]}
          >
            <View style={styles.ttsContentRow}>
              {/* Image */}
              {(pageContent.imageUrl || decodedUrl.includes('favicon')) && (
                <View style={styles.ttsImageContainer}>
                  <Image
                    source={{ 
                      uri: pageContent.imageUrl || `https://www.google.com/s2/favicons?domain=${new URL(decodedUrl).hostname}&sz=128` 
                    }}
                    style={styles.ttsImage}
                    resizeMode="cover"
                  />
                </View>
              )}
              
              {/* Title and domain */}
              <View style={styles.ttsInfo}>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.ttsTitle,
                    isDark ? styles.ttsTitleDark : styles.ttsTitleLight
                  ]}
                >
                  {pageContent.title || decodedTitle}
                </Text>
                <Text
                  numberOfLines={1}
                  style={styles.ttsSubtitle}
                >
                  {new URL(decodedUrl).hostname}
                </Text>
              </View>
              
              {/* Play/Pause button directly in the row */}
              <TouchableOpacity
                style={[
                  styles.ttsPlayButton,
                  isDark ? styles.ttsPlayButtonDark : styles.ttsPlayButtonLight
                ]}
                onPress={toggleSpeech}
                activeOpacity={0.7}
              >
                <FontAwesome
                  name={isSpeaking ? "pause" : "play"}
                  size={22}
                  color={"#FFFFFF"}
                  style={isSpeaking ? {} : { marginLeft: 3 }}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      )}
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
  
  // Minimalist TTS Player Styles
  ttsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    overflow: 'hidden',
    borderRadius: 24,
  },
  ttsGradient: {
    borderRadius: 24,
    padding: 16,
    position: 'relative',
  },
  ttsGradientLight: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  ttsGradientDark: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  ttsContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ttsImageContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  ttsImage: {
    width: '100%',
    height: '100%',
  },
  ttsInfo: {
    flex: 1,
    marginRight: 12,
  },
  ttsTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  ttsTitleLight: {
    color: '#000000',
  },
  ttsTitleDark: {
    color: '#FFFFFF',
  },
  ttsSubtitle: {
    fontSize: 13,
    color: '#888888',
  },
  ttsPlayButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ttsPlayButtonLight: {
    backgroundColor: '#666666',
  },
  ttsPlayButtonDark: {
    backgroundColor: '#999999',
  },
  ttsHeaderButtonActive: {
    backgroundColor: 'rgba(120, 120, 120, 0.15)',
  },
}); 