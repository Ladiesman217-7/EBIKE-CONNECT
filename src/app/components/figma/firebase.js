import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize the apps
const adminApp = initializeApp(firebaseConfig, "adminApp");
const riderApp = initializeApp(firebaseConfig, "riderApp");

//for uploading images to firebase storage
export const storage = getStorage(riderApp);

export const adminAuth = getAuth(adminApp);
export const riderAuth = getAuth(riderApp);

export const adminDb = getFirestore(adminApp);
export const riderDb = getFirestore(riderApp);

// Legacy aliases
export const auth = adminAuth;
export const db = adminDb;