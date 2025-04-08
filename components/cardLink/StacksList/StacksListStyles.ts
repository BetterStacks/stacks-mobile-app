import { scaleWidth } from "@/components/design/scale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: "row",
    fleWrap: "nowrap",
    gap: scaleWidth(5),
    maxWidth: scaleWidth(220),
  },
});
