import React, {useCallback, useState} from "react";
import {
	Image,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import {useRouter} from "expo-router";
import TokenCheck from "@/components/TokenCheck";
import {useFormik} from "formik";
import {ApolloError, useMutation} from "@apollo/client";
import {MUTATION_SIGNUP, MUTATION_UPLOAD_PROFILE_IMAGE} from "@/lib/api/graphql/mutations";
import {SignUpSchema} from "@/lib/validations/auth";
import {setToStorage} from "@/utils/storage/setToStorage";
import {setUserToken} from "@/lib/apollo/store/handlers";
import {Toast} from "toastify-react-native";
import client from "@/lib/apollo/client";
import {TNullable} from "@/hooks/_models";
import uuid from "react-native-uuid";
import {ReactNativeFile} from "apollo-upload-client";
import {useGoogleSignIn} from "@/hooks/useGoogleSignIn";
import {useAppleSignIn} from "@/hooks/useAppleSignIn";
import {MainButton, mainButtonStyles} from "@/components/ui/button";
import {Colors} from "@/components/design/colors";
import Feather from '@expo/vector-icons/Feather';
import FastImage from "react-native-fast-image";
import LogoIcon from "@/svgs/LogoIcon";
import CommonInput from "@/components/CommonInput";

const SignupScreen = () => {
	const [isPasswordSecured, setIsPasswordSecured] = useState(true);
	const [isConfirmedSecured, setIsConfirmedSecured] = useState(true);

	const [signUp, { loading }] = useMutation(MUTATION_SIGNUP);

	const formik = useFormik({
		initialValues: {
			email: "",
			password: "",
			confirmedPassword: "",
		},
		validationSchema: SignUpSchema,
		validateOnMount: false,
		onSubmit: formValues => {
			signUp({
				variables: {
					provider: "email",
					password: formValues.password,
					email: formValues.email,
				},
			})
				.then(res => {
					setToStorage("token", res.data.sign_up_user.token);
					setUserToken(res.data.sign_up_user.token);
				})
				.catch((error: ApolloError) => {
					console.log(error);

					if (error.message === "User is already registered") {
						Toast.error(error.message);
						setFieldError("email", "User is already registered.");
					}
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
	
	const router = useRouter();

	const [uploadProfileImage] = useMutation(MUTATION_UPLOAD_PROFILE_IMAGE, {
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

	const handleConfirmedSecurePassword = useCallback(() => {
		setIsConfirmedSecured(prev => !prev);
	}, []);

	const handleSignIn = () => {
		router.push("/signin");
	}

	const onAppleSignUp = (
		appleResponse: TNullable<{
			token: string;
			name: string;
			email: string | null;
		}>,
	) => {
		if (appleResponse === null) {
			return;
		}
		const appleToken = appleResponse.token;
		const appId = uuid.v4();

		setToStorage("appId", String(appId));

		signUp({
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
				console.log(error.message);

				if (
					error.message === "User is already registered." ||
					error.message === "User is already registered"
				) {
					Toast.error(error.message);
				}
			});
	};

	const onGoogleSignUp = (
		googleToken: string,
		googlePic: string,
		googleName?: string,
		googleEmail?: string,
	) => {
		signUp({
			context: {
				headers: {
					Authorization: `Bearer ${googleToken}`,
				},
			},
			variables: {
				provider: "google_oauth2",
				name: googleName,
				email: googleEmail,
			},
		})
			.then(res => {
				setToStorage("token", res.data.sign_up_user.token);
				setUserToken(res.data.sign_up_user.token);

				if (googlePic.length > 0) {
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
			.catch((error: ApolloError) => {
				console.log(error.message);

				if (
					error.message === "User is already registered." ||
					error.message === "User is already registered"
				) {
					Toast.error(error.message);
				}
			});
	};

	const signUpWithGoogle = useGoogleSignIn(onGoogleSignUp);
	const signInWithApple = useAppleSignIn(onAppleSignUp);

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // or 'position'
			style={{ flex: 1 }}
		>
			<ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
			{/* CHECK FOR THE PRESENCE OF TOKEN */}
			<TokenCheck />

			<View style={styles.mainContainer}>
				<LogoIcon width={63} height={53} />
				<Text style={styles.title}>Create your account</Text>

				<View style={styles.socialsContainer}>
					<MainButton.Outline
						onPress={signUpWithGoogle}
					>
						<Image
							style={styles.socialImage}
							source={require("@/assets/png/socialGoogle.png")}
							resizeMode={FastImage.resizeMode.contain}
						/>
						<Text style={mainButtonStyles.outline.buttonText}>Sign up with Google</Text>
					</MainButton.Outline>

					<MainButton.Outline
						onPress={signInWithApple}
					>
						<Image
							style={styles.socialImage}
							source={require("@/assets/png/socialApple.png")}
							resizeMode={FastImage.resizeMode.contain}
						/>
						<Text style={mainButtonStyles.outline.buttonText}>Sign up with Apple</Text>
					</MainButton.Outline>

					<MainButton.Outline
						onPress={signUpWithGoogle}
					>
						<Image
							style={styles.socialImage}
							source={require("@/assets/png/socialFacebook.png")}
							resizeMode={FastImage.resizeMode.contain}
						/>
						<Text style={mainButtonStyles.outline.buttonText}>Sign up with Facebook</Text>
					</MainButton.Outline>
				</View>

				<Text style={styles.divider}>or</Text>

				<View style={styles.inputsContainer}>
					<CommonInput
						value={values.email}
						onChangeText={handleChange("email")}
						placeholder="Enter your email address"
						keyboardType="email-address" // @ts-ignore
						touched={touched.email}
						errors={errors.email}
						onBlur={handleBlur("email")}
						placeholderTextColor={Colors.TextColor.InputPlaceholderColor}
					/>

					<CommonInput
						value={values.password}
						onChangeText={handleChange("password")}
						placeholder="Enter password"
						iconName={<Feather name="eye-off" size={20} color="black" />}
						secureTextEntry={isPasswordSecured} // @ts-ignore
						isSecondIconActive={!isPasswordSecured}
						secondIconName={<Feather name="eye" size={20} color="black" />}
						onIconPress={handleSecurePassword}
						touched={touched.password}
						errors={errors.password}
						onBlur={handleBlur("password")}
						placeholderTextColor={Colors.TextColor.InputPlaceholderColor}
					/>

					<CommonInput
						value={values.confirmedPassword}
						onChangeText={handleChange("confirmedPassword")}
						placeholder="Confirm password"
						iconName={<Feather name="eye-off" size={20} color="black" />}
						secureTextEntry={isConfirmedSecured} // @ts-ignore
						isSecondIconActive={!isConfirmedSecured}
						secondIconName={<Feather name="eye" size={20} color="black" />}
						onIconPress={handleConfirmedSecurePassword}
						touched={touched.confirmedPassword}
						errors={errors.confirmedPassword}
						onBlur={handleBlur("confirmedPassword")}
						placeholderTextColor={Colors.TextColor.InputPlaceholderColor}
					/>

					{/* @ts-ignore */}
					<MainButton.Primary onPress={handleSubmit} loading={loading}>
						<Text style={mainButtonStyles.primary.buttonText}>Signup</Text>
					</MainButton.Primary>
				</View>
			</View>

			<View style={styles.footer}>
				<Text style={styles.footerSubtitle}>Already have an account?</Text>
				<TouchableOpacity onPress={handleSignIn}>
					<Text style={styles.footerTitle}>Sign In</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
		</KeyboardAvoidingView>
	);
}


const styles = StyleSheet.create({
	container: {
		backgroundColor: Colors.OtherColor.UsualWhite,
	},
	contentContainer: {
		flex: 1,
		paddingHorizontal: 16,
		backgroundColor: Colors.OtherColor.MainBackgroundColor,
		justifyContent: "space-between",
	},
	mainContainer: {
		flex: 1,
		alignItems: 'center',
		paddingTop: 64,
	},
	title: {
		marginTop: 24,
		fontWeight: "bold",
		fontSize: 16,
		color: Colors.TextColor.DarkHeadingColor,
	},
	inputsContainer: {
		gap: 16,
		width: '100%',
	},
	divider: {
		marginVertical: 24,
		fontWeight: "bold",
		fontSize: 14,
	},
	socialsContainer: {
		gap: 16,
		marginTop: 24,
		width: '100%'
	},
	socialImage: {
		width: 25,
		height: 25,
	},
	footer: {
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 7,
		flexDirection: "row",
		gap: 4
	},
	footerSubtitle: {
		fontWeight: "regular",
		color: Colors.TextColor.SecondaryColor,
		fontSize: 16,
		lineHeight: 24,
	},
	footerTitle: {
		fontWeight: "bold",
		color: Colors.TextColor.MainColor,
		fontSize: 16,
		lineHeight: 24,
	},
	errorText: {
		fontWeight: "regular",
		color: Colors.OtherColor.ModalRedColor,
		fontSize: 14,
	},
});


export default SignupScreen;