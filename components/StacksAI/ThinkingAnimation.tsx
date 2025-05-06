import React, {useEffect} from 'react';
import {ColorSchemeName, Text, View} from 'react-native';
import Animated, {
	Easing,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from 'react-native-reanimated';
import {styles} from './styles';

type ThinkingAnimationProps = {
  colorScheme?: ColorSchemeName;
};

const ThinkingAnimation = ({ colorScheme }: ThinkingAnimationProps) => {
  const isDark = colorScheme === 'dark';
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
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
      transform: [{ translateX }],
    };
  });

  return (
    <View style={styles.thinkingContainer}>
      <View style={isDark ? styles.thinkingTextContainer__dark : styles.thinkingTextContainer}>
        <Text style={isDark ? styles.thinkingText__dark : styles.thinkingText}>Thinking...</Text>
        <Animated.View style={shimmerStyle} />
      </View>
    </View>
  );
};

export default ThinkingAnimation; 