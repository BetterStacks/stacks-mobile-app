import AsyncStorage from "@react-native-async-storage/async-storage";

export const getValueFromStorage = async (key: string) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);

        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        // error reading value

        return null;
    }
};

export const getObjectFromStorage = async (key: string) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        // error reading value
    }
};
