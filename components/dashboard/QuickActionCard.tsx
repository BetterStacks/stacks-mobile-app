import { styles } from "@/components/dashboard/HomeScreenStyles";
import { Text, TouchableOpacity, View } from "react-native";

export const QuickActionCard = ({
  emoji,
  title,
  // count,
  onPress,
}: {
  emoji: string;
  title: string;
  count: number;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
    <View style={styles.quickActionLeftContent}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </View>
    {/* <Text style={styles.quickActionCount}>{count}</Text> */}
  </TouchableOpacity>
);
