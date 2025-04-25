import {StatusBar} from "expo-status-bar";
import {StyleSheet, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import React from "react";
import WebView from "react-native-webview";
import {Colors} from "@/components/design/colors";
import {getValueFromStorage} from "@/utils/storage/getStorage";
import {useLocalSearchParams} from "expo-router";

const IndividualPage = () => {
	const [token, setToken] = React.useState<string | null>(null);

	const {id} = useLocalSearchParams();

	React.useEffect(() => {
		const fetchToken = async () => {
			const storedToken = await getValueFromStorage("token");
			setToken(storedToken);
		};
		fetchToken();
	}, []);

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar style="light" />
			<View style={{ width: "100%", height: "110%" }}>
				{token && <WebView
					source={{uri: `http://localhost:3000/page?pageId=${id}&gqlToken=${token}`}}
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
});