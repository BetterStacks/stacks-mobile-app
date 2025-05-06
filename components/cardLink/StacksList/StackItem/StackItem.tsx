import {styles} from "./StackItemStyles";
import {ColorSchemeName, Text, View} from "react-native";

type Props = {
  stackName: string;
  isCollection?: boolean;
  colorScheme?: ColorSchemeName;
};

export const StackItem: React.FC<Props> = ({
  stackName,
  isCollection = false,
  colorScheme,
}) => {
  const isDark = colorScheme === 'dark';
  const prettyStackName = isCollection
    ? stackName
    : stackName.split("")[0].toUpperCase() + stackName.slice(1);
  const stackNameIcon = prettyStackName + "Icon";

  return (
    <View style={isDark ? styles.container__dark : styles.container}>
      {/*{!isCollection && (*/}
      {/*  <View style={styles.icon}>*/}
      {/*    {getIconWithColor(stackNameIcon as unknown as EIconName)}*/}
      {/*  </View>*/}
      {/*)}*/}

      <Text numberOfLines={1} style={isDark ? styles.text__dark : styles.text}>
        {prettyStackName}
      </Text>
    </View>
  );
};
