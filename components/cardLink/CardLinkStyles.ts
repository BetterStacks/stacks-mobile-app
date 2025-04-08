import { StyleSheet } from "react-native";
import { scaleHeight, scaleWidth } from "../design/scale";
import { getFont } from "../design/fonts/fonts";
import { EFontWeight } from "../design/fonts/types";
import { Colors } from "../design/colors";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderBottomColor: Colors.OtherColor.InputGrayBorder,
    borderBottomWidth: 1,
    paddingVertical: scaleHeight(13),
  },
  content: {
    gap: scaleHeight(6),
    backgroundColor: Colors.tailwindColors.neutral["0"],
    padding: 16,
  },
  contentContainer: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.tailwindColors.neutral["300"],
    borderRadius: 12,
  },
  linkTitle: {
    ...getFont(EFontWeight.Medium),
    fontSize: scaleHeight(16),
    lineHeight: scaleHeight(21),
    color: Colors.TextColor.DarkHeadingColor,
    maxHeight: scaleWidth(244),
  },
  urlBox: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: scaleWidth(4),
  },
  url: {
    fontSize: scaleHeight(12),
    color: Colors.tailwindColors.neutral["500"],
  },
  linkDescription: {
    marginTop: 12,
    ...getFont(EFontWeight.Medium),
    color: Colors.tailwindColors.neutral["500"],
    // width: scaleWidth(244),
    fontSize: scaleHeight(12),
  },
  bottomBar: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  elapsedTime: {
    ...getFont(EFontWeight.Regular),
    fontSize: scaleHeight(12),
    color: Colors.tailwindColors.neutral["500"],
  },
  imageContainer: {
    backgroundColor: Colors.tailwindColors.neutral["0"],
    paddingTop: 8,
  },
  image: {
    width: "95%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    marginHorizontal: "2.5%",
    // transform: [{ translateY: 24 }, { rotateX: "-25deg" }],
  },
  bottomBarButtons: {
    marginTop: 8,
    gap: scaleWidth(4),
    flexDirection: "row",
  },
  detailsText: {
    color: Colors.TextColor.CardButtonsText,
    ...getFont(EFontWeight.Regular),
    fontSize: scaleHeight(10),
    lineHeight: scaleHeight(24),
  },
  avatarContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.OtherColor.BorderGrayColor,
  },
  avatar: {
    width: 20,
    height: 20,
  },
  detailsOpenButton: {
    height: scaleHeight(24),
    paddingHorizontal: scaleWidth(5),
    backgroundColor: Colors.ButtonsColor.GrayBackButton,
    flexDirection: "row",
    gap: scaleWidth(7),
    alignItems: "center",
    borderRadius: 8,
  },
  iconPlaceholder: {
    width: 50,
    height: 50,
  },
  bottomStyles: {
    backgroundColor: Colors.tailwindColors.neutral["0"],
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 8,
  },
  readerButton: {
    position: "absolute",
    top: 26,
    right: 13,
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 6,
    padding: 6,
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
  },

  readerContainer: {
    flex: 1,
    backgroundColor: Colors.tailwindColors.neutral["50"],
  },
  closeReaderButton: {
    padding: 8,
  },
  reader: {
    flex: 1,
    backgroundColor: Colors.tailwindColors.neutral["50"],
    marginTop: 60,
  },
  readerHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.tailwindColors.neutral["0"],
    borderBottomWidth: 1,
    borderBottomColor: Colors.tailwindColors.neutral["200"],
    height: 60,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  readerTitle: {
    ...getFont(EFontWeight.Medium),
    fontSize: 14,
    flex: 1,
    marginLeft: 12,
    marginRight: 16,
    color: Colors.TextColor.DarkHeadingColor,
    textAlignVertical: "center",
  },
  readerContentStyle: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    maxWidth: 680,
    alignSelf: "center",
    width: "100%",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  ttsButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.tailwindColors.neutral["0"],
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
    paddingHorizontal: 8,
    gap: 4,
    textAlignVertical: "center",
  },
  editButtonText: {
    ...getFont(EFontWeight.Regular),
    fontSize: 12,
    marginTop: 2,
    color: Colors.tailwindColors.neutral["700"],
  },
});
