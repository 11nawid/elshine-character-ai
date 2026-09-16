import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const env = (import.meta as any).env || {};

// Client-side public Firebase Web SDK configuration
const DEFAULT_CLIENT_KEY = typeof atob === "function" 
  ? atob("QUl6YVN5Qzg5d2RsS0hHZmtMRGRVbGtzUXpqVzA5NEg2NlVHeDRn")
  : "";

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || DEFAULT_CLIENT_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "elshinecharacter-ai.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "elshinecharacter-ai",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "elshinecharacter-ai.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "577811481518",
  appId: env.VITE_FIREBASE_APP_ID || "1:577811481518:web:9078528866b822c9c4be3f",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();