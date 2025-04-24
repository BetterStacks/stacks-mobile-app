import {StatusBar} from "expo-status-bar";
import {StyleSheet, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import React from "react";
import WebView from "react-native-webview";
import {Colors} from "@/components/design/colors";

const IndividualPage = () => {
	return (
		<SafeAreaView style={styles.container}>
			<StatusBar style="light" />
			<View style={{ width: "100%", height: "110%" }}>
				<WebView
					source={{ uri: "http://localhost:3000/page?pageId=220&gqlToken=oe9iqT956g2jFstENSY4" }}
				/>
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