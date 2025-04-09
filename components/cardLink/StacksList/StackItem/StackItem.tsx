import { getIconWithColor } from "@/components/design/icons/getIconWithColor";
import { styles } from "./StackItemStyles";
import { View, Text } from "react-native";
import { EIconName } from "@/components/design/icons/_models";

type Props = {
  stackName: string;
  isCollection?: boolean;
};

export const StackItem: React.FC<Props> = ({
  stackName,
  isCollection = false,
}) => {
  const prettyStackName = isCollection
    ? stackName
    : stackName.split("")[0].toUpperCase() + stackName.slice(1);
  const stackNameIcon = prettyStackName + "Icon";

  return (
    <View style={styles.container}>
      {/* {!isCollection && (
        <View style={styles.icon}>
          {getIconWithColor(stackNameIcon as unknown as EIconName)}
        </View>
      )} */}

      {/* <Text numberOfLines={1} style={styles.text}>
        {prettyStackName}
      </Text> */}
    </View>
  );
};
