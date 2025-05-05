import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { styles } from './styles';

const ThinkingAnimation = () => {
  const shimmerValue = useSharedValue(0);
  
  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerValue.value,
      [0, 1],
      [-100, 100]
    );
    
    return {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      transform: [{ translateX }],
    };
  });

  return (
    <View style={styles.thinkingContainer}>
      <View style={styles.thinkingTextContainer}>
        <Text style={styles.thinkingText}>Thinking...</Text>
        <Animated.View style={shimmerStyle} />
      </View>
    </View>
  );
};

export default ThinkingAnimation; 