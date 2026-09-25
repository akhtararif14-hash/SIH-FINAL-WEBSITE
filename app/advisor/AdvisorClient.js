'use client';
// app/advisor/AdvisorClient.js
// The "Location Advisor" page:
//   1. user picks a spot (search / GPS / tap on map)
//   2. sets radius, budget, interests
//   3. gets ranked business ideas with the score breakdown + AI explanation
//   4. can compare the same ideas at a second spot (B)

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTranslate } from '@/lib/LanguageProvider';
import { getParamInfo } from '@/lib/advisor/paramInfo';

// Use Google Maps when a browser key exists, otherwise the free OpenStreetMap one.
const USE_GOOGLE = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY);
const loadMapModule = () =>
  USE_GOOGLE
    ? import('@/components/advisor/AdvisorMapGoogle')
    : import('@/components/advisor/AdvisorMap');

// Start downloading the map code the moment this page's script runs, instead of
// waiting for React to mount the component. The map then appears almost at once.
if (typeof window !== 'undefined') loadMapModule();

const AdvisorMap = dynamic(loadMapModule, {
  ssr: false,
  loading: () => <div className="map-skeleton" style={{ height: 380, borderRadius: 14 }} />,
});

const INTERESTS = [
  { id: 'food', label: 'Food' },
  { id: 'retail', label: 'Retail' },
  { id: 'services', label: 'Services' },
  { id: 'health', label: 'Health' },
  { id: 'education', label: 'Education' },
];

const rupees = (n) => '₹' + Number(n).toLocaleString('en-IN');

// Reads an API reply safely. When the server times out or crashes it sends a
// plain web page, not JSON — this turns that into a message a human can act on
// instead of "Unexpected token 'A'".
async function readJSON(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    if (res.status === 504 || /timed? ?out|FUNCTION_INVOCATION_TIMEOUT/i.test(text)) {
      throw new Error('The study took too long and the server stopped it. Try a smaller radius (5 km), then run it again — the second try is much faster.');
    }
    if (res.status === 404) throw new Error(`API not found (404) at ${res.url} — check the route.js file location.`);
    throw new Error(`Server error (${res.status}). Try again in a minute, or use a smaller radius.`);
  }
}

export default function AdvisorClient() {
  const { t, lang } = useTranslate();

  // --- input state ---
  const [pinA, setPinA] = useState(null);
  const [pinB, setPinB] = useState(null);
  const [picking, setPicking] = useState('A'); // which pin a map click sets
  const [focus, setFocus] = useState(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [radius, setRadius] = useState(5000);
  const [budget, setBudget] = useState('');
  const [interests, setInterests] = useState([]);

  // --- output state ---
  const [loading, setLoading] = useState(null); // 'A' | 'B' | 'search' | null
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [reportB, setReportB] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    loadMapModule();
  }, []);

  const setPin = (lat, lng, label = '') => {
    const p = { lat, lng, label };
    if (picking === 'B') {
      setPinB(p);
      setReportB(null);
    } else {
      setPinA(p);
      setReport(null);
      setReportB(null);
    }
    setError('');
  };

  const search = async (e) => {
    e.preventDefault();
    if (query.trim().length < 3) return setError('Type at least 3 letters of a place name.');
    setLoading('search');
    setError('');
    try {
      const res = await fetch('/api/advisor/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: query }),
      });
      const data = await readJSON(res);
      if (!res.ok) throw new Error(data.error);
      setSearchResults(data.results);
      if (!data.results.length) setError('No place found. Try adding the city name, e.g. "Lajpat Nagar, Delhi".');
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(null);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return setError('Your browser does not support location.');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPin(pos.coords.latitude, pos.coords.longitude, 'My location');
        setFocus({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setError('Location permission was denied. Search or tap on the map instead.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const analyze = async (which) => {
    const pin = which === 'B' ? pinB : pinA;
    if (!pin) return setError(which === 'B' ? 'Drop pin B on the map first.' : 'Choose a location first.');
    setLoading(which);
    setError('');
    try {
      const res = await fetch('/api/advisor/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: pin.lat,
          lng: pin.lng,
          radius,
          budget: Number(budget) || undefined,
          interests,
          lang,
          explain: which === 'A', // one AI call per comparison is enough
        }),
      });
      const data = await readJSON(res);
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      if (which === 'B') setReportB(data);
      else {
        setReport(data);
        setSelectedId(data.ranked.find((r) => r.eligible)?.id || null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  return null;
}