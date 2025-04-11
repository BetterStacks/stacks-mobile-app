import Modal from "react-native-modal";
import {StyleSheet, View} from "react-native";
import {useMutation} from "@apollo/client";
import {useCallback, useEffect, useState} from "react";
import {MUTATION_ADD_LINK} from "@/lib/api/graphql/mutations";
import client from "@/lib/apollo/client";
import {setSharedLinkText} from "@/lib/apollo/store/handlers";
import CommonInput from "@/components/CommonInput";
import {Colors} from "@/components/design/colors";
import AntDesign from '@expo/vector-icons/AntDesign';
import {ModalButton} from "@/components/ModalButton";
import {AfterSaveContent} from "@/components/AfterSaveContent";

type Props = {
	isNewLinkModalShown: boolean
	setIsNewLinkModalShown: (isShown: boolean) => void
	link: string
	setLink: (link: string) => void
}

export const AddNewLinkModal = ({isNewLinkModalShown, setIsNewLinkModalShown, link, setLink}: Props) => {
	// const [isUploadFilesModalVisible, setIsUploadFilesModalVisible] = useState(false);
	const [isNewLinkFetched, setIsNewLinkFetched] = useState(false);
	const [isNewLinkTouched, setIsNewLinkTouched] = useState(false);
	const [newLinkError, setNewLinkError] = useState(null);

	const [addNewLink, { data: newLinkData, loading }] = useMutation(
		MUTATION_ADD_LINK,
		{
			onCompleted: () => {
				setIsNewLinkFetched(true);
				setNewLinkError(null);
				setIsNewLinkTouched(false);
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
				}, 5000);
			},
			onError: errors => {
				// Toast.error(errors.message)
			},
		},
	);

	useEffect(() => {
		addNewLink({
			variables: {
				target_url: link,
			},
		}).finally(() => {
			setSharedLinkText(null);
		});
	}, [
		addNewLink,
		link,
	]);

	const handleCloseModal = useCallback(() => {
		setSharedLinkText(null);
		setIsNewLinkModalShown(false);
	}, []);

	const onChangeText = useCallback((text: string) => {
		setIsNewLinkTouched(true);
		setNewLinkError(null);
		if (text[text.length - 1] !== " ") {
			setLink(text);
		}
	}, []);

	const handleAddingLink = useCallback(() => {
		addNewLink({
			variables: {
				target_url: link,
			},
		}).finally(() => {
			setSharedLinkText(null);
		});
	}, [addNewLink, link]);

	const handleHideModal = useCallback(() => {
		setIsNewLinkFetched(false);
		setLink("");
	}, []);

	return (
		<>
			<Modal
				isVisible={isNewLinkModalShown}
				onSwipeComplete={handleCloseModal}
				onBackdropPress={handleCloseModal}
				onModalHide={handleHideModal}
			>
				<View style={styles.container}>
					{isNewLinkFetched && newLinkData ? (
						<AfterSaveContent
							handleCloseModal={handleCloseModal}
							newLinkData={newLinkData.add_link}
							closeParent={() => setIsNewLinkModalShown(false)}
						/>
					) : (
						<>
							<CommonInput
								onChangeText={onChangeText}
								placeholder="Add new link here"
								value={link}
								additionalInputStyles={styles.additionalInputStyles}
								placeholderTextColor={
									Colors.OtherColor.ModalInputPlaceholderTextColor
								}
								iconName={<AntDesign name="link" size={20} color="black" />} // @ts-ignore
								errors={newLinkError}
								touched={isNewLinkTouched}
							/>
							<View style={[styles.buttons]}>
								<ModalButton
									onPress={handleCloseModal}
									text="Cancel"
									isExitButton={true}
								/>
								<ModalButton
									text="Save"
									onPress={handleAddingLink}
									loading={loading}
								/>
							</View>
						</>
					)}
				</View>
			</Modal>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		maxWidth: 500,
		backgroundColor: Colors.OtherColor.UsualWhite,
		borderRadius: 6,
	},
	additionalStylesForContainer: {
		paddingHorizontal: 10,
		paddingTop: 18,
		paddingBottom: 8,
	},
	additionalInputStyles: {
		borderRadius: 12,
		borderWidth: 1,
		borderColor: Colors.OtherColor.ModalInputBorderColor,
	},
	buttons: {
		flexDirection: "row",
		gap: 8,
		alignSelf: "flex-end",
		marginTop: 35,
	},
	afterSaveContainer: {
		paddingHorizontal: 10,
		paddingVertical: 12,
	},
	uploadFilesBtn: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 12,
		marginLeft: 6,
	},
	or: {
		color: "#000",
		fontWeight: "500",
		fontSize: 14,
	},
	uploadLabel: {
		fontSize: 16,
		fontWeight: "600",
		color: "#2098d1",
	},
});
