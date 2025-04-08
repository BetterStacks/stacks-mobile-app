import { Colors } from "@/components/design/colors";
import { getFont } from "@/components/design/fonts/fonts";
import { EFontWeight } from "@/components/design/fonts/types";
import { scaleHeight, scaleWidth } from "@/components/design/scale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    // height: scaleHeight(24),
    paddingHorizontal: scaleWidth(6),
    paddingVertical: scaleHeight(1),
    backgroundColor: Colors.tailwindColors.neutral["50"],
    flexDirection: "row",
    overflow: "hidden",
    gap: scaleWidth(7),
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: Colors.tailwindColors.neutral["950"],
  },
  text: {
    color: Colors.TextColor.CardButtonsText,
    ...getFont(EFontWeight.Regular),
    fontSize: scaleHeight(10),
    lineHeight: scaleHeight(24),
  },
  icon: {
    maxWidth: scaleWidth(14),
    maxHeight: scaleHeight(14),
  },
});
