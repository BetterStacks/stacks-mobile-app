import {Colors} from "@/components/design/colors";
import {getFont} from "@/components/design/fonts/fonts";
import {EFontWeight} from "@/components/design/fonts/types";
import metrics from "@/components/design/metrics";
import {scaleHeight, scaleWidth} from "@/components/design/scale";
import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: metrics.isAndroid ? scaleHeight(0) : scaleHeight(0),
  },
  container__dark: {
    flex: 1,
    paddingTop: metrics.isAndroid ? scaleHeight(0) : scaleHeight(0),
    backgroundColor: "#0A0A0A",
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
  carouselContainer: {
    marginTop: scaleHeight(34),
    minHeight: scaleHeight(40),
    maxHeight: scaleHeight(40),
    flexGrow: 0,
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
  noLinksTitle__dark: {
    marginTop: scaleHeight(28),
    ...getFont(EFontWeight.Medium),
    fontSize: scaleHeight(24),
    lineHeight: scaleHeight(31.2),
    color: "#FFFFFF",
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
  noLinksText__dark: {
    marginTop: scaleHeight(16),
    ...getFont(EFontWeight.Medium),
    fontSize: scaleHeight(14),
    lineHeight: scaleHeight(17.5),
    color: "#A0B3BC",
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
  buttonAdditionalStyles__dark: {
    backgroundColor: "#171717",
    borderColor: "#8EACB7",
    marginHorizontal: scaleWidth(24),
  },
  buttonTextAdditionalStyles: {
    color: Colors.TextColor.MainColor,
  },
  buttonTextAdditionalStyles__dark: {
    color: "#8EACB7",
  },
  popularSitesContainer: {
    marginTop: scaleHeight(24),
    width: "100%",
  },
  subtitle: {
    ...getFont(EFontWeight.Bold),
    fontSize: scaleHeight(16),
    color: Colors.TextColor.MainColor,
  },
  subtitle__dark: {
    ...getFont(EFontWeight.Bold),
    fontSize: scaleHeight(16),
    color: "#8EACB7",
  },
  contentContainer: {
    marginTop: scaleHeight(24),
    gap: scaleHeight(16),
  },
  linksContainer: {
    marginHorizontal: scaleWidth(16),
  },
  placesStacks: {
    paddingLeft: scaleWidth(16),
  },
  placesContent: {
    paddingLeft: scaleWidth(16),
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerContainer__dark: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#171717",
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },
  headerContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  headerDescription: {
    fontSize: 14,
    color: "#4A6572",
    opacity: 0.8,
  },
  headerDescription__dark: {
    fontSize: 14,
    color: "#A0B3BC",
    opacity: 0.8,
  },
  workspaceName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C4A5A",
    flex: 1,
  },
  workspaceName__dark: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8EACB7",
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: scaleHeight(400), // Ensure enough height for vertical centering
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scaleWidth(20),
  },
  emptyText: {
    fontSize: scaleHeight(16),
    color: '#4A6572',
    textAlign: 'center',
  },
  emptyTextDark: {
    color: '#A0B3BC',
  },
}); 