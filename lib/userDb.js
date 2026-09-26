// lib/userDb.js
// The user "database": one document per Google account in Firestore.
//
//   users/{uid} = { name, gender, age, district, state, language, email, createdAt }
//
// Login checks whether this document exists. No document = not registered,
// so the app asks the person to sign up first.

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function createUserDoc(uid, profile, authUser) {
  const row = {
    name: profile.name || authUser?.displayName || '',
    gender: profile.gender || '',
    age: profile.age || '',
    district: profile.district || '',
    state: profile.state || '',
    language: profile.language || 'en',
    email: authUser?.email || '',
    photoURL: authUser?.photoURL || '',
    createdAt: serverTimestamp(),
  };
  await setDoc(doc(db, 'users', uid), row, { merge: true });
  return row;
}