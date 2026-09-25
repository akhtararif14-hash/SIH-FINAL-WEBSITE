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
      const data = await res.json();
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
      const data = await res.json();
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

  const toggleInterest = (id) =>
    setInterests((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const eligible = report?.ranked.filter((r) => r.eligible) || [];
  const filteredOut = report?.ranked.filter((r) => !r.eligible) || [];
  const selected = report?.ranked.find((r) => r.id === selectedId);
  const displayName = (r) => (lang === 'hi' && r.nameHi ? r.nameHi : r.name);

  return (
    <div className="page" style={{ maxWidth: 1040 }}>
      <h1 style={s.title}>{t('locationAdvisor')}</h1>
      <p style={s.subtitle}>{t('locationAdvisorSub')}</p>

      {/* ---------------- STEP 1: location ---------------- */}
      <section style={s.card}>
        <div style={s.stepLabel}>1 · Choose the location</div>
        <form onSubmit={search} style={s.row}>
          <input
            style={s.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a place, e.g. Batla House, Delhi"
          />
          <button type="submit" style={s.btnPrimary} disabled={loading === 'search'}>
            {loading === 'search' ? 'Searching…' : 'Search'}
          </button>
          <button type="button" style={s.btnSecondary} onClick={useMyLocation}>
            📍 My location
          </button>
        </form>

        {searchResults.length > 0 && (
          <div style={s.results}>
            {searchResults.map((r) => (
              <button
                key={`${r.lat},${r.lng}`}
                style={s.resultItem}
                onClick={() => {
                  setPin(r.lat, r.lng, r.label);
                  setFocus({ lat: r.lat, lng: r.lng });
                  setSearchResults([]);
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        <div style={s.pickRow}>
          <span style={{ color: 'var(--ink-muted)', fontSize: 13.5 }}>Tap on the map to set:</span>
          {['A', 'B'].map((p) => (
            <button
              key={p}
              style={{ ...s.chip, ...(picking === p ? s.chipOn : {}) }}
              onClick={() => setPicking(p)}
              disabled={p === 'B' && !report}
              title={p === 'B' && !report ? 'Analyse location A first' : ''}
            >
              Pin {p}
              {p === 'B' ? ' (compare)' : ''}
            </button>
          ))}
        </div>

        <AdvisorMap
          pinA={pinA}
          pinB={pinB}
          radius={radius}
          focus={focus}
          competitors={selected?.competitors || []}
          onPick={(lat, lng) => setPin(lat, lng)}
        />
        {pinA && (
          <div style={s.pinText}>
            A: {pinA.label || `${pinA.lat.toFixed(5)}, ${pinA.lng.toFixed(5)}`}
            {pinB && <> &nbsp;·&nbsp; B: {pinB.label || `${pinB.lat.toFixed(5)}, ${pinB.lng.toFixed(5)}`}</>}
          </div>
        )}
      </section>

      {/* ---------------- STEP 2: preferences ---------------- */}
      <section style={s.card}>
        <div style={s.stepLabel}>2 · Your preferences</div>
        <div style={s.grid2}>
          <label style={s.field}>
            <span style={s.fieldLabel}>Area to study: {(radius / 1000).toFixed(1)} km around the pin</span>
            <input type="range" min={5000} max={10000} step={500} value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
            <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
              5 km = your immediate market · 10 km = the wider town. A bigger circle takes longer to study.
            </span>
          </label>
          <label style={s.field}>
            <span style={s.fieldLabel}>Budget (₹) — optional</span>
            <input
              style={s.input}
              type="number"
              min={0}
              step={10000}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 300000"
            />
          </label>
        </div>
        <div style={{ ...s.fieldLabel, marginTop: 14 }}>Interested in (leave empty for all):</div>
        <div style={s.row}>
          {INTERESTS.map((i) => (
            <button key={i.id} style={{ ...s.chip, ...(interests.includes(i.id) ? s.chipOn : {}) }} onClick={() => toggleInterest(i.id)}>
              {i.label}
            </button>
          ))}
        </div>

        <button style={{ ...s.btnBig, opacity: pinA ? 1 : 0.5 }} onClick={() => analyze('A')} disabled={!!loading}>
          {loading === 'A' ? 'Studying this area…' : 'Find the best business here →'}
        </button>
        {loading === 'A' && <AnalyzingPanel radius={radius} />}
      </section>

      {error && <div style={s.error}>{error}</div>}

      {/* ---------------- RESULTS ---------------- */}
      {report && (
        <>
          <section style={s.card}>
            <div style={s.stepLabel}>What we found around A</div>
            <div style={s.statGrid}>
              <Stat
                label="People living in this circle"
                value={report.population ? report.population.people.toLocaleString('en-IN') : 'n/a'}
                sub={report.population ? `${report.population.density.toLocaleString('en-IN')} per km² (WorldPop ${report.population.year})` : 'population data unavailable'}
              />
              <Stat
                label="Average day temperature"
                value={report.climate?.avgMaxTemp != null ? `${report.climate.avgMaxTemp} °C` : 'n/a'}
                sub={report.climate ? `${report.climate.hotDays} days ≥ 40 °C last year` : ''}
              />
              <Stat
                label="Rain last 12 months"
                value={report.climate ? `${report.climate.annualRainMm} mm` : 'n/a'}
                sub={report.climate ? `${report.climate.rainyDays} rainy days` : ''}
              />
              <Stat
                label="Height above sea level"
                value={report.climate?.elevationM != null ? `${Math.round(report.climate.elevationM)} m` : 'n/a'}
                sub=""
              />
            </div>
            <div style={{ ...s.row, marginTop: 12 }}>
              {Object.entries(report.anchors)
                .filter(([, n]) => n > 0)
                .map(([k, n]) => (
                  <span key={k} style={s.tag}>
                    {n} {ANCHOR_SHORT[k] || k}
                  </span>
                ))}
            </div>
            <div style={{ fontSize: 13, marginTop: 10, color: 'var(--ink-muted)' }}>
              Data confidence:{' '}
              <b style={{ color: RISK_COLORS[{ good: 'low', medium: 'medium', low: 'high' }[report.dataConfidence] || 'unknown'] }}>
                {report.dataConfidence}
              </b>{' '}
              ({report.mappedShops} shop{report.mappedShops === 1 ? "" : "s"} mapped in this circle)
              <InfoBlock label="data confidence" info={getParamInfo('confidence', eligible[0] || report.ranked[0], report)} />
            </div>
            {report.warnings?.length > 0 && (
              <ul style={s.warnings}>
                {report.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
          </section>

          {report.explanation && (
            <section style={{ ...s.card, background: 'var(--leaf-pale)' }}>
              <div style={s.stepLabel}>🤖 AI advisor says</div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65, fontSize: 15 }}>{report.explanation}</div>
            </section>
          )}

          <section style={s.card}>
            <div style={s.stepLabel}>Best business ideas for A (tap one to see its competitors on the map)</div>
            {eligible.length === 0 && <p>No business fits these filters. Try a bigger budget or fewer interests.</p>}
            {eligible.slice(0, 8).map((r, i) => (
              <BusinessCard
                key={r.id}
                rank={i + 1}
                r={r}
                ctx={report}
                name={displayName(r)}
                selected={r.id === selectedId}
                onClick={() => setSelectedId(r.id)}
              />
            ))}
            {filteredOut.length > 0 && (
              <details style={{ marginTop: 12 }}>
                <summary style={{ cursor: 'pointer', color: 'var(--ink-muted)' }}>
                  {filteredOut.length} ideas hidden by your filters
                </summary>
                {filteredOut.map((r) => (
                  <div key={r.id} style={{ fontSize: 13.5, padding: '4px 0', color: 'var(--ink-muted)' }}>
                    {displayName(r)} — score {r.score}
                    {r.overBudget ? ` · needs at least ${rupees(r.setupCost[0])}` : ''}
                    {r.outOfInterest ? ' · not in chosen interests' : ''}
                  </div>
                ))}
              </details>
            )}
          </section>

          {/* ---------------- COMPARE ---------------- */}
          <section style={s.card}>
            <div style={s.stepLabel}>Compare with another location</div>
            {!pinB ? (
              <p style={{ margin: 0 }}>
                Select <b>Pin B</b> above, then tap a second spot on the map (or search for it).
                <button style={{ ...s.btnSecondary, marginLeft: 10 }} onClick={() => setPicking('B')}>
                  Set pin B
                </button>
              </p>
            ) : !reportB ? (
              <>
                <button style={s.btnPrimary} onClick={() => analyze('B')} disabled={!!loading}>
                  {loading === 'B' ? 'Studying location B…' : 'Analyse location B'}
                </button>
                {loading === 'B' && <AnalyzingPanel radius={radius} />}
              </>
            ) : (
              <CompareTable a={report} b={reportB} displayName={displayName} />
            )}
          </section>

          <p style={{ fontSize: 12.5, color: 'var(--ink-muted)' }}>
            Data: {report.sources.join(' · ')}. Scores are estimates to guide your research — visit the area at different
            times of day before investing.
          </p>
        </>
      )}
    </div>
  );
}

const ANCHOR_SHORT = {
  college: 'colleges',
  school: 'schools',
  hospital: 'hospitals',
  clinic: 'clinics',
  station: 'stations',
  busStop: 'bus stops',
  office: 'offices',
  market: 'markets/malls',
  hotel: 'hotels/hostels',
  worship: 'places of worship',
};

// Shown while a location is being studied. The steps are the real work the
// server is doing, so the user can see progress instead of a frozen button.
const ANALYZE_STEPS = [
  'Finding the address of your pin…',
  'Reading every shop and landmark on the map…',
  'Counting the people who live inside your circle…',
  'Checking last 12 months of weather…',
  'Scoring 15 businesses against the data…',
  'Writing your advice in simple words…',
];

function AnalyzingPanel({ radius }) {
  const [step, setStep] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => setSeconds((v) => v + 1), 1000);
    const next = setInterval(() => setStep((v) => Math.min(v + 1, ANALYZE_STEPS.length - 1)), 3500);
    return () => {
      clearInterval(tick);
      clearInterval(next);
    };
  }, []);

  return (
    <div style={s.loadingBox} role="status" aria-live="polite">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span className="spinner" />
        <span style={{ fontWeight: 700, color: 'var(--forest)' }}>
          Studying {(radius / 1000).toFixed(1)} km around your pin
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 12.5, color: 'var(--ink-muted)' }}>{seconds}s</span>
      </div>

      <div className="progress-track">
        <div className="progress-fill" />
      </div>

      <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0 }}>
        {ANALYZE_STEPS.map((label, i) => (
          <li
            key={label}
            style={{
              fontSize: 13,
              padding: '3px 0',
              color: i < step ? 'var(--forest)' : i === step ? 'var(--ink)' : 'var(--ink-muted)',
              opacity: i > step ? 0.5 : 1,
            }}
          >
            {i < step ? '✓' : i === step ? '→' : '•'} {label}
          </li>
        ))}
      </ul>

      <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 8 }}>
        A bigger circle takes longer. The same spot loads instantly next time.
      </div>
    </div>
  );
}