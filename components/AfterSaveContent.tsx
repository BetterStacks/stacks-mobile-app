import {useCallback, useState} from "react";
import {Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {useMutation, useQuery} from "@apollo/client";
import {Link} from "@/lib/types/Link";
import AntDesign from '@expo/vector-icons/AntDesign';
import {QUERY_COLLECTIONS, QUERY_USER} from "@/lib/api/graphql/queries";
import client from "@/lib/apollo/client";
import {Collection} from "@/lib/types/Collection";
import {MUTATION_UPDATE_LINK} from "@/lib/api/graphql/mutations";
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
}) => (
	<View style={styles.header}>
		<Text style={styles.headerText}>Link saved successfully!</Text>
		<TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
			<AntDesign name="close" size={20} color="black" />
		</TouchableOpacity>
	</View>
);

export const AfterSaveContent: React.FC<AfterSaveContentProps> = ({
	handleCloseModal,
	newLinkData,
	closeParent
}) => {
	const [notes, setNotes] = useState("");
	const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
	const [tags, setTags] = useState<string[]>([]);
	const [isCollectionsExpanded, setIsCollectionsExpanded] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isChoiceRemembered, setIsChoiceRemembered] = useState(false);

	const { data: collectionsData } = useQuery(QUERY_COLLECTIONS, {
		variables: {
			query: searchQuery,
		},
	});
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

		closeParent();
	}, [updateLink, newLinkData.id, notes, tags, selectedCollections]);

	const handleCollectionButtonPress = () => {
		Keyboard.dismiss();
		setIsCollectionsExpanded(!isCollectionsExpanded);
	};

	const handleSearch = useCallback((text: string) => {
		setSearchQuery(text);
	}, []);

	const handleRememberChoice = useCallback((value: boolean) => {
		setIsChoiceRemembered(value);
	}, []);

	return (
		<View style={styles.container}>
			<AfterSaveContentHeader handleCloseModal={handleCloseModal} />

			<View style={styles.content}>
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Notes</Text>
					<NotesInput
						placeholder="Add notes..."
						onChangeText={handleNotesChange}
						value={notes}
						multiline
						numberOfLines={3}
						additionalInputStyles={styles.notesInput}
					/>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Tags</Text>
					<TagInput
						tags={tags}
						onTagsChange={handleTagsChange}
						placeholder="Add tags..."
						existingTags={userData?.user?.tags || []}
					/>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Collections</Text>
					<TouchableOpacity
						style={[
							styles.collectionButton,
							isCollectionsExpanded && styles.collectionButtonExpanded,
						]}
						onPress={handleCollectionButtonPress}>
						<View style={styles.collectionButtonContent}>
							<View style={styles.collectionIconContainer}>
								<AntDesign name="addfolder" size={20} color="#FFB74D" />
							</View>
							<Text style={styles.collectionText}>
								{selectedCollections.length > 0
									? "Selected Collections"
									: "Add to collection"}
							</Text>
						</View>
						<Entypo name="chevron-right" size={20} color="#666666" style={[
							styles.chevron,
							isCollectionsExpanded && styles.chevronExpanded,
						]} />
					</TouchableOpacity>

					{isCollectionsExpanded && (
						<View style={styles.collectionsContainer}>
							<View style={styles.searchContainer}>
								<View style={styles.searchInputWrapper}>
									<AntDesign name="search1" size={16} color="#999999" style={styles.searchIcon} />
									<TextInput
										style={styles.searchInput}
										placeholder="Search collections..."
										value={searchQuery}
										onChangeText={handleSearch}
										placeholderTextColor="#999999"
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
												styles.collectionItem,
												isSelected && styles.selectedCollectionItem,
											]}>
											<TouchableOpacity
												style={[
													styles.collectionItemTouchable,
													isSelected && styles.selectedCollectionItemTouchable,
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
															styles.collectionItemText,
															isSelected && styles.selectedCollectionItemText,
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
													<AntDesign name="close" size={20} color="#666666" />
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
		</View>
	);
};



const styles = StyleSheet.create({
	container: {
		backgroundColor: "#FFFFFF",
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
});
