import {ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps} from "react-native";
import {Colors} from "@/components/design/colors";
import {scaleHeight} from "@/components/design/scale";

type Props = {
    onPress: () => void;
};

export const MainButton = {
    Outline: ({ onPress, children, loading }: Readonly<TouchableOpacityProps> & {loading?: boolean}) => {
        return (
            <TouchableOpacity onPress={onPress} style={mainButtonStyles.outline.button}>
                {loading ? <ActivityIndicator style={mainButtonStyles.outline.button} /> : children}
            </TouchableOpacity>
        )
    },
    Primary: ({ onPress, children, loading }: Readonly<TouchableOpacityProps> & {loading?: boolean}) => {
        return (
            <TouchableOpacity onPress={onPress} style={mainButtonStyles.primary.button}>
                {loading ? <ActivityIndicator style={mainButtonStyles.primary.button} /> : children}
            </TouchableOpacity>
        )
    }
}

export const mainButtonStyles = {
    outline: StyleSheet.create({
        button: {
            backgroundColor: Colors.TextColor.ArticleColor,
            paddingVertical: scaleHeight(16),
            justifyContent: "center",
            alignItems: "center",
            maxHeight: scaleHeight(56),
            borderRadius: 6,
            borderWidth: 1,
            borderColor: Colors.tailwindColors.neutral["300"],
            flexDirection: "row",
            width: '100%',
            gap: 8
        },
        buttonText: {
            fontWeight: "medium",
            fontSize: scaleHeight(14),
            letterSpacing: 0.3,
            color: Colors.TextColor.MainBlackColor,
        },
        disabled: {
            opacity: 0.3,
        }
    }),
    primary: StyleSheet.create({
        button: {
            backgroundColor: Colors.TextColor.MainColor,
            paddingVertical: scaleHeight(16),
            justifyContent: "center",
            alignItems: "center",
            maxHeight: scaleHeight(56),
            borderRadius: 6,
        },
        buttonText: {
            fontWeight: "medium",
            fontSize: scaleHeight(14),
            letterSpacing: 0.3,
            color: Colors.OtherColor.UsualWhite,
        },
        disabled: {
            opacity: 0.3,
        },
    })
};
