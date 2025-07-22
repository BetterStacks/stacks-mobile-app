import React, {useCallback, useEffect, useState} from "react";
import {
	ActivityIndicator,
	SafeAreaView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	useColorScheme,
	View,
} from "react-native";
import {useMutation} from "@apollo/client";
import {MUTATION_ADD_NEW_COLLECTION,} from "@/lib/api/graphql/mutations";
import client from "@/lib/apollo/client";
import {Colors} from "@/components/design/colors";
import {router} from "expo-router";
import {AntDesign} from "@expo/vector-icons";
import {Toast} from "toastify-react-native";
import {reviewTriggerService} from "@/lib/services/reviewTriggerService";

export const CreateCollectionScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [title, setTitle] = useState("");
  const [organizationSessionId, setOrganizationSessionId] = useState<string | null>(null);
  const [createNewCollection, { loading }] = useMutation(
    MUTATION_ADD_NEW_COLLECTION,
  );

  // Start organization session when component mounts
  useEffect(() => {
    const startSession = async () => {
      const sessionId = await reviewTriggerService.startOrganizationSession();
      setOrganizationSessionId(sessionId);
    };
    startSession();

    // End session when component unmounts
    return () => {
      if (organizationSessionId) {
        reviewTriggerService.endOrganizationSession(organizationSessionId);
      }
    };
  }, []);

  const handleCreateCollection = useCallback(() => {
    if (title.trim()) {
      createNewCollection({
        variables: {
          collection: title,
        },
      })
        .then(async (response) => {
          // Get the new collection ID from the response
          const newCollectionId = response.data.add_new_collection;
          
          // Track organization action for review trigger
          if (organizationSessionId) {
            await reviewTriggerService.trackOrganizationAction(organizationSessionId);
          }
          
          // Show success toast
          Toast.success(`Collection "${title}" created successfully!`);

          // Immediately refetch the collections data
          client.refetchQueries({
            include: ["QUERY_COLLECTIONS", "QUERY_COLLECTION_LINKS"],
          });

          // Navigate to the newly created collection and replace the history
          setTimeout(() => {
            router.replace({
              pathname: "/collection/[id]",
              params: {
                id: newCollectionId,
                collectionId: newCollectionId,
                title: title,
                emoji: "📁", // Default emoji, can be updated later
              }
            });
          }, 500);
        })
        .catch((error) => {
          console.error("Failed to create collection:", error);
          Toast.error("Failed to create collection");
        });
    }
  }, [title, createNewCollection, organizationSessionId]);

  return (
    <SafeAreaView style={isDark ? styles.container_dark : styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.inputWrapper}>
          <Text style={isDark ? styles.label_dark : styles.label}>Collection Name</Text>
          <View style={isDark ? styles.inputContainer_dark : styles.inputContainer}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter collection name"
              placeholderTextColor={isDark ? "#8F8F8F" : "#999"}
              style={isDark ? styles.input_dark : styles.input}
              autoFocus={true}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createButton, !title.trim() && styles.buttonDisabled]}
          onPress={handleCreateCollection}
          disabled={!title.trim() || loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.buttonText}>Creating...</Text>
            </View>
          ) : (
            <>
              <AntDesign name="plus" size={20} color="white" />
              <Text style={styles.buttonText}>Create Collection</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.OtherColor.UsualWhite,
    padding: 20,
  },
  container_dark: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    padding: 20,
  },
  mainContent: {
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.TextColor.MainColor,
    marginBottom: 40,
    marginTop: 20,
    alignSelf: 'flex-start',
  },
  header_dark: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 40,
    marginTop: 20,
    alignSelf: 'flex-start',
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TextColor.MainColor,
    marginBottom: 10,
  },
  label_dark: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainer_dark: {
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: Colors.TextColor.MainColor,
    height: 56,
  },
  input_dark: {
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    height: 56,
  },
  createButton: {
    backgroundColor: Colors.TextColor.LignMainColor,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
    height: 56,
  },
  buttonDisabled: {
    backgroundColor: '#BBBBBB',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
