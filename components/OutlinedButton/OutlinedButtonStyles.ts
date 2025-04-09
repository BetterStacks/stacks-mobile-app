import { StyleSheet } from "react-native";
import { scaleHeight, scaleWidth } from "../design/scale";
import { Colors } from "../design/colors";

export const styles = StyleSheet.create({
  button: {
    width: scaleWidth(40),
    height: scaleHeight(40),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: scaleWidth(1),
    borderColor: Colors.OtherColor.BorderGrayColor,
    borderRadius: 12,
  },
});
