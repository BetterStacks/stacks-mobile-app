import {StyleSheet, useColorScheme, View} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import {CommonButton} from "./CommonButton/CommonButton";
import {useCallback} from "react";
import {setIsReminderModalVisible, setShareModalInfo,} from "@/lib/apollo/store/handlers";

type Props = {
  isChoiceRemembered: boolean;
  handleRememberChoice: (value: boolean) => void;
  linkId: string;
  handleSubmitChanges: () => void;
};

export const AfterSaveButtons: React.FC<Props> = ({
  isChoiceRemembered,
  handleRememberChoice,
  linkId,
  handleSubmitChanges,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleCheckboxPress = useCallback(
    (value: boolean) => {
      handleRememberChoice(value);
    },
    [handleRememberChoice],
  );

  const handleSharePressed = useCallback(() => {
    // Show share modal - coordination handled in store
    setShareModalInfo(true, linkId);
  }, [linkId]);

  const handleRemindPressed = useCallback(() => {
    // Show reminder modal - coordination handled in store
    console.log('[ReminderModal] Button pressed, linkId:', linkId);
    setIsReminderModalVisible(true, linkId);
  }, [linkId]);

  return (
    <View style={styles.container}>
      <View style={styles.commonButtonsContainer}>
        <CommonButton
          additionalButtonStyles={isDark ? styles.buttonStyle_dark : styles.buttonStyle}
          additionalTextStyles={isDark ? styles.buttonText_dark : styles.buttonText}
          text="Set a Reminder"
          onPress={handleRemindPressed}
        />

        <CommonButton
          additionalButtonStyles={isDark ? styles.buttonStyle_dark : styles.buttonStyle}
          additionalTextStyles={isDark ? styles.buttonText_dark : styles.buttonText}
          text="Share to repository"
          onPress={handleSharePressed}
        />
      </View>

      <BouncyCheckbox
        size={16}
        text="Remember your choice"
        style={styles.checkboxContainer}
        fillColor={isDark ? "#555555" : "#E6E8EA"}
        innerIconStyle={isDark ? styles.checkboxInnerStyle_dark : styles.checkboxInnerStyle}
        iconStyle={isDark ? styles.checkboxInnerStyle_dark : styles.checkboxInnerStyle}
        textStyle={isDark ? styles.checkboxTextStyle_dark : styles.checkboxTextStyle}
        textContainerStyle={styles.checkboxTextContainerStyle}
        isChecked={isChoiceRemembered}
        onPress={handleCheckboxPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  commonButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  buttonStyle: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  buttonText: {
    color: "#1C4A5A",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  buttonStyle_dark: {
    flex: 1,
    backgroundColor: "#333333",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444444",
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  buttonText_dark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  checkboxContainer: {
    marginTop: 8,
    paddingVertical: 8,
  },
  checkboxInnerStyle: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  checkboxInnerStyle_dark: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#555555",
  },
  checkboxTextStyle: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "400",
    textDecorationLine: "none",
  },
  checkboxTextStyle_dark: {
    fontSize: 14,
    color: "#999999",
    fontWeight: "400",
    textDecorationLine: "none",
  },
  checkboxTextContainerStyle: {
    marginLeft: 8,
  },
}); 