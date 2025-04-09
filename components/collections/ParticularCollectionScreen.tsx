import { Image, Text, View } from "react-native";
import { styles } from "./ParticularCollectionScreenStyles";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useQuery } from "@apollo/client";
import { QUERY_COLLECTION_LINKS } from "@/lib/api/graphql/queries";
import { useCallback, useEffect } from "react";
import { CardLinksList } from "../cardLinkList/CardLinksList";
import { CommonButton } from "../CommonButton/CommonButton";

export const ParticularCollectionScreen = () => {
  // const navigation = useNavigation<TAfterAuthStackNavigationProp>();
  // const { params } =
  //   useRoute<
  //     RouteProp<
  //       TECollectionsStackParams,
  //       ECollectionsStackScreens.ParticularCollectionScreen
  //     >
  //   >();

  const { data: collectionsLinksData, loading } = useQuery(
    QUERY_COLLECTION_LINKS,
    {
      variables: {
        collectionId: params.collectionId,
      },
    },
  );

  useEffect(() => {
    if (collectionsLinksData) {
      // console.log(collectionsLinksData.stack.links.length);
    }
  }, [collectionsLinksData]);

  // const onButtonPress = useCallback(() => {
  //   navigation.navigate(EAfterAuthScreens.HomeStackNavigator);
  //   setIsNewLinkModalShown(true);
  // }, [navigation]);

  const onButtonPress = useCallback(() => {
    console.log("Button pressed");
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        // <Loader />
        <View>
          <Text>Loading...</Text>
        </View>
      ) : (
        <>
          {collectionsLinksData.stack.links.length > 0 && (
            <View style={styles.contentHeader}>
              <Text style={styles.subtitle}>Saved links</Text>
            </View>
          )}

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
                source={require("assets/png/HomeScreenImage.png")}
                style={styles.image}
              />

              <Text style={styles.noLinksTitle}>
                You haven’t got recently saved items
              </Text>

              <Text style={styles.noLinksText}>
                You haven’t got recently saved items{" "}
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
        </>
      )}
    </View>
  );
};
