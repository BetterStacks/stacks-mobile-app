import { View, Text } from "react-native";
import { styles } from "./PopularSitesSectionStyles";
import { styles as HomeScreenStyles } from "@/app/dashboard/HomeScreenStyles";
import PopularSitesCarousel from "../PopularSitesCarousel";

type Props = {
  containerStyles: object;
  selectedDomain: string;
  data: any;
  onPress: (domain: string) => void;
};

export const PopularSitesSection: React.FC<Props> = ({
  containerStyles,
  data,
  selectedDomain,
  onPress,
}) => (
  <View style={containerStyles}>
    <Text style={HomeScreenStyles.subtitle}>Popular Sites</Text>

    <View style={styles.sitesCarouselContainer}>
      <PopularSitesCarousel
        sites={data}
        selectedDomain={selectedDomain}
        onPress={onPress}
      />
    </View>
  </View>
);
