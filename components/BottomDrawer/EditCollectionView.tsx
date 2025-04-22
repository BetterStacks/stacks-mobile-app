import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useMutation } from "@apollo/client";
import { MUTATION_UPDATE_COLLECTION } from "@/lib/api/graphql/mutations";
import { Colors } from "../design/colors";
import { getEmojiFromCode } from "@/lib/utils";
import { Toast } from "toastify-react-native";

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
    <View style={styles.container}>
      <Text style={styles.title}>Edit collection</Text>

      <View style={styles.collectionPreview}>
        <Text style={styles.emoji}>{getEmojiFromCode(collection.emoji)}</Text>
      </View>

      <Text style={styles.label}>Collection Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Collection name"
        value={title}
        onChangeText={setTitle}
        autoFocus
      />

      {hasChanges && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
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
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  collectionPreview: {
    alignItems: "center",
    marginBottom: 20,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: Colors.tailwindColors.neutral["600"],
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.tailwindColors.neutral["200"],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
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
});

export default EditCollectionView; 