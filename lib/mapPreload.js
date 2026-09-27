'use client';
// lib/mapPreload.js
// Downloads the map code BEFORE the user opens the Location Advisor.
//
// The map is a large chunk (Leaflet, or the Google Maps loader). It used to
// start downloading only when the advisor page's own script ran — which is the
// same moment the page appears, so the user watched a grey box every time.
//
// Now the app shell starts this download quietly in the background once the
// first page is idle, and again the moment a pointer touches the Location
// Advisor menu item. By the time the page opens, the code is usually already
// in memory and the map appears at once.
//
// The promise is kept, so however many times this is called the file is
// fetched once, and the advisor page reuses the very same promise.

let mapModulePromise = null;

export function preloadMap() {
  if (!mapModulePromise) {
    mapModulePromise = (
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY
        ? import('@/components/advisor/AdvisorMapGoogle')
        : import('@/components/advisor/AdvisorMap')
    ).catch((err) => {
      // Let a later attempt try again instead of caching the failure.
      mapModulePromise = null;
      throw err;
    });
  }
  return mapModulePromise;
}

// True once the code is downloaded, so the page can skip the grey placeholder.
export function isMapReady() {
  return mapModulePromise !== null;
}

// Runs the download when the browser is doing nothing else, so it never
// competes with whatever the user is looking at right now.
export function preloadMapWhenIdle() {
  if (typeof window === 'undefined') return () => {};

  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(() => preloadMap(), { timeout: 2500 });
    return () => window.cancelIdleCallback?.(id);
  }

  const timer = setTimeout(() => preloadMap(), 1200);
  return () => clearTimeout(timer);
}