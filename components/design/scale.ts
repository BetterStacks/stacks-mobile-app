import { Dimensions, PixelRatio } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const BASE_SCREEN_WIDTH: number = 375;
const BASE_SCREEN_HEIGHT: number = 812;

const widthBaseScale = screenWidth / BASE_SCREEN_WIDTH;
const heightBaseScale = screenHeight / BASE_SCREEN_HEIGHT;

const normalize = (size: number, based: "width" | "height" = "width") => {
  const newSize =
    based === "height" ? size * heightBaseScale : size * widthBaseScale;

  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const scaleWidth = (size: number) => normalize(size, "width");
export const scaleHeight = (size: number) => normalize(size, "height");
