import { StyleSheet } from "react-native";
import { Colors } from "@/components/design/colors";
import { scaleHeight, scaleWidth } from "@/components/design/scale";

export const styles = StyleSheet.create({
  contentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRightSide: {
    flexDirection: "row",
    gap: scaleWidth(8),
  },
  viewTypeSelector: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    maxWidth: scaleWidth(88),
    paddingHorizontal: scaleWidth(12),
    paddingVertical: scaleHeight(12),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.OtherColor.InputGrayBorder,
    gap: scaleWidth(18),
  },
});
