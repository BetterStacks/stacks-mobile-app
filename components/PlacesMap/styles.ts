import { StyleSheet } from "react-native";
import Colors from "shared/design/colors";
import { scaleHeight, scaleWidth } from "shared/utils/design/scale";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  generalContainer: {
    marginTop: scaleHeight(16),
  },
  viewTypeSelector: {
    zIndex: 1,
    backgroundColor: Colors.OtherColor.UsualWhite,
    position: "absolute",
    top: scaleHeight(8),
    right: scaleWidth(10),
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
