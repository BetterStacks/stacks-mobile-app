import React, {useState} from "react";
import {ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View,} from "react-native";
import {useMutation} from "@apollo/client";
import {MUTATION_UPDATE_COLLECTION} from "@/lib/api/graphql/mutations";
import {Colors} from "../design/colors";
import {getEmojiFromCode} from "@/lib/utils";
import {Toast} from "toastify-react-native";

type Props = {
  onBack: () => void;
  onClose: () => void;
  collection: {
    id: string;
    title: string;
    emoji: string;
  };
  onSuccess?: (message: { title: string; description: string }) => void;
};

const EditCollectionView = ({ onBack, onClose, collection, onSuccess }: Props) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [title, setTitle] = useState(collection.title);
  const [updateCollection, { loading }] = useMutation(MUTATION_UPDATE_COLLECTION, {
    onCompleted: (data) => {
      onClose();
      // Show toast notification
      Toast.success("Collection updated successfully!");
      
      if (onSuccess) {
        onSuccess({
          title: title.trim(),
          description: "Collection updated successfully!",
        });
      }
    },
    onError: (error) => {
      Toast.error("Failed to update collection");
      console.error("Error updating collection:", error);
    }
  });

  const handleSave = async () => {
    if (!title.trim()) return;
    
    try {
      await updateCollection({
        variables: {
          collection: {
            id: collection.id,
            title: title.trim(),
            slug: title.trim().toLowerCase().replace(/\s+/g, '-'),
          },
        },
        refetchQueries: ["QUERY_COLLECTIONS"],
      });
    } catch (error) {
      console.error("Error updating collection:", error);
    }
  };

  const hasChanges = title.trim() !== collection.title;

  return (
    <View style={isDark ? styles.container_dark : styles.container}>
      <Text style={isDark ? styles.title_dark : styles.title}>Edit collection</Text>

      <View style={styles.collectionPreview}>
        <Text style={isDark ? styles.emoji_dark : styles.emoji}>{getEmojiFromCode(collection.emoji)}</Text>
      </View>

      <Text style={isDark ? styles.label_dark : styles.label}>Collection Name</Text>
      <TextInput
        style={isDark ? styles.input_dark : styles.input}
        placeholder="Collection name"
        placeholderTextColor={isDark ? "#8F8F8F" : undefined}
        value={title}
        onChangeText={setTitle}
        autoFocus
      />

      {hasChanges && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              isDark ? styles.saveButton_dark : styles.saveButton, 
              loading && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onBack}
            disabled={loading}
          >
            <Text style={isDark ? styles.cancelButtonText_dark : styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  container_dark: {
    padding: 16,
    backgroundColor: "#171717",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: "#1C4A5A",
  },
  title_dark: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: "#FFFFFF",
  },
  collectionPreview: {
    alignItems: "center",
    marginBottom: 20,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
    color: "#000000",
  },
  emoji_dark: {
    fontSize: 48,
    marginBottom: 8,
    color: "#F0F0F0",
  },
  label: {
    fontSize: 14,
    color: Colors.tailwindColors.neutral["600"],
    marginBottom: 8,
  },
  label_dark: {
    fontSize: 14,
    color: "#A0B3BC",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.tailwindColors.neutral["200"],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    color: "#1C4A5A",
  },
  input_dark: {
    borderWidth: 1,
    borderColor: "#262626",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#262626",
    color: "#FFFFFF",
  },
  buttonContainer: {
    marginTop: 24,
  },
  saveButton: {
    backgroundColor: Colors.TextColor.MainColor,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  saveButton_dark: {
    backgroundColor: "#1C4A5A",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.TextColor.MainColor,
    fontSize: 16,
  },
  cancelButtonText_dark: {
    color: "#8EACB7",
    fontSize: 16,
  },
});

export default EditCollectionView; 