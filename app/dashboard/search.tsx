import {ActivityIndicator, StyleSheet, TextInput, View} from "react-native";
import React, {useCallback, useEffect, useRef, useState} from "react";
import AntDesign from '@expo/vector-icons/AntDesign';
import {useLazyQuery} from "@apollo/client";
import {interpolate, useAnimatedStyle, useSharedValue, withTiming,} from "react-native-reanimated";
import {useIsFocused} from "@react-navigation/native";
import {QUERY_LINKS} from "@/lib/api/graphql/queries";
import CommonInput from "@/components/CommonInput";
import {Colors} from "@/components/design/colors";
import {SafeAreaView} from "react-native-safe-area-context";
import {CardLinksList} from "@/components/cardLinkList/CardLinksList";

const SearchScreen = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const inputRef = useRef<TextInput>(null);
	const [loadLinks, { loading: linksLoading, data: linksData }] =
		useLazyQuery(QUERY_LINKS);

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
		const timer = setTimeout(() => {
			if (searchQuery.length > 1) {
				loadLinks({
					variables: {
						page: 1,
						query: searchQuery,
						domain: "",
					},
				});
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
		<SafeAreaView style={styles.container}>
			<View style={styles.searchWrapper}>
				<CommonInput
					ref={inputRef}
					placeholder="Search links, notes, highlights..."
					additionalInputStyles={styles.inputStyles}
					onChangeText={onChangeText}
					value={searchQuery}
					isIconNotTouchable={true}
					iconName={<AntDesign name="search1" size={20} color={Colors.TextColor.SecondaryColor} />}
					placeholderTextColor={Colors.TextColor.SecondaryColor}
					autoFocus={true}
					returnKeyType="search"
					clearButtonMode="while-editing"
				/>
			</View>

			{linksLoading ? (
				<ActivityIndicator />
			) : (
				linksData && (
					<View style={styles.linksContainer}>
						<CardLinksList links={linksData.links} showList={!linksLoading} />
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
	searchWrapper: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: '#FFFFFF',
		borderBottomWidth: 1,
		borderBottomColor: '#E5E5E5',
	},
	inputStyles: {
		backgroundColor: '#F8F9FA',
		borderWidth: 1,
		borderColor: '#E5E5E5',
		borderRadius: 8,
		minHeight: 48,
	},
	linksContainer: {
		paddingHorizontal: 16,
		paddingTop: 16,
	},
})
