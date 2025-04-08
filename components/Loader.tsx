import Lottie from "lottie-react-native";
import { Text, View } from "react-native";
import { StyleProp, ViewStyle } from "react-native/types";

type Props = {
  loaderStyles?: StyleProp<ViewStyle>;
};

export const Loader: React.FC<Props> = ({ loaderStyles }) => (
  // <Lottie
  //   source={require("assets/lotties/loader.json")}
  //   autoPlay
  //   loop
  //   style={loaderStyles}
  // />
  <View style={loaderStyles}>
    <Text>Loading...</Text>
  </View>
);
