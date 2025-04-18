import { Link } from "@/lib/types/Link";
import { useCallback, useState, useRef } from "react";
import {
  Linking,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
  Modal,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import FastImage from "react-native-fast-image";
import Animated, {
  Easing,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { styles } from "./CardLinkStyles";
import { getIconWithColor } from "../design/icons/getIconWithColor";
import { EIconName } from "../design/icons/_models";
import { StacksList } from "./StacksList/StacksList";
import React from "react";
import Entypo from '@expo/vector-icons/Entypo';

import BottomDrawer from "../BottomDrawer/BottomDrawer";
import EditLinkView from "../BottomDrawer/EditLinkView";

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
}) => {
  const [isDetailsOpenned, setIsDetailsOpenned] = useState(false);
  const [readerVisible, setReaderVisible] = useState(false);
  const [_isLoading, setIsLoading] = useState(false);
  // const elapsedTime = calculateElapsedTime(link.created_at);
  const [articleText, setArticleText] = useState("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // const { isPlaying, ttsReady, toggleSpeech } = useTTS({
  //   title: link.title,
  //   articleText,
  // });

  const toggleDetails = useCallback(() => {
    setIsDetailsOpenned((prev) => !prev);
  }, []);
  const targetUrl = link.target_url;

  const handleOpenLink = useCallback(() => {
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
    Linking.openURL(targetUrl);
  }, [targetUrl, setPdfViewerVisible, setVideoPlayerUri, setImageUri]);

  const handleReaderPress = useCallback((e: any) => {
    e.stopPropagation();
    setReaderVisible(true);
  }, []);

  const handleReaderClose = useCallback(() => {
    setReaderVisible(false);
  }, []);

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

  return (
    <Animated.View style={[styles.container, rStyle]}>
      <TouchableOpacity
        style={styles.contentContainer}
        onPress={handleOpenLink}
        onLongPress={handleLongPress}
        delayLongPress={500}
      >
        <View style={styles.imageContainer}>
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
        </View>

        <View style={styles.content}>
          <View>
            {!link.title && !link.description ? (
              <View style={styles.iconPlaceholder}>
                {/* {getIconWithColor(EIconName.Hourglass)} */}
              </View>
            ) : (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text numberOfLines={2} style={[styles.linkTitle, { flex: 1, marginRight: 10 }]}>
                    {link.title}
                  </Text>
                  <TouchableOpacity
                    onPress={handleLongPress}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    style={{ alignSelf: 'flex-start', marginTop: 3 }}
                  >
                    <Entypo name="dots-three-vertical" size={16} color="#888" />
                  </TouchableOpacity>
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

                {/* <View style={styles.bottomBarButtons}>
                  <StacksList
                    stacks={link.stacks}
                    collections={link.collections}
                  />
                </View> */}

                {link.notes ? (
                  <Text numberOfLines={2} style={styles.linkDescription}>
                    {link.notes}
                  </Text>
                ) : (
                  <Text numberOfLines={2} style={styles.linkDescription}>
                    {link.description
                      ? link.description
                      : "No description provided"}
                  </Text>
                )}
              </>
            )}
          </View>
          {/*
          <View style={styles.bottomBar}>
            <View style={styles.bottomStyles}>
              <View style={styles.avatarContainer}>
                <FastImage
                  style={styles.avatar}
                  source={{
                    uri:
                      link.user?.profile_image_url ||
                      `${defaultUserPhotoUrl}?seed=${link.user?.email}`,
                    priority: FastImage.priority.normal,
                  }}
                />
              </View>

              <Text style={styles.elapsedTime}>
                {elapsedTime === 0 && "Today"}

                {elapsedTime === 1 && "1 Day ago"}

                {elapsedTime > 1 && `${elapsedTime} Days ago`}
              </Text>
            </View>
          </View> */}
        </View>
      </TouchableOpacity>
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
              <Pause size={24} color={Colors.tailwindColors.neutral["700"]} />
            ) : (
              <Play size={24} color={Colors.tailwindColors.neutral["700"]} />
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
