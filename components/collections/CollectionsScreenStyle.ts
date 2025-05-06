import {Platform, StyleSheet} from "react-native";
import {Colors} from "../design/colors";
import {scaleHeight, scaleWidth} from "../design/scale";
import metrics from "../design/metrics";
import {getFont} from "../design/fonts/fonts";
import {EFontWeight} from "../design/fonts/types";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.OtherColor.UsualWhite,
    paddingHorizontal: scaleWidth(16),
    paddingTop: metrics.isAndroid ? scaleHeight(24) : scaleHeight(12),
  },
  container__dark: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    paddingHorizontal: scaleWidth(16),
    paddingTop: metrics.isAndroid ? scaleHeight(24) : scaleHeight(12),
  },
  header: {
    marginTop: scaleHeight(13),
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  headerInfo: {
    gap: scaleHeight(4),
  },
  text: {
    color: Colors.TextColor.SecondaryColor,
    ...getFont(EFontWeight.Medium),
    fontSize: scaleHeight(14),
    lineHeight: scaleHeight(17.5),
  },
  text__dark: {
    color: "#A0B3BC",
    ...getFont(EFontWeight.Medium),
    fontSize: scaleHeight(14),
    lineHeight: scaleHeight(17.5),
  },
  title: {
    ...getFont(EFontWeight.Bold),
    fontSize: scaleHeight(20),
    color: Colors.TextColor.MainColor,
    lineHeight: scaleHeight(24),
  },
  title__dark: {
    ...getFont(EFontWeight.Bold),
    fontSize: scaleHeight(20),
    color: "#FFFFFF",
    lineHeight: scaleHeight(24),
  },
  addButton: {
    backgroundColor: Colors.ButtonsColor.MainButton,
    borderRadius: 12,
  },
  listContainer: {
    marginTop: scaleHeight(28),
  },
  searchContainer: {
    marginTop: scaleHeight(16),
    marginBottom: scaleHeight(24),
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.OtherColor.UsualWhite,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.OtherColor.InputGrayBorder,
    paddingHorizontal: scaleWidth(12),
    height: scaleHeight(40),
  },
  searchWrapper__dark: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#171717",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#262626",
    paddingHorizontal: scaleWidth(12),
    height: scaleHeight(40),
  },
  searchIcon: {
    marginRight: scaleWidth(8),
  },
  searchInput: {
    flex: 1,
    height: "100%",
    padding: 0,
    color: Colors.TextColor.MainColor,
    ...getFont(EFontWeight.Regular),
    fontSize: scaleHeight(14),
  },
  searchInput__dark: {
    flex: 1,
    height: "100%",
    padding: 0,
    color: "#FFFFFF",
    ...getFont(EFontWeight.Regular),
    fontSize: scaleHeight(14),
  },
  collectionItem: {
    paddingVertical: scaleHeight(12),
  },
  collectionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  collectionEmoji: {
    fontSize: scaleHeight(18),
    marginRight: scaleWidth(12),
    includeFontPadding: false,
    textAlignVertical: "center",
    color: "#000",
    ...Platform.select({
      ios: {
        lineHeight: scaleHeight(22),
      },
      android: {
        lineHeight: scaleHeight(20),
      },
    }),
  },
  collectionEmoji__dark: {
    fontSize: scaleHeight(18),
    marginRight: scaleWidth(12),
    includeFontPadding: false,
    textAlignVertical: "center",
    color: "#F0F0F0",
    ...Platform.select({
      ios: {
        lineHeight: scaleHeight(22),
      },
      android: {
        lineHeight: scaleHeight(20),
      },
    }),
  },
  collectionInfo: {
    flex: 1,
  },
  collectionTitle: {
    ...getFont(EFontWeight.Medium),
    fontSize: scaleHeight(16),
    color: Colors.TextColor.MainColor,
  },
  collectionTitle__dark: {
    ...getFont(EFontWeight.Medium),
    fontSize: scaleHeight(16),
    color: "#FFFFFF",
  },
  collectionCount: {
    ...getFont(EFontWeight.Regular),
    fontSize: scaleHeight(14),
    color: Colors.TextColor.SecondaryColor,
    marginLeft: scaleWidth(4),
  },
  collectionCount__dark: {
    ...getFont(EFontWeight.Regular),
    fontSize: scaleHeight(14),
    color: "#8F8F8F",
    marginLeft: scaleWidth(4),
  },
  separator: {
    height: 1,
    backgroundColor: Colors.OtherColor.InputGrayBorder,
  },
  separator__dark: {
    height: 1,
    backgroundColor: "#262626",
  },
  section: {
    marginBottom: scaleHeight(24),
  },
  sectionTitle: {
    ...getFont(EFontWeight.SemiBold),
    fontSize: scaleHeight(14),
    color: Colors.TextColor.SecondaryColor,
    marginBottom: scaleHeight(8),
    // textTransform: "uppercase",
  },
  sectionTitle__dark: {
    ...getFont(EFontWeight.SemiBold),
    fontSize: scaleHeight(14),
    color: "#8EACB7",
    marginBottom: scaleHeight(8),
    // textTransform: "uppercase",
  },
  listContentContainer: {
    paddingBottom: scaleHeight(24),
  },
  emojiContainer: {
    width: scaleWidth(32),
    height: scaleHeight(32),
    justifyContent: "center",
    alignItems: "center",
  },
});
