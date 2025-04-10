import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import {useEffect} from 'react';
import 'react-native-reanimated';

import {useColorScheme} from '@/hooks/useColorScheme';
import {ApolloProvider} from "@apollo/client";
import client from "@/lib/apollo/client";
import {useShareIntent} from "expo-share-intent";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntent()
	const colorScheme = useColorScheme(); // This will always return 'light' now
	const [loaded] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
	});

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	if (hasShareIntent) {
		console.log('Received share intent:', shareIntent);
	}

	return (
		<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
			<ApolloProvider client={client}>
				<Stack>
					<Stack.Screen name="index" options={{ headerShown: false }} />
					<Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
					<Stack.Screen
						name="signin"
						options={{
							title: 'Sign In',
							headerShown: true // or false based on your needs
						}}
					/>
					<Stack.Screen name="dashboard" options={{ headerShown: false }} />
					<Stack.Screen name="+not-found" />
				</Stack>
				<StatusBar style="auto" />
			</ApolloProvider>
		</ThemeProvider>
	);
}
