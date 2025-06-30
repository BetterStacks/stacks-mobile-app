import {ActivityIndicator, Text, TouchableOpacity, View} from "react-native";
import {styles} from "./CommonButtonStyles";

type Props = {
  text: string;
  onPress: () => void;
  additionalButtonStyles?: object;
  additionalTextStyles?: object;
  disabled?: boolean;
  loading?: boolean;
};

export const CommonButton: React.FC<Props> = ({
  text,
  onPress,
  additionalButtonStyles,
  additionalTextStyles,
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
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={[styles.buttonText, additionalTextStyles]}>{text}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
