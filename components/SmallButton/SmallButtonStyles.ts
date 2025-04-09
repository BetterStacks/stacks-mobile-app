import { StyleSheet } from "react-native";
import { scaleHeight, scaleWidth } from "../design/scale";
import { Colors } from "../design/colors";

export const styles = StyleSheet.create({
  button: {
    width: scaleWidth(48),
    height: scaleHeight(48),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    backgroundColor: Colors.ButtonsColor.GrayBackButton,
  },
});
