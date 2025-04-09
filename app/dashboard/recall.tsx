import { TestTube } from "lucide-react-native";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import Modal from "react-native-modal";

export default function RecallScreen() {
  const [modalVisible, setModalVisible] = React.useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <View>
      <Text>Recall</Text>
      <Text style={styles.subtitle}>Discover new content</Text>

      <View style={styles.card}>
        <Text>Featured Content</Text>
        <Text>Featured content will appear here.</Text>
      </View>

      <View style={styles.card}>
        <Text>Popular</Text>
        <Text>Popular content will appear here.</Text>
      </View>
      <View>
        <Button title="Open Modal" onPress={toggleModal} />
      </View>

      <TestModal modalVisible={modalVisible} toggleModal={toggleModal} />
    </View>
  );
}

const TestModal = (modalVisible, toggleModal) => {
  return (
    <View>
      <Modal
        isVisible={modalVisible}
        onBackdropPress={toggleModal}
        backdropOpacity={0.8}
        swipeDirection={["down"]}
        useNativeDriver
        useNativeDriverForBackdrop
        propagateSwipe
      >
        <View>
          <Text>djwiedhj</Text>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 22,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
