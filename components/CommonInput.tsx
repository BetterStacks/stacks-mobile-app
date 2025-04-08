import React, {forwardRef, ReactNode} from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { StyleSheet } from "react-native";
import {getFont} from "@/components/design/fonts/fonts";
import {EFontWeight} from "@/components/design/fonts/types";
import {scaleHeight, scaleWidth} from "@/components/design/scale";
import {getIconWithColor} from "@/components/design/icons/getIconWithColor";
import {EIconName} from "@/components/design/icons/_models";

interface Props extends TextInputProps {
    iconName?: ReactNode;
    additionalInputStyles?: object;
    isIconNotTouchable?: boolean;
}

const CommonInput = forwardRef<TextInput, Props>(({
    iconName,
    additionalInputStyles,
    isIconNotTouchable,
    ...props
}, ref) => {
    return (
        <View style={styles.container}>
            {iconName && (
                <View style={styles.iconContainer}>
                    {getIconWithColor(iconName as EIconName)}
                </View>
            )}
            <TextInput
                ref={ref}
                style={[styles.input, additionalInputStyles]}
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
    iconContainer: {
        position: "absolute",
        left: scaleWidth(12),
        height: "100%",
        justifyContent: "center",
        zIndex: 1,
    },
});