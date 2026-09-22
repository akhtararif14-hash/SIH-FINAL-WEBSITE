// lib/firebase.js
// Client-side Firebase setup for the web app. Uses the same Firebase
// project as the Expo app (same Web app registration), so any users who
// signed up in the mobile app can log in here with the same email/password
// or Google account.
'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
   apiKey: 'AIzaSyD3kL4Wuuesb4UddfrCFd4MjAg2UIePsR0',
  authDomain: 'sih-final-f76bc.firebaseapp.com',
  projectId: 'sih-final-f76bc',
  storageBucket: 'sih-final-f76bc.firebasestorage.app',
  messagingSenderId: '31554277113',
  appId: '1:31554277113:web:965e8be2ce19ff967d5c28',
  measurementId: 'G-BLXTVNCED7',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Web's default persistence (IndexedDB/localStorage) keeps users logged in
// across visits automatically — no extra setup needed, unlike the Expo app
// which needed AsyncStorage wired in manually.
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
