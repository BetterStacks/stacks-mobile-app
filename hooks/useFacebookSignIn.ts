import { AccessToken, LoginManager, Profile } from "react-native-fbsdk-next";

// Attempt a login using the Facebook login dialog asking for default permissions.

export const useFacebookSignIn = (
  onFbSignIn: (token: string, profile: Profile) => void,
) => {
  const onSignInPress = async () => {
    await LoginManager.logInWithPermissions(["public_profile", "email"]);

    const accessToken = await AccessToken.getCurrentAccessToken();
    const currentProfile = await Profile.getCurrentProfile();

    if (accessToken && currentProfile) {
      onFbSignIn(accessToken.accessToken, currentProfile);
    }
  };
  return onSignInPress;
};
