import React, {useEffect, useState} from 'react';
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	useColorScheme,
	View
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {Colors as colors} from '@/components/design/colors';
import AntDesign from '@expo/vector-icons/AntDesign';
import {router, Stack, useLocalSearchParams} from 'expo-router';
import {useMutation, useQuery} from '@apollo/client';
import {QUERY_QUICK_NOTES} from '@/lib/api/graphql/queries';
import {MUTATION_CREATE_QUICK_NOTE, MUTATION_UPDATE_QUICK_NOTE} from '@/lib/api/graphql/mutations';
import Markdown from 'react-native-markdown-display';
import {Toast} from "toastify-react-native";

// Define types
interface QuickNote {
  id: string;
  content: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export default function QuickNoteEditorScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { id } = useLocalSearchParams();
  const [noteContent, setNoteContent] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(!id);

  // Query to get note content
  const { data, loading, error } = useQuery(QUERY_QUICK_NOTES, {
    skip: isCreateMode // Skip query if we're creating a new note
  });
  
  // Mutations
  const [updateQuickNote] = useMutation(MUTATION_UPDATE_QUICK_NOTE);
  const [createQuickNote] = useMutation(MUTATION_CREATE_QUICK_NOTE);

  useEffect(() => {
    if (data && id) {
      const noteData = data.quick_notes.find((note: QuickNote) => note.id === id);
      if (noteData) {
        setNoteContent(noteData.content);
        // Set to preview mode when opening an existing note
        setIsPreviewMode(true);
      }
    }
  }, [data, id]);

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      
      if (isCreateMode) {
        // Create a new note
        const { data } = await createQuickNote({
          variables: {
            content: noteContent,
            color: "default"
          }
        });
        
        if (data?.create_quick_note?.id) {
          // Switch to preview mode and stay on the screen
          setIsPreviewMode(true);
          setIsCreateMode(false); // No longer in create mode
          Toast.success("Note created successfully!", "bottom");
        } else {
          console.error("Failed to create note: No ID returned");
          Toast.error("Failed to create note", "bottom");
        }
      } else {
        // Update existing note
        await updateQuickNote({
          variables: {
            id: id as string,
            content: noteContent,
            color: "default"
          }
        });
        // Switch to preview mode and stay on the screen
        setIsPreviewMode(true);
        Toast.success("Note saved successfully!", "bottom");
      }
    } catch (error) {
      console.error('Error saving note:', error);
      Toast.error("Failed to save note", "bottom");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  // Markdown styling rules
  const lightMarkdownStyles = {
    body: {
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: 16,
      lineHeight: 24,
      color: '#333333',
    },
    heading1: {
      fontSize: 24,
      marginTop: 16,
      marginBottom: 8,
      fontWeight: 'bold',
      color: '#1C4A5A',
    },
    heading2: {
      fontSize: 20,
      marginTop: 16,
      marginBottom: 8,
      fontWeight: 'bold',
      color: '#1C4A5A',
    },
    heading3: {
      fontSize: 18,
      marginTop: 16,
      marginBottom: 8,
      fontWeight: 'bold',
      color: '#1C4A5A',
    },
    link: {
      color: colors.TextColor.LignMainColor,
      textDecorationLine: 'underline' as 'underline',
    },
    blockquote: {
      backgroundColor: '#f0f0f0',
      padding: 8,
      borderLeftWidth: 4,
      borderLeftColor: '#cccccc',
      marginVertical: 8,
    },
    bullet_list: {
      marginVertical: 8,
    },
    code_block: {
      backgroundColor: '#f5f5f5',
      padding: 10,
      borderRadius: 4,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: 14,
    },
    code_inline: {
      backgroundColor: '#f5f5f5',
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: 14,
      paddingHorizontal: 4,
      borderRadius: 2,
    },
  };

  // Dark mode markdown styles
  const darkMarkdownStyles = {
    body: {
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: 16,
      lineHeight: 24,
      color: '#FFFFFF',
    },
    heading1: {
      fontSize: 24,
      marginTop: 16,
      marginBottom: 8,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    heading2: {
      fontSize: 20,
      marginTop: 16,
      marginBottom: 8,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    heading3: {
      fontSize: 18,
      marginTop: 16,
      marginBottom: 8,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    link: {
      color: '#8EACB7',
      textDecorationLine: 'underline' as 'underline',
    },
    blockquote: {
      backgroundColor: '#262626',
      padding: 8,
      borderLeftWidth: 4,
      borderLeftColor: '#505050',
      marginVertical: 8,
    },
    bullet_list: {
      marginVertical: 8,
    },
    code_block: {
      backgroundColor: '#262626',
      padding: 10,
      borderRadius: 4,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: 14,
      color: '#E0E0E0',
    },
    code_inline: {
      backgroundColor: '#262626',
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: 14,
      paddingHorizontal: 4,
      borderRadius: 2,
      color: '#E0E0E0',
    },
  };

  const markdownStyles = isDark ? darkMarkdownStyles : lightMarkdownStyles;

  if (loading) {
    return (
      <SafeAreaView style={isDark ? styles.container_dark : styles.container}>
        <ActivityIndicator size="large" color={colors.TextColor.LignMainColor} />
      </SafeAreaView>
    );
  }

  if (error && !isCreateMode) {
    return (
      <SafeAreaView style={isDark ? styles.container_dark : styles.container}>
        <Text style={isDark ? { color: "#FFFFFF" } : undefined}>Error loading note</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={isDark ? styles.container_dark : styles.container}>
        
        <View style={isDark ? styles.header_dark : styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <AntDesign name="arrowleft" size={24} color={isDark ? "#FFFFFF" : "#000"} />
          </TouchableOpacity>
          
          <Text style={isDark ? styles.headerTitle_dark : styles.headerTitle}>
            {isCreateMode ? "New Quick Note" : "Edit Quick Note"}
          </Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={togglePreviewMode}
            >
              <AntDesign 
                name={isPreviewMode ? "edit" : "eye"} 
                size={24} 
                color={isDark ? "#FFFFFF" : "#000"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleSave}
              disabled={isSaving}
            >
              <AntDesign name="check" size={24} color={isDark ? "#FFFFFF" : "#000"} />
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.content}
        >
          {isPreviewMode ? (
            <ScrollView style={isDark ? styles.previewContainer_dark : styles.previewContainer}>
              <Markdown style={markdownStyles as any}>
                {noteContent}
              </Markdown>
            </ScrollView>
          ) : (
            <ScrollView style={isDark ? styles.editorContainer_dark : styles.editorContainer}>
              <TextInput
                style={isDark ? styles.editor_dark : styles.editor}
                multiline
                value={noteContent}
                onChangeText={setNoteContent}
                placeholder="Start writing your note here..."
                placeholderTextColor={isDark ? "#8F8F8F" : "#999"}
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
              />
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container_dark: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  header_dark: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    color: '#1C4A5A',
  },
  headerTitle_dark: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginHorizontal: 8,
    padding: 4,
  },
  content: {
    flex: 1,
  },
  editorContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  editorContainer_dark: {
    flex: 1,
    backgroundColor: '#171717',
  },
  editor: {
    minHeight: '100%',
    padding: 16,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 24,
    textAlignVertical: 'top',
    color: '#333333',
  },
  editor_dark: {
    minHeight: '100%',
    padding: 16,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 24,
    textAlignVertical: 'top',
    color: '#FFFFFF',
    backgroundColor: '#171717',
  },
  previewContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  previewContainer_dark: {
    flex: 1,
    padding: 16,
    backgroundColor: '#171717',
  },
}); 