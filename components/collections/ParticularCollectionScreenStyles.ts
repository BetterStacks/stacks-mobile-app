import { StyleSheet } from "react-native";
import { Colors } from "../design/colors";
import { scaleHeight, scaleWidth } from "../design/scale";
import { EFontWeight } from "../design/fonts/types";
import { getFont } from "../design/fonts/fonts";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.OtherColor.MainBackgroundColor,
    paddingHorizontal: scaleWidth(16),
  },
  contentHeader: {
    marginTop: scaleHeight(29),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRightSide: {
    flexDirection: "row",
    gap: scaleWidth(8),
  },
  viewTypeSelector: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    maxWidth: scaleWidth(88),
    paddingHorizontal: scaleWidth(12),
    paddingVertical: scaleHeight(12),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.OtherColor.InputGrayBorder,
    gap: scaleWidth(18),
  },
  subtitle: {
    ...getFont(EFontWeight.Bold),
    fontSize: scaleHeight(16),
    color: Colors.TextColor.MainColor,
  },
  image: {
    width: scaleWidth(174),
    height: scaleHeight(174),
    alignSelf: "center",
  },
  emptyContent: {
    alignSelf: "center",
    marginTop: scaleHeight(56),
    alignItems: "center",
  },
  noLinksTitle: {
    marginTop: scaleHeight(28),
    ...getFont(EFontWeight.Medium),
    fontSize: scaleHeight(24),
    lineHeight: scaleHeight(31.2),
    color: Colors.TextColor.DarkHeadingColor,
    textAlign: "center",
    maxWidth: scaleWidth(286),
  },
  noLinksText: {
    marginTop: scaleHeight(16),
    ...getFont(EFontWeight.Medium),
    fontSize: scaleHeight(14),
    lineHeight: scaleHeight(17.5),
    color: Colors.TextColor.SecondaryColor,
    textAlign: "center",
    maxWidth: scaleWidth(248),
  },
  buttonContainer: {
    marginTop: scaleHeight(31),
    minWidth: "100%",
  },
  buttonAdditionalStyles: {
    backgroundColor: Colors.OtherColor.UsualWhite,
    borderColor: Colors.TextColor.MainColor,
    marginHorizontal: scaleWidth(24),
  },
  buttonTextAdditionalStyles: {
    color: Colors.TextColor.MainColor,
  },
});
