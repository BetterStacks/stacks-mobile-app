import React from 'react';
import {ColorSchemeName, FlatList, Text, View} from 'react-native';
import {styles} from './styles';
import LinkItem from './LinkItem';
import {LinkContext} from '@/lib/ai';

type ViewContextDrawerProps = {
  links: LinkContext[];
  onClose: () => void;
  colorScheme?: ColorSchemeName;
};

const ViewContextDrawer = ({ links, onClose, colorScheme }: ViewContextDrawerProps) => {
  const isDark = colorScheme === 'dark';
  
  return (
    <View style={isDark ? styles.drawerContainer__dark : styles.drawerContainer}>
      <Text style={isDark ? styles.drawerTitle__dark : styles.drawerTitle}>Context Resources</Text>
      
      {links.length > 0 ? (
        <FlatList
          data={links}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={index === 0 ? { marginTop: 18 } : undefined}>
              <LinkItem
                link={item}
                isSelected={false}
                onToggle={() => {}}
                colorScheme={colorScheme}
                showCheckbox={false}
              />
            </View>
          )}
          style={styles.linksList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={isDark ? styles.emptyText__dark : styles.emptyText}>No context resources added</Text>
        </View>
      )}
    </View>
  );
};

export default ViewContextDrawer; 