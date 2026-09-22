// app/api/advisor/geocode/route.js
// POST { q: "Jamia Nagar, Delhi" }      -> { results: [{ label, lat, lng }] }
// POST { lat: 28.56, lng: 77.28 }       -> { place: { label, area, district, state } }
// Runs on the server so every user shares one cache and we respect
// Nominatim's 1-request-per-second rule.
export const runtime = 'nodejs';

import { geocodeSearch, reverseGeocode } from '@/lib/advisor/sources';

export async function POST(request) {
  try {
    const body = await request.json();
    if (typeof body.q === 'string' && body.q.trim().length >= 3) {
      const results = await geocodeSearch(body.q.trim());
      return Response.json({ results });
    }
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return Response.json({ place: await reverseGeocode(lat, lng) });
    }
    return Response.json({ error: 'Send { q } (3+ letters) or { lat, lng }' }, { status: 400 });
  } catch (err) {
    console.error('Error in /api/advisor/geocode:', err.message);
    return Response.json({ error: 'Location search failed. Try again in a moment.' }, { status: 502 });
  }
}