// app/api/advisor/analyze/route.js
// POST {
//   lat, lng,              // required — the pin on the map
//   radius = 5000,         // metres, 500–10000 (slider on the page uses 5–10 km)
//   budget,                // ₹, optional
//   interests = [],        // ['food','retail','services','health','education'], optional
//   lang = 'en',           // explanation language
//   explain = true         // set false when comparing, to save AI calls
// }
// -> a full report: population, climate, anchors, ranked businesses, AI explanation.
export const runtime = 'nodejs';
export const maxDuration = 60; // seconds — Overpass + WorldPop can be slow

import {
  fetchOSM,
  fetchPopulation,
  fetchClimate,
  reverseGeocode,
  fetchPlacesCompetitors,
  placesAvailable,
  placesTopN,
  placesReviewsEnabled,
} from '@/lib/advisor/sources';
import { rankBusinesses } from '@/lib/advisor/scoring';
import { explainReport } from '@/lib/advisor/explain';
import { CATEGORIES } from '@/lib/advisor/businesses';

// Runs a promise; on failure records a warning and returns null instead of throwing.
async function safe(label, promise, warnings) {
  try {
    return await promise;
  } catch (err) {
    console.warn(`[advisor] ${label} failed:`, err.message);
    warnings.push(`${label} data unavailable right now (${err.message}).`);
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return Response.json({ error: 'Valid "lat" and "lng" are required' }, { status: 400 });
    }
    const radius = Math.min(10000, Math.max(500, Number(body.radius) || 5000));
    const budget = Number(body.budget) > 0 ? Number(body.budget) : null;
    const interests = Array.isArray(body.interests) ? body.interests.filter((c) => CATEGORIES.includes(c)) : [];
    const lang = ['en', 'hi', 'ur', 'bn'].includes(body.lang) ? body.lang : 'en';

    const warnings = [];

    // Step 1: call all free sources AT THE SAME TIME (much faster than one by one).
    const [place, osm, population, climate] = await Promise.all([
      safe('Address', reverseGeocode(lat, lng), warnings),
      safe('OpenStreetMap', fetchOSM(lat, lng, radius), warnings),
      safe('Population', fetchPopulation(lat, lng, radius), warnings),
      safe('Climate', fetchClimate(lat, lng), warnings),
    ]);

    if (!osm) {
      return Response.json(
        { error: 'Could not load map data for this spot. Please try again in a minute.', warnings },
        { status: 502 }
      );
    }

    const data = { osm, population, climate, radius, budget, anchors: osm.anchors, access: osm.access, placesCompetitors: null };
    let ranked = rankBusinesses(data, { budget, interests });

    // Step 2 (optional): if a Google key exists, fetch real ratings for the
    // top 3 ideas only, then re-score. Keeps you inside the free allowance.
    if (placesAvailable()) {
      const top3 = ranked.filter((r) => r.eligible).slice(0, placesTopN());
      const lists = await Promise.all(
        top3.map((r) => safe(`Google Places (${r.name})`, fetchPlacesCompetitors(r.id, lat, lng, radius), warnings))
      );
      data.placesCompetitors = {};
      top3.forEach((r, i) => {
        const g = lists[i];
        const osmCount = osm.competitors[r.id]?.length || 0;
        // OSM misses many small Indian shops, Google misses some too — keep the bigger list.
        if (g && g.length >= osmCount) data.placesCompetitors[r.id] = g;
      });
      ranked = rankBusinesses(data, { budget, interests });
    }

    // Pull out what customers complain about near here, for the AI to summarise.
    const reviewNotes = [];
    if (placesReviewsEnabled() && data.placesCompetitors) {
      for (const [bizId, list] of Object.entries(data.placesCompetitors)) {
        for (const c of list) {
          for (const rv of c.reviewTexts || []) {
            reviewNotes.push({ business: bizId, shop: c.name, rating: rv.rating, text: rv.text });
          }
        }
      }
    }

    // Data-coverage check: in many Indian neighbourhoods OpenStreetMap has only a
    // fraction of the real shops mapped, which makes competition look lower
    // than it is. Warn the user honestly instead of hiding it.
    const mappedShops = new Set(
      Object.values(osm.competitors).flat().map((c) => `${c.lat},${c.lng}`)
    ).size;
    const shopsPer1000 = population?.people ? (mappedShops / population.people) * 1000 : null;
    const dataConfidence =
      data.placesCompetitors && Object.keys(data.placesCompetitors).length ? 'good'
      : shopsPer1000 == null ? 'unknown'
      : shopsPer1000 < 0.5 ? 'low'
      : shopsPer1000 < 2 ? 'medium'
      : 'good';
    if (dataConfidence === 'low') {
      warnings.push(
        `Only ${mappedShops} shop${mappedShops === 1 ? "" : "s"} ${mappedShops === 1 ? "is" : "are"} mapped on OpenStreetMap for ${population.people.toLocaleString('en-IN')} people here, so competitor counts are probably too low. Add a Google Places key or check the street in person.`
      );
    }

    const report = {
      reviewNotes: reviewNotes.slice(0, 24),
      dataConfidence,
      mappedShops,
      location: { lat, lng, label: place?.label || `${lat.toFixed(4)}, ${lng.toFixed(4)}`, ...(place || {}) },
      radius,
      budget,
      interests,
      population,
      climate,
      anchors: osm.anchors,
      access: osm.access,
      ranked,
      warnings,
      sources: [
        'OpenStreetMap contributors (Overpass API, Nominatim)',
        population ? 'WorldPop 2020 population grid' : null,
        climate ? 'Open-Meteo historical weather' : null,
        data.placesCompetitors ? 'Google Places' : null,
      ].filter(Boolean),
      generatedAt: new Date().toISOString(),
    };

    // Step 3: let the AI explain the numbers (skipped when comparing).
    if (body.explain !== false) {
      const { text, model } = await explainReport(report, lang);
      report.explanation = text;
      report.explanationModel = model;
      if (!text) warnings.push('AI explanation unavailable — the scores above are still valid.');
    }

    return Response.json(report);
  } catch (err) {
    console.error('Error in /api/advisor/analyze:', err);
    return Response.json({ error: 'Something went wrong on the server' }, { status: 500 });
  }
}