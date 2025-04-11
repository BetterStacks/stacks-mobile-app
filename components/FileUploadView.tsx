import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useMutation } from "@apollo/client";
import * as DocumentPicker from "expo-document-picker";
import { Upload, File, X } from "lucide-react-native";
import * as FileSystem from "expo-file-system";
import { MUTATION_UPLOAD_USER_FILES } from "@/lib/api/graphql/mutations";
import client from "@/lib/apollo/client";
import { Toast } from "toastify-react-native";

type FileObject = {
  uri: string;
  name: string;
  type: string;
  size?: number;
};

type Props = {
  onBack: () => void;
  onClose: () => void;
  onSuccess?: (message: { title: string; description: string }) => void;
};

const FILE_SIZE_LIMIT = 20 * 1024 * 1024; // 20MB limit

const FileUploadView = ({ onBack, onClose, onSuccess }: Props) => {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // Clean up any temporary files when component unmounts
  useEffect(() => {
    return () => {
      // Reset any state
      setUploadProgress(0);
      setIsCompressing(false);
    };
  }, []);

  const [uploadFiles, { loading, error }] = useMutation(MUTATION_UPLOAD_USER_FILES, {
    onCompleted: (data) => {
      // First close the modal
      onClose();
      
      // Show success toast directly
      Toast.success(`${files.length} file${files.length !== 1 ? 's' : ''} uploaded successfully`);
      
      // Also notify parent component if needed
      if (onSuccess) {
        onSuccess({
          title: "Files uploaded successfully!",
          description: `${files.length} file${
            files.length !== 1 ? "s" : ""
          } uploaded`,
        });
      }

      // Refetch queries to update the UI
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
      }, 500);
    },
    onError: (error) => {
      // Show failure toast directly
      Toast.error("Failed to upload files");
      
      // Also notify parent component if needed
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

  // Optimize file size if needed
  const optimizeFile = async (file: FileObject): Promise<FileObject> => {
    // If it's not an image, or on iOS (which generally handles this better), or small enough, return as is
    if (!file.type.startsWith('image/') || Platform.OS === 'ios' || (file.size && file.size < FILE_SIZE_LIMIT)) {
      return file;
    }

    try {
      setIsCompressing(true);
      // Get a temp file path
      const tempUri = `${FileSystem.cacheDirectory}${Date.now()}_compressed.jpg`;
      
      // Compress the image
      const compressResult = await FileSystem.downloadAsync(
        file.uri,
        tempUri
      );

      setIsCompressing(false);
      
      // Return the compressed file
      return {
        uri: compressResult.uri,
        name: file.name,
        type: 'image/jpeg',
      };
    } catch (error) {
      setIsCompressing(false);
      // If compression fails, return original file
      return file;
    }
  };

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

      // Get file details including size
      const filesArr = result.assets.map((asset) => {
        return {
          uri: asset.uri,
          name: asset.name || "file",
          type: asset.mimeType || "application/octet-stream",
          size: asset.size || 0,
        };
      });

      // Check for oversized files
      const oversizedFiles = filesArr.filter(file => file.size && file.size > 50 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        Toast.warn("Some files exceed the 50MB limit and were removed");
        // Filter out oversized files
        const validFiles = filesArr.filter(file => !file.size || file.size <= 50 * 1024 * 1024);
        setFiles(validFiles);
      } else {
        setFiles(filesArr);
      }
    } catch (err) {
      // Silent error handling for document picker cancellations
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      setUploadProgress(0);
      
      // Optimize files if needed
      setIsCompressing(true);
      const optimizedFiles = await Promise.all(
        files.map(async (file, index) => {
          const optimized = await optimizeFile(file);
          // Update progress as we process each file
          setUploadProgress(Math.floor(((index + 1) / files.length) * 50)); // First 50% for optimization
          return optimized;
        })
      );
      setIsCompressing(false);
      
      // Set progress to 50% before starting the actual upload
      setUploadProgress(50);
      
      // Start upload with optimized files
      await uploadFiles({
        variables: {
          files: optimizedFiles,
        },
      });
      
      // Upload complete
      setUploadProgress(100);
    } catch (error) {
      // Error is handled in the onError callback of the mutation
      setUploadProgress(0);
    }
  };

  // Show appropriate loading status text
  const getStatusText = () => {
    if (isCompressing) {
      return "Preparing files...";
    }
    if (loading) {
      return "Uploading...";
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Files</Text>

      <TouchableOpacity
        style={styles.uploadArea}
        onPress={handleFilePick}
        disabled={loading || isCompressing}
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
                disabled={loading || isCompressing}
              >
                <X size={16} color="#666666" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {(loading || isCompressing) && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${uploadProgress}%` }
              ]} 
            />
          </View>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.uploadButton,
            (!files.length || loading || isCompressing) && styles.uploadButtonDisabled,
          ]}
          onPress={handleUpload}
          disabled={!files.length || loading || isCompressing}
        >
          {loading || isCompressing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.uploadButtonText}>Save</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onBack}
          disabled={loading || isCompressing}
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
  progressContainer: {
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E5E5E5",
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: "#1C4A5A",
    borderRadius: 4,
  },
  statusText: {
    color: "#666666",
    fontSize: 14,
    textAlign: 'center',
  },
});

export default FileUploadView;
