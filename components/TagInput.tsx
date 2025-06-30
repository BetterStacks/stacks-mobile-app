import React, {useState} from "react";
import {ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,} from "react-native";

type Props = {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  existingTags?: string[];
};

export const TagInput: React.FC<Props> = ({
  tags,
  onTagsChange,
  placeholder,
  existingTags = [],
}) => {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = existingTags.filter(
    tag =>
      tag.toLowerCase().includes(input.toLowerCase()) && !tags.includes(tag),
  );

  const handleAddTag = (tagToAdd: string) => {
    if (tagToAdd.trim() && !tags.includes(tagToAdd.trim())) {
      onTagsChange([...tags, tagToAdd.trim()]);
      setInput("");
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <View style={styles.container}>
      {tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map(tag => (
            <TouchableOpacity
              key={tag}
              style={styles.tag}
              onPress={() => handleRemoveTag(tag)}>
              <Text style={styles.tagText}>{tag}</Text>
              <Text style={styles.removeTag}>×</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={text => {
          setInput(text);
          setShowSuggestions(true);
        }}
        onSubmitEditing={() => handleAddTag(input)}
        placeholder={placeholder}
        placeholderTextColor="#999999"
        returnKeyType="done"
      />
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestions}>
          <ScrollView 
            style={styles.suggestionsScroll}
            showsVerticalScrollIndicator={false}
          >
            {suggestions.map(suggestion => (
              <TouchableOpacity
                key={suggestion}
                style={styles.suggestionItem}
                onPress={() => handleAddTag(suggestion)}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    padding: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: "#1C4A5A",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginRight: 4,
  },
  removeTag: {
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 4,
  },
  input: {
    height: 24,
    fontSize: 15,
    color: "#000000",
    padding: 0,
    marginTop: 0,
  },
  suggestions: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    maxHeight: 150,
  },
  suggestionsScroll: {
    flexGrow: 0,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  suggestionText: {
    fontSize: 15,
    color: "#000000",
  },
});

export default TagInput; 