// import { TBorderPositionMetrics, TPhoneWithNotchMetrics, TWithBorderRadiusMetrics } from "shared/utils/metrics/_models";
// import {
//     deviceInch,
//     isAndroid,
//     isIOS,
//     isTablet,
//     fontScale,
//     width,
//     height,
//     hasNotch,
//     isSmallDevice,
// } from "react-native-utils-scale";
// import DeviceInfo from "react-native-device-info";
import {Platform} from "react-native";
import {scaleHeight, scaleWidth} from "@/components/design/scale";

// const hasAndroidNotch = hasNotch;
const hasAndroidNotch = false;

const iPhoneWithNotch = [
    "iPhone X",
    "iPhone XR",
    "iPhone XS",
    "iPhone XS Max",
    "iPhone 11 Pro",
    "iPhone 11 Pro Max",
    "iPhone 11",
    "iPhone 12 Pro",
    "iPhone 12 Pro Max",
    "iPhone 12",
    "iPhone 12 mini",
    "iPhone 13 Pro",
    "iPhone 13 Pro Max",
    "iPhone 13",
    "iPhone 13 mini",
];

// const hasIphoneNotch = Platform.OS === "ios" && iPhoneWithNotch.includes(DeviceInfo.getModel());
const hasIphoneNotch = false

const hasPhoneNotch = hasAndroidNotch || hasIphoneNotch;

const withBorderRadius = (position: string, radius: number) => {
    switch (position) {
        case "bottom":
            return {
                borderBottomLeftRadius: radius,
                borderBottomRightRadius: radius,
            };
        case "top":
            return {
                borderTopLeftRadius: radius,
                borderTopRightRadius: radius,
            };
        default:
            return {
                borderRadius: radius,
            };
    }
};

const salt = () =>
    Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, "")
        .substr(0, 16);

const saltWithPasscode = (passcode: number) =>
    (passcode * 52350).toString(36).substr(0, 16);

const shortId = () => Math.random().toString(36).slice(-8);

const metrics = {
    screenWidth: 340,
    screenHeight: 720,
    withBorderRadius,
    shortId,
    salt,
    saltWithPasscode,
    deviceInch: 5.5,
    isAndroid: Platform.OS === 'android',
    isIOS: Platform.OS === 'ios',
    isTablet: false,
    scaleWidth: scaleWidth,
    scaleHeight: scaleHeight,
    fontScale: 1,
    // isIphoneWithNotch: isIOS && !isSmallDevice,
    isIphoneWithNotch: false,
    scale: (num: number) => num,
    hasPhoneNotch,
};

export default metrics;
