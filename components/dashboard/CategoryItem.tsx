import {styles} from "@/components/dashboard/HomeScreenStyles";
import {ColorSchemeName, Text, TouchableOpacity} from "react-native";

export const CategoryItem = ({
  emoji,
  title,
  isLast,
  onPress,
  colorScheme,
}: {
  emoji: string;
  title: string;
  isLast?: boolean;
  onPress?: () => void;
  colorScheme?: ColorSchemeName;
}) => (
  <TouchableOpacity
    style={[
      colorScheme === 'light' ? styles.categoryItem : styles.categoryItem__dark, 
      isLast && { borderBottomWidth: 0 }
    ]}
    onPress={onPress}
  >
    <Text style={colorScheme === 'light' ? styles.categoryEmoji : styles.categoryEmoji__dark}>{emoji}</Text>
    <Text style={colorScheme === 'light' ? styles.categoryTitle : styles.categoryTitle__dark}>{title}</Text>
  </TouchableOpacity>
);
