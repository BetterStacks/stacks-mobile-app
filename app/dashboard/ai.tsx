import React, {useCallback, useEffect, useRef, useState} from "react";
import {
	Keyboard,
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


import {getChatCompletion, LinkContext, Message, MessageHistory, FileAttachment} from "@/lib/ai";
import {pickFiles, getFilePreview} from "@/lib/ai/utils/fileProcessing";
import {reviewTriggerService} from "@/lib/services/reviewTriggerService";

export default function StacksAIScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { data: userData } = useQuery(QUERY_USER);
  const hasAPIKey = userData?.user?.ai_tokens?.length > 0;
  const aiToken = userData?.user?.ai_tokens?.[0];
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputAnimation = useSharedValue(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isResourcesDrawerVisible, setIsResourcesDrawerVisible] = useState(false);
  const [isViewContextDrawerVisible, setIsViewContextDrawerVisible] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] =
    useState<Message | null>(null);
  const [selectedLinks, setSelectedLinks] = useState<LinkContext[]>([]);
  const [selectedAttachments, setSelectedAttachments] = useState<FileAttachment[]>([]);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      e => {
        setKeyboardHeight(e.endCoordinates.height);
      },
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading || !aiToken) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      attachments: selectedAttachments.length > 0 ? selectedAttachments : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setSelectedAttachments([]);
    setIsLoading(true);

    const streamingMessageId = (Date.now() + 1).toString();
    setCurrentStreamingMessage({
      id: streamingMessageId,
      text: "",
      isUser: false,
    });

    const messageHistory: MessageHistory[] = messages.map(msg => ({
      role: msg.isUser ? "user" : "assistant",
      content: msg.text,
    }));

    try {
      const finalResponse = await getChatCompletion(
        inputText,
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

      setMessages(prev => [
        ...prev,
        {
          id: streamingMessageId,
          text: finalResponse,
          isUser: false,
        },
      ]);

      // Track successful AI interaction for review trigger
      await reviewTriggerService.trackAIInteraction();
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: Message = {
        id: streamingMessageId,
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setCurrentStreamingMessage(null);
    }
  };

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setSelectedLinks([]);
    setSelectedAttachments([]);
  }, []);

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
                  placeholder={isLoading ? "Please wait..." : "Ask anything..."}
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
    </SafeAreaView>
  );
} 