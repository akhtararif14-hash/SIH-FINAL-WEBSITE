// lib/advisor/scoring.js
// The scoring engine. Pure functions only (no API calls), so it is easy to
// test and easy to explain to judges.
//
//   Score = 100 × Demand × Competition × EnvironmentFit
//
//   Demand      = w_pop·D1 + w_anchor·D2 + w_access·D3        (0 to 1)
//     D1 population  = min(people per km² ÷ 20,000, 1)
//     D2 anchors     = min(Σ weight × min(count, 3) ÷ 5, 1)
//     D3 access      = 0.4·roads + 0.45·transit + 0.15·parking
//   Competition = 1 ÷ (1 + S ÷ saturation)                    (0 to 1)
//     S = Σ competitor strength (1.0 strong, 0.6 medium, 0.3 weak,
//         0.7 when we have no rating, e.g. OpenStreetMap-only data)
//   EnvironmentFit = climate adjustment                        (0 to 1)

import { ANCHOR_TYPES, BUSINESSES, businessName } from './businesses';
import { buildSWOT } from './swot';
import { advisorT } from './i18n';
import { computeFinance } from './finance';

export const DENSITY_REF = 20000; // people/km² that counts as "full" demand
export const ANCHOR_REF = 5;
export const ANCHOR_CAP = 3; // 30 offices shouldn't count 10× more than 3
export const BASE_AREA_KM2 = Math.PI; // a 1 km circle — the size the saturation numbers were written for

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const r3 = (v) => Math.round(v * 1000) / 1000;

export function populationScore(population) {
  if (!population) return { value: 0.5, missing: true }; // neutral if WorldPop failed
  return { value: clamp01(population.density / DENSITY_REF), missing: false };
}

export function anchorScore(business, anchorCounts, lang = 'en') {
  const A = advisorT(lang);
  let total = 0;
  const parts = [];
  for (const [anchorId, weight] of Object.entries(business.anchors)) {
    const count = anchorCounts?.[anchorId] || 0;
    const contribution = weight * Math.min(count, ANCHOR_CAP);
    total += contribution;
    if (count > 0) parts.push({ anchorId, label: A(`anchor_${anchorId}`), count, contribution: r3(contribution) });
  }
  return { value: clamp01(total / ANCHOR_REF), total: r3(total), parts };
}

export function accessScore(anchorCounts, access) {
  const roads = clamp01((access?.majorRoads || 0) / 2);
  const transit = clamp01(((anchorCounts?.station || 0) * 1 + (anchorCounts?.busStop || 0) * 0.2) / 3);
  const parking = clamp01((access?.parking || 0) / 3);
  return { value: 0.4 * roads + 0.45 * transit + 0.15 * parking, roads, transit, parking };
}

export function competitorStrength(c) {
  if (c.rating == null) return 0.7; // unknown strength
  if (c.rating >= 4.0 && c.reviews >= 100) return 1.0;
  if (c.rating >= 3.0) return 0.6;
  return 0.3;
}

// A 10 km circle naturally holds far more shops than a 1 km circle, so the
// "how many competitors are too many" limit grows with the area studied.
// Without this, every business would score near zero at a large radius.
export function saturationFor(business, radius) {
  const areaKm2 = (Math.PI * radius * radius) / 1e6;
  const scale = Math.max(1, areaKm2 / BASE_AREA_KM2);
  return business.saturation * scale;
}

export function competitionScore(business, competitors, radius = 1000) {
  const list = competitors || [];
  const S = list.reduce((sum, c) => sum + competitorStrength(c), 0);
  const saturation = saturationFor(business, radius);
  return { value: 1 / (1 + S / saturation), S: r3(S), count: list.length, saturation: r3(saturation) };
}

export function environmentFit(business, climate, lang = 'en') {
  const A = advisorT(lang);
  if (!climate || business.climate !== 'hot') return { value: 1, reason: null };
  if (climate.hotDays >= 30) return { value: 1, reason: A('envHotMany', { n: climate.hotDays }) };
  if (climate.hotDays >= 5 || climate.avgMaxTemp >= 32) return { value: 0.85, reason: A('envWarm') };
  return { value: 0.6, reason: A('envMild') };
}

// Seasonal / single-source risk: how much of the anchor demand comes from ONE type.
export function concentrationRisk(anchor) {
  if (!anchor.parts.length || anchor.total === 0) return { share: 0, level: 'unknown', source: null };
  const top = anchor.parts.reduce((a, b) => (b.contribution > a.contribution ? b : a));
  const share = top.contribution / anchor.total;
  const level = share > 0.5 ? 'high' : share >= 0.3 ? 'medium' : 'low';
  return { share: r3(share), level, source: top.label };
}

export function scoreBusiness(business, data) {
  const D1 = populationScore(data.population);
  const D2 = anchorScore(business, data.osm?.anchors, data.lang);
  const D3 = accessScore(data.osm?.anchors, data.osm?.access);
  const w = business.weights;
  const demand = w.pop * D1.value + w.anchors * D2.value + w.access * D3.value;

  // Prefer Google competitors (they have ratings) when available, otherwise OSM.
  const competitors = data.placesCompetitors?.[business.id] || data.osm?.competitors?.[business.id] || [];
  const C = competitionScore(business, competitors, data.radius || 1000);
  const E = environmentFit(business, data.climate, data.lang);

  const score = 100 * demand * C.value * E.value;
  const result = {
    id: business.id,
    // Already in the user's language, so the cards, the SWOT, the saved
    // report and the AI prompt all agree on one name.
    name: businessName(business, data.lang),
    nameEn: business.name,
    category: business.category,
    categoryLabel: advisorT(data.lang)(`cat_${business.category}`),
    note: business.note || null,
    setupCost: business.setupCost,
    score: Math.round(score * 10) / 10,
    breakdown: {
      population: r3(D1.value),
      populationMissing: D1.missing,
      anchors: r3(D2.value),
      anchorParts: D2.parts,
      access: r3(D3.value),
      demand: r3(demand),
      weights: w,
      competitorStrengthSum: C.S,
      saturationLimit: C.saturation,
      competition: r3(C.value),
      environment: E.value,
      environmentReason: E.reason,
    },
    competitors: competitors.slice(0, 40),
    competitorCount: C.count,
    competitorSource: data.placesCompetitors?.[business.id] ? 'google' : 'osm',
    risk: concentrationRisk(D2),
  };

  // Money side: what it costs to start, what it may earn, payback time.
  result.finance = computeFinance(business.id, result, { population: data.population, budget: data.budget });
  // SWOT built from the same numbers — no invented content.
  result.swot = buildSWOT(result, { ...data, radius: data.radius, lang: data.lang }, result.finance);
  return result;
}

// Scores every business, applies budget + interest filters, sorts best first.
export function rankBusinesses(data, { budget, interests } = {}) {
  const results = BUSINESSES.map((b) => {
    const r = scoreBusiness(b, { ...data, budget });
    // Judge affordability by the FULL investment (rent deposit, stock, working
    // capital included), not just the equipment cost.
    const needed = r.finance?.totalInvestment || b.setupCost[0];
    const overBudget = budget ? needed > budget : false;
    const outOfInterest = interests?.length ? !interests.includes(b.category) : false;
    return { ...r, overBudget, outOfInterest, eligible: !overBudget && !outOfInterest };
  });
  results.sort((a, b) => Number(b.eligible) - Number(a.eligible) || b.score - a.score);
  return results;
}