// firebaseConfig.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDKgfvifHOvCenGu3penApGOmrFbYPfC4Q",
  authDomain: "expirysense-e9541.firebaseapp.com",
  projectId: "expirysense-e9541",
  storageBucket: "expirysense-e9541.firebasestorage.app",
  messagingSenderId: "980619453434",
  appId: "1:980619453434:web:51b2e1cb938a04a380fa43"
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

// ✅ Correct React Native Auth initialization
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);