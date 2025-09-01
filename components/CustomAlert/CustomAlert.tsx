import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ColorSchemeName,
} from 'react-native';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  onClose: () => void;
  colorScheme?: ColorSchemeName;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons,
  onClose,
  colorScheme,
}) => {
  const isDark = colorScheme === 'dark';

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  const getButtonStyle = (style?: string) => {
    switch (style) {
      case 'destructive':
        return {
          color: '#ff4444',
          fontWeight: '600' as const,
        };
      case 'cancel':
        return {
          color: isDark ? '#A0B3BC' : '#6B7280',
          fontWeight: '500' as const,
        };
      default:
        return {
          color: isDark ? '#0a7ea4' : '#0a7ea4',
          fontWeight: '600' as const,
        };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
            borderRadius: 16,
            paddingVertical: 24,
            paddingHorizontal: 20,
            minWidth: 280,
            maxWidth: 340,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 12,
          }}
          onPress={() => {}} // Prevent closing when tapping the alert itself
        >
          {/* Title */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: isDark ? '#FFFFFF' : '#1F2937',
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            {title}
          </Text>

          {/* Message */}
          <Text
            style={{
              fontSize: 14,
              lineHeight: 20,
              color: isDark ? '#D1D5DB' : '#6B7280',
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            {message}
          </Text>

          {/* Buttons */}
          <View
            style={{
              flexDirection: buttons.length === 2 ? 'row' : 'column',
              gap: 12,
            }}
          >
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  flex: buttons.length === 2 ? 1 : undefined,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor: 
                    button.style === 'destructive' 
                      ? 'rgba(255, 68, 68, 0.1)' 
                      : button.style === 'cancel'
                      ? isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
                      : isDark ? 'rgba(10, 126, 164, 0.15)' : 'rgba(10, 126, 164, 0.1)',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor:
                    button.style === 'destructive'
                      ? 'rgba(255, 68, 68, 0.2)'
                      : button.style === 'cancel'
                      ? isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'
                      : isDark ? 'rgba(10, 126, 164, 0.3)' : 'rgba(10, 126, 164, 0.2)',
                }}
                onPress={() => handleButtonPress(button)}
              >
                <Text
                  style={{
                    ...getButtonStyle(button.style),
                    fontSize: 16,
                    textAlign: 'center',
                  }}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CustomAlert;