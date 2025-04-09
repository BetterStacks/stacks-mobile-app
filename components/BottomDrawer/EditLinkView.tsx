import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useMutation, useQuery } from "@apollo/client";
import { MUTATION_UPDATE_LINK } from "api/graphql/mutations";
import { QUERY_COLLECTIONS } from "api/graphql/queries";
import { CollectionSelector } from "shared/components/CollectionSelector/CollectionSelector";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SELECTED_WORKSPACE_ID_KEY } from "shared/constants/storage";
import Colors from "shared/design/colors";
import { Link } from "types/Link";
import { Tag, Brain, MessageSquare } from "lucide-react-native";
import FastImage from "react-native-fast-image";
import { parseAnnotationSelectedText } from "shared/utils/annotations";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { getFont } from "shared/design/fonts/fonts";
import { EFontWeight } from "shared/design/fonts/types";
import { scaleHeight, scaleWidth } from "shared/utils/design/scale";
import { LinkContext } from "screens/StacksAIScreen/types";

type Props = {
  onBack: () => void;
  onClose: () => void;
  link: Link;
  onSuccess?: (message: { title: string; description: string }) => void;
};

type RootStackParamList = {
  StacksAIScreen: {
    initialContext?: LinkContext[];
    clearChat?: boolean;
  };
};

type NavigationProps = NavigationProp<RootStackParamList>;

const EditLinkView = ({ onBack, onClose, link, onSuccess }: Props) => {
  const navigation = useNavigation<NavigationProps>();
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    link.collections?.map(c => c.id) || [],
  );
  const [notes, setNotes] = useState(link.notes || "");

  const [isCollectionsExpanded, setIsCollectionsExpanded] = useState(false);
  const [repositoryId, setRepositoryId] = useState<string | null>(null);

  const hasChanges = useMemo(() => {
    const originalCollections = link.collections?.map(c => c.id) || [];
    const collectionsChanged =
      selectedCollections.length !== originalCollections.length ||
      !selectedCollections.every(id => originalCollections.includes(id));

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

  const handleCollectionSelect = (collectionId: string) => {
    setSelectedCollections(prev =>
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId],
    );
  };

  const handleRemoveCollection = (collectionId: string) => {
    setSelectedCollections(prev => prev.filter(id => id !== collectionId));
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

  const handleAIChatPress = useCallback(() => {
    navigation.navigate("StacksAIScreen", {
      initialContext: [
        {
          title: link.title,
          description: link.description || "",
          link_content: link.link_content || "",
        },
      ],
      clearChat: true,
    });
    onClose();
  }, [link, navigation, onClose]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit link</Text>

      <View style={styles.linkPreview}>
        {link.image_url && (
          <FastImage
            source={{ uri: link.image_url }}
            style={styles.linkImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.linkInfo}>
          <Text style={styles.linkTitle} numberOfLines={2}>
            {link.title}
          </Text>
          <View style={styles.urlBox}>
            <FastImage
              source={{ uri: link.favicon_url }}
              style={styles.favicon}
            />
            <Text style={styles.url} numberOfLines={1}>
              {link.target_url}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={styles.notesInput}
        placeholder="Add your notes here..."
        value={notes}
        onChangeText={setNotes}
        multiline
        textAlignVertical="top"
        numberOfLines={4}
      />

      <Text style={styles.label}>Collections</Text>
      <CollectionSelector
        collections={collectionsData?.collections || []}
        selectedCollections={selectedCollections}
        onCollectionSelect={handleCollectionSelect}
        onRemoveCollection={handleRemoveCollection}
        isExpanded={isCollectionsExpanded}
        onExpandToggle={() => setIsCollectionsExpanded(!isCollectionsExpanded)}
      />

      {link.tags && link.tags.length > 0 && (
        <>
          <Text style={styles.label}>Tags</Text>
          <View style={styles.tagsWrapper}>
            {link.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Tag size={14} color={Colors.tailwindColors.neutral["500"]} />
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {annotations.length > 0 && (
        <>
          <Text style={styles.label}>Annotations ({annotations.length})</Text>
          <View style={styles.annotationsWrapper}>
            {annotations.map((annotation, index) => (
              <View key={index} style={styles.annotationItem}>
                <View style={styles.highlightBar} />
                <View style={styles.annotationContent}>
                  <Text style={styles.annotationText}>
                    {annotation.selected_text}
                  </Text>
                  <View style={styles.annotationAuthor}>
                    <FastImage
                      style={styles.authorImage}
                      source={{ uri: annotation.author.image_url }}
                    />
                    <Text style={styles.byText}>By </Text>
                    <Text style={styles.authorName}>
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
          <Text style={styles.label}>Comments ({comments.length})</Text>
          <View style={styles.commentsWrapper}>
            {comments.map((comment, index) => (
              <View key={index} style={styles.commentItem}>
                <FastImage
                  style={styles.commentAuthorImage}
                  source={{ uri: comment.author.image_url }}
                />
                <View style={styles.commentContent}>
                  <Text style={styles.authorName}>{comment.author.name}</Text>
                  <Text style={styles.commentText}>{comment.comment}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={styles.aiSection}>
        <TouchableOpacity
          style={styles.aiButton}
          onPress={handleAIChatPress}
          activeOpacity={0.8}>
          <Brain size={16} color={Colors.TextColor.MainColor} />
          <Text style={styles.aiButtonText}>Chat with AI</Text>
          <MessageSquare size={14} color={Colors.TextColor.MainColor} />
        </TouchableOpacity>
      </View>

      {hasChanges && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onBack}
            disabled={loading}>
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
  tagText: {
    fontSize: 14,
    color: Colors.TextColor.DarkHeadingColor,
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
  authorName: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.TextColor.DarkHeadingColor,
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
  linkPreview: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    padding: 12,
    gap: 12,
    alignItems: "center",
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
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.tailwindColors.neutral["200"],
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    height: 100,
    textAlignVertical: "top",
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
});

export default EditLinkView;
