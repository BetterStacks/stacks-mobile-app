import { EIconName } from "@/components/design/icons/_models";
import { getIconWithColor } from "@/components/design/icons/getIconWithColor";
import React, { FC } from "react";
import {
  Dimensions,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Pdf from "react-native-pdf";

type TPdfReader = {
  uri: string;
  onClose: () => void;
};
const PdfReader: FC<TPdfReader> = ({ uri, onClose }) => {
  const onOpenInBrowser = () => {
    Linking.openURL(uri);
  };
  return (
    <View style={styles.container}>
      <View style={styles.btnsWrapper}>
        <TouchableOpacity style={styles.btnclose} onPress={onClose}>
          {getIconWithColor(EIconName.Arrow)}
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnclose} onPress={onOpenInBrowser}>
          {getIconWithColor(EIconName.Browser)}
        </TouchableOpacity>
      </View>

      {/* <Pdf source={{ uri, cache: true }} style={styles.pdf} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  btnsWrapper: {
    position: "absolute",
    bottom: 50,
    left: 30,
    zIndex: 999,
    flexDirection: "row",
    alignItems: "center",
  },
  btnclose: {
    height: 35,
    width: 35,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    backgroundColor: "#ccc",
    borderRadius: 6,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});

export default PdfReader;
