import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useMutation, useQuery } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SELECTED_WORKSPACE_ID_KEY } from "@/lib/constants";
import { QUERY_COLLECTIONS } from "@/lib/api/graphql/queries";
import { MUTATION_ADD_LINK } from "@/lib/api/graphql/mutations";
import {
  setIsSuccessModalVisible,
  setSuccessModalMessage,
} from "@/lib/apollo/store/handlers";
import client from "@/lib/apollo/client";
import { CollectionSelector } from "../CollectionSelector";

// import { FolderPlus, ChevronRight, X } from "lucide-react-native";

type Props = {
  onBack: () => void;
  onClose: () => void;
  onSuccess?: (message: { title: string; description: string }) => void;
  selectedCollectionId?: string;
};

const AddLinkView = ({ onBack, onClose, onSuccess, selectedCollectionId }: Props) => {
  // const navigation = useNavigation<TCollectionsStackNavigationProp>();
  const [url, setUrl] = useState("");
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    selectedCollectionId ? [selectedCollectionId] : []
  );
  const [isCollectionsExpanded, setIsCollectionsExpanded] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const [repositoryId, setRepositoryId] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkspaceId = async () => {
      try {
        const storedId = await AsyncStorage.getItem(SELECTED_WORKSPACE_ID_KEY);
        setRepositoryId(storedId);
      } catch (err) {
        console.error("Error loading workspace ID:", err);
        setRepositoryId(null);
      }
    };

    loadWorkspaceId();
  }, []);

  const { data: collectionsData } = useQuery(QUERY_COLLECTIONS, {
    variables: {
      query: "",
      repositoryId: repositoryId || undefined,
    },
  });

  const [addLink, { loading }] = useMutation(MUTATION_ADD_LINK, {
    onCompleted: (_data) => {
      try {
        onClose();

        const successMessage = {
          title: "Link saved successfully!",
          description:
            selectedCollections.length > 0
              ? `Added to ${selectedCollections.length} collection${
                  selectedCollections.length > 1 ? "s" : ""
                }`
              : "Your link has been saved",
        };

        if (onSuccess) {
          onSuccess(successMessage);
        } else {
          setSuccessModalMessage({
            ...successMessage,
            closeText: "Got it!",
            preventNavigation: true,
          });
          setIsSuccessModalVisible(true);
        }

        setTimeout(() => {
          client.refetchQueries({
            include: [
              "QUERY_LINKS",
              "QUERY_STACKS",
              "QUERY_DOMAIN_LINKS",
              "QUERY_DOMAIN_LINKS_BY_STACKID",
              "QUERY_STACK_LINKS",
            ],
          });
        }, 5000);
      } catch (error) {
        console.error("Error handling success:", error);
      }
    },
    onError: (error) => {
      console.error("Error adding link:", error);
    },
  });

  const handleSave = async () => {
    if (url) {
      try {
        await addLink({
          variables: {
            target_url: url,
            collection_ids:
              selectedCollections.length > 0 ? selectedCollections : null,
          },
          refetchQueries: [
            "QUERY_LINKS",
            "QUERY_STACKS",
            "QUERY_DOMAIN_LINKS",
            "QUERY_DOMAIN_LINKS_BY_STACKID",
            "QUERY_STACK_LINKS",
          ],
        });
      } catch (error) {
        console.error("Error adding link:", error);
      }
    }
  };

  const handleCollectionSelect = (collectionId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId],
    );
  };

  const handleInputFocus = () => {
    setIsCollectionsExpanded(false);
  };

  const handleRemoveCollection = (collectionId: string) => {
    setSelectedCollections((prev) => prev.filter((id) => id !== collectionId));
  };

  const handleCollectionButtonPress = () => {
    Keyboard.dismiss();
    inputRef.current?.blur();
    setIsCollectionsExpanded(!isCollectionsExpanded);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a new link</Text>
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder="Enter URL of link"
        value={url}
        onChangeText={setUrl}
        onFocus={handleInputFocus}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />

      <CollectionSelector
        collections={collectionsData?.collections || []}
        selectedCollections={selectedCollections}
        onCollectionSelect={handleCollectionSelect}
        onRemoveCollection={handleRemoveCollection}
        isExpanded={isCollectionsExpanded}
        onExpandToggle={handleCollectionButtonPress}
      />

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
  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: "auto",
  },
  saveButton: {
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
    color: "#1C4A5A",
    fontSize: 16,
  },
});

export default AddLinkView;
