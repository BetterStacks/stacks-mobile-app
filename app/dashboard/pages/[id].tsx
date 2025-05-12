import {StatusBar} from "expo-status-bar";
import {StyleSheet, View, TouchableOpacity, Text, useColorScheme} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import React from "react";
import WebView from "react-native-webview";
import {Colors} from "@/components/design/colors";
import {getValueFromStorage} from "@/utils/storage/getStorage";
import {useLocalSearchParams, useRouter} from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';

const IndividualPage = () => {
	const [token, setToken] = React.useState<string | null>(null);
	const colorScheme = useColorScheme();
	const isDark = colorScheme === 'dark';
	const router = useRouter();
	const {id} = useLocalSearchParams();

	React.useEffect(() => {
		const fetchToken = async () => {
			const storedToken = await getValueFromStorage("token");
			setToken(storedToken);
		};
		fetchToken();
	}, []);

	return (
		<SafeAreaView style={[styles.container, {backgroundColor: isDark ? "#0A0A0A" : Colors.OtherColor.UsualWhite}]}>
			<StatusBar style={isDark ? "light" : "dark"} />
			
			<View style={[styles.header, {borderBottomColor: isDark ? "#262626" : "#E5E5E5"}]}>
				<TouchableOpacity 
					style={styles.backButton}
					onPress={() => router.back()}
				>
					<AntDesign 
						name="arrowleft" 
						size={22} 
						color={isDark ? "#AAAAAA" : "#555555"} 
					/>
					<Text style={[styles.backText, {color: isDark ? "#AAAAAA" : "#555555"}]}>Back</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.webViewContainer}>
				{token && <WebView
					source={{uri: `https://app.betterstacks.com/page?pageId=${id}&gqlToken=${token}`}}
				/>}
			</View>

		</SafeAreaView>
	)
}

export default IndividualPage;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.OtherColor.UsualWhite,
		// paddingTop: metrics.isAndroid ? scaleHeight(24) : scaleHeight(12),
	},
	header: {
		flexDirection: 'row',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
	},
	backButton: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	backText: {
		marginLeft: 8,
		fontSize: 16,
		fontWeight: '500',
	},
	webViewContainer: {
		flex: 1,
		width: "100%",
	},
});