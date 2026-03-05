// firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDKgfvifHOvCenGu3penApGOmrFbYPfC4Q",
  authDomain: "expirysense-e9541.firebaseapp.com",
  projectId: "expirysense-e9541",
  storageBucket: "expirysense-e9541.firebasestorage.app",
  messagingSenderId: "980619453434",
  appId: "1:980619453434:web:51b2e1cb938a04a380fa43"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore database
export const db = getFirestore(app);