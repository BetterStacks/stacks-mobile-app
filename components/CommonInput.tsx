import React, {forwardRef, ReactNode} from 'react';
import {
	ColorSchemeName,
	StyleSheet,
	Text,
	TextInput,
	TextInputProps,
	TouchableOpacity,
	useColorScheme,
	View
} from 'react-native';
import {getFont} from "@/components/design/fonts/fonts";
import {EFontWeight} from "@/components/design/fonts/types";
import {scaleHeight, scaleWidth} from "@/components/design/scale";
import {Colors} from "@/components/design/colors";

interface Props extends TextInputProps {
    iconName?: ReactNode;
    secondIconName?: ReactNode;
    isSecondIconActive?: boolean;
    onIconPress?: () => void;
    additionalInputStyles?: object;
    isIconNotTouchable?: boolean;
    colorScheme?: ColorSchemeName;
    touched?: boolean;
    errors?: string;
}

const CommonInput = forwardRef<TextInput, Props>(({
    iconName,
    secondIconName,
    isSecondIconActive,
    onIconPress,
    additionalInputStyles,
    isIconNotTouchable,
    colorScheme,
    touched,
    errors,
    ...props
}, ref) => {
    const systemColorScheme = useColorScheme();
    const isDark = colorScheme === 'dark' || systemColorScheme === 'dark';
    const hasError = touched && errors;

    const renderIcon = () => {
        const currentIcon = isSecondIconActive ? secondIconName : iconName;
        
        if (onIconPress && !isIconNotTouchable) {
            return (
                <TouchableOpacity 
                    style={styles.iconContainer}
                    onPress={onIconPress}
                    activeOpacity={0.7}
                >
                    {currentIcon}
                </TouchableOpacity>
            );
        }
        
        return (
            <View style={styles.iconContainer}>
                {currentIcon}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {(iconName || secondIconName) && renderIcon()}
            <TextInput
                ref={ref}
                style={[
                    isDark ? styles.input_dark : styles.input, 
                    (iconName || secondIconName) ? {} : styles.inputWithoutIcon,
                    hasError ? (isDark ? styles.inputError_dark : styles.inputError) : {},
                    additionalInputStyles
                ]}
                {...props}
            />
            {hasError && (
                <Text style={isDark ? styles.errorText_dark : styles.errorText}>
                    {errors}
                </Text>
            )}
        </View>
    );
});

export default CommonInput;

const styles = StyleSheet.create({
    container: {
        position: "relative",
        width: "100%",
    },
    input: {
        ...getFont(EFontWeight.Regular),
        fontSize: scaleHeight(16),
        color: "#1C4A5A",
        backgroundColor: "#F8F9FA",
        borderRadius: 8,
        paddingVertical: scaleHeight(12),
        paddingHorizontal: scaleWidth(16),
        paddingLeft: scaleWidth(44),
        borderWidth: 1,
        borderColor: "transparent",
    },
    input_dark: {
        ...getFont(EFontWeight.Regular),
        fontSize: scaleHeight(16),
        color: "#FFFFFF",
        backgroundColor: "#262626",
        borderRadius: 8,
        paddingVertical: scaleHeight(12),
        paddingHorizontal: scaleWidth(16),
        paddingLeft: scaleWidth(44),
        borderWidth: 1,
        borderColor: "transparent",
    },
    inputWithoutIcon: {
        paddingLeft: scaleWidth(16),
    },
    inputError: {
        borderColor: Colors.OtherColor.ModalRedColor,
    },
    inputError_dark: {
        borderColor: "#ff453a",
    },
    iconContainer: {
        position: "absolute",
        left: scaleWidth(12),
        top: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    errorText: {
        ...getFont(EFontWeight.Regular),
        color: Colors.OtherColor.ModalRedColor,
        fontSize: scaleHeight(12),
        marginTop: scaleHeight(4),
        marginLeft: scaleWidth(4),
    },
    errorText_dark: {
        ...getFont(EFontWeight.Regular),
        color: "#ff453a",
        fontSize: scaleHeight(12),
        marginTop: scaleHeight(4),
        marginLeft: scaleWidth(4),
    },
});