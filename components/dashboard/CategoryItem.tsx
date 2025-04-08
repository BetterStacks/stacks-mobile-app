import { styles } from "@/app/dashboard/HomeScreenStyles";
import { Text, TouchableOpacity } from "react-native";

export const CategoryItem = ({
  emoji,
  title,
  isLast,
  onPress,
}: {
  emoji: string;
  title: string;
  isLast?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    style={[styles.categoryItem, isLast && { borderBottomWidth: 0 }]}
    onPress={onPress}
  >
    <Text style={styles.categoryEmoji}>{emoji}</Text>
    <Text style={styles.categoryTitle}>{title}</Text>
  </TouchableOpacity>
);
