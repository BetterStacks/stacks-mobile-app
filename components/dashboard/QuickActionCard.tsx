import {styles} from "@/components/dashboard/HomeScreenStyles";
import {ColorSchemeName, Text, TouchableOpacity, View} from "react-native";

export const QuickActionCard = ({
  emoji,
  title,
  count,
  onPress,
  colorScheme,
}: {
  emoji: string;
  title: string;
  count: number;
  onPress?: () => void;
  colorScheme?: ColorSchemeName;
}) => (
  <TouchableOpacity style={colorScheme === 'light' ? styles.quickActionCard : styles.quickActionCard__dark} onPress={onPress}>
    <View style={styles.quickActionLeftContent}>
      <Text style={colorScheme === 'light' ? styles.emoji : styles.emoji__dark}>{emoji}</Text>
      <Text style={colorScheme === 'light' ? styles.quickActionTitle : styles.quickActionTitle__dark}>{title}</Text>
    </View>
    {/* <Text style={colorScheme === 'light' ? styles.quickActionCount : styles.quickActionCount__dark}>{count}</Text> */}
  </TouchableOpacity>
);
