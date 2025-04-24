import React, { useEffect, useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors as colors } from '@/components/design/colors';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useQuery, useMutation } from '@apollo/client';
import { QUERY_QUICK_NOTES } from '@/lib/api/graphql/queries';
import { MUTATION_UPDATE_QUICK_NOTE, MUTATION_CREATE_QUICK_NOTE } from '@/lib/api/graphql/mutations';
import Markdown from 'react-native-markdown-display';
import { Toast } from "toastify-react-native";

// Define types
interface QuickNote {
  id: string;
  content: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export default function QuickNoteEditorScreen() {
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
  const markdownStyles = {
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
    },
    heading2: {
      fontSize: 20,
      marginTop: 16,
      marginBottom: 8,
      fontWeight: 'bold',
    },
    heading3: {
      fontSize: 18,
      marginTop: 16,
      marginBottom: 8,
      fontWeight: 'bold',
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.TextColor.LignMainColor} />
      </SafeAreaView>
    );
  }

  if (error && !isCreateMode) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Error loading note</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <AntDesign name="arrowleft" size={24} color="#000" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
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
                color="#000" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleSave}
              disabled={isSaving}
            >
              <AntDesign name="check" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.content}
        >
          {isPreviewMode ? (
            <ScrollView style={styles.previewContainer}>
              <Markdown style={markdownStyles as any}>
                {noteContent}
              </Markdown>
            </ScrollView>
          ) : (
            <ScrollView style={styles.editorContainer}>
              <TextInput
                style={styles.editor}
                multiline
                value={noteContent}
                onChangeText={setNoteContent}
                placeholder="Start writing your note here..."
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
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
  },
  editor: {
    minHeight: '100%',
    padding: 16,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  previewContainer: {
    flex: 1,
    padding: 16,
  },
}); 