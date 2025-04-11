import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useMutation } from "@apollo/client";
import * as DocumentPicker from "expo-document-picker";
import { Upload, File, X } from "lucide-react-native";
import * as FileSystem from "expo-file-system";
import { MUTATION_UPLOAD_USER_FILES } from "@/lib/api/graphql/mutations";
import client from "@/lib/apollo/client";

type FileObject = {
  uri: string;
  name: string;
  type: string;
};

type Props = {
  onBack: () => void;
  onClose: () => void;
  onSuccess?: (message: { title: string; description: string }) => void;
};

const FileUploadView = ({ onBack, onClose, onSuccess }: Props) => {
  const [files, setFiles] = useState<FileObject[]>([]);

  const [uploadFiles, { loading, error }] = useMutation(MUTATION_UPLOAD_USER_FILES, {
    onCompleted: (data) => {
      console.log("Upload completed successfully:", data);
      onClose();
      if (onSuccess) {
        onSuccess({
          title: "Files uploaded successfully!",
          description: `${files.length} file${
            files.length !== 1 ? "s" : ""
          } uploaded`,
        });
      }

      setTimeout(() => {
        client.refetchQueries({
          include: [
            "QUERY_LINKS",
            "QUERY_STACKS",
            "QUERY_DOMAIN_LINKS",
            "QUERY_DOMAIN_LINKS_BY_STACKID",
            "QUERY_STACK_LINKS",
          ],
        });
      }, 1000);
    },
    onError: (error) => {
      console.error("Error uploading files:", error);
      console.error("Error details:", error.message, error.graphQLErrors, error.networkError);
      if (onSuccess) {
        onSuccess({
          title: "Upload Failed",
          description: "There was an error uploading your files",
        });
      }
    },
    context: {
      hasUpload: true, // Flag for Apollo client to handle file uploads
    },
  });

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // All file types
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const filesArr = result.assets.map((asset) => {
        console.log("Selected file:", asset.name, asset.uri, asset.mimeType);
        return {
          uri: asset.uri,
          name: asset.name || "file",
          type: asset.mimeType || "application/octet-stream",
        };
      });

      setFiles(filesArr);
    } catch (err) {
      console.error("Error picking files:", err);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      console.log("Starting upload with files:", files);
      
      // Send file objects directly 
      await uploadFiles({
        variables: {
          files: files,
        },
      });
    } catch (error) {
      console.error("Error in handleUpload:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Files</Text>

      <TouchableOpacity
        style={styles.uploadArea}
        onPress={handleFilePick}
        disabled={loading}
      >
        <View style={styles.uploadIconContainer}>
          <Upload size={24} color="#1C4A5A" />
        </View>
        <Text style={styles.uploadText}>Click to select files</Text>
        <Text style={styles.uploadSubtext}>Documents, photos, or videos</Text>
      </TouchableOpacity>

      {files.length > 0 && (
        <View style={styles.selectedFiles}>
          <Text style={styles.selectedTitle}>
            Selected Files ({files.length})
          </Text>
          {files.map((file, index) => (
            <View style={styles.fileItem} key={index}>
              <View style={styles.fileItemLeft}>
                <File size={16} color="#666666" />
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => removeFile(index)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.removeButton}
              >
                <X size={16} color="#666666" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.uploadButton,
            (!files.length || loading) && styles.uploadButtonDisabled,
          ]}
          onPress={handleUpload}
          disabled={!files.length || loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.uploadButtonText}>Save</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onBack}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  uploadIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#E8F0F2",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  uploadText: {
    color: "#666666",
    fontSize: 16,
    marginBottom: 4,
  },
  uploadSubtext: {
    color: "#999999",
    fontSize: 14,
  },
  selectedFiles: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C4A5A",
    marginBottom: 8,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  fileItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  fileName: {
    color: "#000000",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  buttonContainer: {
    marginTop: "auto",
  },
  uploadButton: {
    backgroundColor: "#1C4A5A",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#1C4A5A",
    fontSize: 16,
  },
});

export default FileUploadView;
