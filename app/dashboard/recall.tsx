import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default function RecallScreen() {
	return (
		<View style={styles.container}>
			<Text>Recall</Text>
			<Text style={styles.subtitle}>Discover new content</Text>

			<View style={styles.card}>
				<Text>Featured Content</Text>
				<Text>Featured content will appear here.</Text>
			</View>

			<View style={styles.card}>
				<Text>Popular</Text>
				<Text>Popular content will appear here.</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
	},
	subtitle: {
		marginTop: 8,
		marginBottom: 24,
	},
	card: {
		backgroundColor: 'rgba(0,0,0,0.05)',
		borderRadius: 8,
		padding: 16,
		marginBottom: 16,
	},
});