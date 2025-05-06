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
  View
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


import {getChatCompletion, LinkContext, Message, MessageHistory} from "@/lib/ai";

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
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
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
      );

      setMessages(prev => [
        ...prev,
        {
          id: streamingMessageId,
          text: finalResponse,
          isUser: false,
        },
      ]);
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
        <Animated.View style={[isDark ? styles.inputContainer__dark : styles.inputContainer, inputStyle]}>
          <TouchableOpacity
            style={isDark ? styles.addButton__dark : styles.addButton}
            onPress={handleShowResources}>
            <AntDesign name="plus" size={20} color={isDark ? "#A0B3BC" : "#777"} />
          </TouchableOpacity>

          <View style={{ flex: 1, position: 'relative' }}>
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

            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText || isLoading) && (isDark ? styles.sendButtonDisabled__dark : styles.sendButtonDisabled),
              ]}
              onPress={handleSend}
              disabled={!inputText || isLoading}>
              <AntDesign
                name="arrowup"
                size={20}
                color={
                  inputText && !isLoading
                    ? "#fff"
                    : isDark ? "#555" : "#888"
                }
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
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