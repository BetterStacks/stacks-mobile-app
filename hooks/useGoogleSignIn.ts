import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useState } from "react";
// import temporaryUserPicStorage from "shared/utils/helpers/TemporaryUserPicStorage";

export const useGoogleSignIn = (
    callback: (
        token: string,
        googlePic: string,
        googleName?: string,
        googleEmail?: string,
    ) => void,
) => {
    const [isConfigured, setIsConfigured] = useState<boolean>(false);

    return async () => {
        if (!isConfigured) {
            GoogleSignin.configure({
                webClientId:
                    "574408922411-6mibbilqs6qtoecohumklv5h4s50bncp.apps.googleusercontent.com",
            });
            setIsConfigured(true);
        }
        const isSignedIn = await GoogleSignin.isSignedIn();
        let idToken = "";
        let image = "";
        let googleName = "";
        let googleEmail = "";

        if (!isSignedIn) {
            try {
                await GoogleSignin.hasPlayServices();
                const userInfo = await GoogleSignin.signIn();

                googleName =
                    userInfo.user.name ||
                    userInfo.user.familyName ||
                    userInfo.user.givenName ||
                    "No Name";
                googleEmail = userInfo.user.email;

                const tokens = await GoogleSignin.getTokens();

                if (userInfo.user.photo) {
                    image = userInfo.user.photo;
                }

                // if (userPic) {
                //   setGooglePhotoUrl(userPic)
                // }

                idToken = tokens.accessToken || "";
            } catch (error) {
                console.error(error);
            }
        } else {
            const tokens = await GoogleSignin.getTokens();

            idToken = tokens.accessToken;
        }

        callback(idToken, image, googleName, googleEmail);
        GoogleSignin.signOut();
    };
};
