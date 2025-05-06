import {ActivityIndicator, Image, StyleSheet, Text, useColorScheme, View} from "react-native";
import {styles} from "./ParticularCollectionScreenStyles";
import React, {useCallback, useEffect, useState} from "react";
import {useQuery} from "@apollo/client";
import {QUERY_COLLECTION_LINKS} from "@/lib/api/graphql/queries";
import {CardLinksList} from "../cardLinkList/CardLinksList";
import {CommonButton} from "../CommonButton/CommonButton";
import {useLocalSearchParams} from "expo-router";
import BottomDrawer from "../BottomDrawer/BottomDrawer";
import {Colors} from "@/components/design/colors";

export const ParticularCollectionScreen = () => {
  const params = useLocalSearchParams<{ collectionId: string, id: string }>();
  const collectionId = params.collectionId || params.id;
  const [isBottomDrawerVisible, setIsBottomDrawerVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { data: collectionsLinksData, loading } = useQuery(
    QUERY_COLLECTION_LINKS,
    {
      variables: {
        collectionId,
      },
    },
  );

  useEffect(() => {
    if (collectionsLinksData) {
      // We can log or do other side effects here if needed
    }
  }, [collectionsLinksData]);

  const onButtonPress = useCallback(() => {
    // Only open the drawer when the button is clicked
    setIsBottomDrawerVisible(true);
  }, []);

  const handleCloseBottomDrawer = useCallback(() => {
    setIsBottomDrawerVisible(false);
  }, []);

  return (
    <View style={isDark ? styles.container__dark : styles.container}>
      {loading ? (
        <View style={localStyles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.TextColor.LignMainColor} />
        </View>
      ) : collectionsLinksData && collectionsLinksData.stack ? (
        <>
          {/* {collectionsLinksData.stack.links.length > 0 && (
            <View style={styles.contentHeader}>
              <Text style={isDark ? styles.subtitle__dark : styles.subtitle}>Saved links</Text>
            </View>
          )} */}

          <View>
            {collectionsLinksData.stack.links.length > 0 && (
              <CardLinksList
                links={collectionsLinksData.stack.links}
                showList={true}
                colorScheme={colorScheme}
              />
            )}
          </View>

          {collectionsLinksData.stack.links.length < 1 && (
            <View style={styles.emptyContent}>
              <Image
                source={require("@/assets/png/HomeScreenImage.png")}
                style={styles.image}
              />

              <Text style={isDark ? styles.noLinksTitle__dark : styles.noLinksTitle}>
                You haven't got recently saved items
              </Text>

              <Text style={isDark ? styles.noLinksText__dark : styles.noLinksText}>
                You haven't got recently saved items{" "}
              </Text>

              <View style={styles.buttonContainer}>
                <CommonButton
                  text="+ Add your first link"
                  onPress={onButtonPress}
                  additionalButtonStyles={isDark ? styles.buttonAdditionalStyles__dark : styles.buttonAdditionalStyles}
                  additionalTextStyles={isDark ? styles.buttonTextAdditionalStyles__dark : styles.buttonTextAdditionalStyles}
                />
              </View>
            </View>
          )}

          <BottomDrawer
            isVisible={isBottomDrawerVisible}
            onClose={handleCloseBottomDrawer}
            selectedCollectionId={collectionId}
          />
        </>
      ) : (
        <View style={isDark ? [localStyles.loaderContainer, localStyles.loaderContainer__dark] : localStyles.loaderContainer}>
          <Text style={isDark ? localStyles.errorText__dark : localStyles.errorText}>No collection data available</Text>
        </View>
      )}
    </View>
  );
};

const localStyles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer__dark: {
    backgroundColor: "#0A0A0A",
  },
  errorText: {
    color: "#1C4A5A",
  },
  errorText__dark: {
    color: "#FFFFFF",
  },
});
