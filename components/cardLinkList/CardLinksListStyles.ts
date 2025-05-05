import {Dimensions, StyleSheet} from "react-native";
import {scaleHeight} from "../design/scale";
import {EFontWeight} from "../design/fonts/types";
import {getFont} from "../design/fonts/fonts";
import {Colors} from "../design/colors";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingBottom: scaleHeight(30),
  },
  container__dark: {
    width: "100%",
    paddingBottom: scaleHeight(30),
    backgroundColor: "#0A0A0A",
  },
  indicator: {
    marginTop: scaleHeight(15),
  },
  noLinksText: {
    ...getFont(EFontWeight.Medium),
    fontSize: scaleHeight(14),
    lineHeight: scaleHeight(21),
    color: Colors.TextColor.MainColor,
    marginTop: scaleHeight(30),
    textAlign: "center",
  },
  noLinksText__dark: {
    ...getFont(EFontWeight.Medium),
    fontSize: scaleHeight(14),
    lineHeight: scaleHeight(21),
    color: "#8EACB7",
    marginTop: scaleHeight(30),
    textAlign: "center",
  },
  videoPlayer: {
    width,
    height,
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  btnclose: {
    position: "absolute",
    top: 50,
    right: 0,
    zIndex: 999,
    height: 30,
    width: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  imgWrapper: {
    flex: 1,
  },
  imgWrapper__dark: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  loadingSpinerWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width,
    height,
  },
  shareBtn: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center", // Center horizontally
    zIndex: 999,
    height: 30,
    width: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
});
