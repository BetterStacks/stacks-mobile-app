import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { styles } from './styles';
import LinkItem from './LinkItem';
import { LinkContext } from '@/lib/ai';

type ViewContextDrawerProps = {
  links: LinkContext[];
  onClose: () => void;
};

const ViewContextDrawer = ({ links, onClose }: ViewContextDrawerProps) => {
  return (
    <View style={styles.drawerContainer}>
      <Text style={styles.drawerTitle}>Context Resources</Text>
      
      {links.length > 0 ? (
        <FlatList
          data={links}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <LinkItem
              link={item}
              isSelected={false}
              onToggle={() => {}}
            />
          )}
          style={styles.linksList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No context resources added</Text>
        </View>
      )}
    </View>
  );
};

export default ViewContextDrawer; 