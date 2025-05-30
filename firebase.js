// firebaseConfig.js

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import {
  getReactNativePersistence,
  initializeAuth
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyDl3Im9ZaHr0wek8KxYKtDJZ2Yfv6cC6o8',
  authDomain: 'swap-448e3.firebaseapp.com',
  projectId: 'swap-448e3',
  storageBucket: 'swap-448e3.appspot.com', // ✅ fixed `.app` to `.com`
  messagingSenderId: '461589296679',
  appId: '1:461589296679:web:4d8699234cde4fb05d0002',
  measurementId: 'G-HT1TCQYQ7K',
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Auth with persistent storage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Firestore for DB
export const db = getFirestore(app);

// Storage for media (images, etc.)
export const storage = getStorage(app);

// Optional: default export for firebase app
export default app;
