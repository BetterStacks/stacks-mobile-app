import React from 'react';
import {ColorSchemeName, Image, Text, TouchableOpacity, View} from 'react-native';
import {AntDesign} from '@expo/vector-icons';
import {styles} from './styles';
import {AIToken, getChatCompletion, LinkContext, Message} from '@/lib/ai';

type EmptyStateProps = {
  aiToken: AIToken;
  selectedLinks: LinkContext[];
  setIsLoading: (loading: boolean) => void;
  setCurrentStreamingMessage: (message: any) => void;
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
  colorScheme?: ColorSchemeName;
};

const EmptyState = ({ 
  aiToken, 
  selectedLinks, 
  setIsLoading,
  setCurrentStreamingMessage,
  setMessages,
  colorScheme
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