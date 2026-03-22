import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    // Gamitin ang bagong variable name dito
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY_NEW,
    authDomain: "ebike-connect-490916.firebaseapp.com",
    projectId: "ebike-connect-490916",
    storageBucket: "ebike-connect-490916.firebasestorage.app",
    messagingSenderId: "1055744837333",
    appId: "1:1055744837333:web:583095034608c07e283be3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);