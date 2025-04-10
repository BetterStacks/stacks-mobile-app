import { Image, Text, View } from "react-native";
import { styles } from "./ParticularCollectionScreenStyles";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { QUERY_COLLECTION_LINKS } from "@/lib/api/graphql/queries";
import { CardLinksList } from "../cardLinkList/CardLinksList";
import { CommonButton } from "../CommonButton/CommonButton";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import BottomDrawer from "../BottomDrawer/BottomDrawer";

export const ParticularCollectionScreen = () => {
  const params = useLocalSearchParams<{ collectionId: string, id: string }>();
  const collectionId = params.collectionId || params.id;
  const [isBottomDrawerVisible, setIsBottomDrawerVisible] = useState(false);

  const { data: collectionsLinksData, loading } = useQuery(
    QUERY_COLLECTION_LINKS,
    {
      variables: {
        collectionId,
      },
    },
  );

  useEffect(() => {
    if (collectionsLinksData && collectionsLinksData.stack) {
      // Auto-open the drawer when the collection is empty
      if (collectionsLinksData.stack.links.length === 0) {
        // This will allow the component to fully mount before showing the drawer
        const timer = setTimeout(() => {
          setIsBottomDrawerVisible(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [collectionsLinksData]);

  const onButtonPress = useCallback(() => {
    setIsBottomDrawerVisible(true);
  }, []);

  const handleCloseBottomDrawer = useCallback(() => {
    setIsBottomDrawerVisible(false);
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        // <Loader />
        <View>
          <Text>Loading...</Text>
        </View>
      ) : collectionsLinksData && collectionsLinksData.stack ? (
        <>
          {/* {collectionsLinksData.stack.links.length > 0 && (
            <View style={styles.contentHeader}>
              <Text style={styles.subtitle}>Saved links</Text>
            </View>
          )} */}

          <View>
            {collectionsLinksData.stack.links.length > 0 && (
              <CardLinksList
                links={collectionsLinksData.stack.links}
                showList={true}
              />
            )}
          </View>

          {collectionsLinksData.stack.links.length < 1 && (
            <View style={styles.emptyContent}>
              <Image
                source={require("@/assets/png/HomeScreenImage.png")}
                style={styles.image}
              />

              <Text style={styles.noLinksTitle}>
                You haven't got recently saved items
              </Text>

              <Text style={styles.noLinksText}>
                You haven't got recently saved items{" "}
              </Text>

              <View style={styles.buttonContainer}>
                <CommonButton
                  text="+ Add your first link"
                  onPress={onButtonPress}
                  additionalButtonStyles={styles.buttonAdditionalStyles}
                  additionalTextStyles={styles.buttonTextAdditionalStyles}
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
        <View>
          <Text>No collection data available</Text>
        </View>
      )}
    </View>
  );
};
