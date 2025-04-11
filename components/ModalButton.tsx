import {StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle,} from "react-native";
import {Colors} from "@/components/design/colors";

type Props = {
	isExitButton?: boolean;
	text: string;
	onPress: () => void;
	loading?: boolean;
	additionalButtonStyles?: StyleProp<ViewStyle>;
	additionalTextStyles?: StyleProp<TextStyle>;
	disabled?: boolean;
};

export const ModalButton: React.FC<Props> = ({
	 isExitButton,
	 text,
	 onPress,
	 loading,
	 additionalButtonStyles,
	 additionalTextStyles,
	 disabled,
}) => (
	<TouchableOpacity
		style={[
			styles.button,
			isExitButton && styles.exitButton,
			loading && styles.loading,
			additionalButtonStyles,
		]}
		onPress={onPress}
		disabled={loading || disabled}>
		<Text
			style={[
				styles.text,
				isExitButton && styles.exitText,
				additionalTextStyles,
			]}>
			{text}
		</Text>
	</TouchableOpacity>
);


const styles = StyleSheet.create({
	button: {
		paddingVertical: 6.5,
		paddingHorizontal: 15,
		minWidth: 65,
		backgroundColor: Colors.ButtonsColor.MainButton,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 4,
	},
	exitButton: {
		backgroundColor: Colors.ButtonsColor.ModalButtonGray,
	},
	text: {
		fontWeight: "medium",
		color: Colors.OtherColor.UsualWhite,
		textAlign: "center",
	},
	exitText: {
		color: Colors.TextColor.ModalGrayText,
	},
	loading: {
		opacity: 0.2,
	},
});
