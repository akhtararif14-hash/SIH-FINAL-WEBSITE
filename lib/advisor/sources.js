// lib/advisor/sources.js
// All the FREE data sources in one file. Each function returns plain JS objects
// and throws on failure — the analyze route catches errors per source so one
// broken API never breaks the whole report.
//
//  Source          | What we get                         | Key needed?
//  ----------------|-------------------------------------|------------------
//  Nominatim (OSM) | place name  <->  lat/lng            | No (1 req/sec max)
//  Overpass (OSM)  | competitors, anchors, roads, transit | No
//  WorldPop        | people living inside the circle     | No
//  Open-Meteo      | last 12 months of weather + height   | No
//  Google Places   | competitor ratings (OPTIONAL)        | Yes + billing

import { ANCHOR_TYPES, BUSINESSES, matchesTags } from './businesses';

// Nominatim's rules require an identifying User-Agent. Put your email in .env.local.
const USER_AGENT = `SriGen-BusinessAdvisor/1.0 (${process.env.CONTACT_EMAIL || 'contact@example.com'})`;

async function fetchJSON(url, options = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, ...(options.headers || {}) },
    });
    if (!res.ok) throw new Error(`${new URL(url).host} answered ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// Very small in-memory cache. On Vercel it lives as long as the server
// instance stays warm, which is enough to avoid hammering the free APIs
// during a demo. (Upgrade later: store results in Firestore.)
const cache = new Map();
export async function cached(key, ttlMs, fn) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value;
  const value = await fn();
  cache.set(key, { at: Date.now(), value });
  return value;
}

const DAY = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// 1. Nominatim — search text -> coordinates, and coordinates -> address
// ---------------------------------------------------------------------------
export function geocodeSearch(q) {
  const url =
    'https://nominatim.openstreetmap.org/search?' +
    new URLSearchParams({ q, format: 'jsonv2', countrycodes: 'in', limit: '5', addressdetails: '1' });
  return cached(`geo:${q.toLowerCase()}`, 30 * DAY, async () => {
    const rows = await fetchJSON(url);
    return rows.map((r) => ({
      label: r.display_name,
      lat: Number(r.lat),
      lng: Number(r.lon),
    }));
  });
}

export function reverseGeocode(lat, lng) {
  const url =
    'https://nominatim.openstreetmap.org/reverse?' +
    new URLSearchParams({ lat: String(lat), lon: String(lng), format: 'jsonv2', zoom: '16' });
  return cached(`rev:${lat.toFixed(4)},${lng.toFixed(4)}`, 30 * DAY, async () => {
    const r = await fetchJSON(url);
    const a = r.address || {};
    return {
      label: r.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      area: a.suburb || a.neighbourhood || a.village || a.town || a.city_district || a.city || '',
      district: a.state_district || a.county || '',
      state: a.state || '',
    };
  });
}

// ---------------------------------------------------------------------------
// 2. Overpass — every shop, anchor, road and transit stop around the pin,
//    fetched in ONE request, then sorted into buckets in JavaScript.
// ---------------------------------------------------------------------------
const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

// Turns [['amenity',['cafe','school']], ['office','*']] into Overpass lines.
function selectorLines(selectors, radius, lat, lng) {
  const byKey = new Map();
  for (const [key, values] of selectors) {
    if (values === '*') byKey.set(key, '*');
    else if (byKey.get(key) !== '*') byKey.set(key, [...new Set([...(byKey.get(key) || []), ...values])]);
  }
  return [...byKey.entries()].map(([key, values]) =>
    values === '*'
      ? `nwr["${key}"](around:${radius},${lat},${lng});`
      : `nwr["${key}"~"^(${values.join('|')})$"](around:${radius},${lat},${lng});`
  );
}

// How many map features we accept back. A 10 km circle in a big city can hold
// tens of thousands, which is too slow for a serverless function, so we cap it.
export const OSM_ELEMENT_LIMIT = 4000;
// Customers do not travel 10 km for a local shop, so colleges, offices and bus
// stops are only counted near the pin. This also keeps the query small and fast.
export const ANCHOR_RADIUS_MAX = 3000;

export function buildOverpassQuery(lat, lng, radius) {
  const shopSelectors = BUSINESSES.flatMap((b) => b.competitors);
  const anchorSelectors = Object.values(ANCHOR_TYPES).flatMap((a) => a.tags);
  const anchorRadius = Math.min(radius, ANCHOR_RADIUS_MAX);
  const lines = [
    ...selectorLines(shopSelectors, radius, lat, lng),
    ...selectorLines(anchorSelectors, anchorRadius, lat, lng),
    // accessibility: big roads close by, and parking
    `way["highway"~"^(motorway|trunk|primary|secondary)$"](around:300,${lat},${lng});`,
    `nwr["amenity"="parking"](around:500,${lat},${lng});`,
  ];
  return `[out:json][timeout:40];\n(\n  ${lines.join('\n  ')}\n);\nout tags center ${OSM_ELEMENT_LIMIT};`;
}

export async function fetchOSM(lat, lng, radius) {
  const key = `osm:${lat.toFixed(4)},${lng.toFixed(4)},${radius}`;
  return cached(key, 7 * DAY, async () => {
    // Try the full radius on both servers. If the area is too busy or the free
    // servers are rate-limiting us, try once more with a small 2 km circle so
    // the user still gets a report instead of an error.
    const attempts = radius > 2000 ? [radius, 2000] : [radius];
    let lastErr;

    for (const tryRadius of attempts) {
      const query = buildOverpassQuery(lat, lng, tryRadius);
      for (const server of OVERPASS_SERVERS) {
        try {
          const data = await fetchJSON(
            server,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: 'data=' + encodeURIComponent(query),
            },
            45000 // fail before Vercel's 60 s limit, so the user gets a real message
          );
          const result = classifyOSM(data.elements || []);
          result.usedRadius = tryRadius;
          result.reducedRadius = tryRadius !== radius;
          return result;
        } catch (err) {
          console.warn(`[advisor] Overpass ${server} at ${tryRadius} m failed:`, err.message);
          lastErr = err;
        }
      }
    }
    throw lastErr;
  });
}

// Sorts raw OSM elements into: competitors per business, anchor counts,
// and accessibility counts. Exported so it can be unit-tested offline.
export function classifyOSM(elements) {
  const competitors = Object.fromEntries(BUSINESSES.map((b) => [b.id, []]));
  const anchors = Object.fromEntries(Object.keys(ANCHOR_TYPES).map((k) => [k, 0]));
  const access = { majorRoads: 0, parking: 0 };

  for (const el of elements) {
    const tags = el.tags || {};
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;

    if (el.type === 'way' && /^(motorway|trunk|primary|secondary)$/.test(tags.highway || '')) {
      access.majorRoads++;
      continue;
    }
    if (tags.amenity === 'parking') {
      access.parking++;
      continue;
    }
    for (const b of BUSINESSES) {
      if (matchesTags(tags, b.competitors)) {
        competitors[b.id].push({ name: tags.name || tags['name:en'] || 'Unnamed shop', lat, lng });
      }
    }
    for (const [anchorId, a] of Object.entries(ANCHOR_TYPES)) {
      if (matchesTags(tags, a.tags)) anchors[anchorId]++;
    }
  }
  return {
    competitors,
    anchors,
    access,
    // True when we hit the cap, so the report can say counts are partial.
    truncated: elements.length >= OSM_ELEMENT_LIMIT,
    elementCount: elements.length,
  };
}

// ---------------------------------------------------------------------------
// 3. WorldPop — how many people live inside the circle (2020 estimate, ~100 m grid)
// ---------------------------------------------------------------------------
export function circlePolygon(lat, lng, radius, points = 32) {
  const coords = [];
  const dLat = radius / 111320; // metres per degree of latitude
  const dLng = radius / (111320 * Math.cos((lat * Math.PI) / 180));
  for (let i = 0; i <= points; i++) {
    const t = (2 * Math.PI * i) / points;
    coords.push([+(lng + dLng * Math.cos(t)).toFixed(6), +(lat + dLat * Math.sin(t)).toFixed(6)]);
  }
  return {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [coords] } }],
  };
}

export async function fetchPopulation(lat, lng, radius) {
  const key = `pop:${lat.toFixed(3)},${lng.toFixed(3)},${radius}`;
  return cached(key, 30 * DAY, async () => {
    const url =
      'https://api.worldpop.org/v1/services/stats?' +
      new URLSearchParams({
        dataset: 'wpgppop',
        year: '2020',
        geojson: JSON.stringify(circlePolygon(lat, lng, radius)),
      });
    let res = await fetchJSON(url);
    // The API works as a queue: it gives a task id, and we poll until it's done.
    for (let i = 0; i < 20 && res.status !== 'finished'; i++) {
      if (res.error) throw new Error(res.error_message || 'WorldPop error');
      if (!res.taskid) break;
      await new Promise((r) => setTimeout(r, 750));
      res = await fetchJSON(`https://api.worldpop.org/v1/tasks/${res.taskid}`);
    }
    const total = res?.data?.total_population;
    if (typeof total !== 'number') throw new Error('WorldPop did not return a population');
    const areaKm2 = (Math.PI * radius * radius) / 1e6;
    return { people: Math.round(total), areaKm2, density: Math.round(total / areaKm2), year: 2020 };
  });
}

// ---------------------------------------------------------------------------
// 4. Open-Meteo — the last 12 months of daily weather at this point
// ---------------------------------------------------------------------------
export async function fetchClimate(lat, lng) {
  const end = new Date(Date.now() - 7 * DAY); // archive lags a few days behind today
  const start = new Date(end.getTime() - 364 * DAY);
  const iso = (d) => d.toISOString().slice(0, 10);
  const url =
    'https://archive-api.open-meteo.com/v1/archive?' +
    new URLSearchParams({
      latitude: lat.toFixed(3),
      longitude: lng.toFixed(3),
      start_date: iso(start),
      end_date: iso(end),
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
      timezone: 'auto',
    });
  return cached(`clim:${lat.toFixed(2)},${lng.toFixed(2)}`, 30 * DAY, async () =>
    summariseClimate(await fetchJSON(url))
  );
}

// Exported for offline testing.
export function summariseClimate(data) {
  const d = data.daily || {};
  const tmax = (d.temperature_2m_max || []).filter((v) => v != null);
  const tmin = (d.temperature_2m_min || []).filter((v) => v != null);
  const rain = (d.precipitation_sum || []).filter((v) => v != null);
  const avg = (arr) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null);
  const round1 = (v) => (v == null ? null : Math.round(v * 10) / 10);
  return {
    avgMaxTemp: round1(avg(tmax)),
    avgMinTemp: round1(avg(tmin)),
    hottestDay: round1(tmax.length ? Math.max(...tmax) : null),
    hotDays: tmax.filter((v) => v >= 40).length, // days at or above 40 °C
    annualRainMm: Math.round(rain.reduce((s, v) => s + v, 0)),
    rainyDays: rain.filter((v) => v >= 2.5).length, // IMD "rainy day" = 2.5 mm or more
    heaviestRainMm: round1(rain.length ? Math.max(...rain) : null),
    elevationM: data.elevation ?? null,
  };
}

// ---------------------------------------------------------------------------
// 5. Google Places (OPTIONAL) — ratings of competitors.
//    Only runs if GOOGLE_MAPS_API_KEY is set. Needs a billing account with a
//    card, but Google gives a monthly free allowance. We only call it for the
//    top 3 businesses per report to stay inside that allowance.
// ---------------------------------------------------------------------------
const PLACES_TYPES = {
  cafe: ['cafe', 'coffee_shop', 'tea_house'],
  restaurant: ['restaurant', 'fast_food_restaurant'],
  bakery: ['bakery', 'confectionery'],
  juice: ['ice_cream_shop', 'juice_shop'],
  grocery: ['grocery_store', 'convenience_store', 'supermarket'],
  pharmacy: ['pharmacy', 'drugstore'],
  stationery: ['book_store'],
  mobile: ['cell_phone_store', 'electronics_store'],
  salon: ['hair_salon', 'beauty_salon', 'barber_shop'],
  laundry: ['laundry'],
  gym: ['gym', 'fitness_center'],
  hardware: ['hardware_store', 'home_improvement_store'],
  tailor: ['tailor'],
  coaching: ['school'],
  // appliance_repair has no matching Google type, so it always uses OpenStreetMap.
};

// Which businesses Google can be asked about at all.
export function placesSupports(businessId) {
  return Boolean(PLACES_TYPES[businessId]);
}

export function placesAvailable() {
  return Boolean(process.env.GOOGLE_MAPS_API_KEY);
}

// How many business types get real Google data per report.
// Each one costs 1 Places call, so keep it small on the free allowance
// and raise it (e.g. 8) while you have trial credit.
export function placesTopN() {
  const n = Number(process.env.PLACES_TOP_N);
  return Number.isFinite(n) && n > 0 ? Math.min(12, n) : 3;
}

// Reviews cost more per call, so they are off unless you ask for them.
export function placesReviewsEnabled() {
  return process.env.PLACES_REVIEWS === 'true';
}

export async function fetchPlacesCompetitors(businessId, lat, lng, radius) {
  const types = PLACES_TYPES[businessId];
  if (!types || !placesAvailable()) return null;
  const key = `places:${businessId}:${lat.toFixed(4)},${lng.toFixed(4)},${radius}`;
  return cached(key, 7 * DAY, async () => {
    const data = await fetchJSON('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': placesReviewsEnabled()
          ? 'places.displayName,places.location,places.rating,places.userRatingCount,places.reviews'
          : 'places.displayName,places.location,places.rating,places.userRatingCount',
      },
      body: JSON.stringify({
        includedTypes: types,
        maxResultCount: 20,
        locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius } },
      }),
    });
    return (data.places || []).map((p) => ({
      name: p.displayName?.text || 'Unnamed',
      lat: p.location?.latitude,
      lng: p.location?.longitude,
      rating: p.rating ?? null,
      reviews: p.userRatingCount ?? 0,
      // What customers actually wrote — only present when PLACES_REVIEWS=true.
      reviewTexts: (p.reviews || [])
        .slice(0, 3)
        .map((rv) => ({
          rating: rv.rating ?? null,
          text: (rv.text?.text || rv.originalText?.text || '').slice(0, 300),
        }))
        .filter((rv) => rv.text),
    }));
  });
}
