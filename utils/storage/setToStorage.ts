import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  setGooglePhotoUrl,
  setUserInfo,
  setUserToken,
} from "@/lib/apollo/store/handlers";
import { getObjectFromStorage } from "./getStorage";
import {User} from "@/lib/types/User";

export const setToStorage = async (key: string, value: string) => {
  try {
    const jsonValue = JSON.stringify(value);

    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    // saving error
    console.log("error in setToStorage", e);
  }
};

export const setObjectToStorage = async (key: string, object: object) => {
  try {
    const jsonValue = JSON.stringify(object);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    // saving error
  }
};

export const setUserToStorageAndReactive = async (object: User) => {
  try {
    const jsonValue = JSON.stringify(object);
    await AsyncStorage.setItem("user", jsonValue);

    setUserInfo(object);

    getObjectFromStorage("user").then(data =>
      console.log("User in storage:", data),
    );
  } catch (e) {
    // saving error
  }
};

export const clearUserInfo = async () => {
  try {
    const jsonValue = JSON.stringify({});
    await AsyncStorage.setItem("user", jsonValue);
    await AsyncStorage.removeItem("token");

    setUserToken("");
    setGooglePhotoUrl("");

    // @ts-ignore
    setUserInfo({
      name: "",
      id: "",
      email: "",
      profile_image_url: "",
      provider: "",
      phone: "",
      token: "",
      companion_share_link: "",
      unconfirmed_email: "",
      is_notification_enabled: false,
      confirmation_token: "",
      spouse: {
        id: "",
      },
      identities: [],
    });
  } catch (e) {
    console.log("error", e);
  }
};
