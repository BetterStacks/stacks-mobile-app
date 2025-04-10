import { StyleSheet, Platform } from "react-native";
import { Colors } from "../design/colors";
import { scaleHeight, scaleWidth } from "../design/scale";
import metrics from "../design/metrics";
import { getFont } from "../design/fonts/fonts";
import { EFontWeight } from "../design/fonts/types";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.OtherColor.UsualWhite,
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
  title: {
    ...getFont(EFontWeight.Bold),
    fontSize: scaleHeight(20),
    color: Colors.TextColor.MainColor,
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
  collectionInfo: {
    flex: 1,
  },
  collectionTitle: {
    ...getFont(EFontWeight.Medium),
    fontSize: scaleHeight(16),
    color: Colors.TextColor.MainColor,
  },
  collectionCount: {
    ...getFont(EFontWeight.Regular),
    fontSize: scaleHeight(14),
    color: Colors.TextColor.SecondaryColor,
    marginLeft: scaleWidth(4),
  },
  separator: {
    height: 1,
    backgroundColor: Colors.OtherColor.InputGrayBorder,
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
