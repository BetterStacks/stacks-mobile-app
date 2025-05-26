import React, {useState} from "react";
import {
	ActivityIndicator,
	Alert,
	Modal,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	useColorScheme,
	View,
} from "react-native";
import {useMutation} from "@apollo/client";
import {MUTATION_DELETE_ACCOUNT} from "@/lib/api/graphql/mutations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useRouter} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import {Toast} from "toastify-react-native";

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  onClose,
}) => {
  const [confirmText, setConfirmText] = useState("");
  const [deleteAccount, { loading }] = useMutation(MUTATION_DELETE_ACCOUNT);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const requiredText = "Yes, delete me";

  const handleDeleteAccount = async () => {
    if (confirmText.trim() !== requiredText) {
      Alert.alert("Error", "Please enter the exact confirmation text to proceed.");
      return;
    }

    try {
      await deleteAccount({
        variables: {
          confirm_text: confirmText,
        },
      });

      // Clear all auth-related tokens
      await AsyncStorage.multiRemove([
        "gqlToken",
        "userToken",
        "refreshToken",
        "userId",
        "userEmail",
        "token",
      ]);

      Toast.success("Account deleted successfully");
      onClose();
      
      // Navigate to the app's root to trigger TokenCheck which will handle redirect
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to delete account. Please try again.");
      console.error("Delete account error:", error);
    }
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={isDark ? styles.modalView_dark : styles.modalView}>
          <View style={styles.header}>
            <Text style={isDark ? styles.title_dark : styles.title}>
              Delete your account
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons 
                name="close" 
                size={24} 
                color={isDark ? "#FFFFFF" : "#000000"} 
              />
            </TouchableOpacity>
          </View>

          <Text style={isDark ? styles.description_dark : styles.description}>
            Delete the Stacks account and everything associated with it including but not limited to all Stacks workspaces, links, collections, tags, notes, annotations and comments. Are you sure you want to delete your account?
          </Text>

          <View style={isDark ? styles.warningContainer_dark : styles.warningContainer}>
            <Ionicons 
              name="warning" 
              size={20} 
              color={isDark ? "#FF6B6B" : "#ff3b30"} 
            />
            <Text style={isDark ? styles.warningText_dark : styles.warningText}>
              <Text style={styles.warningBold}>Warning:</Text> This action is not reversible. Please be certain.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={isDark ? styles.inputLabel_dark : styles.inputLabel}>
              Type "<Text style={styles.requiredTextBold}>{requiredText}</Text>" to confirm
            </Text>
            <TextInput
              style={isDark ? styles.textInput_dark : styles.textInput}
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="Type the confirmation text"
              placeholderTextColor={isDark ? "#666666" : "#999999"}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, isDark ? styles.cancelButton_dark : styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={isDark ? styles.cancelButtonText_dark : styles.cancelButtonText}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.deleteButton,
                (loading || confirmText.trim() !== requiredText) && styles.deleteButtonDisabled,
              ]}
              onPress={handleDeleteAccount}
              disabled={loading || confirmText.trim() !== requiredText}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete my account</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalView: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalView_dark: {
    backgroundColor: "#262626",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
  },
  title_dark: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 16,
    lineHeight: 20,
  },
  description_dark: {
    fontSize: 14,
    color: "#A0A0A0",
    marginBottom: 16,
    lineHeight: 20,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FED7D7",
  },
  warningContainer_dark: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#2D1B1B",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#4A2C2C",
  },
  warningText: {
    fontSize: 14,
    color: "#C53030",
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  warningText_dark: {
    fontSize: 14,
    color: "#FF6B6B",
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  warningBold: {
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  inputLabel_dark: {
    fontSize: 14,
    color: "#A0A0A0",
    marginBottom: 8,
  },
  requiredTextBold: {
    fontWeight: "600",
    color: "#000000",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },
  textInput_dark: {
    borderWidth: 1,
    borderColor: "#404040",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#171717",
    color: "#FFFFFF",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  cancelButton_dark: {
    backgroundColor: "#404040",
    borderWidth: 1,
    borderColor: "#555555",
  },
  cancelButtonText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText_dark: {
    color: "#CCCCCC",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#ff3b30",
  },
  deleteButtonDisabled: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DeleteAccountModal; 