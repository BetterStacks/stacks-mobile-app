import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface AppReadinessState {
	fontsLoaded: boolean;
	authChecked: boolean;
	apolloReady: boolean;
	routerReady: boolean;
}

interface ShareIntentDebugStatusProps {
	readinessState: AppReadinessState;
	isAuthenticated: boolean | null;
	shareModalVisible: boolean;
	link: string;
	isVisible?: boolean;
}

export const ShareIntentDebugStatus: React.FC<ShareIntentDebugStatusProps> = ({
	readinessState,
	isAuthenticated,
	shareModalVisible,
	link,
	isVisible = __DEV__ // Only show in development
}) => {
	if (!isVisible) return null;

	const isAppReady = Object.values(readinessState).every(Boolean);

	const getStatusColor = (status: boolean | null) => {
		if (status === null) return '#FFA500'; // Orange for unknown
		return status ? '#00FF00' : '#FF0000'; // Green for true, red for false
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Share Intent Debug Status</Text>
			
			<View style={styles.statusGrid}>
				<View style={styles.statusItem}>
					<View style={[styles.indicator, { backgroundColor: getStatusColor(readinessState.fontsLoaded) }]} />
					<Text style={styles.statusText}>Fonts: {readinessState.fontsLoaded ? 'Ready' : 'Loading'}</Text>
				</View>
				
				<View style={styles.statusItem}>
					<View style={[styles.indicator, { backgroundColor: getStatusColor(readinessState.authChecked) }]} />
					<Text style={styles.statusText}>Auth: {readinessState.authChecked ? 'Checked' : 'Checking'}</Text>
				</View>
				
				<View style={styles.statusItem}>
					<View style={[styles.indicator, { backgroundColor: getStatusColor(readinessState.apolloReady) }]} />
					<Text style={styles.statusText}>Apollo: {readinessState.apolloReady ? 'Ready' : 'Loading'}</Text>
				</View>
				
				<View style={styles.statusItem}>
					<View style={[styles.indicator, { backgroundColor: getStatusColor(readinessState.routerReady) }]} />
					<Text style={styles.statusText}>Router: {readinessState.routerReady ? 'Ready' : 'Loading'}</Text>
				</View>
			</View>

			<View style={styles.overallStatus}>
				<View style={[styles.indicator, { backgroundColor: getStatusColor(isAppReady) }]} />
				<Text style={styles.statusText}>App Ready: {isAppReady ? 'Yes' : 'No'}</Text>
			</View>

			<View style={styles.authStatus}>
				<View style={[styles.indicator, { backgroundColor: getStatusColor(isAuthenticated) }]} />
				<Text style={styles.statusText}>
					Authenticated: {isAuthenticated === null ? 'Unknown' : isAuthenticated ? 'Yes' : 'No'}
				</Text>
			</View>

			{link && (
				<View style={styles.linkInfo}>
					<Text style={styles.linkText}>Shared Link: {link.substring(0, 30)}...</Text>
					<Text style={styles.linkText}>Modal Visible: {shareModalVisible ? 'Yes' : 'No'}</Text>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 50,
		right: 10,
		backgroundColor: 'rgba(0, 0, 0, 0.8)',
		padding: 10,
		borderRadius: 8,
		maxWidth: 200,
		zIndex: 9999,
	},
	title: {
		color: 'white',
		fontSize: 12,
		fontWeight: 'bold',
		marginBottom: 8,
		textAlign: 'center',
	},
	statusGrid: {
		marginBottom: 8,
	},
	statusItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 4,
	},
	overallStatus: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 4,
		paddingTop: 4,
		borderTopWidth: 1,
		borderTopColor: '#333',
	},
	authStatus: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 4,
	},
	indicator: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginRight: 6,
	},
	statusText: {
		color: 'white',
		fontSize: 10,
		flex: 1,
	},
	linkInfo: {
		paddingTop: 4,
		borderTopWidth: 1,
		borderTopColor: '#333',
	},
	linkText: {
		color: 'white',
		fontSize: 9,
		marginBottom: 2,
	},
}); 