import {ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, useColorScheme, View} from "react-native";
import React, {useCallback, useEffect, useState} from "react";
import {useMutation, useQuery} from "@apollo/client";
import {QUERY_QUICK_NOTES} from "@/lib/api/graphql/queries";
import {MUTATION_CREATE_QUICK_NOTE, MUTATION_DELETE_QUICK_NOTE} from "@/lib/api/graphql/mutations";
import {SafeAreaView} from "react-native-safe-area-context";
import {Colors as colors} from "@/components/design/colors";
import {router, Stack} from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import {StatusBar} from "expo-status-bar";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {Swipeable} from "react-native-gesture-handler";
import {Toast} from "toastify-react-native";

export default function QuickNotesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { loading, error, data, refetch } = useQuery(QUERY_QUICK_NOTES);
  const [createQuickNote] = useMutation(MUTATION_CREATE_QUICK_NOTE);
  const [deleteQuickNote] = useMutation(MUTATION_DELETE_QUICK_NOTE);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Animation values for FAB
  const scrollY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);
  const fabAnimation = useSharedValue(1);

  // Store reference to open swipeable items
  const swipeableRefs = React.useRef<Map<string, Swipeable>>(new Map());

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentScrollY = event.contentOffset.y;
      if (currentScrollY > lastScrollY.value && currentScrollY > 10) {
        // Scrolling down - hide FAB
        fabAnimation.value = withSpring(0);
      } else {
        // Scrolling up - show FAB
        fabAnimation.value = withSpring(1);
      }
      lastScrollY.value = currentScrollY;
      scrollY.value = currentScrollY;
    },
  });

  const fabStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: fabAnimation.value,
        },
      ],
      opacity: fabAnimation.value,
    };
  });

  useEffect(() => {
    // Refresh data when screen is focused
    refetch();
  }, [refetch]);

  const handleCreateNewNote = () => {
    // Navigate directly to the editor in create mode
    router.push({
      pathname: "/quick-note-editor"
    });
  };

  const closeAllSwipeables = () => {
    swipeableRefs.current.forEach((ref) => {
      ref?.close();
    });
  };

  const confirmDelete = useCallback((id: string) => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            const swipeable = swipeableRefs.current.get(id);
            swipeable?.close();
          }
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDelete(id),
        },
      ],
      { cancelable: false }
    );
  }, []);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteQuickNote({
        variables: {
          quick_note_id: id
        }
      });
      await refetch();
      Toast.success("Note deleted successfully", "bottom");
    } catch (error) {
      console.error("Error deleting note:", error);
      Toast.error("Failed to delete note", "bottom");
    } finally {
      setDeletingId(null);
    }
  };

  const renderRightActions = useCallback((id: string) => {
    return (
      <View style={styles.deleteContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDelete(id)}
          disabled={deletingId === id}
        >
          {deletingId === id ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <AntDesign name="delete" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    );
  }, [confirmDelete, deletingId]);

  const renderNoteItem = ({ item }: { item: any }) => {
    // Extract first line as title
    const title = item.content.split('\n')[0].replace(/^#+ /, '') || 'Untitled Note';
    
    // Get a preview of the content (excluding the first line)
    const contentLines = item.content.split('\n').slice(1);
    const preview = contentLines.join(' ').trim().substring(0, 80);
    
    // Format date
    const date = new Date(item.created_at);
    const formattedDate = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });

    return (
      <Swipeable
        ref={(ref) => {
          if (ref) {
            swipeableRefs.current.set(item.id, ref);
          } else {
            swipeableRefs.current.delete(item.id);
          }
        }}
        renderRightActions={() => renderRightActions(item.id)}
        onSwipeableOpen={() => {
          // Close all other open swipeables
          swipeableRefs.current.forEach((ref, id) => {
            if (id !== item.id) {
              ref?.close();
            }
          });
        }}
      >
        <TouchableOpacity 
          style={isDark ? styles.noteItem_dark : styles.noteItem}
          onPress={() => {
            closeAllSwipeables();
            router.push({
              pathname: "/quick-note-editor",
              params: { id: item.id }
            });
          }}
        >
          <View style={styles.noteHeader}>
            <View style={isDark ? styles.iconContainer_dark : styles.iconContainer}>
              <AntDesign name="file1" size={16} color={colors.TextColor.LignMainColor} />
            </View>
            <Text style={isDark ? styles.noteTitle_dark : styles.noteTitle} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
          </View>
          
          {preview && (
            <Text style={isDark ? styles.notePreview_dark : styles.notePreview} numberOfLines={2} ellipsizeMode="tail">
              {preview}
            </Text>
          )}
          
          <Text style={isDark ? styles.noteDate_dark : styles.noteDate}>{formattedDate}</Text>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={isDark ? styles.container_dark : styles.container}>
        <View style={isDark ? styles.header_dark : styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <AntDesign name="arrowleft" size={24} color={isDark ? "#FFFFFF" : "#000"} />
          </TouchableOpacity>
          <Text style={isDark ? styles.headerTitle_dark : styles.headerTitle}>Quick Notes</Text>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.TextColor.LignMainColor} />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={isDark ? { color: "#FFFFFF" } : undefined}>Error loading notes</Text>
          </View>
        ) : (
          <Animated.FlatList
            data={data?.quick_notes || []}
            renderItem={renderNoteItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={isDark ? styles.emptyStateText_dark : styles.emptyStateText}>No quick notes yet</Text>
                <Text style={isDark ? styles.emptyStateSubtext_dark : styles.emptyStateSubtext}>Create your first note!</Text>
              </View>
            }
          />
        )}

        <Animated.View style={[styles.fab, fabStyle]}>
          <TouchableOpacity 
            style={styles.fabButton}
            onPress={handleCreateNewNote}
          >
            <AntDesign name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA"
  },
  container_dark: {
    flex: 1,
    backgroundColor: "#0A0A0A"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE"
  },
  header_dark: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#262626"
  },
  backButton: {
    marginRight: 16
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C4A5A"
  },
  headerTitle_dark: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF"
  },
  listContent: {
    padding: 16
  },
  noteItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(230, 230, 230, 0.9)',
  },
  noteItem_dark: {
    backgroundColor: "#171717",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#262626',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 130, 140, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainer_dark: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 130, 140, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noteTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    letterSpacing: 0.2,
  },
  noteTitle_dark: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  notePreview: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 12,
    lineHeight: 20,
    paddingLeft: 44, // Align with title
  },
  notePreview_dark: {
    fontSize: 14,
    color: "#A0B3BC",
    marginBottom: 12,
    lineHeight: 20,
    paddingLeft: 44, // Align with title
  },
  noteDate: {
    fontSize: 12,
    color: "#AAAAAA",
    fontWeight: "400",
    paddingLeft: 44, // Align with title and preview
  },
  noteDate_dark: {
    fontSize: 12,
    color: "#707070",
    fontWeight: "400",
    paddingLeft: 44, // Align with title and preview
  },
  deleteContainer: {
    marginBottom: 16,
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333333"
  },
  emptyStateText_dark: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 8,
    color: "#FFFFFF"
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#757575"
  },
  emptyStateSubtext_dark: {
    fontSize: 14,
    color: "#A0B3BC"
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.TextColor.LignMainColor,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  fabButton: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 