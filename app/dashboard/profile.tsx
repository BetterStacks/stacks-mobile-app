import React from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	useColorScheme,
	View,
} from "react-native";
import {useQuery} from "@apollo/client";
import {QUERY_USER} from "@/lib/api/graphql/queries";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useRouter} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import {SafeAreaView} from "react-native-safe-area-context";
import {Toast} from "toastify-react-native";

interface Identity {
  provider: string;
  id: string;
  uid: string;
  valid_token: boolean;
  label: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { data, loading, error } = useQuery(QUERY_USER);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLogout = async () => {
    try {
      // Clear all auth-related tokens
      await AsyncStorage.multiRemove([
        "gqlToken",
        "userToken",
        "refreshToken",
        "userId",
        "userEmail",
      ]);

      // Clear the main token used for auth checking
      await AsyncStorage.removeItem("token");

      Toast.success("Logged out successfully");

      // Navigate to the app's root to trigger TokenCheck which will handle redirect
      router.replace("/");
    } catch (err) {
      Alert.alert("Error", "Failed to logout. Please try again.");
      console.error("Logout error:", err);
    }
  };

  if (loading) {
    return (
      <View style={isDark ? styles.loadingContainer_dark : styles.loadingContainer}>
        <ActivityIndicator size="large" color={isDark ? "#4793E0" : "#0066CC"} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={isDark ? styles.errorContainer_dark : styles.errorContainer}>
        <Text style={isDark ? styles.errorText_dark : styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity
          style={isDark ? styles.retryButton_dark : styles.retryButton}
          onPress={() => window.location.reload()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const user = data?.user;

  return (
    <SafeAreaView style={isDark ? styles.container_dark : styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={isDark ? styles.header_dark : styles.header}>
          {user?.profile_image_url ? (
            <Image
              source={{ uri: user.profile_image_url }}
              style={isDark ? styles.profileImage_dark : styles.profileImage}
            />
          ) : (
            <View style={isDark ? styles.avatarPlaceholder_dark : styles.avatarPlaceholder}>
              <Text style={isDark ? styles.avatarInitial_dark : styles.avatarInitial}>
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
          )}
          <Text style={isDark ? styles.name_dark : styles.name}>{user?.name || "User"}</Text>
          {user?.username && (
            <Text style={isDark ? styles.username_dark : styles.username}>@{user.username}</Text>
          )}
          {user?.job_title && (
            <Text style={isDark ? styles.jobTitle_dark : styles.jobTitle}>{user.job_title}</Text>
          )}
          <Text style={isDark ? styles.bio_dark : styles.bio}>{user?.description || "Stacks user"}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={isDark ? styles.detailItem_dark : styles.detailItem}>
            <Ionicons name="mail-outline" size={18} color={isDark ? "#8EACB7" : "#555"} />
            <Text style={isDark ? styles.detailText_dark : styles.detailText}>
              {user?.email || "No email provided"}
            </Text>
          </View>

          {user?.phone && (
            <View style={isDark ? styles.detailItem_dark : styles.detailItem}>
              <Ionicons name="call-outline" size={18} color={isDark ? "#8EACB7" : "#555"} />
              <Text style={isDark ? styles.detailText_dark : styles.detailText}>{user.phone}</Text>
            </View>
          )}

          {/* {user?.identities?.length > 0 && (
						<View style={styles.detailItem}>
							<Ionicons name="link-outline" size={18} color="#555" />
							<Text style={styles.detailText}>
								{user.identities.map((identity: Identity) => identity.provider).join(', ')}
							</Text>
						</View>
					)} */}

          {/* {user?.tags?.length > 0 && (
						<View style={styles.tagsContainer}>
							<Text style={styles.sectionTitle}>Tags</Text>
							<View style={styles.tagsList}>
								{user.tags.map((tag: string, index: number) => (
									<View key={index} style={styles.tag}>
										<Text style={styles.tagText}>{tag}</Text>
									</View>
								))}
							</View>
						</View>
					)} */}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={16} color="#ff3b30" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container_dark: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingContainer_dark: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  errorContainer_dark: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#0A0A0A",
  },
  errorText: {
    fontSize: 16,
    color: "#ff3b30",
    marginBottom: 16,
  },
  errorText_dark: {
    fontSize: 16,
    color: "#ff453a",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#0066CC",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButton_dark: {
    backgroundColor: "#0A84FF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  header: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 24,
    backgroundColor: "#fff",
  },
  header_dark: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 24,
    backgroundColor: "#0A0A0A",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage_dark: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#262626",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e1f5fe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarPlaceholder_dark: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#0A84FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#262626",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#0288d1",
  },
  avatarInitial_dark: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
  },
  name_dark: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#FFFFFF",
  },
  username: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  username_dark: {
    fontSize: 14,
    color: "#8EACB7",
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 14,
    color: "#0066CC",
    marginBottom: 6,
  },
  jobTitle_dark: {
    fontSize: 14,
    color: "#4793E0",
    marginBottom: 6,
  },
  bio: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  bio_dark: {
    fontSize: 14,
    color: "#A0B3BC",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  detailsContainer: {
    padding: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#f8f8f8",
    padding: 14,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  detailItem_dark: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#171717",
    padding: 14,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  detailText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
  detailText_dark: {
    fontSize: 14,
    color: "#FFFFFF",
    marginLeft: 10,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#555",
  },
  sectionTitle_dark: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#8EACB7",
  },
  tagsContainer: {
    marginTop: 6,
    marginBottom: 20,
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#e1f5fe",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
  },
  tag_dark: {
    backgroundColor: "#0A84FF",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: "#0288d1",
  },
  tagText_dark: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ff3b30",
    borderRadius: 20,
    marginTop: 10,
  },
  logoutText: {
    color: "#ff3b30",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
});
