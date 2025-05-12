import React, {useCallback, useEffect, useState} from "react";
import {StyleSheet, Text, TouchableOpacity, useColorScheme, View} from "react-native";
import {Edit, File, FolderPlus, Link, Mic} from "lucide-react-native";
import {ReactNativeModal} from "react-native-modal";
import AddLinkView from "./AddLinkView";
import {setIsSuccessModalVisible, setSuccessModalMessage,} from "@/lib/apollo/store/handlers";
import {router} from "expo-router";
import FileUploadView from "../FileUploadView";
import VoiceNoteView from "../VoiceNoteView";

type Props = {
  isVisible: boolean;
  onClose: () => void;
  customContent?: React.ReactNode;
  selectedCollectionId?: string;
};

const BottomDrawer = ({
  isVisible,
  onClose,
  customContent,
  selectedCollectionId,
}: Props) => {
  const colorScheme = useColorScheme();
  
  // const navigation = useNavigation<TAfterAuthStackNavigationProp>();
  const [isAddLinkView, setIsAddLinkView] = useState(false);
  const [isFileUploadView, setIsFileUploadView] = useState(false);
  const [isVoiceNoteView, setIsVoiceNoteView] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setIsAddLinkView(false);
      setIsFileUploadView(false);
      setIsVoiceNoteView(false);
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

  const handleNewVoiceNote = () => {
    setIsVoiceNoteView(true);
  };

  const handleNewQuickNote = () => {
    onClose();
    router.push({
      pathname: "/quick-note-editor"
    });
  };

  const handleNewCollection = useCallback(() => {
    onClose();
    router.push("/collection/create");
  }, [onClose]);

  const handleBack = () => {
    setIsAddLinkView(false);
    setIsFileUploadView(false);
    setIsVoiceNoteView(false);
  };

  const options = [
    {
      icon: <Link size={24} color={colorScheme === 'dark' ? "#FFFFFF" : "#000000"} />,
      title: "New Link",
      onPress: handleNewLink,
    },
    {
      icon: <FolderPlus size={24} color={colorScheme === 'dark' ? "#FFFFFF" : "#000000"} />,
      title: "New Collection",
      onPress: handleNewCollection,
    },
    {
      icon: <File size={24} color={colorScheme === 'dark' ? "#FFFFFF" : "#000000"} />,
      title: "New File",
      onPress: handleNewFile,
    },
    {
      icon: <Mic size={24} color={colorScheme === 'dark' ? "#FFFFFF" : "#000000"} />,
      title: "New Voice Note",
      onPress: handleNewVoiceNote,
    },
    {
      icon: <Edit size={24} color={colorScheme === 'dark' ? "#FFFFFF" : "#000000"} />,
      title: "New Quick Note",
      onPress: handleNewQuickNote,
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
      <View style={colorScheme === 'dark' ? styles.content_dark : styles.content}>
        <View style={colorScheme === 'dark' ? styles.indicator_dark : styles.indicator} />
        {customContent ? (
          customContent
        ) : !isAddLinkView && !isFileUploadView && !isVoiceNoteView ? (
          <View style={colorScheme === 'dark' ? styles.container_dark : styles.container}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  colorScheme === 'dark' ? styles.option_dark : styles.option,
                  index === options.length - 1 && styles.lastOption,
                ]}
                onPress={option.onPress}
              >
                {option.icon}
                <Text style={colorScheme === 'dark' ? styles.optionText_dark : styles.optionText}>{option.title}</Text>
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
        ) : isFileUploadView ? (
          <FileUploadView
            onBack={handleBack}
            onClose={onClose}
            onSuccess={handleSuccess}
          />
        ) : (
          <VoiceNoteView
            onBack={handleBack}
            onClose={onClose}
            onSuccess={handleSuccess}
          />
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
    paddingBottom: 0,
  },
  content_dark: {
    backgroundColor: "#171717",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  // @ts-ignore
  content_dark: {
    backgroundColor: "#171717",
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
  indicator_dark: {
    width: 50,
    height: 4,
    backgroundColor: "#333333",
    alignSelf: "center",
    marginBottom: 8,
    borderRadius: 2,
  },
  container: {
    padding: 16,
  },
  container_dark: {
    padding: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  option_dark: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionText: {
    marginLeft: 16,
    fontSize: 16,
    color: "#000000",
  },
  optionText_dark: {
    marginLeft: 16,
    fontSize: 16,
    color: "#FFFFFF",
  },
});

export default BottomDrawer;
