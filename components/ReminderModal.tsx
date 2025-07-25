import Modal from "react-native-modal";
import {StyleSheet, Text, TouchableOpacity, useColorScheme, View} from "react-native";
import {useCallback, useState} from "react";
import {useMutation, useReactiveVar} from "@apollo/client";
import {isReminderModalVisibleVar} from "@/lib/apollo/store";
import {setIsReminderModalVisible} from "@/lib/apollo/store/handlers";
import {ModalButton} from "./ModalButton";
import DateTimePicker, {DateTimePickerAndroid, DateTimePickerEvent,} from "@react-native-community/datetimepicker";
import {MUTATION_ADD_REMINDER} from "@/lib/api/graphql/mutations";
import {format} from "date-fns";
import metrics from "./design/metrics";

export const ReminderModal = () => {
  const { isVisible, linkId } = useReactiveVar(isReminderModalVisibleVar);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [dateTime, setDateTime] = useState(new Date());
  const [addReminder, { loading }] = useMutation(MUTATION_ADD_REMINDER);

  const onChangeDate = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined,
  ) => {
    if (selectedDate) {
      setDateTime(new Date(selectedDate));
    }
  };

  const handleCloseModal = useCallback(() => {
    setIsReminderModalVisible(false, linkId);
  }, [linkId]);

  const onSubmit = useCallback(() => {
    addReminder({
      variables: {
        viewing_preference: dateTime.toString(),
        link_id: linkId,
      },
    }).then(handleCloseModal);
  }, [addReminder, dateTime, handleCloseModal, linkId]);

  const handleTimePress = useCallback(() => {
    if (metrics.isAndroid && isVisible) {
      DateTimePickerAndroid.open({
        testID: "dateTimePicker",
        value: dateTime,
        mode: "time",
        is24Hour: true,
        onChange: onChangeDate,
      });
    }
  }, [dateTime, isVisible]);

  const handleDatePress = useCallback(() => {
    if (metrics.isAndroid && isVisible) {
      DateTimePickerAndroid.open({
        testID: "dateTimePicker",
        value: dateTime,
        mode: "date",
        is24Hour: true,
        onChange: onChangeDate,
      });
    }
  }, [dateTime, isVisible]);

  return (
    <Modal
      isVisible={isVisible}
      onSwipeComplete={handleCloseModal}
      onBackdropPress={handleCloseModal}
      backdropColor="rgba(0,0,0,0.5)"
      backdropOpacity={1}
      animationIn="fadeIn"
      animationOut="fadeOut"
      useNativeDriver={false}
      hideModalContentWhileAnimating={false}
      avoidKeyboard={true}
    >
      <View style={isDark ? styles.wrapper_dark : styles.wrapper}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.dateRow} onPress={handleTimePress}>
            <Text style={isDark ? styles.text_dark : styles.text}>Set your time</Text>
            {metrics.isIOS && (
              <DateTimePicker
                testID="dateTimePicker"
                value={dateTime}
                mode={"time"}
                is24Hour={true}
                onChange={onChangeDate}
              />
            )}

            {metrics.isAndroid && (
              <Text style={isDark ? styles.text_dark : styles.text}>{format(dateTime, "HH:mm")}</Text>
            )}
          </TouchableOpacity>

          <View style={isDark ? styles.divider_dark : styles.divider} />

          <TouchableOpacity style={styles.dateRow} onPress={handleDatePress}>
            <Text style={isDark ? styles.text_dark : styles.text}>Set your date</Text>

            {metrics.isIOS && (
              <DateTimePicker
                testID="dateTimePicker"
                value={dateTime}
                mode={"date"}
                is24Hour={true}
                onChange={onChangeDate}
              />
            )}

            {metrics.isAndroid && (
              <Text style={isDark ? styles.text_dark : styles.text}>{format(dateTime, "dd/MMM/yyyy")}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.buttons}>
            <ModalButton
              onPress={handleCloseModal}
              text="Clear"
              isExitButton={true}
            />

            <ModalButton text="Apply" onPress={onSubmit} loading={loading} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 0,
    margin: 20,
  },
  wrapper_dark: {
    backgroundColor: "#232323",
    borderRadius: 16,
    padding: 0,
    margin: 20,
  },
  content: {
    padding: 24,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  text: {
    fontSize: 16,
    color: "#1C4A5A",
    fontWeight: "500",
  },
  text_dark: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 8,
  },
  divider_dark: {
    height: 1,
    backgroundColor: "#444444",
    marginVertical: 8,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
}); 