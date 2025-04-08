import { styles as HomeScreenStyles } from "@/app/dashboard/HomeScreenStyles";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "./HomeContentStyles";
import { getIconWithColor } from "../design/icons/getIconWithColor";
import { EIconName } from "../design/icons/_models";

type Props = {
  contentContainer: object;
  selectedStack: string;
};

export const HomeScreenContent: React.FC<Props> = ({
  contentContainer,
  selectedStack,
}) => (
  <View style={contentContainer}>
    <View style={styles.contentHeader}>
      <Text style={HomeScreenStyles.subtitle}>
        Saved {selectedStack === "All links" ? "Links" : selectedStack}
      </Text>

      <View style={styles.headerRightSide}>
        {false && (
          <>
            <View style={styles.viewTypeSelector}>
              <TouchableOpacity>
                {getIconWithColor(EIconName.GridType, "", {
                  stroke: "#E5E7EB",
                })}
              </TouchableOpacity>

              {getIconWithColor(EIconName.SmallDivider)}

              <TouchableOpacity>
                {getIconWithColor(EIconName.ListType, "", "", {
                  color: "1C4A5A",
                })}
              </TouchableOpacity>
            </View>

            <View style={styles.viewTypeSelector}>
              <TouchableOpacity>
                {getIconWithColor(EIconName.Filters)}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  </View>
);
