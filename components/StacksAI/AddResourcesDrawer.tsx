import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList } from 'react-native';
import { useQuery } from '@apollo/client';
import { AntDesign } from '@expo/vector-icons';
import { QUERY_SEARCH_LINKS } from '@/lib/api/graphql/queries';
import { styles } from './styles';
import LinkItem from './LinkItem';
import { LinkContext } from '@/lib/ai';

type AddResourcesDrawerProps = {
  onLinksSelected: (links: LinkContext[]) => void;
  selectedLinks: LinkContext[];
};

const AddResourcesDrawer = ({ onLinksSelected, selectedLinks }: AddResourcesDrawerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  const { data: linksData, loading } = useQuery(QUERY_SEARCH_LINKS, {
    variables: {
      query: searchQuery,
      domain: "",
      page: 1,
    },
    skip: !searchQuery,
  });

  // Focus the input when the component mounts
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const toggleLinkSelection = useCallback(
    (link: any) => {
      const linkContext: LinkContext = {
        title: link.title,
        description: link.description || "",
        link_content: link.link_content || "",
      };

      const isSelected = selectedLinks.some(l => l.title === link.title);
      const newSelectedLinks = isSelected
        ? selectedLinks.filter(l => l.title !== link.title)
        : [...selectedLinks, linkContext];

      onLinksSelected(newSelectedLinks);
    },
    [selectedLinks, onLinksSelected],
  );

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerContent}>
        <Text style={styles.drawerTitle}>Add resources to context</Text>

        <View style={styles.searchContainer}>
          <AntDesign name="search1" size={18} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search your links..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        ) : linksData?.links?.length ? (
          <FlatList
            data={linksData.links}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <LinkItem
                link={item}
                isSelected={selectedLinks.some(l => l.title === item.title)}
                onToggle={() => toggleLinkSelection(item)}
              />
            )}
            style={styles.linksList}
            contentContainerStyle={styles.linksListContent}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? "No links found" : "Start typing to search links"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default AddResourcesDrawer; 