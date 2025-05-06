import React, {forwardRef, ReactNode} from 'react';
import {ColorSchemeName, StyleSheet, TextInput, TextInputProps, useColorScheme, View} from 'react-native';
import {getFont} from "@/components/design/fonts/fonts";
import {EFontWeight} from "@/components/design/fonts/types";
import {scaleHeight, scaleWidth} from "@/components/design/scale";

interface Props extends TextInputProps {
    iconName?: ReactNode;
    additionalInputStyles?: object;
    isIconNotTouchable?: boolean;
    colorScheme?: ColorSchemeName;
}

const CommonInput = forwardRef<TextInput, Props>(({
    iconName,
    additionalInputStyles,
    isIconNotTouchable,
    colorScheme,
    ...props
}, ref) => {
    const systemColorScheme = useColorScheme();
    const isDark = colorScheme === 'dark' || systemColorScheme === 'dark';

    return (
        <View style={styles.container}>
            {iconName && (
                <View style={styles.iconContainer}>
                    {iconName}
                </View>
            )}
            <TextInput
                ref={ref}
                style={[
                    isDark ? styles.input_dark : styles.input, 
                    additionalInputStyles
                ]}
                {...props}
            />
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
    },
    iconContainer: {
        position: "absolute",
        left: scaleWidth(12),
        height: "100%",
        justifyContent: "center",
        zIndex: 1,
    },
});