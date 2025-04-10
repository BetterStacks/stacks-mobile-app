import { StyleSheet } from "react-native";
import { Colors } from "../design/colors";
import { scaleHeight, scaleWidth } from "../design/scale";
import { getFont } from "../design/fonts/fonts";
import { EFontWeight } from "../design/fonts/types";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.OtherColor.UsualWhite,
    paddingHorizontal: scaleWidth(24),
  },
  content: {
    marginTop: scaleHeight(26),
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    ...getFont(EFontWeight.Bold),
    fontSize: scaleHeight(24),
    lineHeight: scaleHeight(31),
    color: Colors.TextColor.DarkHeadingColor,
  },
  secondTitle: {
    marginTop: scaleHeight(32),
  },
  input: {
    height: scaleHeight(56),
    fontSize: scaleHeight(16),
    lineHeight: scaleHeight(24),
    marginTop: scaleHeight(24),
  },
  text: {
    ...getFont(EFontWeight.Regular),
    fontSize: scaleHeight(16),
    lineHeight: scaleHeight(24),
    marginTop: scaleHeight(16),
    color: Colors.TextColor.SecondaryColor,
  },
  filePicker: {
    marginTop: scaleHeight(16),
    width: "100%",
    height: scaleHeight(192),
    backgroundColor: Colors.ButtonsColor.GrayBackButton,
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: Colors.OtherColor.FilePickerBack,
    alignItems: "center",
    justifyContent: "center",
    gap: scaleHeight(16),
  },
  filePickerTitle: {
    ...getFont(EFontWeight.Medium),
    fontSize: scaleHeight(14),
    lineHeight: scaleHeight(15),
    borderColor: Colors.OtherColor.Black,
  },
  filePickerSubtitle: {
    ...getFont(EFontWeight.Regular),
    fontSize: scaleHeight(12),
    lineHeight: scaleHeight(16),
    borderColor: Colors.OtherColor.Black,
    opacity: 0.5,
  },
  button: {
    marginBottom: scaleHeight(44),
  },
  buttonLoading: {
    opacity: 0.2,
  },
  newImageContainer: {
    marginTop: scaleHeight(8),
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
  },
  newImageText: {
    marginTop: 0,
  },
  newImageStyle: {
    width: scaleWidth(70),
    height: scaleHeight(70),
    borderRadius: 5,
    marginLeft: scaleWidth(10),
  },
});
