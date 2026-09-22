'use client';
// components/advisor/AdvisorMap.js
// Free map using Leaflet + OpenStreetMap tiles (no API key, no billing).
// Click anywhere on the map to drop the pin.
// This file must only ever load in the browser — AdvisorClient imports it
// with next/dynamic and { ssr: false }, because Leaflet needs `window`.

import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip, useMap, useMapEvents } from 'react-leaflet';

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Moves the map when the "focus" point changes (e.g. after a search).
function FlyTo({ focus }) {
  const map = useMap();
  useEffect(() => {
    if (focus) map.setView([focus.lat, focus.lng], Math.max(map.getZoom(), 15));
  }, [focus?.lat, focus?.lng]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function AdvisorMap({ pinA, pinB, radius, competitors = [], focus, onPick, height = 380 }) {
  const start = pinA || { lat: 28.5616, lng: 77.2802 }; // default view: Jamia Nagar, New Delhi

  return (
    <MapContainer
      center={[start.lat, start.lng]}
      zoom={pinA ? 15 : 12}
      style={{ height, width: '100%', borderRadius: 14, zIndex: 0 }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      <FlyTo focus={focus} />

      {pinA && (
        <>
          <Circle center={[pinA.lat, pinA.lng]} radius={radius} pathOptions={{ color: '#2e5339', weight: 2, fillOpacity: 0.08 }} />
          <CircleMarker center={[pinA.lat, pinA.lng]} radius={9} pathOptions={{ color: '#fff', weight: 3, fillColor: '#2e5339', fillOpacity: 1 }}>
            <Tooltip permanent direction="top" offset={[0, -8]}>A</Tooltip>
          </CircleMarker>
        </>
      )}

      {pinB && (
        <>
          <Circle center={[pinB.lat, pinB.lng]} radius={radius} pathOptions={{ color: '#6b4226', weight: 2, fillOpacity: 0.08, dashArray: '6 6' }} />
          <CircleMarker center={[pinB.lat, pinB.lng]} radius={9} pathOptions={{ color: '#fff', weight: 3, fillColor: '#6b4226', fillOpacity: 1 }}>
            <Tooltip permanent direction="top" offset={[0, -8]}>B</Tooltip>
          </CircleMarker>
        </>
      )}

      {competitors
        .filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng))
        .map((c, i) => (
          <CircleMarker
            key={`${c.lat},${c.lng},${i}`}
            center={[c.lat, c.lng]}
            radius={6}
            pathOptions={{ color: '#fff', weight: 1.5, fillColor: '#c0392b', fillOpacity: 0.9 }}
          >
            <Tooltip>
              {c.name}
              {c.rating != null ? ` · ${c.rating}★ (${c.reviews})` : ''}
            </Tooltip>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}