import React from 'react';
import {ColorSchemeName, Image, Text, View} from 'react-native';
import Markdown from 'react-native-markdown-display';
import {styles} from './styles';
import {markdownStyles} from './markdownStyles';
import ThinkingAnimation from './ThinkingAnimation';
import {Message} from '@/lib/ai';

type MessageItemProps = {
  message: Message;
  colorScheme?: ColorSchemeName;
};

const MessageItem = ({ message, colorScheme }: MessageItemProps) => {
  const isDark = colorScheme === 'dark';
  
  if (message.isUser) {
    return (
      <View style={[styles.messageBubble, isDark ? styles.userMessage__dark : styles.userMessage]}>
        <Text style={[styles.messageText, isDark ? styles.userMessageText__dark : styles.userMessageText]}>
          {message.text}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.assistantMessageContainer}>
      <View style={isDark ? styles.assistantAvatarContainer__dark : styles.assistantAvatarContainer}>
        <Image 
          source={require('@/assets/png/stacks-logo.png')}
          style={styles.assistantAvatar}
          resizeMode="contain"
        />
      </View>
      <View style={[styles.messageBubble, isDark ? styles.aiMessage__dark : styles.aiMessage]}>
        {message.text ? (
          <Markdown style={isDark ? { ...markdownStyles, body: { ...markdownStyles.body, color: '#E5E5E5' } } : markdownStyles}>
            {message.text}
          </Markdown>
        ) : (
          <ThinkingAnimation colorScheme={colorScheme} />
        )}
      </View>
    </View>
  );
};

export default MessageItem; 