'use client';
// lib/mapPreload.js
// Decides WHICH map to use, downloads it early, and remembers if Google fails.
//
// Two jobs:
//
// 1. SPEED — the map is a large chunk. The app shell starts downloading it as
//    soon as the first page is idle, and again the moment a pointer touches
//    the Location Advisor menu item, so the page opens with a map already
//    there instead of a grey box.
//
// 2. FALLING BACK — Google Maps refuses to draw if the key is wrong, the
//    referrer is not allowed, billing is off or a trial has run out. It shows
//    "Oops! Something went wrong" and there is nothing the page can do about
//    it. When that happens we switch to OpenStreetMap, which needs no key, and
//    remember the failure for the rest of the session so the error never
//    appears twice.

const FAILED_KEY = 'srigen-google-maps-failed';

export const HAS_GOOGLE_KEY = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY);

let googleFailed = false;

// Read the remembered failure once, so a reload does not retry a key that is
// already known to be refused.
if (typeof window !== 'undefined') {
  try {
    googleFailed = window.sessionStorage.getItem(FAILED_KEY) === '1';
  } catch {
    // Private browsing can block sessionStorage. Not important enough to care.
  }
}

export function googleMapsFailed() {
  return googleFailed;
}

export function markGoogleMapsFailed(reason = '') {
  if (googleFailed) return;
  googleFailed = true;
  try {
    window.sessionStorage.setItem(FAILED_KEY, '1');
  } catch {}
  // Worth one line in the console: the developer should still fix the key.
  console.warn(
    `[SriGen] Google Maps could not load${reason ? ` (${reason})` : ''}. ` +
      'Showing OpenStreetMap instead. Check the key\'s API restrictions, allowed ' +
      'referrers and billing in Google Cloud.'
  );
}

// Use Google only if there is a key AND it has not already failed.
export function shouldUseGoogle() {
  return HAS_GOOGLE_KEY && !googleFailed;
}

// ---- downloading the code ------------------------------------------------

let googlePromise = null;
let osmPromise = null;

export function preloadGoogleMap() {
  if (!googlePromise) {
    googlePromise = import('@/components/advisor/AdvisorMapGoogle').catch((err) => {
      googlePromise = null;
      throw err;
    });
  }
  return googlePromise;
}

export function preloadOsmMap() {
  if (!osmPromise) {
    osmPromise = import('@/components/advisor/AdvisorMap').catch((err) => {
      osmPromise = null;
      throw err;
    });
  }
  return osmPromise;
}

// Whichever map we are going to show.
export function preloadMap() {
  return shouldUseGoogle() ? preloadGoogleMap() : preloadOsmMap();
}

// Runs the download when the browser has nothing better to do, so it never
// competes with whatever the user is looking at.
export function preloadMapWhenIdle() {
  if (typeof window === 'undefined') return () => {};

  const run = () => {
    preloadMap();
    // Fetch OpenStreetMap too when Google is in use: it is small, and if the
    // key turns out to be refused the switch is then instant.
    if (shouldUseGoogle()) preloadOsmMap();
  };

  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(run, { timeout: 2500 });
    return () => window.cancelIdleCallback?.(id);
  }
  const timer = setTimeout(run, 1200);
  return () => clearTimeout(timer);
}