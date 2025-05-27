// Import the functions you need from the SDKs you need
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDl3Im9ZaHr0wek8KxYKtDJZ2Yfv6cC6o8",
  authDomain: "swap-448e3.firebaseapp.com",
  projectId: "swap-448e3",
  storageBucket: "swap-448e3.firebasestorage.app",
  messagingSenderId: "461589296679",
  appId: "1:461589296679:web:4d8699234cde4fb05d0002",
  measurementId: "G-HT1TCQYQ7K"
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);


const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});





