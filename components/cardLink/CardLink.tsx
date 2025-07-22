import {Link} from "@/lib/types/Link";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {ColorSchemeName, Image, Linking, Pressable, Text, useColorScheme, View, ViewToken,} from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {Easing, useAnimatedStyle, withDelay, withTiming,} from "react-native-reanimated";
import {styles} from "./CardLinkStyles";
import {StacksList} from "./StacksList/StacksList";
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import {Audio} from 'expo-av';

import BottomDrawer from "../BottomDrawer/BottomDrawer";
import EditLinkView from "../BottomDrawer/EditLinkView";
import {useRouter} from "expo-router";
import {reviewTriggerService} from "@/lib/services/reviewTriggerService";

// Static variable to track the currently playing note
let currentlyPlayingCard: string | null = null;

function getFileExtension(url: string) {
  // Get the last part of the URL after the last dot
  const parts = url.split(".");
  if (parts.length > 1) {
    return parts[parts.length - 1];
  }
  return "";
}

type Props = {
  link: Link;
  viewableItems: Animated.SharedValue<ViewToken[]>;
  setPdfViewerVisible?: (a: string) => void;
  setVideoPlayerUri?: (a: string) => void;
  setImageUri?: (a: string) => void;
  colorScheme?: ColorSchemeName;
  showBorder?: boolean;
  disableTouchEffect?: boolean;
  uniformHeight?: boolean;
  isSearchResult?: boolean;
};

const videoTypes = ["mp4", "mov", "wmv", "avi", "mkv", "webm"];
const fileTypes = ["doc", "docx", "ppt", "pptx", "xls", "xlsx", "pdf"];
const imgTypes = ["jpg", "jpeg", "png", "gif", "ico", "webp"];

export const CardLink: React.FC<Props> = ({
  link,
  viewableItems,
  setPdfViewerVisible = () => null,
  setVideoPlayerUri = () => null,
  setImageUri = () => null,
  isSearchResult = false,
  colorScheme: propColorScheme,
  showBorder = true,
  disableTouchEffect = false,
  uniformHeight = false,
}) => {
  const deviceColorScheme = useColorScheme();
  const colorScheme = propColorScheme || deviceColorScheme;
  const isDark = colorScheme === 'dark';

  const [isDetailsOpenned, setIsDetailsOpenned] = useState(false);
  const [readerVisible, setReaderVisible] = useState(false);
  const [_isLoading, setIsLoading] = useState(false);
  // const elapsedTime = calculateElapsedTime(link.created_at);
  const [articleText, setArticleText] = useState("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  
  // Voice note state
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const playbackPositionRef = useRef(0);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPlaybackFinished = useRef(false);
  const isMounted = useRef(true);

  const router = useRouter();

  // const { isPlaying, ttsReady, toggleSpeech } = useTTS({
  //   title: link.title,
  //   articleText,
  // });

  const toggleDetails = useCallback(() => {
    setIsDetailsOpenned((prev) => !prev);
  }, []);
  const targetUrl = link.target_url;

  const handleOpenLink = useCallback(async () => {
    // Track search result interaction if this is a search result
    if (isSearchResult) {
      await reviewTriggerService.trackSearchResultInteraction();
    }

    // Don't open voice notes with external links
    if (link.is_voice_note) {
      return;
    }
    
    const extension = getFileExtension(targetUrl);
    if (fileTypes.includes(extension)) {
      setPdfViewerVisible(targetUrl);
      return;
    }
    if (videoTypes.includes(extension)) {
      setVideoPlayerUri(targetUrl);
      return;
    }
    if (imgTypes.includes(extension)) {
      setImageUri(targetUrl);
      return;
    }
    if (isUserPage) {
      router.push(`/dashboard/pages/${link.user_page.id}`);
      return;
    }
    Linking.openURL(targetUrl);
  }, [targetUrl, setPdfViewerVisible, setVideoPlayerUri, setImageUri, link.is_voice_note, isSearchResult]);

  const handleReaderPress = useCallback((e: any) => {
    e.stopPropagation();
    setReaderVisible(true);
  }, []);

  const handleReaderClose = useCallback(() => {
    setReaderVisible(false);
  }, []);

  const handleOpenWebView = useCallback((e: any) => {
    e.stopPropagation();
    // Navigate to the web view screen with the link's URL
    router.push({
      pathname: '/web-view',
      params: { 
        url: encodeURIComponent(link.target_url),
        title: encodeURIComponent(link.title || 'Web View')
      }
    });
  }, [link, router]);

  // Animation
  const rStyle = useAnimatedStyle(() => {
    const targetValue = viewableItems.value
      .filter((item) => item.isViewable)
      .find((viewableItem) => viewableItem.item.id === link.id);

    const isVisible = Boolean(targetValue);
    const currentIndex = viewableItems.value.findIndex((el) => {
      if (targetValue) {
        return el.index === targetValue.index;
      } else {
        return -1;
      }
    });

    const delay = currentIndex > 0 ? 20 * currentIndex : 0;

    return {
      opacity: withDelay(delay + 20, withTiming(isVisible ? 1 : 0)),
      transform: [
        {
          scale: withDelay(
            delay,
            withTiming(isVisible ? 1 : 0.7, {
              easing: Easing.linear,
            }),
          ),
        },
      ],
    };
  }, []);

  // const handleWebViewMessage = (event: WebViewMessageEvent) => {
  //   try {
  //     const text = event.nativeEvent.data;
  //     setArticleText(text);
  //   } catch (err) {
  //     Alert.alert("Error", "Failed to process article content");
  //   }
  // };

  // const handleWebViewLoad = () => {
  //   webViewRef.current?.injectJavaScript(extractTextScript);
  //   setIsLoading(false);
  // };

  // const webViewRef = useRef<WebView>(null);

  const handleEditPress = () => {
    handleReaderClose();
    setIsEditModalVisible(true);
  };

  const handleLongPress = useCallback(() => {
    setIsEditModalVisible(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalVisible(false);
  }, []);

  const handleEditSuccess = useCallback(
    (message: { title: string; description: string }) => {
      setIsEditModalVisible(false);
    },
    [],
  );

  // Minimal, clean menu button style
  const menuButtonStyle = {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 10,
  };

  const isUserPage = link.is_user_page

  // Format time for audio playback display
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Component lifecycle - set mounted flag
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (currentlyPlayingCard === link.id) {
        currentlyPlayingCard = null;
      }
      stopAndUnloadSound(); // Clean up on unmount
    };
  }, []);
  
  // Stop any playback if this card is unmounted while playing
  useEffect(() => {
    return () => {
      if (sound) {
        stopAndUnloadSound();
      }
    };
  }, [sound]);

  // Helper for fully resetting the player state
  const fullResetPlayerState = () => {
    setIsPlaying(false);
    setPlaybackPosition(0);
    setSound(null);
    isPlaybackFinished.current = false;
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
    if (currentlyPlayingCard === link.id) {
      currentlyPlayingCard = null;
    }
  };

  const stopAndUnloadSound = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        fullResetPlayerState();
      } catch (error) {
        console.error("Error unloading sound", error);
        fullResetPlayerState(); // Reset state even if there's an error
      }
    }
  };

  const stopPlayback = async () => {
    if (sound) {
      try {
        // Stop playback and reset position
        await sound.stopAsync();
        await sound.setPositionAsync(0);
        setIsPlaying(false);
        setPlaybackPosition(0);
        isPlaybackFinished.current = false;
        
        if (playbackIntervalRef.current) {
          clearInterval(playbackIntervalRef.current);
          playbackIntervalRef.current = null;
        }
      } catch (error) {
        console.error("Error stopping playback", error);
        fullResetPlayerState(); // Reset state even if there's an error
      }
    }
  };

  const pausePlayback = async () => {
    if (sound && isPlaying) {
      try {
        await sound.pauseAsync();
        setIsPlaying(false);
        
        if (playbackIntervalRef.current) {
          clearInterval(playbackIntervalRef.current);
          playbackIntervalRef.current = null;
        }
      } catch (error) {
        console.error("Error pausing playback", error);
      }
    }
  };

  // Stop any currently playing note before starting a new one
  const stopCurrentlyPlayingNote = async () => {
    if (currentlyPlayingCard && currentlyPlayingCard !== link.id) {
      // A different note is playing - we need to stop it
      // This is a static flag - the actual stopping will be handled
      // by the component that owns that sound
      currentlyPlayingCard = null;
      
      // Give a brief moment for the other component to detect the change
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };

  // Check if we should stop due to another note starting
  useEffect(() => {
    const checkIfShouldStop = () => {
      if (sound && isPlaying && currentlyPlayingCard !== link.id) {
        stopAndUnloadSound();
      }
    };
    
    // Set up a periodic check
    const checkInterval = setInterval(checkIfShouldStop, 300);
    
    return () => {
      clearInterval(checkInterval);
    };
  }, [sound, isPlaying, link.id]);

  const startPlayback = async () => {
    if (!link.is_voice_note || !link.target_url) return;
    
    try {
      // Stop any other playing notes first
      await stopCurrentlyPlayingNote();
      
      // Register this note as the currently playing one
      currentlyPlayingCard = link.id;
      
      // Reset the finished flag
      isPlaybackFinished.current = false;
      
      if (sound) {
        // For existing sound, reset position before playing
        await sound.setPositionAsync(0);
        await sound.playAsync();
        setIsPlaying(true);
        setPlaybackPosition(0);
        startPlaybackPositionTracking();
      } else {
        // Load and play for the first time
        try {
          setIsPlaying(true); // Set loading state
          
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: link.target_url },
            { shouldPlay: true },
            (status) => {
              if (!isMounted.current) return;
              
              if (status.isLoaded) {
                // Update duration and handle playback completion
                setPlaybackDuration(status.durationMillis || 0);
                
                if (status.didJustFinish) {
                  isPlaybackFinished.current = true;
                  
                  // Use setTimeout to ensure this runs after the status update
                  setTimeout(() => {
                    if (isMounted.current) {
                      setIsPlaying(false);
                      setPlaybackPosition(0);
                      
                      if (playbackIntervalRef.current) {
                        clearInterval(playbackIntervalRef.current);
                        playbackIntervalRef.current = null;
                      }
                    }
                  }, 50);
                }
              }
            }
          );
          
          setSound(newSound);
          updatePlaybackStatus(); // Get initial duration
          startPlaybackPositionTracking();
        } catch (error) {
          console.error("Error loading sound:", error);
          setIsPlaying(false);
          currentlyPlayingCard = null;
        }
      }
    } catch (error) {
      console.error("Error starting playback", error);
      setIsPlaying(false);
      currentlyPlayingCard = null;
    }
  };

  const togglePlayback = async () => {
    if (isPlaying) {
      await pausePlayback();
    } else {
      await startPlayback();
    }
  };

  const updatePlaybackStatus = async () => {
    if (!sound || !isMounted.current) return;
    
    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        // Only update position if not finished (to avoid jumping back to 0)
        if (!isPlaybackFinished.current) {
          setPlaybackPosition(status.positionMillis);
        }
        setPlaybackDuration(status.durationMillis || 0);
        
        // Handle case where playback reaches the end
        if (status.didJustFinish) {
          isPlaybackFinished.current = true;
          setIsPlaying(false);
          setPlaybackPosition(0);
          
          if (playbackIntervalRef.current) {
            clearInterval(playbackIntervalRef.current);
            playbackIntervalRef.current = null;
          }
        }
        
        // Also check if we need to stop due to another note playing
        if (isPlaying && currentlyPlayingCard !== link.id) {
          stopAndUnloadSound();
        }
      }
    } catch (error) {
      console.error("Error getting playback status", error);
    }
  };

  const startPlaybackPositionTracking = () => {
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
    }
    
    // More frequent updates for better accuracy
    playbackIntervalRef.current = setInterval(updatePlaybackStatus, 100);
  };

  // Create container style based on showBorder prop
  const containerStyle = [
    isDark ? styles.container__dark : styles.container,
    !showBorder && { borderBottomWidth: 0 },
    rStyle
  ];

  // Create content container style with uniform height if needed
  const contentContainerStyle = [
    isDark ? styles.contentContainer__dark : styles.contentContainer,
    uniformHeight && { height: 400 } // Set a fixed height when uniformHeight is true
  ];

  // Create content style with full height if uniform height is enabled
  const contentStyle = [
    isDark ? styles.content__dark : styles.content,
    uniformHeight && { height: '100%' }
  ];

  // Render different content for voice notes
  const renderVoiceNoteContent = () => {
    return (
      <View style={isDark ? [styles.content__dark, { padding: 0 }] : [styles.content, { padding: 0 }]}>
        <View style={{ width: '100%' }}>
          {/* Voice note header */}
          <View style={{ padding: 16, paddingBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={styles.voiceNoteHeader}>
                <View style={styles.voiceNoteIcon}>
                  <Feather name="mic" size={18} color={isDark ? "#d1d5db" : "#4b5563"} />
                </View>
                <Text style={[
                  styles.voiceNoteHeaderText,
                  isDark && { color: '#d1d5db' }
                ]}>
                  Voice Note
                </Text>
                
                {/* Show duration next to Voice Note label if available */}
                {playbackDuration > 0 && (
                  <Text style={[
                    styles.timeText,
                    { marginLeft: 8, fontSize: 12 },
                    isDark && { color: '#a3a3a3' }
                  ]}>
                    ({formatTime(playbackDuration)})
                  </Text>
                )}
              </View>
              
              <Pressable
                onPress={handleLongPress}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Entypo name="dots-three-vertical" size={16} color={isDark ? "#d1d5db" : "#6b7280"} />
              </Pressable>
            </View>

            <Text numberOfLines={2} style={[
              isDark ? styles.linkTitle__dark : styles.linkTitle, 
              { marginTop: 8, marginBottom: 0 }
            ]}>
              {link.title || "Voice Recording"}
            </Text>
          </View>

          {/* Playback controls */}
          <View style={{ 
            alignItems: 'center', 
            justifyContent: 'center',
            paddingVertical: 24,
            position: 'relative'
          }}>
            {isPlaying ? (
              // When playing: show pause and stop buttons
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Pressable
                  onPress={pausePlayback}
                  style={[
                    styles.playButton, 
                    { width: 64, height: 64, borderRadius: 32, marginRight: 20 },
                    isDark && { backgroundColor: '#525252' }
                  ]}
                >
                  <Feather name="pause" size={28} color="#FFFFFF" />
                </Pressable>
                
                <Pressable
                  onPress={stopPlayback}
                  style={[
                    styles.playButton, 
                    { 
                      width: 64, 
                      height: 64, 
                      borderRadius: 32,
                      backgroundColor: isDark ? '#3f3f46' : '#ef4444'
                    }
                  ]}
                >
                  <Feather name="square" size={22} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : (
              // When not playing: show play button
              <Pressable
                onPress={startPlayback}
                style={[
                  styles.playButton, 
                  { width: 72, height: 72, borderRadius: 36 },
                  isDark && { backgroundColor: '#525252' }
                ]}
              >
                <Feather name="play" size={32} color="#FFFFFF" />
              </Pressable>
            )}
            
            {/* Playback status */}
            <Text style={[
              styles.timeText,
              { marginTop: 16, fontSize: 15, fontWeight: '500' },
              isDark && { color: '#d1d5db' }
            ]}>
              {isPlaying ? "Playing" : playbackPosition > 0 ? "Paused" : "Tap to play"}
            </Text>
          </View>
          
          {/* Notes and collections */}
          <View style={{ padding: 16, paddingTop: 0 }}>
            {link.notes && (
              <View style={styles.noteContainer}>
                <MaterialIcons name="edit-note" size={20} color={isDark ? "#A0A0A0" : "#6b7280"} />
                <Text numberOfLines={2} style={isDark ? styles.linkDescription__dark : styles.linkDescription}>
                  {link.notes}
                </Text>
              </View>
            )}

            <View style={styles.bottomBarButtons}>
              <StacksList
                stacks={link.stacks}
                collections={link.collections}
                colorScheme={colorScheme}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Animated.View style={containerStyle}>
      <Pressable
        style={({pressed}) => [
          contentContainerStyle,
          pressed && !disableTouchEffect && {opacity: 0.2}
        ]}
        onPress={link.is_voice_note ? togglePlayback : handleOpenLink}
        onLongPress={handleLongPress}
        delayLongPress={500}
      >
        {link.is_voice_note ? (
          renderVoiceNoteContent()
        ) : (
          <>
            <View style={isDark ? styles.imageContainer__dark : styles.imageContainer}>
              {link.image_url ? (
                <Image
                  style={styles.image}
                  source={{
                    uri: link.image_url,
                  }}
                />
              ) : (
                <Image
                  style={styles.image}
                  source={require("@/assets/gif/CardImagePlaceholder.gif")}
                />
              )}
              
              {/* Add Book Icon Button for WebView */}
              <Pressable
                style={[
                  styles.webViewButton,
                  isDark ? styles.webViewButton__dark : {}
                ]}
                onPress={handleOpenWebView}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="book-outline" size={16} color={isDark ? "#FFFFFF" : "#333333"} />
              </Pressable>
            </View>

            {/* @ts-ignore */}
            <View style={contentStyle}>
              <View>
                {!link.title && !link.description ? (
                  <View style={styles.iconPlaceholder}>
                    {/* {getIconWithColor(EIconName.Hourglass)} */}
                  </View>
                ) : (
                  <>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text numberOfLines={2} style={[isDark ? styles.linkTitle__dark : styles.linkTitle, { flex: 1, marginRight: 10 }]}>
                        {link.title}
                      </Text>
                      <Pressable
                        onPress={handleLongPress}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                        style={{ alignSelf: 'flex-start', marginTop: 3 }}
                      >
                        <Entypo name="dots-three-vertical" size={16} color="#888" />
                      </Pressable>
                    </View>

                    <View style={styles.urlBox}>
                      {/* <LinkIcon
                        isUserPage={link.is_user_page}
                        isQuickNote={link.is_quick_note}
                        faviconUrl={link.favicon_url}
                      /> */}
                      <Text numberOfLines={1} style={styles.url}>
                        {link.target_url}
                      </Text>
                    </View>

                    <View style={styles.bottomBarButtons}>
                      <StacksList
                        stacks={link.stacks}
                        collections={link.collections}
                        colorScheme={colorScheme}
                      />
                    </View>

                    {link.notes ? (
                      <View style={styles.noteContainer}>
                        <MaterialIcons name="edit-note" size={24} color={isDark ? "#A0A0A0" : "black"} />
                        <Text numberOfLines={2} style={isDark ? styles.linkDescription__dark : styles.linkDescription}>
                          {link.notes}
                        </Text>
                      </View>
                    ) : (
                        <View style={styles.noteContainer}>
                          <Text numberOfLines={2} style={isDark ? styles.linkDescription__dark : styles.linkDescription}>
                            {link.description
                                ? link.description
                                : "No description provided"}
                          </Text>
                        </View>
                    )}
                  </>
                )}
              </View>
            </View>
          </>
        )}
      </Pressable>
      {/* <TouchableOpacity
        style={styles.readerButton}
        onPress={handleReaderPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Book size={20} color="#666666" />
      </TouchableOpacity> */}
      {/* {isDetailsOpenned && (
        <CardDetails onOpenPressed={onOpenPressed} link={link} />
      )} */}
      {/* {      <Modal
        visible={readerVisible}
        animationType="slide"
        onRequestClose={handleReaderClose}
      >
        <View style={styles.readerContainer}>
          <View style={styles.readerHeader}>
            <TouchableOpacity
              style={styles.closeReaderButton}
              onPress={handleReaderClose}
            >
              {getIconWithColor(EIconName.Arrow)}
            </TouchableOpacity>
            <Text numberOfLines={1} style={styles.readerTitle}>
              {link.title}
            </Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditPress}
            >
              <SquarePen
                size={16}
                color={Colors.tailwindColors.neutral["700"]}
              />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <WebView
            ref={webViewRef}
            source={{ uri: targetUrl }}
            style={styles.reader}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={handleWebViewLoad}
            onMessage={handleWebViewMessage}
            startInLoadingState={true}
            renderLoading={() => (
              <ActivityIndicator
                size="large"
                style={styles.loader}
                color={Colors.tailwindColors.neutral["500"]}
              />
            )}
          />

          <TouchableOpacity
            style={styles.ttsButton}
            onPress={toggleSpeech}
            disabled={!ttsReady}>
            {isPlaying ? (
              <Feather name="pause" size={24} color={Colors.tailwindColors.neutral["700"]} />
            ) : (
              <Feather name="play" size={24} color={Colors.tailwindColors.neutral["700"]} />
            )}
          </TouchableOpacity>
        </View>
      </Modal>} */}
      <View>
        <BottomDrawer
          isVisible={isEditModalVisible}
          onClose={handleCloseEditModal}
          customContent={
            <EditLinkView
              link={link}
              onBack={handleCloseEditModal}
              onClose={handleCloseEditModal}
              onSuccess={handleEditSuccess}
            />
          }
        />
      </View>
    </Animated.View>
  );
};
