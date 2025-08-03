import React, { useState } from "react";
import {
  View,
  Image,
  Modal,
  TouchableOpacity,
  Text,
  Alert,
  Share,
  Platform,
  Dimensions,
  ActivityIndicator,
  ColorSchemeName,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useMutation } from "@apollo/client";
import { MUTATION_ADD_FILE } from "@/lib/api/graphql/mutations";
import { GeneratedImage } from "@/lib/ai/types";

interface ImageViewerProps {
  visible: boolean;
  generatedImage: GeneratedImage;
  onClose: () => void;
  colorScheme?: ColorSchemeName;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const ImageViewer: React.FC<ImageViewerProps> = ({
  visible,
  generatedImage,
  onClose,
  colorScheme,
}) => {
  const isDark = colorScheme === "dark";
  const [isSaving, setIsSaving] = useState(false);
  const [addFile] = useMutation(MUTATION_ADD_FILE);

  const imageUri = `data:${generatedImage.mediaType};base64,${generatedImage.base64}`;

  const handleDownload = async () => {
    try {
      setIsSaving(true);

      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Permission to access media library is required to save images.",
        );
        return;
      }

      // Create a temporary file
      const filename = `generated-image-${Date.now()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      // Write base64 data to file
      await FileSystem.writeAsStringAsync(fileUri, generatedImage.base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync("Stacks AI", asset, false);

      Alert.alert("Success", "Image saved to gallery!");
    } catch (error) {
      console.error("Error saving image:", error);
      Alert.alert("Error", "Failed to save image to gallery.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      const filename = `generated-image-${Date.now()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      // Write base64 data to file
      await FileSystem.writeAsStringAsync(fileUri, generatedImage.base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Share.share({
        url: fileUri,
      });
    } catch (error) {
      console.error("Error sharing image:", error);
      Alert.alert("Error", "Failed to share image.");
    }
  };

  const handleSaveToStacks = async () => {
    Alert.alert(
      "Coming Soon",
      "Save to Stacks feature is coming soon! For now, you can download the image to your device.",
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Header with close button */}
        <View
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            zIndex: 1,
          }}
        >
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: 20,
              padding: 10,
            }}
          >
            <AntDesign name="close" size={24} color="white" />
          </TouchableOpacity>

          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontWeight: "600",
              flex: 1,
              textAlign: "center",
              marginHorizontal: 20,
            }}
            numberOfLines={1}
          >
            {generatedImage.prompt}
          </Text>
        </View>

        {/* Image */}
        <Image
          source={{ uri: imageUri }}
          style={{
            width: screenWidth - 40,
            height: screenWidth - 40,
            borderRadius: 12,
          }}
          resizeMode="contain"
        />

        {/* Action buttons */}
        <View
          style={{
            position: "absolute",
            bottom: 80,
            left: 20,
            right: 20,
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={handleDownload}
            disabled={isSaving}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: 25,
              paddingVertical: 12,
              paddingHorizontal: 20,
              flexDirection: "row",
              alignItems: "center",
              minWidth: 100,
              justifyContent: "center",
            }}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <AntDesign name="download" size={18} color="white" />
                <Text
                  style={{ color: "white", marginLeft: 8, fontWeight: "600" }}
                >
                  Download
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: 25,
              paddingVertical: 12,
              paddingHorizontal: 20,
              flexDirection: "row",
              alignItems: "center",
              minWidth: 100,
              justifyContent: "center",
            }}
          >
            <AntDesign name="sharealt" size={18} color="white" />
            <Text style={{ color: "white", marginLeft: 8, fontWeight: "600" }}>
              Share
            </Text>
          </TouchableOpacity>

          {/*<TouchableOpacity
            onPress={handleSaveToStacks}
            disabled={isSaving}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: 25,
              paddingVertical: 12,
              paddingHorizontal: 20,
              flexDirection: "row",
              alignItems: "center",
              minWidth: 100,
              justifyContent: "center",
            }}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <AntDesign name="cloudupload" size={18} color="white" />
                <Text
                  style={{ color: "white", marginLeft: 8, fontWeight: "600" }}
                >
                  Save
                </Text>
              </>
            )}
          </TouchableOpacity>*/}
        </View>
      </View>
    </Modal>
  );
};

export default ImageViewer;
