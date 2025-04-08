import { FlatList, StyleProp, ViewStyle } from "react-native";
import { StacksCarouselItem } from "@/components/stacksCarousel/stacksCarouselItem";
import { styles } from "@/components/stacksCarousel/stacksCarouselStyles";
import collectionsData from "@/components/stacksCarousel/collectionsData";

type Props = {
  onPress: (title: string) => void;
  selectedStack: string;
  containerStyles?: StyleProp<ViewStyle>;
};

export const StacksCarousel: React.FC<Props> = ({
  onPress,
  selectedStack,
  containerStyles,
}) => (
  <FlatList
    horizontal
    showsHorizontalScrollIndicator={false}
    directionalLockEnabled={true}
    alwaysBounceVertical={false}
    contentContainerStyle={styles.container}
    data={collectionsData}
    style={containerStyles}
    renderItem={({ item }) => (
      <StacksCarouselItem
        item={item}
        onPress={onPress}
        selectedStack={selectedStack}
        key={item.id}
      />
    )}
  />
);
