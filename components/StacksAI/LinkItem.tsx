import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { styles } from './styles';
import { Colors } from '@/components/design/colors';

type LinkItemProps = {
  link: any;
  isSelected: boolean;
  onToggle: () => void;
};

const LinkItem = ({ link, isSelected, onToggle }: LinkItemProps) => {
  return (
    <TouchableOpacity 
      style={[styles.linkItem, isSelected && styles.selectedLinkItem]} 
      onPress={onToggle}
    >
      <View style={styles.linkContent}>
        <Text style={styles.linkTitle} numberOfLines={1}>{link.title}</Text>
        <Text style={styles.linkDescription} numberOfLines={2}>
          {link.description || "No description"}
        </Text>
      </View>
      <View style={styles.checkboxContainer}>
        {isSelected && (
          <AntDesign name="check" size={16} color={Colors.TextColor.LignMainColor} />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default LinkItem; 