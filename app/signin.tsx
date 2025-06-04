import React, {useCallback} from "react";
import {ApolloError, useMutation} from "@apollo/client";
import client from "@/lib/apollo/client";
import {MUTATION_SIGNIN, MUTATION_UPLOAD_PROFILE_IMAGE,} from "@/lib/api/graphql/mutations";
import {
  GestureResponderEvent,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import FastImage from "react-native-fast-image";
import CommonInput from "@/components/CommonInput";
import {useAppleSignIn} from "@/hooks/useAppleSignIn";
import {TNullable} from "@/hooks/_models";
import {setUserToken} from "@/lib/apollo/store/handlers";
import uuid from "react-native-uuid";
import {ReactNativeFile} from "apollo-upload-client";
import {Profile} from "react-native-fbsdk-next";
import {useFormik} from "formik";
import {SignInSchema} from "@/lib/validations/auth";
import LogoIcon from "@/svgs/LogoIcon";
import {Colors} from "@/components/design/colors";
import {setToStorage} from "@/utils/storage/setToStorage";
import {scaleHeight, scaleWidth} from "@/components/design/scale";
import {getFont} from "@/components/design/fonts/fonts";
import {EFontWeight} from "@/components/design/fonts/types";
import {useGoogleSignIn} from "@/hooks/useGoogleSignIn";
import TokenCheck from "@/components/TokenCheck";
import {router} from "expo-router";
import {Toast} from "toastify-react-native";

const SignInScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: SignInSchema,
    validateOnMount: false,
    onSubmit: (formValues) => {
      signIn({
        variables: {
          provider: "email",
          password: formValues.password,
          email: formValues.email,
        },
      })
        .then((res) => {
          console.log(res.data.sign_in_user.token);
          setToStorage("token", res.data.sign_in_user.token);
          setUserToken(res.data.sign_in_user.token);
        })
        .catch((err: ApolloError) => {
          if (err.message === "Password is incorrect") {
            setFieldError("password", "Invalid password.");
            return;
          }
          if (err.message === "User not found") {
            setFieldError("email", "User not found.");
            return;
          }

          Toast.error(err.message);
        });
    },
  });

  const {
    values,
    errors,
    touched,
    handleSubmit,
    setFieldError,
    handleChange,
    handleBlur,
  } = formik;

  // Apollo queries / mutations
  const [signIn, { loading: signInLoading }] = useMutation(MUTATION_SIGNIN, {
    onCompleted: () => {
      setTimeout(async () => {
        await client.refetchQueries({
          include: ["QUERY_USER"],
        });
      }, 1500);
      router.replace("/dashboard");
    },
  });
  const [uploadProfileImage] = useMutation(MUTATION_UPLOAD_PROFILE_IMAGE, {
    onCompleted: () => {
      setTimeout(async () => {
        await client.refetchQueries({
          include: ["QUERY_USER"],
        });
      }, 1500);
    },
  });

  const onGoogleSignIn = (googleToken: string, googlePic: string, googleName?: string, googleEmail?: string) => {
    const appId = uuid.v4();

    setToStorage("appId", String(appId));
    console.log("googlePicture", googlePic);

    signIn({
      context: {
        headers: {
          Authorization: `Bearer ${googleToken}`,
        },
      },
      variables: {
        provider: "google_oauth2",
        app_id: appId,
        email: googleEmail,
      },
    })
      .then((res) => {
        setToStorage("token", res.data.sign_in_user.token);
        setUserToken(res.data.sign_in_user.token);

        console.log("GQLToken", res.data.sign_in_user.token);

        console.log("picture", res.data.sign_in_user.user.profile_image_url);

        if (
          !res.data.sign_in_user.user.profile_image_url &&
          googlePic.length > 0
        ) {
          uploadProfileImage({
            variables: {
              file: new ReactNativeFile({
                uri: googlePic,
                name: googlePic,
                type: "JPG",
              }),
            },
          });
        }
      })
      .catch((error) => console.log("In signInScreen", error));
  };

  const onAppleSignIn = (
    appleResponse: TNullable<{ token: string; name: string; email: string | null }>,
  ) => {
    if (appleResponse === null) {
      return;
    }
    const appleToken = appleResponse.token;

    const appId = uuid.v4();

    setToStorage("appId", String(appId));

    signIn({
      context: {
        headers: {
          Authorization: `Bearer ${appleToken}`,
        },
      },
      variables: {
        provider: "apple",
        app_id: appId,
        email: appleResponse.email,
      },
    })
      .then((res) => {
        setToStorage("token", res.data.sign_in_user.token);
        setUserToken(res.data.sign_in_user.token);

        console.log("Apple Sign-In successful");
        console.log(
          "Image in profile",
          res.data.sign_in_user.user.profile_image_url,
        );
      })
      .catch((error) => {
        Toast.error(error.message);
        return console.log("Apple Sign-In error:", error);
      });
  };

  const onFacebookSignIn = useCallback(
    (token: string, profile: Profile) => {
      const appId = uuid.v4();

      setToStorage("appId", String(appId));

      signIn({
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        variables: {
          provider: "facebook",
          app_id: appId,
        },
      })
        .then((res) => {
          setToStorage("token", res.data.sign_in_user.token);
          setUserToken(res.data.sign_in_user.token);

          if (
            !res.data.sign_in_user.user.profile_image_url &&
            profile.imageURL &&
            profile.imageURL.length > 0
          ) {
            uploadProfileImage({
              variables: {
                file: new ReactNativeFile({
                  uri: profile.imageURL,
                  name: profile.imageURL,
                  type: "JPG",
                }),
              },
            });
          }
        })
        .catch((error) => console.log("In signInScreen", error));
    },
    [signIn, uploadProfileImage],
  );

  const signInGoogle = useGoogleSignIn(onGoogleSignIn);
  const signInWithApple = useAppleSignIn(onAppleSignIn);

  const handleLoginPress = (event: GestureResponderEvent) => {
    handleSubmit();
  };

  return (
      <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
      >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <ScrollView style={isDark ? styles.container_dark : styles.container}>
          {/* CHECK FOR THE PRESENCE OF TOKEN */}
          <TokenCheck />

          <View style={styles.mainContainer}>
            <LogoIcon width={63} height={53} />

            <Text style={isDark ? styles.title_dark : styles.title}>Login to your account</Text>

            <View style={styles.socialsContainer}>
              <TouchableOpacity
                style={isDark ? styles.socialButton_dark : styles.socialButton}
                onPress={signInGoogle}
              >
                <Image
                  style={styles.socialImage}
                  source={require("@/assets/png/socialGoogle.png")}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={isDark ? styles.socialButtonText_dark : styles.socialButtonText}>
                  Login with Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={isDark ? styles.socialButton_dark : styles.socialButton}
                onPress={signInWithApple}
              >
                <Image
                  style={isDark ? styles.socialImageAppleDark : styles.socialImage}
                  source={require("@/assets/png/socialApple.png")}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={isDark ? styles.socialButtonText_dark : styles.socialButtonText}>
                  Login with Apple
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={isDark ? styles.socialButton_dark : styles.socialButton}
                onPress={signInGoogle}
              >
                <Image
                  style={styles.socialImage}
                  source={require("@/assets/png/socialFacebook.png")}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={isDark ? styles.socialButtonText_dark : styles.socialButtonText}>
                  Login with Facebook
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={isDark ? styles.divider_dark : styles.divider}>or</Text>

            <View style={styles.inputsContainer}>
              <CommonInput
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                value={values.email}
                placeholder="Email"
                keyboardType="email-address"
                placeholderTextColor={isDark ? "#8F8F8F" : Colors.TextColor.InputPlaceholderColor}
                colorScheme={colorScheme}
              />

              <CommonInput
                placeholder="Password"
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                value={values.password}
                placeholderTextColor={isDark ? "#8F8F8F" : Colors.TextColor.InputPlaceholderColor}
                secureTextEntry
                colorScheme={colorScheme}
              />

              <TouchableOpacity style={styles.forgotTouchable}>
                <Text style={isDark ? styles.forgotText_dark : styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={isDark ? styles.loginButton_dark : styles.loginButton}
                onPress={handleLoginPress}
                disabled={signInLoading}
              >
                {(signInLoading) ? (
                  <Text style={styles.loginButtonText}>Loading...</Text>
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={isDark ? styles.footerSubtitle_dark : styles.footerSubtitle}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={isDark ? styles.footerTitle_dark : styles.footerTitle}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scaleWidth(16),
    backgroundColor: Colors.OtherColor.MainBackgroundColor,
  },
  container_dark: {
    flex: 1,
    paddingHorizontal: scaleWidth(16),
    backgroundColor: "#0A0A0A",
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
  title_dark: {
    marginTop: scaleHeight(24),
    ...getFont(EFontWeight.Bold),
    fontSize: scaleHeight(16),
    color: "#FFFFFF",
  },
  inputsContainer: {
    gap: scaleHeight(16),
    width: "100%",
  },
  forgotTouchable: {
    alignSelf: "flex-end",
  },
  forgotText: {
    color: Colors.TextColor.LignMainColor,
    ...getFont(EFontWeight.Medium),
    fontSize: scaleHeight(12),
  },
  forgotText_dark: {
    color: "#4793E0",
    ...getFont(EFontWeight.Medium),
    fontSize: scaleHeight(12),
  },
  divider: {
    marginVertical: scaleHeight(24),
    ...getFont(EFontWeight.Bold),
    fontSize: scaleHeight(14),
  },
  divider_dark: {
    marginVertical: scaleHeight(24),
    ...getFont(EFontWeight.Bold),
    fontSize: scaleHeight(14),
    color: "#FFFFFF",
  },
  socialsContainer: {
    gap: 16,
    marginTop: scaleHeight(24),
    width: "100%",
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    gap: 10,
  },
  socialButton_dark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#171717',
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#262626',
    gap: 10,
  },
  socialButtonText: {
    color: '#1C4A5A',
    fontWeight: '600',
    fontSize: 16,
  },
  socialButtonText_dark: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  socialImage: {
    width: scaleWidth(25),
    height: scaleHeight(25),
  },
  socialImageAppleDark: {
    width: scaleWidth(25),
    height: scaleHeight(25),
    tintColor: '#FFFFFF',
  },
  loginButton: {
    backgroundColor: "#1C4A5A",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
    width: '100%',
  },
  loginButton_dark: {
    backgroundColor: "#1C4A5A",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
    width: '100%',
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
  footerSubtitle_dark: {
    ...getFont(EFontWeight.Regular),
    color: "#8EACB7",
    fontSize: scaleHeight(16),
    lineHeight: 24,
  },
  footerTitle: {
    ...getFont(EFontWeight.Bold),
    color: Colors.TextColor.MainColor,
    fontSize: scaleHeight(16),
    lineHeight: 24,
  },
  footerTitle_dark: {
    ...getFont(EFontWeight.Bold),
    color: "#FFFFFF",
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
