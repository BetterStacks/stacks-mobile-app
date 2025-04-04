import { EFontWeight } from "./types";
import metrics from "@/components/design/metrics";

export const getFont = (
  // _fontFamily: EFontFamily,
  _fontWeight: EFontWeight,
): { fontFamily?: string; fontWeight?: EFontWeight } => {
  let fontFamily = "Poppins";
  const { isAndroid, isIOS } = metrics;

  switch (_fontWeight) {
    case EFontWeight.Regular:
      if (isAndroid) {
        fontFamily += "-Regular";
      }
      break;
    case EFontWeight.Medium:
      if (isAndroid) {
        fontFamily += "-Medium";
      }
      break;
    case EFontWeight.Bold:
      if (isAndroid) {
        fontFamily += "-Bold";
      }
      break;
    case EFontWeight.Black:
      if (isAndroid) {
        fontFamily += "-Black";
      }
      break;
  }

  const fontObject: { fontFamily: string; fontWeight?: EFontWeight } = {
    fontFamily,
  };

  if (isIOS) {
    fontObject.fontWeight = _fontWeight;
  }

  return fontObject;
};
