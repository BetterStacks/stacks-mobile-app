import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ColorSchemeName, FlatList, Text, TextInput, View} from 'react-native';
import {useQuery} from '@apollo/client';
import {AntDesign} from '@expo/vector-icons';
import {QUERY_SEARCH_LINKS} from '@/lib/api/graphql/queries';
import {styles} from './styles';
import LinkItem from './LinkItem';
import {LinkContext} from '@/lib/ai';

type AddResourcesDrawerProps = {
  onLinksSelected: (links: LinkContext[]) => void;
  selectedLinks: LinkContext[];
  colorScheme?: ColorSchemeName;
};

const AddResourcesDrawer = ({ onLinksSelected, selectedLinks, colorScheme }: AddResourcesDrawerProps) => {
  const isDark = colorScheme === 'dark';
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
    <View style={isDark ? styles.drawerContainer__dark : styles.drawerContainer}>
      <View style={styles.drawerContent}>
        <Text style={[isDark ? styles.drawerTitle__dark : styles.drawerTitle, { marginBottom: 16, marginTop: 8 }]}>Add resources to context</Text>

        <View style={isDark ? styles.searchContainer__dark : styles.searchContainer}>
          <AntDesign name="search1" size={18} color={isDark ? "#A0B3BC" : "#6B7280"} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={isDark ? styles.searchInput__dark : styles.searchInput}
            placeholder="Search your links..."
            placeholderTextColor={isDark ? "#777" : "#9CA3AF"}
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={isDark ? styles.emptyText__dark : styles.emptyText}>Loading...</Text>
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
                colorScheme={colorScheme}
              />
            )}
            style={styles.linksList}
            contentContainerStyle={styles.linksListContent}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={isDark ? styles.emptyText__dark : styles.emptyText}>
              {searchQuery ? "No links found" : "Start typing to search links"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default AddResourcesDrawer; 