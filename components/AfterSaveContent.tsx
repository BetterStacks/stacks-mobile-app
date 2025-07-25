import {useCallback, useState} from "react";
import {Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View} from "react-native";
import {useMutation, useQuery} from "@apollo/client";
import {Link} from "@/lib/types/Link";
import AntDesign from '@expo/vector-icons/AntDesign';
import {QUERY_COLLECTIONS, QUERY_USER, QUERY_USER_REPOSITORIES} from "@/lib/api/graphql/queries";
import client from "@/lib/apollo/client";
import {Collection} from "@/lib/types/Collection";
import {Repository} from "@/lib/types/Repository";
import {MUTATION_ADD_LINK_TO_REPOSITORIES, MUTATION_UPDATE_LINK} from "@/lib/api/graphql/mutations";
import Entypo from '@expo/vector-icons/Entypo';
import {getEmojiFromCode} from "@/lib/utils";
import {CommonButton} from "@/components/CommonButton/CommonButton";
import {NotesInput} from "@/components/NotesInput";
import {TagInput} from "@/components/TagInput";
import {AfterSaveButtons} from "@/components/AfterSaveButtons";

type AfterSaveContentProps = {
	closeParent: () => void;
	handleCloseModal: () => void;
	newLinkData: Link;
};

const AfterSaveContentHeader = ({
	handleCloseModal,
}: {
	handleCloseModal: () => void;
}) => {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === 'dark';
	
	return (
		<View style={styles.header}>
			<Text style={isDark ? styles.headerText_dark : styles.headerText}>Link saved successfully!</Text>
			<TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
				<AntDesign name="close" size={20} color={isDark ? "#FFFFFF" : "black"} />
			</TouchableOpacity>
		</View>
	);
};

export const AfterSaveContent: React.FC<AfterSaveContentProps> = ({
	handleCloseModal,
	newLinkData,
	closeParent
}) => {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === 'dark';
	
	const [notes, setNotes] = useState("");
	const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
	const [selectedRepositories, setSelectedRepositories] = useState<string[]>([]);
	const [tags, setTags] = useState<string[]>([]);
	const [isCollectionsExpanded, setIsCollectionsExpanded] = useState(false);
	const [isRepositoriesExpanded, setIsRepositoriesExpanded] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [repositorySearchQuery, setRepositorySearchQuery] = useState("");
	const [isChoiceRemembered, setIsChoiceRemembered] = useState(false);

	const { data: collectionsData } = useQuery(QUERY_COLLECTIONS, {
		variables: {
			query: searchQuery,
		},
	});
	const { data: repositoriesData } = useQuery(QUERY_USER_REPOSITORIES);
	const { data: userData } = useQuery(QUERY_USER);

	const [updateLink, { loading }] = useMutation(MUTATION_UPDATE_LINK, {
		onCompleted: _data => {
			setTimeout(async () => {
				await client.refetchQueries({
					include: [
						"QUERY_LINKS",
						"QUERY_STACKS",
						"QUERY_DOMAIN_LINKS",
						"QUERY_DOMAIN_LINKS_BY_STACKID",
						"QUERY_STACK_LINKS",
					],
				});
			}, 1000);
			handleCloseModal();
		},
		onError: error => {
			console.error("Update link mutation error:", error);
		},
	});

	const [addLinkToRepositories] = useMutation(MUTATION_ADD_LINK_TO_REPOSITORIES, {
		onError: error => {
			console.error("Add link to repositories mutation error:", error);
		},
	});

	const handleNotesChange = useCallback((text: string) => {
		setNotes(text);
	}, []);

	const handleTagsChange = useCallback((newTags: string[]) => {
		setTags(newTags);
	}, []);

	const handleCollectionSelect = useCallback((collection: Collection) => {
		setSelectedCollections(prev =>
			prev.includes(collection.id)
				? prev.filter(id => id !== collection.id)
				: [...prev, collection.id],
		);
	}, []);

	const handleRemoveCollection = useCallback((collectionId: string) => {
		setSelectedCollections(prev => prev.filter(id => id !== collectionId));
	}, []);

	const handleRepositorySelect = useCallback((repository: Repository) => {
		setSelectedRepositories(prev =>
			prev.includes(repository.id)
				? prev.filter(id => id !== repository.id)
				: [...prev, repository.id],
		);
	}, []);

	const handleRemoveRepository = useCallback((repositoryId: string) => {
		setSelectedRepositories(prev => prev.filter(id => id !== repositoryId));
	}, []);

	const handleSubmit = useCallback(async () => {
		await updateLink({
			variables: {
				link_id: newLinkData.id,
				notes: notes || null,
				tags: tags.length > 0 ? tags : null,
				collection_ids:
					selectedCollections.length > 0 ? selectedCollections : null,
			},
		});

		// Add link to repositories if any are selected
		if (selectedRepositories.length > 0) {
			await addLinkToRepositories({
				variables: {
					repository_ids: selectedRepositories,
					link_id: newLinkData.id,
				},
			});
		}

		closeParent();
	}, [updateLink, addLinkToRepositories, newLinkData.id, notes, tags, selectedCollections, selectedRepositories, closeParent]);

	const handleCollectionButtonPress = () => {
		Keyboard.dismiss();
		setIsCollectionsExpanded(!isCollectionsExpanded);
	};

	const handleRepositoryButtonPress = () => {
		Keyboard.dismiss();
		setIsRepositoriesExpanded(!isRepositoriesExpanded);
	};

	const handleSearch = useCallback((text: string) => {
		setSearchQuery(text);
	}, []);

	const handleRepositorySearch = useCallback((text: string) => {
		setRepositorySearchQuery(text);
	}, []);

	const handleRememberChoice = useCallback((value: boolean) => {
		setIsChoiceRemembered(value);
	}, []);

	// Filter repositories based on search query
	const filteredRepositories = repositoriesData?.user?.repositories?.filter((repo: Repository) =>
		repo.name.toLowerCase().includes(repositorySearchQuery.toLowerCase())
	) || [];

	return (
		<ScrollView style={isDark ? styles.container_dark : styles.container}>
			<AfterSaveContentHeader handleCloseModal={handleCloseModal} />

			<View style={styles.content}>
				<View style={styles.section}>
					<Text style={isDark ? styles.sectionTitle_dark : styles.sectionTitle}>Notes</Text>
					<NotesInput
						placeholder="Add notes..."
						onChangeText={handleNotesChange}
						value={notes}
						multiline
						numberOfLines={3}
						additionalInputStyles={isDark ? styles.notesInput_dark : styles.notesInput}
					/>
				</View>

				<View style={styles.section}>
					<Text style={isDark ? styles.sectionTitle_dark : styles.sectionTitle}>Tags</Text>
					<TagInput
						tags={tags}
						onTagsChange={handleTagsChange}
						placeholder="Add tags..."
						existingTags={userData?.user?.tags || []}
					/>
				</View>

				<View style={styles.section}>
					<Text style={isDark ? styles.sectionTitle_dark : styles.sectionTitle}>Collections</Text>
					<TouchableOpacity
						style={[
							isDark ? styles.collectionButton_dark : styles.collectionButton,
							isCollectionsExpanded && (isDark ? styles.collectionButtonExpanded_dark : styles.collectionButtonExpanded),
						]}
						onPress={handleCollectionButtonPress}>
						<View style={styles.collectionButtonContent}>
							<View style={styles.collectionIconContainer}>
								<AntDesign name="addfolder" size={20} color="#FFB74D" />
							</View>
							<Text style={isDark ? styles.collectionText_dark : styles.collectionText}>
								{selectedCollections.length > 0
									? "Selected Collections"
									: "Add to collection"}
							</Text>
						</View>
						<Entypo name="chevron-right" size={20} color={isDark ? "#999999" : "#666666"} style={[
							styles.chevron,
							isCollectionsExpanded && styles.chevronExpanded,
						]} />
					</TouchableOpacity>

					{isCollectionsExpanded && (
						<View style={isDark ? styles.collectionsContainer_dark : styles.collectionsContainer}>
							<View style={isDark ? styles.searchContainer_dark : styles.searchContainer}>
								<View style={isDark ? styles.searchInputWrapper_dark : styles.searchInputWrapper}>
									<AntDesign name="search1" size={16} color={isDark ? "#666666" : "#999999"} style={styles.searchIcon} />
									<TextInput
										style={isDark ? styles.searchInput_dark : styles.searchInput}
										placeholder="Search collections..."
										value={searchQuery}
										onChangeText={handleSearch}
										placeholderTextColor={isDark ? "#666666" : "#999999"}
									/>
								</View>
							</View>
							<ScrollView style={styles.collectionsScroll} nestedScrollEnabled>
								{collectionsData?.collections?.map((collection: Collection) => {
									const isSelected = selectedCollections.includes(
										collection.id,
									);
									return (
										<View
											key={collection.id}
											style={[
												isDark ? styles.collectionItem_dark : styles.collectionItem,
												isSelected && (isDark ? styles.selectedCollectionItem_dark : styles.selectedCollectionItem),
											]}>
											<TouchableOpacity
												style={[
													styles.collectionItemTouchable,
													isSelected && (isDark ? styles.selectedCollectionItemTouchable_dark : styles.selectedCollectionItemTouchable),
												]}
												onPress={() => handleCollectionSelect(collection)}>
												<View style={styles.collectionItemContent}>
													<View
														style={[
															styles.collectionItemIcon,
															isSelected && styles.selectedCollectionItemIcon,
														]}>
														<Text>
															{getEmojiFromCode(collection.emoji) || "📁"}
														</Text>
													</View>
													<Text
														style={[
															isDark ? styles.collectionItemText_dark : styles.collectionItemText,
															isSelected && (isDark ? styles.selectedCollectionItemText_dark : styles.selectedCollectionItemText),
														]}>
														{collection.title}
													</Text>
												</View>
											</TouchableOpacity>

											{isSelected && (
												<TouchableOpacity
													style={styles.removeButton}
													onPress={() => handleRemoveCollection(collection.id)}
													hitSlop={{
														top: 10,
														bottom: 10,
														left: 10,
														right: 10,
													}}
												>
													<AntDesign name="close" size={20} color={isDark ? "#999999" : "#666666"} />
												</TouchableOpacity>
											)}
										</View>
									);
								})}
							</ScrollView>
						</View>
					)}
				</View>

				<View style={styles.section}>
					<Text style={isDark ? styles.sectionTitle_dark : styles.sectionTitle}>Workspaces</Text>
					<TouchableOpacity
						style={[
							isDark ? styles.repositoryButton_dark : styles.repositoryButton,
							isRepositoriesExpanded && (isDark ? styles.repositoryButtonExpanded_dark : styles.repositoryButtonExpanded),
						]}
						onPress={handleRepositoryButtonPress}>
						<View style={styles.repositoryButtonContent}>
							<View style={styles.repositoryIconContainer}>
								<AntDesign name="team" size={20} color="#81C784" />
							</View>
							<Text style={isDark ? styles.repositoryText_dark : styles.repositoryText}>
								{selectedRepositories.length > 0
									? "Selected Workspaces"
									: "Add to workspace"}
							</Text>
						</View>
						<Entypo name="chevron-right" size={20} color={isDark ? "#999999" : "#666666"} style={[
							styles.chevron,
							isRepositoriesExpanded && styles.chevronExpanded,
						]} />
					</TouchableOpacity>

					{isRepositoriesExpanded && (
						<View style={isDark ? styles.repositoriesContainer_dark : styles.repositoriesContainer}>
							<View style={isDark ? styles.searchContainer_dark : styles.searchContainer}>
								<View style={isDark ? styles.searchInputWrapper_dark : styles.searchInputWrapper}>
									<AntDesign name="search1" size={16} color={isDark ? "#666666" : "#999999"} style={styles.searchIcon} />
									<TextInput
										style={isDark ? styles.searchInput_dark : styles.searchInput}
										placeholder="Search workspaces..."
										value={repositorySearchQuery}
										onChangeText={handleRepositorySearch}
										placeholderTextColor={isDark ? "#666666" : "#999999"}
									/>
								</View>
							</View>
							<ScrollView style={styles.repositoriesScroll} nestedScrollEnabled>
								{filteredRepositories?.map((repository: Repository) => {
									const isSelected = selectedRepositories.includes(
										repository.id,
									);
									return (
										<View
											key={repository.id}
											style={[
												isDark ? styles.repositoryItem_dark : styles.repositoryItem,
												isSelected && (isDark ? styles.selectedRepositoryItem_dark : styles.selectedRepositoryItem),
											]}>
											<TouchableOpacity
												style={[
													styles.repositoryItemTouchable,
													isSelected && (isDark ? styles.selectedRepositoryItemTouchable_dark : styles.selectedRepositoryItemTouchable),
												]}
												onPress={() => handleRepositorySelect(repository)}>
												<View style={styles.repositoryItemContent}>
													<View
														style={[
															styles.repositoryItemIcon,
															isSelected && styles.selectedRepositoryItemIcon,
														]}>
														<AntDesign name="team" size={16} color={isSelected ? "#4CAF50" : "#81C784"} />
													</View>
													<Text
														style={[
															isDark ? styles.repositoryItemText_dark : styles.repositoryItemText,
															isSelected && (isDark ? styles.selectedRepositoryItemText_dark : styles.selectedRepositoryItemText),
														]}>
														{repository.name}
													</Text>
												</View>
											</TouchableOpacity>

											{isSelected && (
												<TouchableOpacity
													style={styles.removeButton}
													onPress={() => handleRemoveRepository(repository.id)}
													hitSlop={{
														top: 10,
														bottom: 10,
														left: 10,
														right: 10,
													}}
												>
													<AntDesign name="close" size={20} color={isDark ? "#999999" : "#666666"} />
												</TouchableOpacity>
											)}
										</View>
									);
								})}
							</ScrollView>
						</View>
					)}
				</View>

				<AfterSaveButtons
					isChoiceRemembered={isChoiceRemembered}
					handleRememberChoice={handleRememberChoice}
					linkId={newLinkData.id}
					handleSubmitChanges={handleSubmit}
				/>
			</View>

			<View style={styles.footer}>
				<CommonButton
					text="Apply"
					onPress={handleSubmit}
					loading={loading}
					additionalButtonStyles={styles.applyButton}
					additionalTextStyles={styles.applyButtonText}
				/>
			</View>
		</ScrollView>
	);
};



const styles = StyleSheet.create({
	container: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 20,
		width: "100%",
	},
	container_dark: {
		backgroundColor: "#232323",
		borderRadius: 16,
		padding: 20,
		width: "100%",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 24,
	},
	headerText: {
		fontSize: 20,
		fontWeight: "500",
		color: "#232323",
	},
	headerText_dark: {
		fontSize: 20,
		fontWeight: "500",
		color: "#FFFFFF",
	},
	closeButton: {
		padding: 8,
	},
	content: {
		marginBottom: 20,
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#666666",
		marginBottom: 12,
	},
	sectionTitle_dark: {
		fontSize: 16,
		fontWeight: "600",
		color: "#999999",
		marginBottom: 12,
	},
	notesInput: {
		minHeight: 80,
		textAlignVertical: "top",
		padding: 8,
		backgroundColor: "#F5F5F5",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#E5E5E5",
		fontSize: 15,
	},
	notesInput_dark: {
		minHeight: 80,
		textAlignVertical: "top",
		padding: 8,
		backgroundColor: "#333333",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#444444",
		fontSize: 15,
	},
	collectionButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 12,
		borderWidth: 1,
		borderColor: "#E5E5E5",
		borderRadius: 8,
		backgroundColor: "#FFFFFF",
	},
	collectionButtonExpanded: {
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 0,
	},
	collectionButtonContent: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	collectionIconContainer: {
		width: 32,
		height: 32,
		backgroundColor: "#FFF3E0",
		borderRadius: 6,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	collectionText: {
		fontSize: 16,
		color: "#666666",
		flex: 1,
		marginRight: 8,
	},
	chevron: {
		transform: [{ rotate: "0deg" }],
	},
	chevronExpanded: {
		transform: [{ rotate: "90deg" }],
	},
	collectionsContainer: {
		borderWidth: 1,
		borderTopWidth: 0,
		borderColor: "#E5E5E5",
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
		maxHeight: 200,
		backgroundColor: "#FFFFFF",
	},
	collectionsScroll: {
		flexGrow: 0,
	},
	collectionItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: 'white',
		borderBottomWidth: 1,
		borderBottomColor: '#E5E5E5',
	},
	selectedCollectionItem: {
		backgroundColor: "#F5F5F5",
	},
	collectionItemContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	collectionItemIcon: {
		width: 32,
		height: 32,
		backgroundColor: "#FFF3E0",
		borderRadius: 6,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	collectionItemText: {
		fontSize: 16,
		color: "#000000",
	},
	footer: {
		paddingTop: 16,
		paddingBottom: 8,
	},
	applyButton: {
		backgroundColor: "#1C4A5A",
		borderRadius: 8,
		height: 48,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 24,
	},
	applyButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
		lineHeight: 24,
		letterSpacing: 0.5,
	},
	collectionItemTouchable: {
		flex: 1,
		padding: 12,
	},
	removeButton: {
		padding: 4,
		marginRight: 8,
	},
	searchContainer: {
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E5E5',
	},
	searchInputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#F5F5F5',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#E5E5E5',
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	searchIcon: {
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		height: 24,
		padding: 0,
		fontSize: 15,
		color: '#000000',
	},
	selectedCollectionItemTouchable: {
		backgroundColor: '#E8F0F2',
	},
	selectedCollectionItemIcon: {
		backgroundColor: '#D1E4E9',
	},
	selectedCollectionItemText: {
		color: '#1C4A5A',
		fontWeight: '500',
	},
	collectionButton_dark: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 12,
		borderWidth: 1,
		borderColor: "#444444",
		borderRadius: 8,
		backgroundColor: "#333333",
	},
	collectionText_dark: {
		fontSize: 16,
		color: "#999999",
		flex: 1,
		marginRight: 8,
	},
	collectionsContainer_dark: {
		borderWidth: 1,
		borderTopWidth: 0,
		borderColor: "#444444",
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
		maxHeight: 200,
		backgroundColor: "#333333",
	},
	searchContainer_dark: {
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#444444',
	},
	searchInputWrapper_dark: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#444444',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#555555',
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	searchInput_dark: {
		flex: 1,
		height: 24,
		padding: 0,
		fontSize: 15,
		color: '#999999',
	},
	collectionButtonExpanded_dark: {
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 0,
	},
	collectionItem_dark: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#333333',
		borderBottomWidth: 1,
		borderBottomColor: '#444444',
	},
	selectedCollectionItem_dark: {
		backgroundColor: '#444444',
	},
	collectionItemTouchable_dark: {
		flex: 1,
		padding: 12,
	},
	selectedCollectionItemTouchable_dark: {
		backgroundColor: '#555555',
	},
	collectionItemText_dark: {
		fontSize: 16,
		color: '#999999',
	},
	selectedCollectionItemText_dark: {
		color: '#D1E4E9',
	},
	repositoryButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 12,
		borderWidth: 1,
		borderColor: "#E5E5E5",
		borderRadius: 8,
		backgroundColor: "#FFFFFF",
	},
	repositoryButtonExpanded: {
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 0,
	},
	repositoryButtonContent: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	repositoryIconContainer: {
		width: 32,
		height: 32,
		backgroundColor: "#E8F5E9",
		borderRadius: 6,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	repositoryText: {
		fontSize: 16,
		color: "#666666",
		flex: 1,
		marginRight: 8,
	},
	repositoryButton_dark: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 12,
		borderWidth: 1,
		borderColor: "#444444",
		borderRadius: 8,
		backgroundColor: "#333333",
	},
	repositoryText_dark: {
		fontSize: 16,
		color: "#999999",
		flex: 1,
		marginRight: 8,
	},
	repositoriesContainer: {
		borderWidth: 1,
		borderTopWidth: 0,
		borderColor: "#E5E5E5",
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
		maxHeight: 200,
		backgroundColor: "#FFFFFF",
	},
	repositoriesScroll: {
		flexGrow: 0,
	},
	repositoryItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: 'white',
		borderBottomWidth: 1,
		borderBottomColor: '#E5E5E5',
	},
	selectedRepositoryItem: {
		backgroundColor: "#F5F5F5",
	},
	repositoryItemContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	repositoryItemIcon: {
		width: 32,
		height: 32,
		backgroundColor: "#E8F5E9",
		borderRadius: 6,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	repositoryItemText: {
		fontSize: 16,
		color: "#000000",
	},
	repositoryItem_dark: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#333333',
		borderBottomWidth: 1,
		borderBottomColor: '#444444',
	},
	selectedRepositoryItem_dark: {
		backgroundColor: '#444444',
	},
	repositoryItemTouchable: {
		flex: 1,
		padding: 12,
	},
	selectedRepositoryItemTouchable: {
		backgroundColor: '#E8F0F2',
	},
	repositoryItemText_dark: {
		fontSize: 16,
		color: '#999999',
	},
	selectedRepositoryItemText_dark: {
		color: '#D1E4E9',
	},
	repositoryButtonExpanded_dark: {
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 0,
	},
	repositoriesContainer_dark: {
		borderWidth: 1,
		borderTopWidth: 0,
		borderColor: "#444444",
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
		maxHeight: 200,
		backgroundColor: "#333333",
	},
	selectedRepositoryItemTouchable_dark: {
		backgroundColor: '#555555',
	},
	selectedRepositoryItemIcon: {
		backgroundColor: '#C8E6C9',
	},
	selectedRepositoryItemText: {
		color: '#2E7D32',
		fontWeight: '500',
	},
});
