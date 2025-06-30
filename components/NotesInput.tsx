import React from "react";
import {StyleSheet, TextInput, TextInputProps} from "react-native";

interface NotesInputProps extends TextInputProps {
  additionalInputStyles?: object;
}

export const NotesInput: React.FC<NotesInputProps> = ({
  additionalInputStyles,
  ...props
}) => {
  return (
    <TextInput
      style={[styles.input, additionalInputStyles]}
      placeholderTextColor="#999999"
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    color: "#1C4A5A",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});

export default NotesInput; 