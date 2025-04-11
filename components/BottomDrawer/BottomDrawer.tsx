import React, { useCallback, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Link, FolderPlus, File } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import Modal, { ReactNativeModal } from "react-native-modal";
import AddLinkView from "./AddLinkView";
import {
  setIsSuccessModalVisible,
  setSuccessModalMessage,
} from "@/lib/apollo/store/handlers";
import { router } from "expo-router";

type Props = {
  isVisible: boolean;
  onClose: () => void;
  customContent?: React.ReactNode;
  selectedCollectionId?: string;
};

const BottomDrawer = ({ isVisible, onClose, customContent, selectedCollectionId }: Props) => {
  // const navigation = useNavigation<TAfterAuthStackNavigationProp>();
  const [isAddLinkView, setIsAddLinkView] = useState(false);
  const [isFileUploadView, setIsFileUploadView] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setIsAddLinkView(false);
      setIsFileUploadView(false);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && selectedCollectionId) {
      setIsAddLinkView(true);
    }
  }, [isVisible, selectedCollectionId]);

  const handleSuccess = useCallback(
    (message: { title: string; description: string }) => {
      setSuccessModalMessage({
        ...message,
        closeText: "Got it!",
        preventNavigation: true,
      });
      setIsSuccessModalVisible(true);
    },
    [],
  );

  const handleNewLink = () => {
    setIsAddLinkView(true);
  };

  const handleNewFile = () => {
    setIsFileUploadView(true);
  };

  const handleNewCollection = useCallback(() => {
    onClose();
    router.push('/collection/create');
  }, [onClose]);

  const handleBack = () => {
    setIsAddLinkView(false);
    setIsFileUploadView(false);
  };

  const options = [
    {
      icon: <Link size={24} color="#000000" />,
      title: "New Link",
      onPress: handleNewLink,
    },
    {
      icon: <FolderPlus size={24} color="#000000" />,
      title: "New Collection",
      onPress: handleNewCollection,
    },
    {
      icon: <File size={24} color="#000000" />,
      title: "New File",
      onPress: handleNewFile,
    },
  ];

  return (
    <ReactNativeModal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={["down"]}
      style={styles.modal}
      useNativeDriver
      useNativeDriverForBackdrop
      backdropOpacity={0.4}
      propagateSwipe
    >
      <View style={styles.content}>
        <View style={styles.indicator} />
        {customContent ? (
          customContent
        ) : !isAddLinkView && !isFileUploadView ? (
          <View style={styles.container}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  index === options.length - 1 && styles.lastOption,
                ]}
                onPress={option.onPress}
              >
                {option.icon}
                <Text style={styles.optionText}>{option.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : isAddLinkView ? (
          <AddLinkView
            onBack={handleBack}
            onClose={onClose}
            onSuccess={handleSuccess}
            selectedCollectionId={selectedCollectionId}
          />
        ) : (
          // <FileUploadView
          //   onBack={handleBack}
          //   onClose={onClose}
          //   onSuccess={handleSuccess}
          // />
          <View>
            <Text>File Upload View</Text>
          </View>
        )}
      </View>
    </ReactNativeModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  content: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  indicator: {
    width: 50,
    height: 4,
    backgroundColor: "#E5E5E5",
    alignSelf: "center",
    marginBottom: 8,
    borderRadius: 2,
  },
  container: {
    padding: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionText: {
    marginLeft: 16,
    fontSize: 16,
    color: "#000000",
  },
});

export default BottomDrawer;
