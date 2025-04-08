import { StyleSheet } from "react-native";
import Colors from "shared/design/colors";
import { getFont } from "shared/design/fonts/fonts";
import { EFontWeight } from "shared/design/fonts/types";
import { scaleWidth, scaleHeight } from "shared/utils/design/scale";

export const styles = StyleSheet.create({
  container: {
    width: scaleWidth(40),
    height: scaleHeight(40),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.ButtonsColor.GrayBackButton,
    borderWidth: 1,
    borderColor: Colors.ButtonsColor.GrayBackButton,
    borderRadius: 50,
  },
  selectedSite: {
    borderColor: Colors.ButtonsColor.MainButton,
  },
  text: {
    ...getFont(EFontWeight.Medium),
    fontSize: scaleHeight(16),
    color: Colors.TextColor.MainColor,
  },
});
