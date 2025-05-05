import React from 'react';
import { View, Text, Image } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { styles } from './styles';
import { markdownStyles } from './markdownStyles';
import ThinkingAnimation from './ThinkingAnimation';
import { Message } from '@/lib/ai';

type MessageItemProps = {
  message: Message;
};

const MessageItem = ({ message }: MessageItemProps) => {
  if (message.isUser) {
    return (
      <View style={[styles.messageBubble, styles.userMessage]}>
        <Text style={[styles.messageText, styles.userMessageText]}>
          {message.text}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.assistantMessageContainer}>
      <View style={styles.assistantAvatarContainer}>
        <Image 
          source={require('@/assets/png/stacks-logo.png')}
          style={styles.assistantAvatar}
          resizeMode="contain"
        />
      </View>
      <View style={[styles.messageBubble, styles.aiMessage]}>
        {message.text ? (
          <Markdown style={markdownStyles}>
            {message.text}
          </Markdown>
        ) : (
          <ThinkingAnimation />
        )}
      </View>
    </View>
  );
};

export default MessageItem; 