'use client';
// lib/ProfileProvider.js
// Remembers who the user is, so they only fill the form ONCE.
// Saved in the browser (localStorage), so closing the tab or coming back
// tomorrow does not ask again. Firebase remembers the Google login separately.

import { createContext, useContext, useEffect, useState } from 'react';

const KEY = 'srigen-profile';

const EMPTY = {
  language: 'en',
  name: '',
  gender: '',
  age: '',
  district: '',
  state: '',
  onboarded: false,
  createdAt: null,
};

const ProfileContext = createContext({
  profile: EMPTY,
  ready: false,
  saveProfile: () => {},
  clearProfile: () => {},
});

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(EMPTY);
  // `ready` stops the app from redirecting to onboarding before we have read
  // localStorage — otherwise a returning user would flash the sign-up screen.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      if (saved) setProfile({ ...EMPTY, ...JSON.parse(saved) });
    } catch {
      // A blocked or full localStorage should never break the app.
    }
    setReady(true);
  }, []);

  const saveProfile = (patch) => {
    setProfile((current) => {
      const next = { ...current, ...patch };
      if (!next.createdAt) next.createdAt = new Date().toISOString();
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearProfile = () => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {}
    setProfile(EMPTY);
  };

  return (
    <ProfileContext.Provider value={{ profile, ready, saveProfile, clearProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}