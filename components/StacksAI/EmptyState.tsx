import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { styles } from './styles';
import { AIToken, MessageHistory, LinkContext, Message } from '@/lib/ai';
import { getChatCompletion } from '@/lib/ai';

type EmptyStateProps = {
  aiToken: AIToken;
  selectedLinks: LinkContext[];
  setIsLoading: (loading: boolean) => void;
  setCurrentStreamingMessage: (message: any) => void;
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
};

const EmptyState = ({ 
  aiToken, 
  selectedLinks, 
  setIsLoading,
  setCurrentStreamingMessage,
  setMessages
}: EmptyStateProps) => {
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

    // Set up the streaming message
    const streamingMessageId = (Date.now() + 1).toString();
    setCurrentStreamingMessage({
      id: streamingMessageId,
      text: "",
      isUser: false,
    });

    try {
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
      
      // Once complete, add the final message
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
      setMessages(prev => [
        ...prev,
        {
          id: streamingMessageId,
          text: "Sorry, I encountered an error. Please try again.",
          isUser: false,
        },
      ]);
    } finally {
      setIsLoading(false);
      setCurrentStreamingMessage(null);
    }
  };

  return (
    <View style={styles.emptyState}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('@/assets/png/stacks-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.emptyStateTitle}>
        How can I help you today?
      </Text>
      <Text style={styles.emptyStateDescription}>
        Ask me anything or try one of these suggestions.
      </Text>
      <View style={styles.suggestionsContainer}>
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionButton}
            onPress={() => handleSuggestionClick(suggestion.text)}>
            <AntDesign name={suggestion.icon} size={16} color="#888" style={styles.suggestionIcon} />
            <Text style={styles.suggestionText}>{suggestion.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default EmptyState; 