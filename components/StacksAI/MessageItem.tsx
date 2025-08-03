import React from 'react';
import {ColorSchemeName, Image, Text, View, ScrollView} from 'react-native';
import Markdown from 'react-native-markdown-display';
import {AntDesign} from '@expo/vector-icons';
import {styles} from './styles';
import {markdownStyles} from './markdownStyles';
import ThinkingAnimation from './ThinkingAnimation';
import {Message} from '@/lib/ai';
import {getFilePreview} from '@/lib/ai/utils/fileProcessing';

type MessageItemProps = {
  message: Message;
  colorScheme?: ColorSchemeName;
};

const MessageItem = ({ message, colorScheme }: MessageItemProps) => {
  const isDark = colorScheme === 'dark';
  
  if (message.isUser) {
    return (
      <View style={{ marginBottom: 16 }}>
        {/* Attachments - Displayed above message bubble, aligned to the right */}
        {message.attachments && message.attachments.length > 0 && (
          <View style={{ alignItems: 'flex-end', marginBottom: 4 }}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'flex-end' }}
            >
              {message.attachments.map((attachment) => {
                const preview = getFilePreview(attachment);
                return (
                  <View 
                    key={attachment.id}
                    style={{
                      marginLeft: 4,
                    }}
                  >
                    {attachment.type === 'image' && attachment.uri ? (
                      <Image 
                        source={{ uri: attachment.uri }}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                        }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{
                        width: 50,
                        height: 50,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        borderRadius: 6,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                      }}>
                        <AntDesign 
                          name={preview.icon as any} 
                          size={16} 
                          color={preview.color} 
                        />
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
        
        {/* Message text bubble */}
        <View style={[styles.messageBubble, isDark ? styles.userMessage__dark : styles.userMessage]}>
          <Text style={[styles.messageText, isDark ? styles.userMessageText__dark : styles.userMessageText]}>
            {message.text}
          </Text>
        </View>
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