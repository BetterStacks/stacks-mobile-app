import React, {useEffect, useRef, useState} from "react";
import {
	ActivityIndicator,
	Keyboard,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	useColorScheme,
	View,
} from "react-native";
import {useMutation, useQuery} from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {SELECTED_WORKSPACE_ID_KEY} from "@/lib/constants";
import {QUERY_COLLECTIONS} from "@/lib/api/graphql/queries";
import {MUTATION_ADD_USER_PAGE} from "@/lib/api/graphql/mutations";
import {setIsSuccessModalVisible, setSuccessModalMessage,} from "@/lib/apollo/store/handlers";
import client from "@/lib/apollo/client";
import {CollectionSelector} from "../CollectionSelector";
import {Toast} from "toastify-react-native";
import {useRouter} from "expo-router";
import {reviewTriggerService} from "@/lib/services/reviewTriggerService";

// import { FolderPlus, ChevronRight, X } from "lucide-react-native";

type Props = {
	onBack: () => void;
	onClose: () => void;
	onSuccess?: (message: { title: string; description: string }) => void;
	selectedCollectionId?: string;
};

const initialValue = {
	root: {
		children: [
			{
				children: [
					{
						detail: 0,
						format: 0,
						mode: 'normal',
						style: '',
						text: '',
						type: 'text',
						version: 1,
					},
				],
				direction: 'ltr',
				format: '',
				indent: 0,
				type: 'paragraph',
				version: 1,
			},
		],
		direction: 'ltr',
		format: '',
		indent: 0,
		type: 'root',
		version: 1,
	},
}

const AddPageView = ({ onBack, onClose, onSuccess, selectedCollectionId }: Props) => {
	const router = useRouter();
	const colorScheme = useColorScheme();
	const [title, setTitle] = useState("");
	const [selectedCollections, setSelectedCollections] = useState<string[]>(
		selectedCollectionId ? [selectedCollectionId] : []
	);
	const [isCollectionsExpanded, setIsCollectionsExpanded] = useState(false);
	const inputRef = useRef<TextInput>(null);
	const [repositoryId, setRepositoryId] = useState<string | null>(null);

	useEffect(() => {
		const loadWorkspaceId = async () => {
			try {
				const storedId = await AsyncStorage.getItem(SELECTED_WORKSPACE_ID_KEY);
				setRepositoryId(storedId);
			} catch (err) {
				console.error("Error loading workspace ID:", err);
				setRepositoryId(null);
			}
		};

		loadWorkspaceId();
	}, []);

	const { data: collectionsData } = useQuery(QUERY_COLLECTIONS, {
		variables: {
			query: "",
			repositoryId: repositoryId || undefined,
		},
	});

	const [addPage, { loading }] = useMutation(MUTATION_ADD_USER_PAGE, {
		onCompleted: async (data) => {
			try {
				onClose();

				const successMessage = {
					title: "Page created successfully!",
					description: "Your new page has been created",
				};

				// Show toast notification
				Toast.success("Page created successfully!");

				// Track content addition for review trigger
				await reviewTriggerService.trackContentAddition();

				// Track collection item addition if collections were selected
				if (selectedCollections.length > 0) {
					for (const collectionId of selectedCollections) {
						await reviewTriggerService.trackCollectionItemAddition(collectionId);
					}
				}

				if (onSuccess) {
					onSuccess(successMessage);
				} else {
					setSuccessModalMessage({
						...successMessage,
						closeText: "Got it!",
						preventNavigation: true,
					});
					setIsSuccessModalVisible(true);
				}

				// Navigate to the new page
				if (data?.add_user_page?.id) {
					router.push(`/dashboard/pages/${data.add_user_page.id}`);
				}

				setTimeout(() => {
					client.refetchQueries({
						include: ["QUERY_PAGES"],
					});
				}, 5000);
			} catch (error) {
				console.error("Error handling success:", error);
				Toast.error("Failed to create page");
			}
		},
		onError: (error) => {
			console.error("Error adding page:", error);
			Toast.error("Failed to create page");
		},
	});

	const handleSave = async () => {
		if (title) {
			try {
				const note_content = JSON.stringify(initialValue);
				
				await addPage({
					variables: {
						title,
						note_content,
						collection_ids: selectedCollections.length > 0 ? selectedCollections : null,
						repository_ids: repositoryId ? [repositoryId] : null
					},
					refetchQueries: ["QUERY_PAGES"],
				});
			} catch (error) {
				console.error("Error adding page:", error);
			}
		}
	};

	const handleCollectionSelect = (collectionId: string) => {
		setSelectedCollections((prev) =>
			prev.includes(collectionId)
				? prev.filter((id) => id !== collectionId)
				: [...prev, collectionId],
		);
	};

	const handleInputFocus = () => {
		setIsCollectionsExpanded(false);
	};

	const handleRemoveCollection = (collectionId: string) => {
		setSelectedCollections((prev) => prev.filter((id) => id !== collectionId));
	};

	const handleCollectionButtonPress = () => {
		Keyboard.dismiss();
		inputRef.current?.blur();
		setIsCollectionsExpanded(!isCollectionsExpanded);
	};

	return (
		<View style={colorScheme === 'dark' ? styles.container_dark : styles.container}>
			<Text style={colorScheme === 'dark' ? styles.title_dark : styles.title}>Add a new page</Text>
			<TextInput
				ref={inputRef}
				style={colorScheme === 'dark' ? styles.input_dark : styles.input}
				placeholder="Enter page title"
				placeholderTextColor={colorScheme === 'dark' ? "#8F8F8F" : undefined}
				value={title}
				onChangeText={setTitle}
				onFocus={handleInputFocus}
				autoCapitalize="sentences"
				autoCorrect={true}
			/>

			<CollectionSelector
				collections={collectionsData?.collections || []}
				selectedCollections={selectedCollections}
				onCollectionSelect={handleCollectionSelect}
				onRemoveCollection={handleRemoveCollection}
				isExpanded={isCollectionsExpanded}
				onExpandToggle={handleCollectionButtonPress}
				colorScheme={colorScheme}
			/>

			<View style={styles.buttonContainer}>
				<TouchableOpacity
					style={[styles.saveButton, loading && styles.saveButtonDisabled]}
					onPress={handleSave}
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator color="white" />
					) : (
						<Text style={styles.saveButtonText}>Create</Text>
					)}
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.cancelButton}
					onPress={onBack}
					disabled={loading}
				>
					<Text style={colorScheme === 'dark' ? styles.cancelButtonText_dark : styles.cancelButtonText}>Cancel</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 16,
		backgroundColor: "#FFFFFF",
	},
	container_dark: {
		padding: 16,
		backgroundColor: "#171717",
	},
	title: {
		fontSize: 18,
		fontWeight: "600",
		textAlign: "center",
		marginBottom: 20,
		color: "#1C4A5A",
	},
	title_dark: {
		fontSize: 18,
		fontWeight: "600",
		textAlign: "center",
		marginBottom: 20,
		color: "#FFFFFF",
	},
	input: {
		borderWidth: 1,
		borderColor: "#E5E5E5",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		marginBottom: 16,
	},
	input_dark: {
		borderWidth: 1,
		borderColor: "#262626",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		marginBottom: 16,
		backgroundColor: "#262626",
		color: "#FFFFFF",
	},
	buttonContainer: {
		marginTop: "auto",
	},
	saveButton: {
		backgroundColor: "#1C4A5A",
		padding: 16,
		borderRadius: 8,
		alignItems: "center",
		marginBottom: 8,
	},
	saveButtonDisabled: {
		opacity: 0.7,
	},
	saveButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	cancelButton: {
		padding: 16,
		borderRadius: 8,
		alignItems: "center",
	},
	cancelButtonText: {
		color: "#1C4A5A",
		fontSize: 16,
	},
	cancelButtonText_dark: {
		color: "#8EACB7",
		fontSize: 16,
	},
});

export default AddPageView;
