import { Text, TouchableOpacity } from "react-native";
import { Domain } from "types/Domain";
import { styles } from "./PopularSiteStyles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useCallback } from "react";
const brands = require("@fortawesome/free-brands-svg-icons");

type Props = {
  site: Domain;
  selectedDomain: string;
  onPress: (domain: string) => void;
};

export const PopularSite: React.FC<Props> = ({
  site,
  selectedDomain,
  onPress,
}) => {
  const prettyDomain = site.domain
    ? site.domain.split("")[0].toUpperCase() +
      site.domain.split(".")[0].slice(1)
    : "N";
  const newDomain = site.domain
    ? site.domain.split("")[0].toUpperCase() + site.domain.slice(1)
    : "N";

  const handlePress = useCallback(() => {
    if (site.domain === null) {
      onPress("");
    } else {
      onPress(site.domain);
    }
  }, [onPress, site.domain]);

  const isSelected = selectedDomain === site.domain;
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedSite]}
      onPress={handlePress}>
      {brands[`fa${prettyDomain}`] ? (
        <FontAwesomeIcon icon={brands[`fa${prettyDomain}`]} />
      ) : (
        <Text style={styles.text}>
          {site.domain === "All" ? "All" : newDomain[0]}
        </Text>
      )}
    </TouchableOpacity>
  );
};
