import React, {useMemo, useState} from "react";
import {styles} from "@/components/dashboard/HomeScreenStyles";
import {useQuery} from "@apollo/client";
import {Modal, Text, TouchableOpacity, useColorScheme, View} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import {QUERY_USER_REPOSITORIES} from "@/lib/api/graphql/queries";

export const WorkspaceSelector = ({
  selectedWorkspace,
  onSelect,
}: {
  selectedWorkspace: string;
  onSelect: (workspace: string) => void;
}) => {
  const colorScheme = useColorScheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { data: repositoriesData, loading } = useQuery(QUERY_USER_REPOSITORIES);

  const workspaces = useMemo(() => {
    const defaultOption = ["All Workspaces"];
    if (!repositoriesData?.user?.repositories) return defaultOption;
    return [
      ...defaultOption,
      ...repositoriesData.user.repositories.map((repo: any) => repo.name),
    ];
  }, [repositoriesData]);

  if (loading) {
    return (
      <TouchableOpacity style={styles.workspaceSelector}>
        <Text style={styles.workspaceTitle}>Loading...</Text>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={styles.workspaceSelector}
        onPress={() => setIsModalVisible(true)}
      >
        <Text
          style={styles.workspaceTitle}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {selectedWorkspace || "All Workspaces"}
        </Text>
        <Entypo name="chevron-down" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={colorScheme === 'dark' ? styles.modalContent__dark : styles.modalContent}>
            {workspaces.map((workspace, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.workspaceOption,
                  workspace === selectedWorkspace && (
                    colorScheme === 'dark' 
                    ? styles.workspaceOptionSelected__dark 
                    : styles.workspaceOptionSelected
                  )
                ]}
                onPress={() => {
                  onSelect(workspace);
                  setIsModalVisible(false);
                }}
              >
                <Text
                  style={[
                    colorScheme === 'dark' ? styles.workspaceOptionText__dark : styles.workspaceOptionText,
                    workspace === selectedWorkspace &&
                      (colorScheme === 'dark' ? styles.workspaceOptionTextSelected__dark : styles.workspaceOptionTextSelected),
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {workspace}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};
