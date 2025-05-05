import React from 'react';
import { View } from 'react-native';
import { styles } from './styles';

const LoadingBubbles = () => {
  return (
    <View style={styles.loadingBubbles}>
      <View style={[styles.bubble, styles.bubble1]} />
      <View style={[styles.bubble, styles.bubble2]} />
      <View style={[styles.bubble, styles.bubble3]} />
    </View>
  );
};

export default LoadingBubbles; 