import {ColorSchemeName, View} from "react-native";
import {styles} from "./StacksListStyles";
import {Collection} from "@/lib/types/Collection";
import {StackItem} from "./StackItem/StackItem";
import {getEmojiFromCode} from "@/lib/utils";

type Props = {
  stacks: string[];
  collections: Collection[];
  colorScheme?: ColorSchemeName;
};

export const StacksList: React.FC<Props> = ({ stacks, collections, colorScheme }) => (
  <View style={colorScheme === 'dark' ? styles.contentContainer__dark : styles.contentContainer}>
    {stacks &&
      stacks.map((stack) => <StackItem stackName={stack} key={stack} colorScheme={colorScheme} />)}
    {collections &&
      collections.map((collection) => (
        <StackItem
          stackName={`${getEmojiFromCode(collection.emoji)} ${collection.name}`}
          key={collection.id}
          isCollection={true}
          colorScheme={colorScheme}
        />
      ))}
  </View>
);
