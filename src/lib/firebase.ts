// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ⚠️ REPLACE with your actual Firebase project config from Firebase Console
// Go to: Firebase Console → Project Settings → Your Apps → Web App → Config
const firebaseConfig = {
  apiKey: "AIzaSyAaDPhp_wde2g5pgna3tEvRttV6OEwbvr0",
  authDomain: "monitoring-app-4882e.firebaseapp.com",
  projectId: "monitoring-app-4882e",
  storageBucket: "monitoring-app-4882e.firebasestorage.app",
  messagingSenderId: "342696666206",
  appId: "1:342696666206:web:4a174932b3bff1f29880cf" ,
  measurementId: "G-TY54RPPT1V"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();




export default app;