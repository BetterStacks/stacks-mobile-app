import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useQuery } from "@apollo/client";
import { QUERY_USER } from "@/lib/api/graphql/queries";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => window.location.reload()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const user = data?.user;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          {user?.profile_image_url ? (
            <Image
              source={{ uri: user.profile_image_url }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
          )}
          <Text style={styles.name}>{user?.name || "User"}</Text>
          {user?.username && (
            <Text style={styles.username}>@{user.username}</Text>
          )}
          {user?.job_title && (
            <Text style={styles.jobTitle}>{user.job_title}</Text>
          )}
          <Text style={styles.bio}>{user?.description || "Stacks user"}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="mail-outline" size={18} color="#555" />
            <Text style={styles.detailText}>
              {user?.email || "No email provided"}
            </Text>
          </View>

          {user?.phone && (
            <View style={styles.detailItem}>
              <Ionicons name="call-outline" size={18} color="#555" />
              <Text style={styles.detailText}>{user.phone}</Text>
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
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ff3b30",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#0066CC",
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
  avatarInitial: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#0288d1",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 14,
    color: "#0066CC",
    marginBottom: 6,
  },
  bio: {
    fontSize: 14,
    color: "#666",
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
  detailText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#555",
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
  tagText: {
    fontSize: 12,
    color: "#0288d1",
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
