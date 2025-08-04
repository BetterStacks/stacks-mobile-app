import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  ColorSchemeName,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onHide: () => void;
  colorScheme?: ColorSchemeName;
}

const CustomToast: React.FC<CustomToastProps> = ({
  visible,
  message,
  type = 'success',
  duration = 4500,
  onHide,
  colorScheme,
}) => {
  const isDark = colorScheme === 'dark';
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      console.log('🍞 Toast showing, duration:', duration);
      
      // Reset animation values
      slideAnim.setValue(100);
      opacityAnim.setValue(0);
      
      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        console.log('🍞 Toast hiding after', duration, 'ms');
        hideToast();
      }, duration);

      return () => {
        console.log('🍞 Toast timer cleared');
        clearTimeout(timer);
      };
    } else {
      // Reset to hidden state when not visible
      slideAnim.setValue(100);
      opacityAnim.setValue(0);
    }
  }, [visible, duration]);

  const hideToast = () => {
    console.log('🍞 Starting hide animation');
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log('🍞 Hide animation complete, calling onHide');
      onHide();
    });
  };

  const getToastStyle = () => {
    const baseStyle = {
      backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
      borderColor: isDark ? '#404040' : '#E5E5E5',
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyle,
          borderLeftColor: '#10B981',
          borderLeftWidth: 4,
        };
      case 'error':
        return {
          ...baseStyle,
          borderLeftColor: '#EF4444',
          borderLeftWidth: 4,
        };
      default:
        return {
          ...baseStyle,
          borderLeftColor: isDark ? '#0a7ea4' : '#0a7ea4',
          borderLeftWidth: 4,
        };
    }
  };

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      default:
        return isDark ? '#0a7ea4' : '#0a7ea4';
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 0, // Above bottom navigation/tabs
        left: 16,
        right: 16,
        zIndex: 9999,
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
    >
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            borderWidth: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
          },
          getToastStyle(),
        ]}
      >
        <Ionicons
          name={getIconName()}
          size={20}
          color={getIconColor()}
          style={{ marginRight: 12 }}
        />
        <Text
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: '500',
            color: isDark ? '#FFFFFF' : '#1F2937',
          }}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

export default CustomToast;