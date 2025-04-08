import { initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Optionally import the services that you want to use
// import {...} from 'firebase/auth';
// import {...} from 'firebase/database';
// import {...} from 'firebase/firestore';
// import {...} from 'firebase/functions';
// import {...} from 'firebase/storage';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC6DCBEzA8yVZtUQO7Mc687AOnyYhloRIU",
  authDomain: "stacks-259313.firebaseapp.com",
  databaseURL: "https://stacks-259313.firebaseio.com",
  projectId: "stacks-259313",
  storageBucket: "stacks-259313.appspot.com",
  messagingSenderId: 574408922411,
  appId: "app-id",
  measurementId: "G-measurement-id",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { app, auth };
