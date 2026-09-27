'use client';
// components/advisor/AdvisorMapAuto.js
// Shows the Google map, and silently switches to OpenStreetMap if Google
// refuses to load.
//
// Google Maps fails for reasons the page cannot control — a key restricted to
// the wrong website, Maps JavaScript API not enabled, billing switched off, a
// trial that has run out. When that happens Google paints its own grey
// "Oops! Something went wrong" panel inside our box, and the user is stuck.
//
// Three things are watched, because Google reports failure in different ways:
//
//   1. window.gm_authFailure  — the official callback for a refused key.
//                               This covers the referrer, billing and expiry
//                               cases, which are the common ones.
//   2. the chunk failing      — no network, or the file is missing.
//   3. a timeout              — nothing drew within 6 seconds.
//
// Any of the three switches to OpenStreetMap for the rest of the session.
// OpenStreetMap needs no key and cannot fail this way.

import { useEffect, useRef, useState } from 'react';
import {
  HAS_GOOGLE_KEY,
  shouldUseGoogle,
  markGoogleMapsFailed,
  preloadGoogleMap,
  preloadOsmMap,
} from '@/lib/mapPreload';

const SWITCH_AFTER_MS = 6000;

export default function AdvisorMapAuto(props) {
  // Decided once per mount. If Google already failed earlier in this session
  // we go straight to OpenStreetMap and never flash the error again.
  const [useGoogle, setUseGoogle] = useState(() => shouldUseGoogle());
  const [Map, setMap] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const drewRef = useRef(false);

  // --- 1. Google's own "this key is refused" callback --------------------
  useEffect(() => {
    if (!useGoogle || typeof window === 'undefined') return;

    const previous = window.gm_authFailure;
    window.gm_authFailure = () => {
      markGoogleMapsFailed('authentication refused');
      setUseGoogle(false);
      setMap(null);
      if (typeof previous === 'function') previous();
    };

    return () => {
      window.gm_authFailure = previous;
    };
  }, [useGoogle]);

  // --- 2. load the right map component ----------------------------------
  useEffect(() => {
    let cancelled = false;
    setLoadError(false);

    const loader = useGoogle ? preloadGoogleMap() : preloadOsmMap();
    loader
      .then((mod) => {
        if (cancelled) return;
        drewRef.current = true;
        setMap(() => mod.default);
      })
      .catch(() => {
        if (cancelled) return;
        if (useGoogle) {
          markGoogleMapsFailed('map code failed to download');
          setUseGoogle(false); // try OpenStreetMap instead
        } else {
          setLoadError(true); // both failed — say so plainly
        }
      });

    return () => {
      cancelled = true;
    };
  }, [useGoogle]);

  // --- 3. nothing drew in time ------------------------------------------
  useEffect(() => {
    if (!useGoogle) return;
    drewRef.current = false;

    const timer = setTimeout(() => {
      // Google draws its error panel without telling us, so if the component
      // never became available, assume it is not coming.
      if (!drewRef.current) {
        markGoogleMapsFailed('timed out');
        setUseGoogle(false);
      }
    }, SWITCH_AFTER_MS);

    return () => clearTimeout(timer);
  }, [useGoogle]);

  const height = props.height || 380;

  if (loadError) {
    return (
      <div className="map-skeleton" style={{ height, borderRadius: 14, display: 'grid', placeItems: 'center' }}>
        <span style={{ fontSize: 13.5, color: 'var(--ink-muted)', padding: '0 16px', textAlign: 'center' }}>
          The map could not be loaded. Search for a place by name instead — everything else still works.
        </span>
      </div>
    );
  }

  if (!Map) {
    return <div className="map-skeleton" style={{ height, borderRadius: 14 }} />;
  }

  return (
    <>
      <Map {...props} />
      {HAS_GOOGLE_KEY && !useGoogle && (
        <div style={noteStyle}>
          Showing OpenStreetMap — Google Maps did not accept the key for this site.
        </div>
      )}
    </>
  );
}

const noteStyle = {
  fontSize: 12,
  color: 'var(--ink-muted)',
  marginTop: 6,
  lineHeight: 1.5,
};