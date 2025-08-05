import React, {useCallback, useEffect, useRef, useState} from "react";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	useColorScheme,
	View,
	Image
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import Animated, {useAnimatedStyle, useSharedValue} from "react-native-reanimated";
import AntDesign from "@expo/vector-icons/AntDesign";
import {Ionicons} from "@expo/vector-icons";
import {useQuery} from "@apollo/client";
import {QUERY_USER} from "@/lib/api/graphql/queries";
import BottomDrawer from "@/components/BottomDrawer/BottomDrawer";

import {
	AddResourcesDrawer,
	EmptyState,
	MessageItem,
	NoAPIKeyView,
	styles,
	ViewContextDrawer
} from "@/components/StacksAI";
import ChatHistoryDrawer from "@/components/StacksAI/ChatHistoryDrawer";

import {getChatCompletion, LinkContext, Message, MessageHistory, FileAttachment} from "@/lib/ai";
import {generateImage} from "@/lib/ai/imageService";
import {pickFiles, getFilePreview} from "@/lib/ai/utils/fileProcessing";
import {isImageGenerationRequest, extractImagePrompt} from "@/lib/ai/utils/imagePromptDetector";
import {reviewTriggerService} from "@/lib/services/reviewTriggerService";
import {useChats} from "@/hooks/useChats";
import {Chat} from "@/lib/api/graphql/chats";

export default function StacksAIScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { data: userData } = useQuery(QUERY_USER);
  const hasAPIKey = userData?.user?.ai_tokens?.length > 0;
  const aiToken = userData?.user?.ai_tokens?.[0];
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const inputAnimation = useSharedValue(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isResourcesDrawerVisible, setIsResourcesDrawerVisible] = useState(false);
  const [isViewContextDrawerVisible, setIsViewContextDrawerVisible] = useState(false);
  const [isChatHistoryDrawerVisible, setIsChatHistoryDrawerVisible] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] =
    useState<Message | null>(null);
  const [selectedLinks, setSelectedLinks] = useState<LinkContext[]>([]);
  const [selectedAttachments, setSelectedAttachments] = useState<FileAttachment[]>([]);
  
  // Chat persistence state
  const [currentChatUuid, setCurrentChatUuid] = useState<string | null>(null);
  const [isNewChat, setIsNewChat] = useState(true);
  const [skipInitialLoad, setSkipInitialLoad] = useState(false);
  
  // Chat persistence hook
  const chatService = useChats();

  // Watch for chat data changes and update messages
  useEffect(() => {
    if (chatService.currentChatMessages?.length > 0) {
      const chatMessages = chatService.currentChatMessages.map((msg): Message => {
        const message: Message = {
          id: msg.chat_message_uuid,
          text: msg.content,
          isUser: msg.role === 'user'
        };

        // Parse metadata to reconstruct attachments and generated images
        if (msg.metadata) {
          try {
            const metadata = typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata;
            
            if (metadata.type === 'attachment' && metadata.attachments) {
              message.attachments = metadata.attachments;
            } else if (metadata.type === 'image_generated' && metadata.generatedImage) {
              // Handle both URL strings and full GeneratedImage objects
              if (typeof metadata.generatedImage === 'string') {
                // If it's a URL string, create a GeneratedImage object
                message.generatedImage = {
                  url: metadata.generatedImage,
                  mediaType: 'image/png',
                  prompt: metadata.prompt || '',
                  savedUrl: metadata.generatedImage,
                  savedTitle: metadata.savedTitle || undefined
                };
              } else {
                // If it's already a GeneratedImage object, use it directly
                message.generatedImage = metadata.generatedImage;
              }
            }
          } catch {
            // Ignore malformed metadata
          }
        }

        return message;
      });
      
      setMessages(chatMessages);
      // Chat messages loaded from persistence
    }
  }, [chatService.currentChatMessages]);


  // Load chat when currentChatUuid changes (and it's not a new chat)
  useEffect(() => {
    if (currentChatUuid && !isNewChat && !skipInitialLoad) {
      chatService.loadChat(currentChatUuid);
    }
  }, [currentChatUuid, isNewChat, skipInitialLoad]); // Removed chatService from dependencies

  // Watch for chat data changes and update selected links (AI contexts)
  useEffect(() => {
    if (chatService.currentChat?.ai_contexts && chatService.currentChat.ai_contexts.length > 0) {
      const linkContexts = chatService.currentChat.ai_contexts
        .filter((context: any) => context.contextable_type === 'RepositoryLink')
        .map((context: any): LinkContext => ({
          id: context.contextable.id,
          title: context.contextable.title,
          description: context.contextable.link_description || '',
          link_content: context.contextable.link_content || '',
        }));
      
      setSelectedLinks(linkContexts);
      // AI contexts (links) loaded from persistence
    } else if (chatService.currentChat) {
      // Clear selected links if no contexts
      setSelectedLinks([]);
    }
  }, [chatService.currentChat]);


  // Helper function to save attachments to server asynchronously
  const saveAttachmentsAsync = async (attachments: FileAttachment[]) => {
    const savedAttachments = [];
    
    
    for (let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i];
      
      try {
        if (attachment.uri || attachment.base64) {
          // Create file object for custom upload link (not ReactNativeFile)
          let fileObj;
          
          if (attachment.base64) {
            // For base64 files, create plain object
            fileObj = {
              uri: `data:${attachment.mimeType};base64,${attachment.base64}`,
              type: attachment.mimeType,
              name: attachment.name
            };
          } else if (attachment.uri) {
            // For URI files, create plain object
            fileObj = {
              uri: attachment.uri,
              type: attachment.mimeType,
              name: attachment.name
            };
          }
          
          
          const result = await chatService.addFile(fileObj!);
          
          savedAttachments.push({
            ...attachment,
            savedUrl: result.target_url,
            savedTitle: result.title
          });
        }
      } catch (error) {
        console.error('❌ File upload failed:', error);
        // If saving fails, keep original attachment info
        savedAttachments.push(attachment);
      }
    }
    
    return savedAttachments;
  };

  // Helper function to save generated image asynchronously  
  const saveGeneratedImageAsync = async (imageBase64: string) => {
    try {
      // Convert base64 to plain file object for custom upload link
      const imageFile = {
        uri: `data:image/png;base64,${imageBase64}`,
        type: 'image/png',
        name: `generated_image_${Date.now()}.png`
      };
      
      const result = await chatService.addFile(imageFile);
      return {
        originalBase64: imageBase64,
        savedUrl: result.target_url,
        savedTitle: result.title
      };
    } catch (error) {
      // If saving fails, return original
      return {
        originalBase64: imageBase64
      };
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading || !aiToken) return;

    const originalInputText = inputText;
    const originalAttachments = [...selectedAttachments];
    
    // Create user message immediately with original attachments for display
    const userMessage: Message = {
      id: Date.now().toString(),
      text: originalInputText,
      isUser: true,
      attachments: originalAttachments.length > 0 ? originalAttachments : undefined,
    };

    // Send message immediately to UI
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setSelectedAttachments([]);
    setIsLoading(true);
    
    // Show typing indicator immediately
    const streamingMessageId = (Date.now() + 1).toString();
    setCurrentStreamingMessage({
      id: streamingMessageId,
      text: "",
      isUser: false,
    });
    
    // Create chat if this is the first message
    let chatUuid = currentChatUuid;
    let isFirstMessage = isNewChat && !chatUuid;
    if (isFirstMessage) {
      try {
        const title = originalInputText.length > 50 
          ? originalInputText.substring(0, 47) + "..." 
          : originalInputText;
        
        // Creating new chat
        chatUuid = await chatService.createChat(title, originalInputText);
        setCurrentChatUuid(chatUuid);
        setIsNewChat(false);
        setSkipInitialLoad(true);
      } catch (error) {
        // Continue without persistence if chat creation fails
      }
    }

    try {
      // Save attachments in background and persist user message if needed
      let attachmentMetadata: any = null;
      if (originalAttachments.length > 0) {
        // Save attachments in background (don't block UI)
        saveAttachmentsAsync(originalAttachments)
          .then(savedAttachments => {
            attachmentMetadata = {
              type: 'attachment',
              attachments: savedAttachments.map(att => ({
                ...att,
                uri: att.savedUrl || att.uri,
                title: att.savedTitle || att.name
              }))
            };
            
            // Update the persisted message with saved attachment metadata (for subsequent messages only)
            if (chatUuid && !isFirstMessage) {
              chatService.addMessage(chatUuid, originalInputText, 'user', attachmentMetadata)
                .catch(error => console.error('❌ Failed to save user message with attachments:', error));
            }
          })
          .catch(error => {
            console.error('❌ Background attachment save failed:', error);
            // Still try to save message without metadata if attachment save fails
            if (chatUuid && !isFirstMessage) {
              chatService.addMessage(chatUuid, originalInputText, 'user')
                .catch(error => console.error('❌ Failed to save user message:', error));
            }
          });
      } else {
        // No attachments, save message normally
        if (chatUuid && !isFirstMessage) {
          try {
            await chatService.addMessage(chatUuid, originalInputText, 'user');
            // User message saved to chat
          } catch (error) {
            // Failed to save user message
          }
        }
      }

      // Check if this is an image generation request
      if (isImageGenerationRequest(originalInputText)) {
        setCurrentStreamingMessage(prev =>
          prev ? { ...prev, text: "Generating image..." } : null,
        );

        const imagePrompt = extractImagePrompt(originalInputText);
        const imageResult = await generateImage(imagePrompt, aiToken);

        // Save generated image to get saved URL
        let savedImageInfo: any = null;
        if (imageResult.image.base64) {
          try {
            savedImageInfo = await saveGeneratedImageAsync(imageResult.image.base64);
          } catch (error) {
            // If saving fails, use original base64
            savedImageInfo = { originalBase64: imageResult.image.base64 };
          }
        } else {
          // No base64 data available
          savedImageInfo = { originalBase64: '' };
        }

        const imageMetadata = {
          type: 'image_generated',
          generatedImage: savedImageInfo.savedUrl || `data:image/png;base64,${savedImageInfo.originalBase64}`,
          prompt: imagePrompt,
          savedUrl: savedImageInfo.savedUrl || undefined,
          savedTitle: savedImageInfo.savedTitle || undefined
        };

        const aiMessage: Message = {
          id: streamingMessageId,
          text: `I've generated an image based on your prompt: "${imagePrompt}"`,
          isUser: false,
          generatedImage: {
            base64: imageResult.image.base64 || undefined,
            url: savedImageInfo.savedUrl || undefined,
            mediaType: imageResult.image.mediaType || 'image/png',
            prompt: imagePrompt,
            savedUrl: savedImageInfo.savedUrl || undefined,
            savedTitle: savedImageInfo.savedTitle || undefined
          },
        };

        // Clear streaming message first to prevent flicker
        setCurrentStreamingMessage(null);
        
        // Then add the final message
        setMessages(prev => [...prev, aiMessage]);
        
        // Persist assistant message for image generation with metadata
        if (chatUuid) {
          try {
            await chatService.addMessage(chatUuid, aiMessage.text, 'assistant', imageMetadata);
            // Image generation message saved to chat
          } catch (error) {
            // Failed to save image generation message
          }
        }
        
        // Persist AI context (selected links) for image generation if we have a chat UUID
        if (chatUuid && selectedLinks.length > 0) {
          try {
            for (const link of selectedLinks) {
              await chatService.addContext(chatUuid, 'link', 'RepositoryLink', link.id);
              // AI context saved to chat
            }
          } catch (error) {
            // Failed to save AI context
          }
        }
      } else {
        // Regular chat completion
        const messageHistory: MessageHistory[] = messages.map(msg => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.text,
        }));

        // Processing selected attachments for API call

        const finalResponse = await getChatCompletion(
          originalInputText,
          aiToken,
          partialResponse => {
            setCurrentStreamingMessage(prev =>
              prev ? { ...prev, text: partialResponse } : null,
            );
          },
          selectedLinks,
          messageHistory,
          selectedAttachments,
        );

        // Clear streaming message first to prevent flicker
        setCurrentStreamingMessage(null);
        
        // Then add the final message
        setMessages(prev => [
          ...prev,
          {
            id: streamingMessageId,
            text: finalResponse,
            isUser: false,
          },
        ]);
        
        // Persist assistant message if we have a chat UUID
        if (chatUuid) {
          try {
            await chatService.addMessage(chatUuid, finalResponse, 'assistant');
            // Assistant message saved to chat
          } catch (error) {
            // Failed to save assistant message
          }
        }
        
        // Persist AI context (selected links) if we have a chat UUID
        if (chatUuid && selectedLinks.length > 0) {
          try {
            for (const link of selectedLinks) {
              await chatService.addContext(chatUuid, 'link', 'RepositoryLink', link.id);
              // AI context saved to chat
            }
          } catch (error) {
            // Failed to save AI context
          }
        }
      }

      // Track successful AI interaction for review trigger
      await reviewTriggerService.trackAIInteraction();
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Clear streaming message first
      setCurrentStreamingMessage(null);
      
      // Then add error message
      const errorMessage: Message = {
        id: streamingMessageId,
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setSelectedLinks([]);
    setSelectedAttachments([]);
    setCurrentChatUuid(null);
    setIsNewChat(true);
    setSkipInitialLoad(false);
    // Started new chat
  }, []);

  const handleChatSelect = useCallback(async (chat: Chat) => {
    try {
      // Loading chat
      
      // Close the drawer first
      setIsChatHistoryDrawerVisible(false);
      
      // Set current chat immediately
      setCurrentChatUuid(chat.chat_uuid);
      setIsNewChat(false);
      setSkipInitialLoad(false); // Allow loading for selected chats
      setSelectedLinks([]);
      setSelectedAttachments([]);
      
      // Load the chat messages (this will trigger the query)
      chatService.loadChat(chat.chat_uuid);
      
      // Chat loading initiated
    } catch (error) {
      // Failed to load chat
    }
  }, []); // Removed chatService dependency

  // Handle when current chat is deleted by checking if it still exists
  // Only check for deletion if we're not in "new chat" mode (to avoid false positives for newly created chats)
  useEffect(() => {
    if (currentChatUuid && !isNewChat && !chatService.chatsLoading && chatService.chats.length > 0) {
      const chatExists = chatService.chats.some(chat => chat.chat_uuid === currentChatUuid);
      if (!chatExists) {
        // Current chat was deleted, start a new chat
        handleNewChat();
        // Current chat was deleted, started new chat
      }
    }
  }, [chatService.chats, currentChatUuid, isNewChat, chatService.chatsLoading, handleNewChat]);

  const handleMessageSend = useCallback((userMessageText: string, aiResponseText: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      isUser: true,
    };

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: aiResponseText,
      isUser: false,
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);
  }, []);

  const inputStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: inputAnimation.value }],
    };
  });

  const handleShowResources = useCallback(() => {
    setIsResourcesDrawerVisible(true);
  }, []);

  const handleCloseResourcesDrawer = useCallback(() => {
    setIsResourcesDrawerVisible(false);
  }, []);
  
  const handleShowViewContext = useCallback(() => {
    setIsViewContextDrawerVisible(true);
  }, []);

  const handleCloseViewContextDrawer = useCallback(() => {
    setIsViewContextDrawerVisible(false);
  }, []);

  const handleCloseChatHistoryDrawer = useCallback(() => {
    setIsChatHistoryDrawerVisible(false);
  }, []);

  const handlePickFiles = useCallback(async () => {
    try {
      const files = await pickFiles();
      setSelectedAttachments(prev => [...prev, ...files]);
    } catch (error) {
      console.error('Error picking files:', error);
    }
  }, []);

  const handleRemoveAttachment = useCallback((attachmentId: string) => {
    setSelectedAttachments(prev => prev.filter(att => att.id !== attachmentId));
  }, []);

  // No API Key View
  if (!hasAPIKey) {
    return (
      <SafeAreaView style={isDark ? styles.container__dark : styles.container}>
        <NoAPIKeyView colorScheme={colorScheme} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={isDark ? styles.container__dark : styles.container}>
      <View style={isDark ? styles.header__dark : styles.header}>
        <View style={styles.headerTitle}>
          <AntDesign name="message1" size={16} color={isDark ? "#A0B3BC" : "#555"} style={{marginRight: 7}} />
          <Text style={isDark ? styles.headerTitleText__dark : styles.headerTitleText}>Stacks AI</Text>
        </View>
        <View style={styles.headerActions}>
          {selectedLinks.length > 0 && (
            <TouchableOpacity 
              style={[
                isDark ? styles.headerButton__dark : styles.headerButton, 
                isDark ? styles.contextButton__dark : styles.contextButton
              ]} 
              onPress={handleShowViewContext}
            >
              <AntDesign name="paperclip" size={18} color={isDark ? "#A0B3BC" : "#333"} />
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{selectedLinks.length}</Text>
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={isDark ? styles.headerButton__dark : styles.headerButton} 
            onPress={() => setIsChatHistoryDrawerVisible(true)}
          >
            <Ionicons name="time-outline" size={18} color={isDark ? "#A0B3BC" : "#333"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={isDark ? styles.headerButton__dark : styles.headerButton} 
            onPress={handleNewChat}
          >
            <AntDesign name="plus" size={18} color={isDark ? "#A0B3BC" : "#333"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={[
          styles.messagesContent,
          messages.length === 0 && styles.emptyMessagesContent,
        ]}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
        keyboardShouldPersistTaps="handled">
        {messages.length === 0 ? (
          <EmptyState 
            aiToken={aiToken}
            selectedLinks={selectedLinks}
            setIsLoading={setIsLoading}
            setCurrentStreamingMessage={setCurrentStreamingMessage}
            setMessages={setMessages}
            colorScheme={colorScheme}
            chatService={chatService}
            currentChatUuid={currentChatUuid}
            setCurrentChatUuid={setCurrentChatUuid}
            isNewChat={isNewChat}
            setIsNewChat={setIsNewChat}
          />
        ) : (
          <>
            {messages.map(message => (
              <MessageItem key={message.id} message={message} colorScheme={colorScheme} />
            ))}
            {currentStreamingMessage && (
              <MessageItem message={currentStreamingMessage} colorScheme={colorScheme} />
            )}
          </>
        )}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
        <View style={[isDark ? styles.inputContainer__dark : styles.inputContainer]}>
          <Animated.View style={[{ width: '100%' }, inputStyle]}>
            {/* Input Field - Full Width */}
            <View style={{ width: '100%', position: 'relative' }}>
              {/* Attachments Preview - Above Input */}
              {selectedAttachments.length > 0 && (
                <View style={{
                  marginBottom: 12,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                }}>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: isDark ? '#A0B3BC' : '#666',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}>Attachments ({selectedAttachments.length})</Text>
                  <ScrollView 
                    horizontal 
                    contentContainerStyle={{ paddingRight: 8 }}
                    showsHorizontalScrollIndicator={false}
                  >
                    {selectedAttachments.map((attachment) => {
                      const preview = getFilePreview(attachment);
                      return (
                        <View 
                          key={attachment.id}
                          style={{
                            backgroundColor: isDark ? '#1A1A1A' : '#ffffff',
                            borderRadius: 10,
                            padding: 10,
                            marginRight: 8,
                            minWidth: 100,
                            maxWidth: 140,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: isDark ? '#333333' : '#E5E5E5',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: isDark ? 0.3 : 0.1,
                            shadowRadius: 3,
                            elevation: 2,
                          }}
                        >
                          {attachment.type === 'image' && attachment.uri ? (
                            <Image 
                              source={{ uri: attachment.uri }}
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: 8,
                                marginBottom: 8,
                              }}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={{
                              backgroundColor: preview.color + '20',
                              borderRadius: 8,
                              padding: 12,
                              marginBottom: 8,
                            }}>
                              <AntDesign 
                                name={preview.icon as any} 
                                size={24} 
                                color={preview.color} 
                              />
                            </View>
                          )}
                          
                          <Text 
                            style={{
                              fontSize: 11,
                              fontWeight: '500',
                              color: isDark ? '#E5E5E5' : '#333',
                              textAlign: 'center',
                              marginBottom: 6,
                            }}
                            numberOfLines={2}
                          >
                            {attachment.name.length > 20 ? attachment.name.substring(0, 20) + '...' : attachment.name}
                          </Text>
                          
                          <TouchableOpacity 
                            onPress={() => handleRemoveAttachment(attachment.id)}
                            style={{ 
                              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                              borderRadius: 12,
                              padding: 4,
                              position: 'absolute',
                              top: 4,
                              right: 4,
                            }}
                          >
                            <AntDesign 
                              name="close" 
                              size={12} 
                              color={isDark ? '#A0B3BC' : '#666'} 
                            />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Full-width Text Input */}
              <View style={{ position: 'relative', marginBottom: 8 }}>
                <TextInput
                  style={[isDark ? styles.input__dark : styles.input, styles.inputWithButton]}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder={
                    isLoading ? "Please wait..." : 
                    "Ask anything..."
                  }
                  placeholderTextColor={isDark ? "#777" : "#888"}
                  multiline
                  returnKeyType="send"
                  onSubmitEditing={handleSend}
                  blurOnSubmit={false}
                  editable={!isLoading}
                />
                
                {/* Send Button - Positioned inside input */}
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!inputText || isLoading) && (isDark ? styles.sendButtonDisabled__dark : styles.sendButtonDisabled),
                  ]}
                  onPress={handleSend}
                  disabled={!inputText || isLoading}>
                  <AntDesign
                    name="arrowup"
                    size={18}
                    color={
                      inputText && !isLoading
                        ? "#fff"
                        : isDark ? "#555" : "#888"
                    }
                  />
                </TouchableOpacity>
              </View>
              
              {/* Action Buttons Row - Below input */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 8 }}>
                <TouchableOpacity
                  style={[isDark ? styles.actionButton__dark : styles.actionButton, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, width: 'auto' }]}
                  onPress={handleShowResources}>
                  <AntDesign name="plus" size={16} color={isDark ? "#A0B3BC" : "#666"} />
                  <Text style={{ marginLeft: 6, fontSize: 14, color: isDark ? "#A0B3BC" : "#666", fontWeight: '500' }}>Resources</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[isDark ? styles.actionButton__dark : styles.actionButton, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, width: 'auto' }]}
                  onPress={handlePickFiles}>
                  <AntDesign name="paperclip" size={14} color={isDark ? "#A0B3BC" : "#666"} />
                  <Text style={{ marginLeft: 6, fontSize: 14, color: isDark ? "#A0B3BC" : "#666", fontWeight: '500' }}>Attach</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
      
      <View style={{position: 'absolute'}}>
        <BottomDrawer 
          isVisible={isResourcesDrawerVisible}
          onClose={handleCloseResourcesDrawer}
          customContent={
            <AddResourcesDrawer
              onLinksSelected={setSelectedLinks}
              selectedLinks={selectedLinks}
              colorScheme={colorScheme}
            />
          }
        />
      </View>
      
      <View style={{position: 'absolute'}}>
        <BottomDrawer 
          isVisible={isViewContextDrawerVisible}
          onClose={handleCloseViewContextDrawer}
          customContent={
            <ViewContextDrawer
              links={selectedLinks}
              onClose={handleCloseViewContextDrawer}
              colorScheme={colorScheme}
            />
          }
        />
      </View>
      
      <View style={{position: 'absolute'}}>
        <BottomDrawer 
          isVisible={isChatHistoryDrawerVisible}
          onClose={handleCloseChatHistoryDrawer}
          customContent={
            <ChatHistoryDrawer
              onChatSelect={handleChatSelect}
              colorScheme={colorScheme}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
} 