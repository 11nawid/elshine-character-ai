import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "elshinecharacter-ai.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "elshinecharacter-ai",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "elshinecharacter-ai.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "577811481518",
  appId: env.VITE_FIREBASE_APP_ID || "1:577811481518:web:9078528866b822c9c4be3f",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();