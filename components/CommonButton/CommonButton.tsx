import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./CommonButtonStyles";
import { getIconWithColor } from "../design/icons/getIconWithColor";
import { EIconName } from "../design/icons/_models";

type Props = {
  text: string;
  onPress: () => void;
  additionalButtonStyles?: object;
  additionalTextStyles?: object;
  iconName?: EIconName;
  disabled?: boolean;
  loading?: boolean;
};

export const CommonButton: React.FC<Props> = ({
  text,
  onPress,
  additionalButtonStyles,
  additionalTextStyles,
  iconName,
  disabled = false,
  loading,
}) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      style={[
        styles.button,
        disabled && styles.disabled,
        additionalButtonStyles,
      ]}
      onPress={loading ? () => {} : onPress}
    >
      {iconName && getIconWithColor(iconName)}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator style={styles.button} />
        ) : (
          <Text style={[styles.buttonText, additionalTextStyles]}>{text}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
