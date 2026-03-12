import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDAUo3Ik7EBQRdtpOAOPAMM0L-ec9Bz2jI",
    authDomain: "ebike-login.firebaseapp.com",
    projectId: "ebike-login",
    storageBucket: "ebike-login.firebasestorage.app",
    messagingSenderId: "160884241142",
    appId: "1:160884241142:web:b7eb3f48589c9b4be2b2d7",
    measurementId: "G-VZFY8PVXQG",
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