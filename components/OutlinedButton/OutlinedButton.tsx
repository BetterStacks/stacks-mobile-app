import React from "react";
import { TouchableOpacity } from "react-native";

import { styles } from "./OutlinedButtonStyles";
import { getIconWithColor } from "../design/icons/getIconWithColor";
import { EIconName } from "../design/icons/_models";

type Props = {
  iconName: EIconName;
  onPress: () => void;
  additionalStyles?: object;
};

export const OutlinedButton: React.FC<Props> = ({
  iconName,
  onPress,
  additionalStyles,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, additionalStyles]}
      onPress={onPress}
    >
      {getIconWithColor(iconName)}
    </TouchableOpacity>
  );
};
