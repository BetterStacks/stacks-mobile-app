import {DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider} from '@react-navigation/native';
import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import {useCallback, useEffect} from 'react';
import 'react-native-reanimated';

import {useColorScheme} from '@/hooks/useColorScheme';
import {ThemeProvider} from '@/contexts/ThemeContext';
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {KeyboardProvider} from "react-native-keyboard-controller";
import {ApolloProvider, useReactiveVar} from "@apollo/client";
import client from "@/lib/apollo/client";
import {AddNewLinkModal} from "@/components/AddNewLinkModal";
import {ReminderModal} from "@/components/ReminderModal";
import {View} from "react-native";
import ToastManager from "toastify-react-native";
import {useShareIntentManager} from "@/hooks/useShareIntentManager";
import {isReminderModalVisibleVar} from "@/lib/apollo/store";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [loaded] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
	});

	// Use our custom share intent manager hook
	const {
		readinessState,
		isAuthenticated,
		shareModalVisible,
		link,
		setShareModalVisible,
		setLink,
		updateReadinessState,
	} = useShareIntentManager();

	// Get reminder modal state
	const reminderModalState = useReactiveVar(isReminderModalVisibleVar);

	// Apollo client readiness check
	const checkApolloReadiness = useCallback(() => {
		try {
			// Simple check to ensure Apollo client is initialized
			if (client && client.cache) {
				updateReadinessState({ apolloReady: true });
				console.log('[ShareIntent Debug] Apollo client ready');
			}
		} catch (error) {
			console.log('[ShareIntent Debug] Apollo client check failed', error);
			// Set as ready anyway to not block the app
			updateReadinessState({ apolloReady: true });
		}
	}, [updateReadinessState]);

	// Monitor font loading and other readiness states
	useEffect(() => {
		if (loaded) {
			updateReadinessState({ fontsLoaded: true });
			SplashScreen.hideAsync();
			console.log('[ShareIntent Debug] Fonts loaded');
		}
	}, [loaded, updateReadinessState]);

	useEffect(() => {
		checkApolloReadiness();
		
		// Check router readiness with a small delay to ensure it's initialized
		const routerTimer = setTimeout(() => {
			updateReadinessState({ routerReady: true });
			console.log('[ShareIntent Debug] Router ready');
		}, 100);

		return () => clearTimeout(routerTimer);
	}, [checkApolloReadiness, updateReadinessState]);

	// Show loading screen until fonts are loaded (minimum requirement)
	if (!loaded) {
		return null;
	}

	return (
		<ThemeProvider>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<KeyboardProvider>
					<AppContent
						readinessState={readinessState}
						isAuthenticated={isAuthenticated}
						shareModalVisible={shareModalVisible}
						link={link}
						setShareModalVisible={setShareModalVisible}
						setLink={setLink}
						reminderModalState={reminderModalState}
					/>
				</KeyboardProvider>
			</GestureHandlerRootView>
		</ThemeProvider>
	);
}

function AppContent({
	readinessState,
	isAuthenticated,
	shareModalVisible,
	link,
	setShareModalVisible,
	setLink,
	reminderModalState,
}: {
	readinessState: any;
	isAuthenticated: boolean;
	shareModalVisible: boolean;
	link: string;
	setShareModalVisible: (visible: boolean) => void;
	setLink: (link: string) => void;
	reminderModalState: any;
}) {
	const colorScheme = useColorScheme();

	return (
		<NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
			<ApolloProvider client={client}>
				<Stack>
					<Stack.Screen name="index" options={{ headerShown: false }} />
					<Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
					<Stack.Screen
						name="signin"
						options={{
							title: 'Sign In',
							headerShown: true
						}}
					/>
					<Stack.Screen name="dashboard" options={{ headerShown: false }} />
					<Stack.Screen name="web-view" options={{ headerShown: false }} />
					<Stack.Screen name="+not-found" />
				</Stack>
				<StatusBar style="auto" />

				<View>
					{/* Only render one modal at a time to avoid iOS conflicts */}
					{reminderModalState.isVisible ? (
						<ReminderModal />
					) : (
						<AddNewLinkModal
							isNewLinkModalShown={shareModalVisible}
							setIsNewLinkModalShown={setShareModalVisible}
							link={link}
							setLink={setLink}
						/>
					)}
				</View>
				<ToastManager />
			</ApolloProvider>
		</NavigationThemeProvider>
	);
}
