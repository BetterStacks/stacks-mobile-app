import { EIconName } from "../design/icons/_models";
import { OutlinedButton } from "../OutlinedButton/OutlinedButton";
import { styles } from "./SmallButtonStyles";
import { StyleProp, ViewStyle } from "react-native";

type Props = {
  onPress: () => void;
  iconName: EIconName;
  additionalStyles?: StyleProp<ViewStyle>;
};

export const SmallButton: React.FC<Props> = ({
  onPress,
  iconName,
  additionalStyles,
}) => (
  <OutlinedButton
    iconName={iconName}
    onPress={onPress}
    additionalStyles={[styles.button, additionalStyles]}
  />
);
