import React, {useEffect, useMemo, useState} from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	Modal,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	useColorScheme,
	View,
} from "react-native";
import {useMutation, useQuery} from "@apollo/client";

import AntDesign from "@expo/vector-icons/AntDesign";
import FastImage from "react-native-fast-image";
import {Link} from "@/lib/types/Link";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {SELECTED_WORKSPACE_ID_KEY} from "@/lib/constants";
import {QUERY_COLLECTIONS} from "@/lib/api/graphql/queries";
import {MUTATION_DELETE_LINK, MUTATION_UPDATE_LINK} from "@/lib/api/graphql/mutations";
import {parseAnnotationSelectedText} from "@/lib/utils";
import {CollectionSelector} from "../CollectionSelector";
import {Colors} from "../design/colors";
import {scaleHeight, scaleWidth} from "../design/scale";
import {getFont} from "../design/fonts/fonts";
import {EFontWeight} from "../design/fonts/types";
import {Toast} from "toastify-react-native";

type Props = {
  onBack: () => void;
  onClose: () => void;
  link: Link;
  onSuccess?: (message: { title: string; description: string }) => void;
};

// type RootStackParamList = {
//   StacksAIScreen: {
//     initialContext?: LinkContext[];
//     clearChat?: boolean;
//   };
// };

// type NavigationProps = NavigationProp<RootStackParamList>;

const EditLinkView = ({ onBack, onClose, link, onSuccess }: Props) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  // const navigation = useNavigation<NavigationProps>();
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    link.collections?.map((c) => c.id) || [],
  );
  const [notes, setNotes] = useState(link.notes || "");

  const [isCollectionsExpanded, setIsCollectionsExpanded] = useState(false);
  const [repositoryId, setRepositoryId] = useState<string | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const hasChanges = useMemo(() => {
    const originalCollections = link.collections?.map((c) => c.id) || [];
    const collectionsChanged =
      selectedCollections.length !== originalCollections.length ||
      !selectedCollections.every((id) => originalCollections.includes(id));

    return notes !== link.notes || collectionsChanged;
  }, [notes, selectedCollections, link]);

  useEffect(() => {
    const loadWorkspaceId = async () => {
      const storedId = await AsyncStorage.getItem(SELECTED_WORKSPACE_ID_KEY);
      setRepositoryId(storedId);
    };
    loadWorkspaceId();
  }, []);

  const { data: collectionsData } = useQuery(QUERY_COLLECTIONS, {
    variables: {
      query: "",
      repositoryId: repositoryId || undefined,
    },
  });

  const [updateLink, { loading }] = useMutation(MUTATION_UPDATE_LINK, {
    onCompleted: () => {
      onClose();
      if (onSuccess) {
        onSuccess({
          title: "Link updated successfully!",
          description: "Your changes have been saved",
        });
      }
    },
    onError: (error) => {
      Toast.error(error.message || "Failed to update link");
    }
  });

  const [deleteLink, { loading: deleteLoading }] = useMutation(MUTATION_DELETE_LINK, {
    onCompleted: () => {
      if (onSuccess) {
        onSuccess({
          title: "Link deleted successfully!",
          description: "The link has been removed",
        });
      }
      Toast.success("Link deleted successfully!");
      onClose();
    },
    onError: (error) => {
      Toast.error(error.message || "Failed to delete link");
    }
  });

  const handleSave = async () => {
    try {
      await updateLink({
        variables: {
          link_id: link.id,
          title: link.title,
          target_url: link.target_url,
          notes,
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
      console.error("Error updating link:", error);
    }
  };

  const handleDelete = () => {
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteLink({
        variables: {
          link_id: link.id,
        },
        refetchQueries: [
          "QUERY_LINKS",
          "QUERY_STACKS",
          "QUERY_DOMAIN_LINKS",
          "QUERY_DOMAIN_LINKS_BY_STACKID",
          "QUERY_STACK_LINKS",
        ],
        update: (cache) => {
          // Remove the deleted link from Apollo cache for different queries
          cache.modify({
            fields: {
              links: (existingLinks = [], { readField }) => {
                return existingLinks.filter(
                  // @ts-ignore
                  linkRef => readField('id', linkRef) !== link.id
                );
              },
              stack_links: (existingLinks = [], { readField }) => {
                return existingLinks.filter(
                  // @ts-ignore
                  linkRef => readField('id', linkRef) !== link.id
                );
              },
              // For domain links
              domain_links: (existingDomains = []) => {
                return existingDomains;
              },
              // For domain links by stack id
              domain_links_by_stackid: (existingDomains = []) => {
                return existingDomains;
              }
            }
          });
          
          // Invalidate queries to force refetch
          cache.evict({ fieldName: 'links' });
          cache.evict({ fieldName: 'stack_links' });
          cache.gc();
        }
      });
    } catch (error) {
      console.error("Error deleting link:", error);
    } finally {
      setIsDeleteModalVisible(false);
    }
  };

  const handleCollectionSelect = (collectionId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId],
    );
  };

  const handleRemoveCollection = (collectionId: string) => {
    setSelectedCollections((prev) => prev.filter((id) => id !== collectionId));
  };

  const { annotations, comments } = useMemo(() => {
    if (!link.annotations) return { annotations: [], comments: [] };

    return link.annotations.reduce(
      (acc, item) => {
        if (item.annotation_comments.length === 0 && item.selected_text) {
          acc.annotations.push({
            ...item,
            selected_text: parseAnnotationSelectedText(item.selected_text),
          });
        } else if (item.annotation_comments.length > 0 && !item.selected_text) {
          acc.comments.push(...item.annotation_comments);
        }
        return acc;
      },
      { annotations: [], comments: [] } as {
        annotations: (typeof link.annotations)[0][];
        comments: (typeof link.annotations)[0]["annotation_comments"][0][];
      },
    );
  }, [link]);

  // const handleAIChatPress = useCallback(() => {
  //   navigation.navigate("StacksAIScreen", {
  //     initialContext: [
  //       {
  //         title: link.title,
  //         description: link.description || "",
  //         link_content: link.link_content || "",
  //       },
  //     ],
  //     clearChat: true,
  //   });
  //   onClose();
  // }, [link, navigation, onClose]);

  return (
    <View style={isDark ? styles.container_dark : styles.container}>
      <Text style={isDark ? styles.title_dark : styles.title}>Edit link</Text>

      <View style={isDark ? styles.linkPreview_dark : styles.linkPreview}>
        {link.image_url && (
          <Image
            source={{ uri: link.image_url }}
            style={styles.linkImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.linkInfo}>
          <Text style={isDark ? styles.linkTitle_dark : styles.linkTitle} numberOfLines={2}>
            {link.title}
          </Text>
          <View style={styles.urlBox}>
            <Image source={{ uri: link.favicon_url }} style={styles.favicon} />
            <Text style={styles.url} numberOfLines={1}>
              {link.target_url}
            </Text>
          </View>
        </View>
      </View>

      <Text style={isDark ? styles.label_dark : styles.label}>Notes</Text>
      <TextInput
        style={isDark ? styles.notesInput_dark : styles.notesInput}
        placeholder="Add your notes here..."
        placeholderTextColor={isDark ? "#8F8F8F" : undefined}
        value={notes}
        onChangeText={setNotes}
        multiline
        textAlignVertical="top"
        numberOfLines={4}
      />

      <Text style={isDark ? styles.label_dark : styles.label}>Collections</Text>
      <CollectionSelector
        collections={collectionsData?.collections || []}
        selectedCollections={selectedCollections}
        onCollectionSelect={handleCollectionSelect}
        onRemoveCollection={handleRemoveCollection}
        isExpanded={isCollectionsExpanded}
        onExpandToggle={() => setIsCollectionsExpanded(!isCollectionsExpanded)}
        colorScheme={colorScheme}
      />

      {link.tags && link.tags.length > 0 && (
        <>
          <Text style={isDark ? styles.label_dark : styles.label}>Tags</Text>
          <View style={styles.tagsWrapper}>
            {link.tags.map((tag, index) => (
              <View key={index} style={isDark ? styles.tag_dark : styles.tag}>
                <AntDesign
                  name="tags"
                  size={14}
                  color={isDark ? "#8EACB7" : Colors.tailwindColors.neutral["500"]}
                />
                <Text style={isDark ? styles.tagText_dark : styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {annotations.length > 0 && (
        <>
          <Text style={isDark ? styles.label_dark : styles.label}>Annotations ({annotations.length})</Text>
          <View style={styles.annotationsWrapper}>
            {annotations.map((annotation, index) => (
              <View key={index} style={styles.annotationItem}>
                <View style={isDark ? styles.highlightBar_dark : styles.highlightBar} />
                <View style={styles.annotationContent}>
                  <Text style={isDark ? styles.annotationText_dark : styles.annotationText}>
                    {annotation.selected_text}
                  </Text>
                  <View style={styles.annotationAuthor}>
                    <FastImage
                      style={styles.authorImage}
                      source={{ uri: annotation.author.image_url }}
                    />
                    <Text style={isDark ? styles.byText_dark : styles.byText}>By </Text>
                    <Text style={isDark ? styles.authorName_dark : styles.authorName}>
                      {annotation.author.name}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {comments.length > 0 && (
        <>
          <Text style={isDark ? styles.label_dark : styles.label}>Comments ({comments.length})</Text>
          <View style={styles.commentsWrapper}>
            {comments.map((comment, index) => (
              <View key={index} style={isDark ? styles.commentItem_dark : styles.commentItem}>
                <FastImage
                  style={styles.commentAuthorImage}
                  source={{ uri: comment.author.image_url }}
                />
                <View style={styles.commentContent}>
                  <Text style={isDark ? styles.authorName_dark : styles.authorName}>{comment.author.name}</Text>
                  <Text style={isDark ? styles.commentText_dark : styles.commentText}>{comment.comment}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {/* AI Chat section has been disabled
      <View style={styles.aiSection}>
        <TouchableOpacity
          style={styles.aiButton}
          onPress={handleAIChatPress}
          activeOpacity={0.8}
        >
          <AntDesign name="rocket1" size={16} color={Colors.TextColor.MainColor} />
          <Text style={styles.aiButtonText}>Chat with AI</Text>
          <AntDesign name="message1" size={14} color={Colors.TextColor.MainColor} />
        </TouchableOpacity>
      </View>
      */}

      <View style={styles.buttonContainer}>
        {hasChanges && (
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading || deleteLoading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        )}
        
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onBack}
            disabled={loading || deleteLoading}
          >
            <Text style={isDark ? styles.cancelButtonText_dark : styles.cancelButtonText}>
              Cancel
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={loading || deleteLoading}
          >
            {deleteLoading ? (
              <ActivityIndicator size="small" color={isDark ? "#CF6679" : "#E53935"} />
            ) : (
              <View style={styles.deleteButtonContent}>
                <AntDesign name="delete" size={14} color={isDark ? "#CF6679" : "#E53935"} />
                <Text style={isDark ? styles.deleteButtonText_dark : styles.deleteButtonText}>
                  Delete
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Delete Modal */}
      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={isDark ? styles.modalView_dark : styles.modalView}>
            <Text style={isDark ? styles.modalTitle_dark : styles.modalTitle}>Delete Link</Text>
            <Text style={isDark ? styles.modalMessage_dark : styles.modalMessage}>
              Are you sure you want to delete this link? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, isDark ? styles.cancelModalButton_dark : styles.cancelModalButton]}
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text style={isDark ? styles.cancelModalButtonText_dark : styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteModalButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteModalButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  container_dark: {
    padding: 16,
    backgroundColor: '#171717',
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: '#1C4A5A',
  },
  title_dark: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: '#FFFFFF',
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
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  deleteButtonText: {
    color: Colors.tailwindColors.neutral["700"],
    fontSize: 14,
    fontWeight: "500",
  },
  deleteButtonText_dark: {
    color: Colors.tailwindColors.neutral["300"],
    fontSize: 14,
    fontWeight: "500",
  },
  cancelButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.tailwindColors.neutral["500"],
    fontSize: 14,
    fontWeight: "500",
  },
  cancelButtonText_dark: {
    color: Colors.tailwindColors.neutral["400"],
    fontSize: 14,
    fontWeight: "500",
  },
  tagsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.tailwindColors.neutral["100"],
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  tag_dark: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#262626",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  tagText: {
    fontSize: 14,
    color: Colors.TextColor.DarkHeadingColor,
  },
  tagText_dark: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  annotationsWrapper: {
    gap: 16,
    marginBottom: 16,
    marginTop: 16,
  },
  annotationItem: {
    flexDirection: "row",
    overflow: "hidden",
  },
  highlightBar: {
    width: 4,
    backgroundColor: Colors.tailwindColors.neutral["400"],
  },
  highlightBar_dark: {
    width: 4,
    backgroundColor: "#8EACB7",
  },
  annotationContent: {
    flex: 1,
    paddingLeft: 12,
  },
  annotationText: {
    fontSize: 14,
    color: Colors.tailwindColors.neutral["700"],
    lineHeight: 20,
    fontStyle: "italic",
    marginBottom: 8,
  },
  annotationText_dark: {
    fontSize: 14,
    color: "#FFFFFF",
    lineHeight: 20,
    fontStyle: "italic",
    marginBottom: 8,
  },
  annotationAuthor: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  byText: {
    fontSize: 14,
    color: Colors.tailwindColors.neutral["500"],
  },
  byText_dark: {
    fontSize: 14,
    color: "#8F8F8F",
  },
  authorName: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.TextColor.DarkHeadingColor,
  },
  authorName_dark: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  commentsWrapper: {
    gap: 12,
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    alignItems: "flex-start",
  },
  commentItem_dark: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    alignItems: "flex-start",
    backgroundColor: "#262626",
  },
  commentAuthorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentText: {
    fontSize: 14,
    color: Colors.tailwindColors.neutral["700"],
    lineHeight: 20,
    marginTop: 4,
  },
  commentText_dark: {
    fontSize: 14,
    color: "#A0B3BC",
    lineHeight: 20,
    marginTop: 4,
  },
  linkPreview: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    padding: 12,
    gap: 12,
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  linkPreview_dark: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    padding: 12,
    gap: 12,
    alignItems: "center",
    backgroundColor: "#262626",
  },
  linkImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: Colors.tailwindColors.neutral["100"],
  },
  linkInfo: {
    flex: 1,
    gap: 4,
  },
  urlBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  favicon: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  url: {
    fontSize: 12,
    color: Colors.tailwindColors.neutral["500"],
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.TextColor.DarkHeadingColor,
    lineHeight: 18,
  },
  linkTitle_dark: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    lineHeight: 18,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.tailwindColors.neutral["200"],
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    height: 100,
    textAlignVertical: "top",
    backgroundColor: "#FFFFFF",
  },
  notesInput_dark: {
    borderWidth: 1,
    borderColor: "#262626",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    height: 100,
    textAlignVertical: "top",
    backgroundColor: "#262626",
    color: "#FFFFFF",
  },
  aiSection: {
    marginTop: scaleHeight(16),
    width: "100%",
    marginBottom: scaleHeight(16),
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scaleWidth(12),
    paddingVertical: scaleHeight(8),
    borderRadius: scaleHeight(8),
    gap: scaleWidth(6),
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.tailwindColors.neutral["200"],
  },
  aiButtonText: {
    ...getFont(EFontWeight.Medium),
    fontSize: scaleHeight(13),
    color: Colors.TextColor.MainColor,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%',
  },
  modalView_dark: {
    margin: 20,
    backgroundColor: '#262626',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.TextColor.DarkHeadingColor,
  },
  modalTitle_dark: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#FFFFFF',
  },
  modalMessage: {
    marginBottom: 24,
    fontSize: 16,
    textAlign: 'center',
    color: Colors.tailwindColors.neutral["600"],
  },
  modalMessage_dark: {
    marginBottom: 24,
    fontSize: 16,
    textAlign: 'center',
    color: Colors.tailwindColors.neutral["300"],
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelModalButton: {
    backgroundColor: Colors.tailwindColors.neutral["100"],
  },
  cancelModalButton_dark: {
    backgroundColor: Colors.tailwindColors.neutral["700"],
  },
  cancelModalButtonText: {
    color: Colors.tailwindColors.neutral["700"],
    fontSize: 16,
    fontWeight: '600',
  },
  cancelModalButtonText_dark: {
    color: Colors.tailwindColors.neutral["300"],
    fontSize: 16,
    fontWeight: '600',
  },
  deleteModalButton: {
    backgroundColor: '#E53935',
  },
  deleteModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditLinkView;
