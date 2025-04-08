import { Text, TouchableOpacity } from "react-native";
import { useCallback } from "react";
import { EIconName } from "@/components/design/icons/_models";
import { styles } from "./stacksCarouselItemStyles";
import { getIconWithColor } from "@/components/design/icons/getIconWithColor";

type Props = {
  onPress: (title: string) => void;
  item: {
    id: number;
    title: string;
    iconName: EIconName;
  };
  selectedStack: string;
};

export const StacksCarouselItem: React.FC<Props> = ({
  item,
  onPress,
  selectedStack,
}) => {
  const handlePress = useCallback(() => {
    onPress(item.title);
  }, [item.title, onPress]);
  return (
    <TouchableOpacity
      style={[styles.container, selectedStack === item.title && styles.active]}
      onPress={handlePress}
    >
      {getIconWithColor(item.iconName)}

      <Text
        style={[styles.text, selectedStack === item.title && styles.textActive]}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );
};
