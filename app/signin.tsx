import React, { useState, useCallback } from "react";
import { ApolloError, useMutation } from "@apollo/client";
import client from "@/lib/apollo/client";
import {
  MUTATION_SIGNIN,
  MUTATION_SIGNUP,
  MUTATION_UPLOAD_PROFILE_IMAGE,
} from "@/lib/api/graphql/mutations";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import FastImage from "react-native-fast-image";
import CommonInput from "@/components/CommonInput";
import { EIconName } from "@/components/design/icons/_models";
import { useAppleSignIn } from "@/hooks/useAppleSignIn";
import { TNullable } from "@/hooks/_models";
import { setUserToken } from "@/lib/apollo/store/handlers";
// import {useGoogleSignIn} from "@/hooks/useGoogleSignIn";
import uuid from "react-native-uuid";
import { ReactNativeFile } from "apollo-upload-client";
import { useFacebookSignIn } from "@/hooks/useFacebookSignIn";
import { Profile } from "react-native-fbsdk-next";
import { createRandomPassword } from "@/utils/helpers/createRandomPassword";
import { useFormik } from "formik";
import { SignInSchema } from "@/lib/validations/auth";
import Toast from "react-native-toast-message";
import LogoIcon from "@/svgs/LogoIcon";
import { Colors } from "@/components/design/colors";
import { setToStorage } from "@/utils/storage/setToStorage";
import { scaleHeight, scaleWidth } from "@/components/design/scale";
import { getFont } from "@/components/design/fonts/fonts";
import { EFontWeight } from "@/components/design/fonts/types";
import { MainButton, mainButtonStyles } from "@/components/ui/button";
import { EyeOff } from "lucide-react-native";
import { Image } from "react-native";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithRedirect,
} from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";

const SignInScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = async () => {
    console.log("Attempting sign in with credentials:", { email, password });

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Successfully signed in user:", user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Sign in error:", { errorCode, errorMessage });
      });
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithRedirect(auth, provider);
      console.log("Successfully signed in with Google:", credential);
    } catch (error) {
      console.error("Google sign in error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <LogoIcon width={63} height={53} />

        <Text style={styles.title}>Login to your account</Text>

        <View style={styles.socialsContainer}>
          <MainButton.Outline onPress={signInWithGoogle}>
            <Image
              style={styles.socialImage}
              source={require("@/assets/png/socialGoogle.png")}
              resizeMode={FastImage.resizeMode.contain}
            />
            <Text style={mainButtonStyles.outline.buttonText}>
              Login with Google
            </Text>
          </MainButton.Outline>

          <MainButton.Outline onPress={() => {}}>
            <Image
              style={styles.socialImage}
              source={require("@/assets/png/socialApple.png")}
              resizeMode={FastImage.resizeMode.contain}
            />
            <Text style={mainButtonStyles.outline.buttonText}>
              Login with Apple
            </Text>
          </MainButton.Outline>

          <MainButton.Outline onPress={() => {}}>
            <Image
              style={styles.socialImage}
              source={require("@/assets/png/socialFacebook.png")}
              resizeMode={FastImage.resizeMode.contain}
            />
            <Text style={mainButtonStyles.outline.buttonText}>
              Login with Facebook
            </Text>
          </MainButton.Outline>
        </View>

        <Text style={styles.divider}>or</Text>

        <View style={styles.inputsContainer}>
          <CommonInput
            placeholder="Email"
            keyboardType="email-address"
            placeholderTextColor={Colors.TextColor.InputPlaceholderColor}
            value={email}
            onChangeText={setEmail}
          />

          <CommonInput
            placeholder="Password"
            iconName={EIconName.EyeOff}
            placeholderTextColor={Colors.TextColor.InputPlaceholderColor}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.forgotTouchable}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* @ts-ignore */}
          <MainButton.Primary onPress={signIn}>
            <Text style={mainButtonStyles.primary.buttonText}>Login</Text>
          </MainButton.Primary>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerSubtitle}>Don't have an account?</Text>
        <TouchableOpacity>
          <Text style={styles.footerTitle}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scaleWidth(16),
    backgroundColor: Colors.OtherColor.MainBackgroundColor,
  },
  mainContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: scaleHeight(64),
  },
  title: {
    marginTop: scaleHeight(24),
    ...getFont(EFontWeight.Bold),
    fontSize: scaleHeight(16),
    color: Colors.TextColor.DarkHeadingColor,
  },
  inputsContainer: {
    gap: scaleHeight(16),
    width: "100%",
  },
  forgotTouchable: {
    alignSelf: "flex-end",
    // marginTop: scaleHeight(12),
  },
  forgotText: {
    color: Colors.TextColor.LignMainColor,
    ...getFont(EFontWeight.Medium),
    fontSize: scaleHeight(12),
  },
  divider: {
    marginVertical: scaleHeight(24),
    ...getFont(EFontWeight.Bold),
    fontSize: scaleHeight(14),
  },
  socialsContainer: {
    gap: 16,
    marginTop: scaleHeight(24),
    width: "100%",
  },
  socialImage: {
    width: scaleWidth(25),
    height: scaleHeight(25),
  },
  footer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scaleHeight(7),
    flexDirection: "row",
    gap: 4,
  },
  footerSubtitle: {
    ...getFont(EFontWeight.Regular),
    color: Colors.TextColor.SecondaryColor,
    fontSize: scaleHeight(16),
    lineHeight: 24,
  },
  footerTitle: {
    ...getFont(EFontWeight.Bold),
    color: Colors.TextColor.MainColor,
    fontSize: scaleHeight(16),
    lineHeight: 24,
  },
  loadingText: {
    ...getFont(EFontWeight.Regular),
    color: Colors.TextColor.MainColor,
    fontSize: scaleHeight(14),
    textAlign: "center",
  },
});

export default SignInScreen;
