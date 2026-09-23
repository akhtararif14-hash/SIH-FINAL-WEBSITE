'use client';
// components/advisor/AdvisorMapGoogle.js
// Google Maps version of the advisor map.
// It takes EXACTLY the same props as AdvisorMap.js (the OpenStreetMap one),
// so you can switch between them without changing anything else.
//
// Needs in .env.local:
//   NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY=...   (browser key, restricted by website)
//   NEXT_PUBLIC_GOOGLE_MAP_ID=...             (optional; DEMO_MAP_ID is used if empty)

import { useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';

const BROWSER_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || 'DEMO_MAP_ID';

// Google Maps has no React component for circles, so we draw them directly
// on the map object and clean them up when the values change.
function Circles({ pinA, pinB, radius }) {
  const map = useMap();
  const circlesRef = useRef([]);

  useEffect(() => {
    if (!map || !window.google) return;
    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = [];

    const draw = (pin, color, dashed) => {
      if (!pin) return;
      const circle = new window.google.maps.Circle({
        map,
        center: { lat: pin.lat, lng: pin.lng },
        radius,
        strokeColor: color,
        strokeOpacity: dashed ? 0.6 : 0.9,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.08,
        clickable: false,
      });
      circlesRef.current.push(circle);
    };

    draw(pinA, '#2e5339', false);
    draw(pinB, '#6b4226', true);

    return () => {
      circlesRef.current.forEach((c) => c.setMap(null));
      circlesRef.current = [];
    };
  }, [map, pinA?.lat, pinA?.lng, pinB?.lat, pinB?.lng, radius]);

  return null;
}

// Moves the map when the user searches for a place or uses "My location".
function FlyTo({ focus }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !focus) return;
    map.panTo({ lat: focus.lat, lng: focus.lng });
    if ((map.getZoom() || 0) < 15) map.setZoom(15);
  }, [map, focus?.lat, focus?.lng]);
  return null;
}

export default function AdvisorMapGoogle({
  pinA,
  pinB,
  radius,
  competitors = [],
  focus,
  onPick,
  height = 380,
}) {
  const start = pinA || { lat: 28.5616, lng: 77.2802 }; // default: Jamia Nagar, New Delhi

  if (!BROWSER_KEY) {
    return (
      <div style={{ ...box(height), color: 'var(--danger)', fontSize: 14 }}>
        Google Maps key missing. Add NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY to .env.local and restart the server.
      </div>
    );
  }

  return (
    <div style={{ ...box(height), padding: 0, overflow: 'hidden' }}>
      <APIProvider apiKey={BROWSER_KEY}>
        <Map
          defaultCenter={{ lat: start.lat, lng: start.lng }}
          defaultZoom={pinA ? 15 : 12}
          mapId={MAP_ID}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          style={{ width: '100%', height: '100%' }}
          onClick={(e) => {
            const ll = e.detail?.latLng;
            if (ll) onPick(ll.lat, ll.lng);
          }}
        >
          <Circles pinA={pinA} pinB={pinB} radius={radius} />
          <FlyTo focus={focus} />

          {pinA && (
            <AdvancedMarker position={{ lat: pinA.lat, lng: pinA.lng }} title="Location A">
              <div style={pinStyle('#2e5339')}>A</div>
            </AdvancedMarker>
          )}

          {pinB && (
            <AdvancedMarker position={{ lat: pinB.lat, lng: pinB.lng }} title="Location B">
              <div style={pinStyle('#6b4226')}>B</div>
            </AdvancedMarker>
          )}

          {competitors
            .filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng))
            .map((c, i) => (
              <AdvancedMarker
                key={`${c.lat},${c.lng},${i}`}
                position={{ lat: c.lat, lng: c.lng }}
                title={`${c.name}${c.rating != null ? ` · ${c.rating}★ (${c.reviews})` : ''}`}
              >
                <div style={dotStyle} />
              </AdvancedMarker>
            ))}
        </Map>
      </APIProvider>
    </div>
  );
}

const box = (height) => ({
  height,
  width: '100%',
  borderRadius: 14,
  background: 'var(--leaf-pale)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  textAlign: 'center',
});

const pinStyle = (color) => ({
  width: 26,
  height: 26,
  borderRadius: 13,
  background: color,
  color: '#fff',
  border: '3px solid #fff',
  boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
  fontSize: 12,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const dotStyle = {
  width: 12,
  height: 12,
  borderRadius: 6,
  background: '#c0392b',
  border: '2px solid #fff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
};