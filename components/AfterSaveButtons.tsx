import {StyleSheet, View} from "react-native";
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
  const handleCheckboxPress = useCallback(
    (value: boolean) => {
      handleRememberChoice(value);
    },
    [handleRememberChoice],
  );

  const handleSharePressed = useCallback(() => {
    handleSubmitChanges();

    setTimeout(() => {
      setShareModalInfo(true, linkId);
    }, 500);
  }, [handleSubmitChanges, linkId]);

  const handleRemindPressed = useCallback(() => {
    handleSubmitChanges();

    setTimeout(() => {
      setIsReminderModalVisible(true, linkId);
    }, 500);
  }, [handleSubmitChanges, linkId]);

  return (
    <View style={styles.container}>
      <View style={styles.commonButtonsContainer}>
        <CommonButton
          additionalButtonStyles={styles.buttonStyle}
          additionalTextStyles={styles.buttonText}
          text="Set a Reminder"
          onPress={handleRemindPressed}
        />

        <CommonButton
          additionalButtonStyles={styles.buttonStyle}
          additionalTextStyles={styles.buttonText}
          text="Share to repository"
          onPress={handleSharePressed}
        />
      </View>

      <BouncyCheckbox
        size={16}
        text="Remember your choice"
        style={styles.checkboxContainer}
        fillColor="#E6E8EA"
        innerIconStyle={styles.checkboxInnerStyle}
        iconStyle={styles.checkboxInnerStyle}
        textStyle={styles.checkboxTextStyle}
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
  checkboxContainer: {
    marginTop: 8,
    paddingVertical: 8,
  },
  checkboxInnerStyle: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  checkboxTextStyle: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "400",
    textDecorationLine: "none",
  },
  checkboxTextContainerStyle: {
    marginLeft: 8,
  },
}); 