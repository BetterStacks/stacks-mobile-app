import { Link } from "@/lib/types/Link";
import {
  JSXElementConstructor,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  ViewToken,
} from "react-native";
import FastImage from "react-native-fast-image";
import { useSharedValue } from "react-native-reanimated";
import Video from "react-native-video";
import { styles } from "./CardLinksListStyles";
import { getIconWithColor } from "../design/icons/getIconWithColor";
import { EIconName } from "../design/icons/_models";
import metrics from "../design/metrics";
import { CardLink } from "../cardLink/CardLink";
import PdfReader from "../cardLink/PdfReader";

type Props = {
  links: Link[];
  style?: StyleProp<ViewStyle>;
  onEndReached: () => void;
  isLoadMoreAvailable: boolean;
  currentPage: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  header: ReactElement<any, string | JSXElementConstructor<any>>;
  showList: boolean;
};

type FooterProps = {
  isLoadMoreAvailable: boolean;
  currentPage: number;
};

const ListFooter: React.FC<FooterProps> = ({
  isLoadMoreAvailable,
  currentPage,
}) => {
  if (isLoadMoreAvailable) {
    return <ActivityIndicator style={styles.indicator} />;
  }

  if (currentPage > 1) {
    return (
      <Text style={styles.noLinksText}>You have reached the end of result</Text>
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
}) => {
  const viewableItems = useSharedValue<ViewToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfViewerVisible, setPdfViewerVisible] = useState("");
  const [videoPlayerUri, setVideoPlayerUri] = useState("");
  const [imageUri, setImageUri] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(isLoadMoreAvailable);
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
        contentContainerStyle={styles.container}
        onViewableItemsChanged={onViewableItemsChanged}
        onEndReached={onEndReached}
        data={showList ? links : null}
        bounces
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={header}
        ListFooterComponent={
          showList ? (
            <ListFooter
              isLoadMoreAvailable={isLoading}
              currentPage={currentPage}
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
          {getIconWithColor(EIconName.CloseModal)}
        </TouchableOpacity>
        <View style={styles.imgWrapper}>
          <View style={styles.loadingSpinerWrapper}>
            <ActivityIndicator size={"large"} />
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
          {getIconWithColor(EIconName.CloseModal)}
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
}) => {
  const viewableItems = useSharedValue<ViewToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(isLoadMoreAvailable);
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
      contentContainerStyle={styles.container}
      data={links}
      style={{ height: metrics.screenHeight * 0.75 }}
      onViewableItemsChanged={onViewableItemsChanged}
      onEndReached={onEndReached}
      ListFooterComponent={
        <ListFooter isLoadMoreAvailable={isLoading} currentPage={currentPage} />
      }
      renderItem={({ item }) => (
        <CardLink link={item} key={item.id} viewableItems={viewableItems} />
      )}
    />
  );
};
