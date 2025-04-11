import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { useQuery } from "@apollo/client";
import { ExternalLink, Globe } from "lucide-react-native";
import { Linking } from "react-native";
import { StyleSheet } from "react-native";
import { QUERY_QUICK_LINKS } from "@/lib/api/graphql/queries";
import { Loader } from "./Loader";

type QuickLink = {
  domain: string;
  id: string;
  subdomain: string;
  target_url: string;
  title: string;
};

const QuickLinkCard = ({ link }: { link: QuickLink }) => {
  const handlePress = async () => {
    try {
      await Linking.openURL(link.target_url);
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.cardHeader}>
        <View style={styles.domainContainer}>
          <Image
            source={{
              uri: `https://www.google.com/s2/favicons?domain=${link.domain}&sz=64`,
            }}
            style={styles.favicon}
            // defaultSource={Globe}
          />
          <Text style={styles.domain}>{link.domain}</Text>
        </View>
        <ExternalLink size={20} color="#4A6572" />
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {link.title}
      </Text>

      <Text style={styles.url} numberOfLines={1}>
        {link.target_url}
      </Text>
    </TouchableOpacity>
  );
};

export const QuickLinksScreen = () => {
  const { data, loading } = useQuery(QUERY_QUICK_LINKS);

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Quick Links</Text>
        <Text style={styles.headerSubtitle}>
          Access your pinned links quickly
        </Text>
      </View> */}

      <FlatList
        data={data?.quick_links}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <QuickLinkCard link={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No quick links yet</Text>
            <Text style={styles.emptySubtext}>
              Pin your important links for quick access
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1C4A5A",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#4A6572",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  domainContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  favicon: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  domain: {
    fontSize: 14,
    color: "#4A6572",
    fontWeight: "500",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C4A5A",
    lineHeight: 24,
  },
  url: {
    fontSize: 14,
    color: "#4A6572",
    opacity: 0.8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C4A5A",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#4A6572",
    textAlign: "center",
  },
});
