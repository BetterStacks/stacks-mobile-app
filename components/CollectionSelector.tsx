import React from "react";
import {ColorSchemeName, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {ChevronRight, X} from "lucide-react-native";
import {Collection} from "@/lib/types/Collection";
import {getEmojiFromCode} from "@/lib/utils";
import {Colors} from "./design/colors";
import {getFont} from "./design/fonts/fonts";
import {EFontWeight} from "./design/fonts/types";

type Props = {
  collections: Collection[];
  selectedCollections: string[];
  onCollectionSelect: (collectionId: string) => void;
  onRemoveCollection: (collectionId: string) => void;
  isExpanded: boolean;
  onExpandToggle: () => void;
  colorScheme?: ColorSchemeName;
};

export const CollectionSelector: React.FC<Props> = ({
  collections,
  selectedCollections,
  onCollectionSelect,
  onRemoveCollection,
  isExpanded,
  onExpandToggle,
  colorScheme,
}) => {
  const isDark = colorScheme === 'dark';

  return (
    <View>
      <TouchableOpacity
        style={[
          isDark ? styles.collectionButton_dark : styles.collectionButton, 
          { marginBottom: isExpanded ? 0 : 24 }
        ]}
        onPress={onExpandToggle}
      >
        <View style={styles.collectionButtonContent}>
          <View style={isDark ? styles.collectionIconContainer_dark : styles.collectionIconContainer}>
            <Text>{selectedCollections.length > 0 ? "📑" : "📁"}</Text>
          </View>
          <Text style={isDark ? styles.collectionText_dark : styles.collectionText}>
            {selectedCollections.length === 0
              ? "Add to collection"
              : `${selectedCollections.length} collection${
                  selectedCollections.length > 1 ? "s" : ""
                } selected`}
          </Text>
        </View>
        <ChevronRight
          size={20}
          color={isDark ? "#A0B3BC" : "#666666"}
          style={[styles.chevron, isExpanded && styles.chevronExpanded]}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={isDark ? styles.collectionsContainer_dark : styles.collectionsContainer}>
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
                    isDark ? styles.collectionItem_dark : styles.collectionItem,
                    isSelected && (isDark ? styles.selectedCollectionItem_dark : styles.selectedCollectionItem),
                  ]}
                >
                  <TouchableOpacity
                    style={styles.collectionItemTouchable}
                    onPress={() => onCollectionSelect(collection.id)}
                  >
                    <View style={styles.collectionItemContent}>
                      <View style={isDark ? styles.collectionItemIcon_dark : styles.collectionItemIcon}>
                        <Text style={styles.emojiText}>
                          {getEmojiFromCode(collection.emoji) || "📁"}
                        </Text>
                      </View>
                      <Text style={isDark ? styles.collectionItemText_dark : styles.collectionItemText}>
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
                      <X size={20} color={isDark ? "#A0B3BC" : "#666666"} />
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
    backgroundColor: "#FFFFFF",
  },
  collectionButton_dark: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "#262626",
    borderRadius: 8,
    backgroundColor: "#262626",
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
  collectionIconContainer_dark: {
    width: 32,
    height: 32,
    backgroundColor: "#3A3A3A",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  collectionText: {
    fontSize: 16,
    color: Colors.tailwindColors.neutral["600"],
  },
  collectionText_dark: {
    fontSize: 16,
    color: "#FFFFFF",
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
    backgroundColor: "#FFFFFF",
  },
  collectionsContainer_dark: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#262626",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginBottom: 24,
    maxHeight: 400,
    backgroundColor: "#171717",
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
  collectionItem_dark: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#171717",
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
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
  collectionItemIcon_dark: {
    width: 32,
    height: 32,
    backgroundColor: "#3A3A3A",
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
  collectionItemText_dark: {
    ...getFont(EFontWeight.Regular),
    fontSize: 16,
    color: "#FFFFFF",
    flex: 1,
    marginRight: 8,
  },
  selectedCollectionItem: {
    backgroundColor: Colors.tailwindColors.neutral["50"],
  },
  selectedCollectionItem_dark: {
    backgroundColor: "#262626",
  },
  removeButton: {
    padding: 4,
    marginRight: 8,
  },
});
