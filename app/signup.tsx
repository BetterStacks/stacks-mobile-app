import React, {useCallback, useState} from "react";
import {
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
import {Colors} from "@/components/design/colors";
import Feather from '@expo/vector-icons/Feather';
import FastImage from "react-native-fast-image";
import LogoIcon from "@/svgs/LogoIcon";
import CommonInput from "@/components/CommonInput";

const SignupScreen = () => {
	const [isPasswordSecured, setIsPasswordSecured] = useState(true);
	const [isConfirmedSecured, setIsConfirmedSecured] = useState(true);
	const colorScheme = useColorScheme();
	const isDark = colorScheme === 'dark';

	const [signUp, { loading }] = useMutation(MUTATION_SIGNUP, {
		onCompleted: () => {
			setTimeout(async () => {
				await client.refetchQueries({
					include: ["QUERY_USER"],
				});
			}, 1500);
			router.replace("/dashboard");
		},
	});

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
				name: appleResponse.name,
				email: appleResponse.email,
			},
		})
			.then(res => {
				setToStorage("token", res.data.sign_up_user.token);
				setUserToken(res.data.sign_up_user.token);

				console.log("Apple Sign-Up successful");
				console.log(
					"Image in profile",
					res.data.sign_up_user.user.profile_image_url,
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
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			style={{ flex: 1 }}
		>
			<StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
			<ScrollView 
				style={isDark ? styles.container_dark : styles.container} 
				contentContainerStyle={isDark ? styles.contentContainer_dark : styles.contentContainer}
			>
			{/* CHECK FOR THE PRESENCE OF TOKEN */}
			<TokenCheck />

			<View style={styles.mainContainer}>
				<LogoIcon width={63} height={53} />
				<Text style={isDark ? styles.title_dark : styles.title}>Create your account</Text>

				<View style={styles.socialsContainer}>
					<TouchableOpacity 
						style={isDark ? styles.socialButton_dark : styles.socialButton} 
						onPress={signUpWithGoogle}
					>
						<Image
							style={styles.socialImage}
							source={require("@/assets/png/socialGoogle.png")}
							resizeMode={FastImage.resizeMode.contain}
						/>
						<Text style={isDark ? styles.socialButtonText_dark : styles.socialButtonText}>
							Sign up with Google
						</Text>
					</TouchableOpacity>

					<TouchableOpacity 
						style={isDark ? styles.socialButton_dark : styles.socialButton}
						onPress={signInWithApple}
					>
						<Image
							style={styles.socialImage}
							source={require("@/assets/png/socialApple.png")}
							resizeMode={FastImage.resizeMode.contain}
						/>
						<Text style={isDark ? styles.socialButtonText_dark : styles.socialButtonText}>
							Sign up with Apple
						</Text>
					</TouchableOpacity>

					<TouchableOpacity 
						style={isDark ? styles.socialButton_dark : styles.socialButton}
						onPress={signUpWithGoogle}
					>
						<Image
							style={styles.socialImage}
							source={require("@/assets/png/socialFacebook.png")}
							resizeMode={FastImage.resizeMode.contain}
						/>
						<Text style={isDark ? styles.socialButtonText_dark : styles.socialButtonText}>
							Sign up with Facebook
						</Text>
					</TouchableOpacity>
				</View>

				<Text style={isDark ? styles.divider_dark : styles.divider}>or</Text>

				<View style={styles.inputsContainer}>
					<CommonInput
						value={values.email}
						onChangeText={handleChange("email")}
						placeholder="Enter your email address"
						keyboardType="email-address" // @ts-ignore
						touched={touched.email}
						errors={errors.email}
						onBlur={handleBlur("email")}
						placeholderTextColor={isDark ? "#8F8F8F" : Colors.TextColor.InputPlaceholderColor}
						colorScheme={colorScheme}
					/>

					<CommonInput
						value={values.password}
						onChangeText={handleChange("password")}
						placeholder="Enter password"
						iconName={<Feather name="eye-off" size={20} color={isDark ? "#8EACB7" : "black"} />}
						secureTextEntry={isPasswordSecured} // @ts-ignore
						isSecondIconActive={!isPasswordSecured}
						secondIconName={<Feather name="eye" size={20} color={isDark ? "#8EACB7" : "black"} />}
						onIconPress={handleSecurePassword}
						touched={touched.password}
						errors={errors.password}
						onBlur={handleBlur("password")}
						placeholderTextColor={isDark ? "#8F8F8F" : Colors.TextColor.InputPlaceholderColor}
						colorScheme={colorScheme}
					/>

					<CommonInput
						value={values.confirmedPassword}
						onChangeText={handleChange("confirmedPassword")}
						placeholder="Confirm password"
						iconName={<Feather name="eye-off" size={20} color={isDark ? "#8EACB7" : "black"} />}
						secureTextEntry={isConfirmedSecured} // @ts-ignore
						isSecondIconActive={!isConfirmedSecured}
						secondIconName={<Feather name="eye" size={20} color={isDark ? "#8EACB7" : "black"} />}
						onIconPress={handleConfirmedSecurePassword}
						touched={touched.confirmedPassword}
						errors={errors.confirmedPassword}
						onBlur={handleBlur("confirmedPassword")}
						placeholderTextColor={isDark ? "#8F8F8F" : Colors.TextColor.InputPlaceholderColor}
						colorScheme={colorScheme}
					/>

					<TouchableOpacity 
						style={isDark ? styles.signupButton_dark : styles.signupButton} // @ts-ignore
						onPress={handleSubmit}
						disabled={loading}
					>
						{loading ? (
							<Text style={styles.signupButtonText}>Loading...</Text>
						) : (
							<Text style={styles.signupButtonText}>Signup</Text>
						)}
					</TouchableOpacity>
				</View>
			</View>

			<View style={styles.footer}>
				<Text style={isDark ? styles.footerSubtitle_dark : styles.footerSubtitle}>Already have an account?</Text>
				<TouchableOpacity onPress={handleSignIn}>
					<Text style={isDark ? styles.footerTitle_dark : styles.footerTitle}>Sign In</Text>
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
	container_dark: {
		backgroundColor: "#0A0A0A",
	},
	contentContainer: {
		flex: 1,
		paddingHorizontal: 16,
		backgroundColor: Colors.OtherColor.MainBackgroundColor,
		justifyContent: "space-between",
	},
	contentContainer_dark: {
		flex: 1,
		paddingHorizontal: 16,
		backgroundColor: "#0A0A0A",
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
	title_dark: {
		marginTop: 24,
		fontWeight: "bold",
		fontSize: 16,
		color: "#FFFFFF",
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
	divider_dark: {
		marginVertical: 24,
		fontWeight: "bold",
		fontSize: 14,
		color: "#FFFFFF",
	},
	socialsContainer: {
		gap: 16,
		marginTop: 24,
		width: '100%'
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
		width: 25,
		height: 25,
	},
	signupButton: {
		backgroundColor: "#1C4A5A",
		padding: 16,
		borderRadius: 8,
		alignItems: "center",
		marginBottom: 8,
		width: '100%',
	},
	signupButton_dark: {
		backgroundColor: "#1C4A5A",
		padding: 16,
		borderRadius: 8,
		alignItems: "center",
		marginBottom: 8,
		width: '100%',
	},
	signupButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
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
	footerSubtitle_dark: {
		fontWeight: "regular",
		color: "#8EACB7",
		fontSize: 16,
		lineHeight: 24,
	},
	footerTitle: {
		fontWeight: "bold",
		color: Colors.TextColor.MainColor,
		fontSize: 16,
		lineHeight: 24,
	},
	footerTitle_dark: {
		fontWeight: "bold",
		color: "#FFFFFF",
		fontSize: 16,
		lineHeight: 24,
	},
	errorText: {
		fontWeight: "regular",
		color: Colors.OtherColor.ModalRedColor,
		fontSize: 14,
	},
	errorText_dark: {
		fontWeight: "regular",
		color: "#ff453a",
		fontSize: 14,
	},
});


export default SignupScreen;