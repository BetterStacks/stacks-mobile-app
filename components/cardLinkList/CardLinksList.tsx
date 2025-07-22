import {Link} from "@/lib/types/Link";
import React, {JSXElementConstructor, ReactElement, useCallback, useEffect, useState,} from "react";
import {
	ActivityIndicator,
	ColorSchemeName,
	FlatList,
	Image,
	Modal,
	RefreshControl,
	StyleProp,
	Text,
	TouchableOpacity,
	useColorScheme,
	View,
	ViewStyle,
	ViewToken,
} from "react-native";
import FastImage from "react-native-fast-image";
import {useSharedValue} from "react-native-reanimated";
import {styles} from "./CardLinksListStyles";
import {getIconWithColor} from "../design/icons/getIconWithColor";
import {EIconName} from "../design/icons/_models";
import metrics from "../design/metrics";
import {CardLink} from "../cardLink/CardLink";

type Props = {
  links: Link[];
  style?: StyleProp<ViewStyle>;
  onEndReached?: () => void;
  isLoadMoreAvailable?: boolean;
  currentPage?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  header?: ReactElement<any, string | JSXElementConstructor<any>>;
  showList?: boolean;
  colorScheme?: ColorSchemeName;
  isSearchResults?: boolean;
};

type FooterProps = {
  isLoadMoreAvailable: boolean;
  currentPage: number;
  colorScheme?: ColorSchemeName;
};

const ListFooter: React.FC<FooterProps> = ({
  isLoadMoreAvailable,
  currentPage,
  colorScheme,
}) => {
  if (isLoadMoreAvailable) {
    return <ActivityIndicator style={styles.indicator} color={colorScheme === 'dark' ? "#8EACB7" : undefined} />;
  }

  if (currentPage > 1) {
    return (
      <Text style={colorScheme === 'dark' ? styles.noLinksText__dark : styles.noLinksText}>
        You have reached the end of result
      </Text>
    );
  }

  return null;
};

export const CardLinksList: React.FC<Props> = ({
  links,
  style,
  onEndReached,
  isLoadMoreAvailable,
  currentPage,
  onRefresh = () => {},
  isRefreshing = false,
  header,
  showList,
  colorScheme: propColorScheme,
  isSearchResults = false,
}) => {
  const deviceColorScheme = useColorScheme();
  const colorScheme = propColorScheme || deviceColorScheme;
  const isDark = colorScheme === 'dark';
  
  const viewableItems = useSharedValue<ViewToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfViewerVisible, setPdfViewerVisible] = useState("");
  const [videoPlayerUri, setVideoPlayerUri] = useState("");
  const [imageUri, setImageUri] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(isLoadMoreAvailable!);
    }, 500);
  }, [isLoadMoreAvailable]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems: vItems }: { viewableItems: ViewToken[] }) => {
      viewableItems.value = vItems;
    },
    [viewableItems],
  );

  return (
    <>
      <FlatList
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={style}
        contentContainerStyle={isDark ? styles.container__dark : styles.container}
        onViewableItemsChanged={onViewableItemsChanged}
        onEndReached={onEndReached}
        data={showList ? links : null}
        bounces
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={onRefresh}
            tintColor={isDark ? "#8EACB7" : undefined}
          />
        }
        ListHeaderComponent={header}
        ListFooterComponent={
          showList ? (
            <ListFooter
              isLoadMoreAvailable={isLoading}
              currentPage={currentPage!}
              colorScheme={colorScheme}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <CardLink
            link={item}
            key={item.id}
            viewableItems={viewableItems}
            setPdfViewerVisible={setPdfViewerVisible}
            setVideoPlayerUri={setVideoPlayerUri}
            setImageUri={setImageUri}
            colorScheme={colorScheme}
            isSearchResult={isSearchResults}
          />
        )}
      />
      <Modal visible={!!imageUri}>
        <TouchableOpacity
          style={styles.btnclose}
          onPress={() => {
            setImageUri("");
          }}
        >
          {getIconWithColor(EIconName.CloseModal, {}, "")}
        </TouchableOpacity>
        <View style={isDark ? styles.imgWrapper__dark : styles.imgWrapper}>
          <View style={styles.loadingSpinerWrapper}>
            <ActivityIndicator size={"large"} color={isDark ? "#8EACB7" : undefined} />
          </View>
          <Image
            style={styles.image}
            source={{ uri: imageUri }}
            resizeMode={FastImage.resizeMode.contain}
          />
          {/* <TouchableOpacity style={styles.shareBtn}>
            {getIconWithColor(EIconName.ShareIcon, {}, "", {
              width: 30,
              height: 30,
            })}
          </TouchableOpacity> */}
        </View>
      </Modal>
      <Modal visible={!!videoPlayerUri}>
        <TouchableOpacity
          style={styles.btnclose}
          onPress={() => {
            setVideoPlayerUri("");
          }}
        >
          {getIconWithColor(EIconName.CloseModal, {}, "", {})}
        </TouchableOpacity>
        {/* <Video
          source={{
            uri: videoPlayerUri,
          }}
          onError={(err) => {
            console.log(err, "error here");
          }}
          style={styles.videoPlayer}
          resizeMode="contain"
        /> */}
      </Modal>
      <Modal visible={!!pdfViewerVisible}>
        {/* <PdfReader
          uri={pdfViewerVisible}
          onClose={() => setPdfViewerVisible("")}
        /> */}
        \\{" "}
      </Modal>
    </>
  );
};

export const BottomSheetList: React.FC<Props> = ({
  links,
  onEndReached,
  isLoadMoreAvailable,
  currentPage,
  colorScheme: propColorScheme,
}) => {
  const deviceColorScheme = useColorScheme();
  const colorScheme = propColorScheme || deviceColorScheme;
  const isDark = colorScheme === 'dark';
  
  const viewableItems = useSharedValue<ViewToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(isLoadMoreAvailable!);
    }, 500);
  }, [isLoadMoreAvailable]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems: vItems }: { viewableItems: ViewToken[] }) => {
      viewableItems.value = vItems;
    },
    [viewableItems],
  );

  return (
    <FlatList
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={isDark ? styles.container__dark : styles.container}
      data={links}
      style={{ height: metrics.screenHeight * 0.75 }}
      onViewableItemsChanged={onViewableItemsChanged}
      onEndReached={onEndReached}
      ListFooterComponent={
        <ListFooter 
          isLoadMoreAvailable={isLoading} 
          currentPage={currentPage!}
          colorScheme={colorScheme}
        />
      }
      renderItem={({ item }) => (
        <CardLink 
          link={item} 
          key={item.id} 
          viewableItems={viewableItems} 
          colorScheme={colorScheme}
        />
      )}
    />
  );
};
