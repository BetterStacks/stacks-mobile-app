import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_QUICK_NOTES } from "@/lib/api/graphql/queries";
import { MUTATION_CREATE_QUICK_NOTE } from "@/lib/api/graphql/mutations";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors as colors } from "@/components/design/colors";
import { router, Stack } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export default function QuickNotesScreen() {
  const { loading, error, data, refetch } = useQuery(QUERY_QUICK_NOTES);
  const [createQuickNote] = useMutation(MUTATION_CREATE_QUICK_NOTE);

  // Animation values for FAB
  const scrollY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);
  const fabAnimation = useSharedValue(1);

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
      <TouchableOpacity 
        style={styles.noteItem}
        onPress={() => {
          router.push({
            pathname: "/quick-note-editor",
            params: { id: item.id }
          });
        }}
      >
        <View style={styles.noteHeader}>
          <View style={styles.iconContainer}>
            <AntDesign name="file1" size={16} color={colors.TextColor.LignMainColor} />
          </View>
          <Text style={styles.noteTitle} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
        </View>
        
        {preview && (
          <Text style={styles.notePreview} numberOfLines={2} ellipsizeMode="tail">
            {preview}
          </Text>
        )}
        
        <Text style={styles.noteDate}>{formattedDate}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <AntDesign name="arrowleft" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quick Notes</Text>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.TextColor.LignMainColor} />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text>Error loading notes</Text>
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
                <Text style={styles.emptyStateText}>No quick notes yet</Text>
                <Text style={styles.emptyStateSubtext}>Create your first note!</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE"
  },
  backButton: {
    marginRight: 16
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600"
  },
  listContent: {
    padding: 16
  },
  noteItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    // Simple, uniform border
    borderWidth: 1,
    borderColor: 'rgba(230, 230, 230, 0.9)',
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
  noteTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    letterSpacing: 0.2,
  },
  notePreview: {
    fontSize: 14,
    color: "#757575",
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
    marginBottom: 8
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#757575"
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