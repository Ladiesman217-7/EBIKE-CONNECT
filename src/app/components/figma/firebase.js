import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "ebike-login.firebaseapp.com",
    projectId: "ebike-login",
    storageBucket: "ebike-login.appspot.com",
    messagingSenderId: "177410831009",
    appId: "1:177410831009:web:6027a71860d5b6e4093f63"
};
const defaultApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const adminApp =
    getApps().find((app) => app.name === "adminApp") ||
    initializeApp(firebaseConfig, "adminApp");

const riderApp =
    getApps().find((app) => app.name === "riderApp") ||
    initializeApp(firebaseConfig, "riderApp");

export const db = getFirestore(defaultApp);
export const adminAuth = getAuth(adminApp);
export const riderAuth = getAuth(riderApp);