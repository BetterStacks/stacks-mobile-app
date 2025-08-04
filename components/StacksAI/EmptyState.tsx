import React from 'react';
import {ColorSchemeName, Image, Text, TouchableOpacity, View} from 'react-native';
import {AntDesign} from '@expo/vector-icons';
import {styles} from './styles';
import {AIToken, getChatCompletion, LinkContext, Message} from '@/lib/ai';
import {reviewTriggerService} from '@/lib/services/reviewTriggerService';
import {UseChatsReturn} from '@/hooks/useChats';

type EmptyStateProps = {
  aiToken: AIToken;
  selectedLinks: LinkContext[];
  setIsLoading: (loading: boolean) => void;
  setCurrentStreamingMessage: (message: any) => void;
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
  colorScheme?: ColorSchemeName;
  // Chat persistence props
  chatService: UseChatsReturn;
  currentChatUuid: string | null;
  setCurrentChatUuid: (uuid: string | null) => void;
  isNewChat: boolean;
  setIsNewChat: (isNew: boolean) => void;
};

const EmptyState = ({ 
  aiToken, 
  selectedLinks, 
  setIsLoading,
  setCurrentStreamingMessage,
  setMessages,
  colorScheme,
  chatService,
  currentChatUuid,
  setCurrentChatUuid,
  isNewChat,
  setIsNewChat
}: EmptyStateProps) => {
  const isDark = colorScheme === 'dark';
  const suggestions = [
    { text: "What are some productivity tips?", icon: "bulb1" as const },
    { text: "How can I improve my focus?", icon: "eyeo" as const },
    { text: "Give me time management advice", icon: "clockcircleo" as const },
    { text: "Help me organize my day better", icon: "calendar" as const }
  ];

  const handleSuggestionClick = async (suggestionText: string) => {
    // First, add the user message to the chat
    const userMessageId = Date.now().toString();
    const userMessage: Message = {
      id: userMessageId,
      text: suggestionText,
      isUser: true,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Create chat if this is the first message
    let chatUuid = currentChatUuid;
    if (isNewChat && !chatUuid) {
      try {
        const title = suggestionText.length > 50 
          ? suggestionText.substring(0, 47) + "..." 
          : suggestionText;
        
        chatUuid = await chatService.createChat(title, suggestionText);
        setCurrentChatUuid(chatUuid);
        setIsNewChat(false);
      } catch (error) {
        // Continue without persistence if chat creation fails
      }
    }

    // Set up the streaming message
    const streamingMessageId = (Date.now() + 1).toString();
    setCurrentStreamingMessage({
      id: streamingMessageId,
      text: "",
      isUser: false,
    });

    try {
      // Persist user message if we have a chat UUID (for subsequent messages after first)
      if (chatUuid && !isNewChat) {
        try {
          await chatService.addMessage(chatUuid, suggestionText, 'user');
        } catch (error) {
          // Failed to save user message
        }
      }

      const finalResponse = await getChatCompletion(
        suggestionText,
        aiToken,
        partialResponse => {
          setCurrentStreamingMessage(prev =>
            prev ? { ...prev, text: partialResponse } : null,
          );
        },
        selectedLinks,
        []
      );
      
      // Clear streaming message first to prevent flicker
      setCurrentStreamingMessage(null);
      
      // Once complete, add the final message
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
        } catch (error) {
          // Failed to save assistant message
        }
      }
      
      // Persist AI context (selected links) if we have a chat UUID
      if (chatUuid && selectedLinks.length > 0) {
        try {
          for (const link of selectedLinks) {
            await chatService.addContext(chatUuid, 'link', 'RepositoryLink', link.id);
          }
        } catch (error) {
          // Failed to save AI context
        }
      }

      // Track successful AI interaction for review trigger
      await reviewTriggerService.trackAIInteraction();
    } catch (error) {
      
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

  return (
    <View style={styles.emptyState}>
      <View style={isDark ? styles.logoContainer__dark : styles.logoContainer}>
        <Image 
          source={require('@/assets/png/stacks-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Text style={isDark ? styles.emptyStateTitle__dark : styles.emptyStateTitle}>
        How can I help you today?
      </Text>
      <Text style={isDark ? styles.emptyStateDescription__dark : styles.emptyStateDescription}>
        Ask me anything or try one of these suggestions.
      </Text>
      <View style={styles.suggestionsContainer}>
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={isDark ? styles.suggestionButton__dark : styles.suggestionButton}
            onPress={() => handleSuggestionClick(suggestion.text)}>
            <AntDesign name={suggestion.icon} size={16} color={isDark ? "#777" : "#888"} style={styles.suggestionIcon} />
            <Text style={isDark ? styles.suggestionText__dark : styles.suggestionText}>{suggestion.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default EmptyState; 