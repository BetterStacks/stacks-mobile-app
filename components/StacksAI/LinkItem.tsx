import React from 'react';
import {ColorSchemeName, Text, TouchableOpacity, View} from 'react-native';
import {AntDesign} from '@expo/vector-icons';
import {styles} from './styles';
import {Colors} from '@/components/design/colors';

type LinkItemProps = {
  link: any;
  isSelected: boolean;
  onToggle: () => void;
  colorScheme?: ColorSchemeName;
};

const LinkItem = ({ link, isSelected, onToggle, colorScheme }: LinkItemProps) => {
  const isDark = colorScheme === 'dark';
  
  return (
    <TouchableOpacity 
      style={[
        isDark ? styles.linkItem__dark : styles.linkItem, 
        isSelected && (isDark ? styles.selectedLinkItem__dark : styles.selectedLinkItem)
      ]} 
      onPress={onToggle}
    >
      <View style={styles.linkContent}>
        <Text style={isDark ? styles.linkTitle__dark : styles.linkTitle} numberOfLines={1}>{link.title}</Text>
        <Text style={isDark ? styles.linkDescription__dark : styles.linkDescription} numberOfLines={2}>
          {link.description || "No description"}
        </Text>
      </View>
      <View style={isDark ? styles.checkboxContainer__dark : styles.checkboxContainer}>
        {isSelected && (
          <AntDesign name="check" size={16} color={Colors.TextColor.LignMainColor} />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default LinkItem; 