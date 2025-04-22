import {styles} from "./StackItemStyles";
import {Text, View} from "react-native";

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
      {/*{!isCollection && (*/}
      {/*  <View style={styles.icon}>*/}
      {/*    {getIconWithColor(stackNameIcon as unknown as EIconName)}*/}
      {/*  </View>*/}
      {/*)}*/}

      <Text numberOfLines={1} style={styles.text}>
        {prettyStackName}
      </Text>
    </View>
  );
};
