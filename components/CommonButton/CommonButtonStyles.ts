import { StyleSheet } from "react-native";
import { Colors } from "../design/colors";
import { scaleHeight } from "../design/scale";
import { getFont } from "../design/fonts/fonts";
import { EFontWeight } from "../design/fonts/types";

export const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.ButtonsColor.MainButton,
    paddingVertical: scaleHeight(0),
    justifyContent: "center",
    alignItems: "center",
    maxHeight: scaleHeight(56),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.ButtonsColor.MainButton,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    ...getFont(EFontWeight.Medium),
    fontSize: scaleHeight(16),
    letterSpacing: 0.3,
    color: Colors.OtherColor.UsualWhite,
  },
  disabled: {
    opacity: 0.3,
  },
});
