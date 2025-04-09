import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { styles } from "./CreateCollectionScreenStyles";
import { useCallback, useState } from "react";
import { useMutation } from "@apollo/client";
import FastImage from "react-native-fast-image";
import { ReactNativeFile } from "apollo-upload-client";
import {
  MUTATION_ADD_NEW_COLLECTION,
  MUTATION_UPLOAD_COLLECTION_COVER_IMAGE,
} from "@/lib/api/graphql/mutations";
import { setIsSuccessModalVisible } from "@/lib/apollo/store/handlers";
import client from "@/lib/apollo/client";
import CommonInput from "../CommonInput";
import { CommonButton } from "../CommonButton/CommonButton";

export const CreateCollectionScreen = () => {
  const [collection, setCollectionName] = useState("");
  const [collectionImage, setCollectionImage] = useState();
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [createNewCollection, { loading }] = useMutation(
    MUTATION_ADD_NEW_COLLECTION,
  );
  const [uploadImage, { loading: imageUploading }] = useMutation(
    MUTATION_UPLOAD_COLLECTION_COVER_IMAGE,
  );

  const handleCreateCollection = useCallback(() => {
    if (collection) {
      createNewCollection({
        variables: {
          collection,
        },
      })
        .then((data) => {
          const newCollectionId = data.data.add_new_collection;

          if (collectionImage) {
            uploadImage({
              variables: {
                file: new ReactNativeFile({
                  uri: collectionImage.path,
                  name: collectionImage.filename,
                  type: collectionImage.mime,
                }),
                collection: newCollectionId,
              },
            });
          }
        })
        .finally(() => {
          setIsSuccessModalVisible(true);
          setTimeout(async () => {
            await client.refetchQueries({
              include: [
                "QUERY_LINKS",
                "QUERY_STACKS",
                "QUERY_DOMAIN_LINKS",
                "QUERY_DOMAIN_LINKS_BY_STACKID",
                "QUERY_STACK_LINKS",
                "QUERY_COLLECTION_LINKS",
                "QUERY_COLLECTIONS",
              ],
            });
          }, 1500);
        });
    }
  }, [collection, collectionImage, createNewCollection, uploadImage]);

  const onChangeText = useCallback((text: string) => {
    setCollectionName(text);
  }, []);

  // const onSelectImage = useCallback(() => {
  //   setIsImageUploading(true);
  //   ImagePicker.openPicker({
  //     width: 300,
  //     height: 400,
  //     cropping: true,
  //     includeBase64: true,
  //   })
  //     .then((image) => {
  //       setCollectionImage(image);
  //     })
  //     .finally(() => {
  //       setIsImageUploading(false);
  //     });
  // }, []);
  //
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>Name your new collection</Text>

          <CommonInput
            value={collection}
            onChangeText={onChangeText}
            placeholder="Collection name"
            additionalInputStyles={styles.input}
          />

          <Text style={[styles.title, styles.secondTitle]}>Image</Text>

          <Text style={styles.text}>
            You can share the link with your team member or enter your companion
            connect code.
          </Text>

          {collectionImage && (
            <View style={styles.newImageContainer}>
              <Text style={[styles.text, styles.newImageText]}>
                Uploaded image:
              </Text>
              <FastImage
                style={styles.newImageStyle}
                source={{
                  uri: collectionImage.path,
                }}
              />
            </View>
          )}

          {/* <TouchableOpacity style={styles.filePicker} onPress={onSelectImage}>
            {isImageUploading ? (
              <ActivityIndicator />
            ) : (
              <>
                <Text style={styles.filePickerTitle}>Browse image</Text>
                <Text style={styles.filePickerSubtitle}>Max 5mb each</Text>
              </>
            )}
          </TouchableOpacity> */}
        </View>

        <CommonButton
          text="Create"
          disabled={loading || imageUploading ? true : false}
          onPress={handleCreateCollection}
          additionalButtonStyles={[
            styles.button,
            (loading || imageUploading) && styles.buttonLoading,
          ]}
        />
      </View>
    </View>
  );
};
