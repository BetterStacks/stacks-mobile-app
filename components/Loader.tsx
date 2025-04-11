import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StyleProp, ViewStyle } from "react-native/types";
import { Colors } from "@/components/design/colors";

type Props = {
  loaderStyles?: StyleProp<ViewStyle>;
  color?: string;
  size?: "small" | "large";
};

export const Loader: React.FC<Props> = ({
  loaderStyles,
  color = Colors.TextColor.LignMainColor,
  size = "large"
}) => (
  <View style={[styles.container, loaderStyles]}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
