import { FlatList } from "react-native";
import { Domain } from "types/Domain";
import { PopularSite } from "./PopularSite/PopularSite";
import { styles } from "./PopularSitesCarouselStyles";
import { useMemo } from "react";

type Props = {
  sites: Domain[];
  selectedDomain: string;
  onPress: (domain: string) => void;
};

export const PopularSitesCarousel: React.FC<Props> = ({
  sites,
  selectedDomain,
  onPress,
}) => {
  const defaultDomain: Domain = {
    domain: "All",
    count: 0,
  };
  const customSites = useMemo(
    () => (sites ? [defaultDomain, ...sites] : [defaultDomain]),
    [sites],
  );

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      directionalLockEnabled={true}
      alwaysBounceVertical={false}
      contentContainerStyle={styles.container}
      data={customSites}
      renderItem={({ item }) => (
        <PopularSite
          site={item}
          selectedDomain={selectedDomain}
          onPress={onPress}
          key={item.domain}
        />
      )}
    />
  );
};
