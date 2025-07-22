import {ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, useColorScheme, View} from "react-native";
import React, {useCallback, useEffect, useRef, useState} from "react";
import AntDesign from '@expo/vector-icons/AntDesign';
import {useLazyQuery} from "@apollo/client";
import {interpolate, useAnimatedStyle, useSharedValue, withTiming,} from "react-native-reanimated";
import {useIsFocused, useNavigation} from "@react-navigation/native";
import {QUERY_LINKS} from "@/lib/api/graphql/queries";
import CommonInput from "@/components/CommonInput";
import {Colors} from "@/components/design/colors";
import {SafeAreaView} from "react-native-safe-area-context";
import {CardLinksList} from "@/components/cardLinkList/CardLinksList";
import {reviewTriggerService} from "@/lib/services/reviewTriggerService";

const SearchScreen = () => {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === 'dark';
	const [searchQuery, setSearchQuery] = useState("");
	const inputRef = useRef<TextInput>(null);
	const [loadLinks, { loading: linksLoading, data: linksData }] =
		useLazyQuery(QUERY_LINKS);
	const navigation = useNavigation();
	const isFocused = useIsFocused();

	// Focus input when screen mounts and is focused
	useEffect(() => {
		if (isFocused) {
			const timer = setTimeout(() => {
				inputRef.current?.focus();
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [isFocused]);

	const onChangeText = useCallback((text: string) => {
		setSearchQuery(text);
	}, []);

	useEffect(() => {
		const timer = setTimeout(async () => {
			if (searchQuery.length > 1) {
				const result = await loadLinks({
					variables: {
						page: 1,
						query: searchQuery,
						domain: "",
					},
				});
				
				// Track search interaction for review trigger
				const hasResults = result?.data?.links && result.data.links.length > 0;
				await reviewTriggerService.trackSearchInteraction(searchQuery, hasResults);
			}
		}, 1000);

		return () => clearTimeout(timer);
	}, [searchQuery, loadLinks]);

	const sharedValue = useSharedValue(0);

	useEffect(() => {
		if (isFocused) {
			sharedValue.value = withTiming(1);
		} else {
			sharedValue.value = 0;
		}
	}, [isFocused, sharedValue]);

	const animViewStyle = useAnimatedStyle(() => {
		return {
			opacity: interpolate(sharedValue.value, [0, 1], [0, 1]),
		};
	});

	return (
		<SafeAreaView style={isDark ? styles.container_dark : styles.container}>
			<View style={isDark ? styles.searchWrapper_dark : styles.searchWrapper}>
				<View style={styles.searchRow}>
					<TouchableOpacity 
						style={styles.backButton}
						onPress={() => navigation.goBack()}
					>
						<AntDesign 
							name="arrowleft" 
							size={22} 
							color={isDark ? "#8EACB7" : Colors.TextColor.LignMainColor} 
						/>
					</TouchableOpacity>
					<View style={styles.inputContainer}>
						<CommonInput
							ref={inputRef}
							placeholder="Search links, notes, highlights..."
							additionalInputStyles={isDark ? styles.inputStyles_dark : styles.inputStyles}
							onChangeText={onChangeText}
							value={searchQuery}
							isIconNotTouchable={true}
							iconName={<AntDesign name="search1" size={20} color={isDark ? "#8EACB7" : Colors.TextColor.SecondaryColor} />}
							placeholderTextColor={isDark ? "#8F8F8F" : Colors.TextColor.SecondaryColor}
							autoFocus={true}
							returnKeyType="search"
							clearButtonMode="while-editing"
						/>
					</View>
				</View>
			</View>

			{linksLoading ? (
				<ActivityIndicator color={isDark ? "#8EACB7" : Colors.TextColor.LignMainColor} />
			) : (
				linksData && (
					<View style={styles.linksContainer}>
						<CardLinksList 
							links={linksData.links} 
							showList={!linksLoading} 
							colorScheme={colorScheme}
							isSearchResults={true}
						/>
					</View>
				)
			)}
		</SafeAreaView>
	);
};

export default SearchScreen;


const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F8F9FA",
	},
	container_dark: {
		flex: 1,
		backgroundColor: "#0A0A0A",
	},
	searchWrapper: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: '#FFFFFF',
		borderBottomWidth: 1,
		borderBottomColor: '#E5E5E5',
	},
	searchWrapper_dark: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: '#171717',
		borderBottomWidth: 1,
		borderBottomColor: '#262626',
	},
	inputStyles: {
		backgroundColor: '#F8F9FA',
		borderWidth: 1,
		borderColor: '#E5E5E5',
		borderRadius: 8,
		minHeight: 48,
	},
	inputStyles_dark: {
		backgroundColor: '#262626',
		borderWidth: 1,
		borderColor: '#262626',
		borderRadius: 8,
		minHeight: 48,
		color: '#FFFFFF',
	},
	linksContainer: {
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 24,
	},
	searchRow: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
	},
	backButton: {
		padding: 8,
		marginRight: 8,
	},
	inputContainer: {
		flex: 1,
	},
})
