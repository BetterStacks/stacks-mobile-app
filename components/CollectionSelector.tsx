import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { ChevronRight, X } from "lucide-react-native";
import { Collection } from "@/lib/types/Collection";
import { getEmojiFromCode } from "@/lib/utils";
import { Colors } from "./design/colors";
import { getFont } from "./design/fonts/fonts";
import { EFontWeight } from "./design/fonts/types";

type Props = {
  collections: Collection[];
  selectedCollections: string[];
  onCollectionSelect: (collectionId: string) => void;
  onRemoveCollection: (collectionId: string) => void;
  isExpanded: boolean;
  onExpandToggle: () => void;
};

export const CollectionSelector: React.FC<Props> = ({
  collections,
  selectedCollections,
  onCollectionSelect,
  onRemoveCollection,
  isExpanded,
  onExpandToggle,
}) => {
  return (
    <View>
      <TouchableOpacity
        style={[styles.collectionButton, { marginBottom: isExpanded ? 0 : 24 }]}
        onPress={onExpandToggle}
      >
        <View style={styles.collectionButtonContent}>
          <View style={styles.collectionIconContainer}>
            <Text>{selectedCollections.length > 0 ? "📑" : "📁"}</Text>
          </View>
          <Text style={styles.collectionText}>
            {selectedCollections.length === 0
              ? "Add to collection"
              : `${selectedCollections.length} collection${
                  selectedCollections.length > 1 ? "s" : ""
                } selected`}
          </Text>
        </View>
        <ChevronRight
          size={20}
          color="#666666"
          style={[styles.chevron, isExpanded && styles.chevronExpanded]}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.collectionsContainer}>
          <ScrollView
            style={styles.collectionsScroll}
            showsVerticalScrollIndicator={false}
          >
            {collections?.map((collection: Collection) => {
              const isSelected = selectedCollections.includes(collection.id);
              return (
                <View
                  key={collection.id}
                  style={[
                    styles.collectionItem,
                    isSelected && styles.selectedCollectionItem,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.collectionItemTouchable}
                    onPress={() => onCollectionSelect(collection.id)}
                  >
                    <View style={styles.collectionItemContent}>
                      <View style={styles.collectionItemIcon}>
                        <Text style={styles.emojiText}>
                          {getEmojiFromCode(collection.emoji) || "📁"}
                        </Text>
                      </View>
                      <Text style={styles.collectionItemText}>
                        {collection.title}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {isSelected && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => onRemoveCollection(collection.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <X size={20} color="#666666" />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  collectionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.tailwindColors.neutral["200"],
    borderRadius: 8,
  },
  collectionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  collectionIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: "#FFF3E0",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  collectionText: {
    fontSize: 16,
    color: Colors.tailwindColors.neutral["600"],
  },
  chevron: {
    transform: [{ rotate: "0deg" }],
  },
  chevronExpanded: {
    transform: [{ rotate: "90deg" }],
  },
  collectionsContainer: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.tailwindColors.neutral["200"],
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginBottom: 24,
    maxHeight: 400,
  },
  collectionsScroll: {
    flexGrow: 0,
  },
  collectionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.tailwindColors.neutral["0"],
    borderBottomWidth: 1,
    borderBottomColor: Colors.tailwindColors.neutral["200"],
  },
  collectionItemTouchable: {
    flex: 1,
    padding: 12,
  },
  collectionItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  collectionItemIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#FFF3E0",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  emojiText: {
    fontSize: 16,
  },
  collectionItemText: {
    ...getFont(EFontWeight.Regular),
    fontSize: 16,
    color: Colors.TextColor.DarkHeadingColor,
    flex: 1,
    marginRight: 8,
  },
  selectedCollectionItem: {
    backgroundColor: Colors.tailwindColors.neutral["50"],
  },
  removeButton: {
    padding: 4,
    marginRight: 8,
  },
});
