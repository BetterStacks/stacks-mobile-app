import { StyleSheet } from "react-native";
import { scaleHeight, scaleWidth } from "@/components/design/scale";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: scaleWidth(8),
    alignContent: "flex-start",
    height: scaleHeight(40),
  },
});
