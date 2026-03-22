import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "ebike-login.firebaseapp.com",
    projectId: "ebike-login",
    storageBucket: "ebike-login.appspot.com",
    messagingSenderId: "177410831009",
    appId: "1:177410831009:web:6027a71860d5b6e4093f63",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);