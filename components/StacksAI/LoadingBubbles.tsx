import React from 'react';
import {ColorSchemeName, View} from 'react-native';
import {styles} from './styles';

type LoadingBubblesProps = {
  colorScheme?: ColorSchemeName;
};

const LoadingBubbles = ({ colorScheme }: LoadingBubblesProps) => {
  const isDark = colorScheme === 'dark';
  
  return (
    <View style={styles.loadingBubbles}>
      <View style={[isDark ? styles.bubble__dark : styles.bubble, styles.bubble1]} />
      <View style={[isDark ? styles.bubble__dark : styles.bubble, styles.bubble2]} />
      <View style={[isDark ? styles.bubble__dark : styles.bubble, styles.bubble3]} />
    </View>
  );
};

export default LoadingBubbles; 