import {useCallback, useEffect, useState} from 'react';
import {useShareIntent} from "expo-share-intent";
import {router} from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getValueFromStorage} from "@/utils/storage/getStorage";

interface AppReadinessState {
	fontsLoaded: boolean;
	authChecked: boolean;
	apolloReady: boolean;
	routerReady: boolean;
}

interface ShareIntentManagerReturn {
	readinessState: AppReadinessState;
	isAuthenticated: boolean | null;
	shareModalVisible: boolean;
	link: string;
	setShareModalVisible: (visible: boolean) => void;
	setLink: (link: string) => void;
	updateReadinessState: (update: Partial<AppReadinessState>) => void;
	setIsAuthenticated: (auth: boolean | null) => void;
}

export const useShareIntentManager = (): ShareIntentManagerReturn => {
	const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

	// App readiness states
	const [readinessState, setReadinessState] = useState<AppReadinessState>({
		fontsLoaded: false,
		authChecked: false,
		apolloReady: false,
		routerReady: false,
	});

	// Authentication state
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
	
	// Shared link queue
	const [queuedShareLink, setQueuedShareLink] = useState<string | null>(null);
	const [shareModalVisible, setShareModalVisible] = useState(false);
	const [link, setLink] = useState('');

	// Debug logging helper
	const logDebug = useCallback((message: string, data?: any) => {
		console.log(`[ShareIntent Debug] ${message}`, data || '');
	}, []);

	// Check if app is fully ready
	const isAppReady = Object.values(readinessState).every(Boolean);

	// Helper to update readiness state
	const updateReadinessState = useCallback((update: Partial<AppReadinessState>) => {
		setReadinessState(prev => ({ ...prev, ...update }));
	}, []);

	// Check Authentication State
	const checkAuthenticationState = useCallback(async () => {
		try {
			logDebug('Checking authentication state...');
			const token = await getValueFromStorage("token");
			const isAuth = !!token;
			setIsAuthenticated(isAuth);
			
			updateReadinessState({ authChecked: true });
			logDebug('Authentication check complete', { isAuthenticated: isAuth });
		} catch (error) {
			logDebug('Authentication check failed', error);
			setIsAuthenticated(false);
			updateReadinessState({ authChecked: true });
		}
	}, [logDebug, updateReadinessState]);

	// Queue Shared Links
	useEffect(() => {
		if (hasShareIntent && shareIntent?.type === 'weburl') {
			const sharedUrl = shareIntent.webUrl!;
			logDebug('Share intent detected', { url: sharedUrl });
			
			// Queue the shared link
			setQueuedShareLink(sharedUrl);
		}
	}, [hasShareIntent, shareIntent, logDebug]);

	// Process Queued Links When App is Ready
	const processQueuedLink = useCallback(async () => {
		if (!queuedShareLink || !isAppReady) return;

		try {
			logDebug('Processing queued share link', { 
				url: queuedShareLink, 
				isAuthenticated,
				readinessState 
			});

			if (isAuthenticated) {
				// User is authenticated, navigate to dashboard
				logDebug('Navigating to dashboard...');
				router.replace('/dashboard');
				
				// Wait for navigation to complete, then show modal
				setTimeout(() => {
					logDebug('Showing share modal');
					setLink(queuedShareLink);
					setShareModalVisible(true);
					setQueuedShareLink(null); // Clear the queue
					
					// Clear the share intent to prevent reprocessing on app reloads
					resetShareIntent();
				}, 300);
			} else {
				// User not authenticated, store link and navigate to auth
				logDebug('User not authenticated, storing link and navigating to signin');
				await AsyncStorage.setItem('pendingSharedLink', queuedShareLink);
				router.replace('/signin');
				setQueuedShareLink(null); // Clear the queue
				
				// Clear the share intent to prevent reprocessing on app reloads
				resetShareIntent();
			}
		} catch (error) {
			logDebug('Error processing queued link', error);
			// Fallback: try to navigate to root
			try {
				router.replace('/');
				setQueuedShareLink(null);
				
				// Clear the share intent even on error to prevent reprocessing
				resetShareIntent();
			} catch (fallbackError) {
				logDebug('Fallback navigation also failed', fallbackError);
				// Clear share intent even if fallback fails
				resetShareIntent();
			}
		}
	}, [queuedShareLink, isAppReady, isAuthenticated, readinessState, logDebug, resetShareIntent]);

	// Check for immediate share link after authentication
	const checkImmediateShareLink = useCallback(async () => {
		try {
			const immediateLink = await AsyncStorage.getItem('immediateShareLink');
			if (immediateLink) {
				logDebug('Found immediate share link after authentication', { url: immediateLink });
				
				// Clear the immediate link
				await AsyncStorage.removeItem('immediateShareLink');
				
				// Show the modal
				setLink(immediateLink);
				setShareModalVisible(true);
				
				// Clear the share intent since we've now processed it
				resetShareIntent();
			}
		} catch (error) {
			logDebug('Error checking immediate share link', error);
		}
	}, [logDebug, resetShareIntent]);

	// Initialize authentication check
	useEffect(() => {
		checkAuthenticationState();
	}, [checkAuthenticationState]);

	// Process queue when app becomes ready
	useEffect(() => {
		if (isAppReady && queuedShareLink) {
			logDebug('App ready, processing queued link...');
			processQueuedLink();
		}
	}, [isAppReady, processQueuedLink, queuedShareLink, logDebug]);

	// Check for immediate share links when authenticated and app ready
	useEffect(() => {
		if (isAppReady && isAuthenticated) {
			checkImmediateShareLink();
		}
	}, [isAppReady, isAuthenticated, checkImmediateShareLink]);

	// Timeout mechanism to prevent infinite waiting
	useEffect(() => {
		if (queuedShareLink) {
			const timeout = setTimeout(() => {
				logDebug('Timeout reached, forcing link processing');
				// Force process even if not all systems are ready
				if (readinessState.fontsLoaded && readinessState.authChecked) {
					processQueuedLink();
				} else {
					logDebug('Timeout: App still not minimally ready, clearing queue');
					setQueuedShareLink(null);
					
					// Clear the share intent to prevent reprocessing
					resetShareIntent();
				}
			}, 10000); // 10 second timeout

			return () => clearTimeout(timeout);
		}
	}, [queuedShareLink, readinessState, processQueuedLink, logDebug, resetShareIntent]);

	return {
		readinessState,
		isAuthenticated,
		shareModalVisible,
		link,
		setShareModalVisible,
		setLink,
		updateReadinessState,
		setIsAuthenticated,
	};
}; 