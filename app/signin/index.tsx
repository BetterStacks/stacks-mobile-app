import React, { useState, useCallback } from 'react';
import { ApolloError, useMutation } from "@apollo/client";
import client from "@/lib/apollo/client";
import {
  MUTATION_SIGNIN,
  MUTATION_SIGNUP,
  MUTATION_UPLOAD_PROFILE_IMAGE,
} from "@/lib/api/graphql/mutations";
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import FastImage from "react-native-fast-image";
import CommonInput from "@/components/CommonInput";
import {EIconName} from "@/components/design/icons/_models";
import {useAppleSignIn} from "@/hooks/useAppleSignIn";
import {TNullable} from "@/hooks/_models";
import { setUserToken } from "@/lib/apollo/store/handlers";
// import {useGoogleSignIn} from "@/hooks/useGoogleSignIn";
import uuid from "react-native-uuid";
import { ReactNativeFile } from "apollo-upload-client";
import {useFacebookSignIn} from "@/hooks/useFacebookSignIn";
import { Profile } from "react-native-fbsdk-next";
import {createRandomPassword} from "@/utils/helpers/createRandomPassword";
import { useFormik } from "formik";
import {SignInSchema} from "@/lib/validations/auth";
import Toast from "react-native-toast-message";
import LogoIcon from "@/assets/svg/LogoIcon.svg";
import {Colors} from "@/components/design/colors";
import {setToStorage} from "@/utils/storage/setToStorage";
import {scaleHeight, scaleWidth} from "@/components/design/scale";
import {getFont} from "@/components/design/fonts/fonts";
import {EFontWeight} from "@/components/design/fonts/types";
import {MainButton, mainButtonStyles} from "@/components/ui/button";

const SignInScreen = () => {
  const [isPasswordSecured, setIsPasswordSecured] = useState(true);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: SignInSchema,
    validateOnMount: false,
    onSubmit: formValues => {
      signIn({
        variables: {
          provider: "email",
          password: formValues.password,
          email: formValues.email,
        },
      })
          .then(res => {
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
            Toast.show({
              type: "error",
              text1: "Error",
              text2: err.message,
            });
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


  const [uploadProfileImage] = useMutation(MUTATION_UPLOAD_PROFILE_IMAGE, {
    onCompleted: () => {
      setTimeout(async () => {
        await client.refetchQueries({
          include: ["QUERY_USER"],
        });
      }, 1500);
    },
  });

  // Apollo queries / mutations
  const [signUp, { loading: signUpLoading }] = useMutation(MUTATION_SIGNUP);
  const [signIn, { loading: signInLoading }] = useMutation(MUTATION_SIGNIN, {
    onCompleted: () => {
      setTimeout(async () => {
        await client.refetchQueries({
          include: ["QUERY_USER"],
        });
      }, 1500);
    },
  });

  const handleSecurePassword = useCallback(() => {
    setIsPasswordSecured(prev => !prev);
  }, []);


  const handleForgotButton = useCallback(() => {
    // TODO: implement forgot password
  }, []);

  const handleSignUp = useCallback(() => {
    router.replace("/signup");
  }, []);

  const onAppleSignIn = (
      appleResponse: TNullable<{ token: string; name: string }>,
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
      },
    })
        .then(res => {
          setToStorage("token", res.data.sign_in_user.token);
          setUserToken(res.data.sign_in_user.token);

          console.log(
              "Image in profile",
              res.data.sign_in_user.user.profile_image_url,
          );
        })
        .catch(error => {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "This email isn't registered, please sign up",
          });
          return console.log("In signInScreen", error);
        });
  };

  const onGoogleSignIn = (googleToken: string, googlePic: string) => {
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
      },
    })
        .then(res => {
          setToStorage("token", res.data.sign_in_user.token);
          setUserToken(res.data.sign_in_user.token);

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
        .catch(error => console.log("In signInScreen", error));
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
            .then(res => {
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
            .catch(error => console.log("In signInScreen", error));
      },
      [signIn, uploadProfileImage],
  );

  const signInWithApple = useAppleSignIn(onAppleSignIn);
  const signInWithGoogle = () => onGoogleSignIn('', '');
  const signInWithFacebook = useFacebookSignIn(onFacebookSignIn);

  const onAnonymSignUp = useCallback(() => {
    const appId = uuid.v4();

    setToStorage("appId", String(appId));

    signUp({
      variables: {
        provider: "email",
        name: "Anonym User",
        password: createRandomPassword(),
        email: `${appId}@anonymous.betterstacks.com`,
      },
    })
        .then(res => {
          setToStorage("token", res.data.sign_up_user.token);
          setUserToken(res.data.sign_up_user.token);
        })
        .catch((error: ApolloError) => {
          if (error.message === "User is already registered") {
            // setErrors(prev =>
            //   prev.includes(error.message) ? prev : [...prev, error.message],
            // );
          }
        });
  }, [signUp]);

  return (
      <View style={styles.container}>
        <View style={styles.mainContainer}>
          <LogoIcon width={63} height={53} />

          <Text style={styles.title}>Login to your account</Text>

          <View style={styles.socialsContainer}>
            <MainButton.Outline
                onPress={() => {}}
            >
              <FastImage
                  style={styles.socialImage}
                  source={require("@/assets/png/socialGoogle.png")}
                  resizeMode={FastImage.resizeMode.contain}
              />
              <Text style={mainButtonStyles.outline.buttonText}>Login with Google</Text>
            </MainButton.Outline>

            <MainButton.Outline
                onPress={() => {}}
            >
              <FastImage
                  style={styles.socialImage}
                  source={require("@/assets/png/socialApple.png")}
                  resizeMode={FastImage.resizeMode.contain}
              />
              <Text style={mainButtonStyles.outline.buttonText}>Login with Apple</Text>
            </MainButton.Outline>

            <MainButton.Outline
                onPress={() => {}}
            >
              <FastImage
                  style={styles.socialImage}
                  source={require("@/assets/png/socialFacebook.png")}
                  resizeMode={FastImage.resizeMode.contain}
              />
              <Text style={mainButtonStyles.outline.buttonText}>Login with Facebook</Text>
            </MainButton.Outline>
          </View>

          <Text style={styles.divider}>or</Text>

          <View style={styles.inputsContainer}>
            <CommonInput
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                value={values.email}
                placeholder="Email"
                keyboardType="email-address" // @ts-ignore
                touched={touched.email}
                errors={errors.email}
                placeholderTextColor={Colors.TextColor.InputPlaceholderColor}
            />

            <CommonInput
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                value={values.password}
                placeholder="Password"
                iconName={EIconName.EyeOff}
                secureTextEntry={isPasswordSecured} // @ts-ignore
                isSecondIconActive={!isPasswordSecured}
                secondIconName={EIconName.EyeOn}
                onIconPress={handleSecurePassword}
                touched={touched.password}
                errors={errors.password}
                placeholderTextColor={Colors.TextColor.InputPlaceholderColor}
            />

            <TouchableOpacity style={styles.forgotTouchable} onPress={handleForgotButton}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* @ts-ignore */}
            <MainButton.Primary onPress={handleSubmit} loading={signInLoading || signUpLoading}>
              <Text style={mainButtonStyles.primary.buttonText}>Login</Text>
            </MainButton.Primary>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerSubtitle}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.footerTitle}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scaleWidth(16),
    backgroundColor: Colors.OtherColor.MainBackgroundColor,
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
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
    width: '100%',
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
    width: '100%'
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
    gap: 4
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

export default SignInScreen