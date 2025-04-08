declare module "*.jpg" {
  import { ImageRequireSource } from "react-native";
  import { Source } from "react-native-fast-image/dist";

  type SourceImage = number | Source | ImageRequireSource;

  export default "" as SourceImage;
}

declare module "*.png" {
  // eslint-disable-next-line no-duplicate-imports
  import { ImageRequireSource } from "react-native";
  // eslint-disable-next-line no-duplicate-imports
  import { Source } from "react-native-fast-image/dist";

  type SourceImage = number | Source | ImageRequireSource;

  export default "" as SourceImage;
}

declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";

  const content: React.FC<SvgProps>;

  export default content;
}
