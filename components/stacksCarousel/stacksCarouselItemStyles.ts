import { StyleSheet } from "react-native";
import { Colors } from "@/components/design/colors";
import { scaleHeight, scaleWidth } from "@/components/design/scale";
import { getFont } from "@/components/design/fonts/fonts";
import { EFontWeight } from "@/components/design/fonts/types";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.ButtonsColor.GrayBackButton,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: scaleWidth(8),
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(8),
    height: scaleHeight(40),
  },
  text: {
    fontSize: scaleHeight(16),
    ...getFont(EFontWeight.Medium),
    lineHeight: scaleHeight(24),
    color: Colors.TextColor.SecondaryColor,
  },
  active: {
    backgroundColor: Colors.ButtonsColor.MainButton,
  },
  textActive: {
    color: Colors.OtherColor.UsualWhite,
  },
});
