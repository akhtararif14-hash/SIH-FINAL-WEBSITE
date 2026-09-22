'use client';
// app/advisor/AdvisorClient.js
// The "Location Advisor" page:
//   1. user picks a spot (search / GPS / tap on map)
//   2. sets radius, budget, interests
//   3. gets ranked business ideas with the score breakdown + AI explanation
//   4. can compare the same ideas at a second spot (B)

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslate } from '@/lib/LanguageProvider';

const AdvisorMap = dynamic(() => import('@/components/advisor/AdvisorMap'), {
  ssr: false,
  loading: () => <div style={{ height: 380, borderRadius: 14, background: 'var(--leaf-pale)' }} />,
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
  const [radius, setRadius] = useState(1000);
  const [budget, setBudget] = useState('');
  const [interests, setInterests] = useState([]);

  // --- output state ---
  const [loading, setLoading] = useState(null); // 'A' | 'B' | 'search' | null
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [reportB, setReportB] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

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
            <span style={s.fieldLabel}>Area to study: {radius >= 1000 ? `${radius / 1000} km` : `${radius} m`} around the pin</span>
            <input type="range" min={300} max={3000} step={100} value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
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
          {loading === 'A' ? 'Studying this area… (10–20 s)' : 'Find the best business here →'}
        </button>
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
              <div style={s.stepLabel}> AI advisor says</div>
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
              <button style={s.btnPrimary} onClick={() => analyze('B')} disabled={!!loading}>
                {loading === 'B' ? 'Studying location B…' : 'Analyse location B'}
              </button>
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

function Stat({ label, value, sub }) {
  return (
    <div style={s.stat}>
      <div style={{ fontSize: 12.5, color: 'var(--ink-muted)' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--forest)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{sub}</div>}
    </div>
  );
}

function Bar({ label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
      <span style={{ width: 150, color: 'var(--ink-muted)' }}>{label}</span>
      <div style={{ flex: 1, height: 10, background: 'var(--border)', borderRadius: 5 }}>
        <div style={{ width: `${Math.round(value * 100)}%`, height: '100%', background: color, borderRadius: 5 }} />
      </div>
      <span style={{ width: 40, textAlign: 'right' }}>{value.toFixed(2)}</span>
    </div>
  );
}

const RISK_COLORS = { low: '#2e7d32', medium: '#b7791f', high: '#c0392b', unknown: '#7a6f63' };

function BusinessCard({ rank, r, name, selected, onClick }) {
  const b = r.breakdown;
  return (
    <div onClick={onClick} style={{ ...s.biz, ...(selected ? s.bizSelected : {}) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={s.rank}>{rank}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{name}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
            {r.competitorCount} existing shop{r.competitorCount === 1 ? '' : 's'} nearby ({r.competitorSource === 'google' ? 'Google' : 'OpenStreetMap'}) · setup{' '}
            {rupees(r.setupCost[0])}–{rupees(r.setupCost[1])}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--forest)' }}>{r.score}</div>
          <div style={{ fontSize: 11.5, color: RISK_COLORS[r.risk.level] }}>
            {r.risk.level === 'unknown' ? 'risk: n/a' : `${r.risk.level} risk`}
          </div>
        </div>
      </div>

      {selected && (
        <div style={{ marginTop: 12, display: 'grid', gap: 6 }}>
          <Bar label="Demand" value={b.demand} color="var(--forest)" />
          <Bar label="  · population" value={b.population} color="var(--leaf)" />
          <Bar label="  · nearby anchors" value={b.anchors} color="var(--leaf)" />
          <Bar label="  · accessibility" value={b.access} color="var(--leaf)" />
          <Bar label="Low competition" value={b.competition} color="var(--tan)" />
          {b.environment < 1 && <Bar label="Climate fit" value={b.environment} color="var(--brown)" />}
          <div style={{ fontSize: 12.5, color: 'var(--ink-muted)', marginTop: 4 }}>
            Score = 100 × {b.demand} × {b.competition}
            {b.environment < 1 ? ` × ${b.environment}` : ''} = {r.score}
            {b.anchorParts.length > 0 && <> · Customers come from: {b.anchorParts.map((p) => `${p.count} ${p.label.toLowerCase()}`).join(', ')}</>}
            {r.risk.level === 'high' && <> · ⚠ {Math.round(r.risk.share * 100)}% of anchor demand depends on {r.risk.source.toLowerCase()}</>}
            {b.environmentReason && <> · {b.environmentReason}</>}
            {b.populationMissing && <> · population unavailable, neutral value used</>}
            {r.note && <> · Note: {r.note}</>}
          </div>
        </div>
      )}
    </div>
  );
}

function CompareTable({ a, b, displayName }) {
  const rows = a.ranked
    .filter((r) => r.eligible)
    .slice(0, 8)
    .map((ra) => ({ ra, rb: b.ranked.find((x) => x.id === ra.id) }));
  const best = rows[0];
  const diff = best && best.rb ? best.rb.score - best.ra.score : 0;
  // "% higher" is measured against the LOWER of the two scores.
  const low = best && best.rb ? Math.min(best.ra.score, best.rb.score) : 0;
  const pct = low > 0 ? Math.round((Math.abs(diff) / low) * 100) : null;

  return (
    <>
      {best && best.rb && (
        <p style={{ fontSize: 15.5, marginTop: 0 }}>
          For <b>{displayName(best.ra)}</b>: location <b>{diff > 0 ? 'B' : 'A'}</b> scores{' '}
          <b>{diff === 0 ? 'the same' : pct != null ? `${pct}% higher` : 'higher'}</b> ({best.ra.score} vs {best.rb.score}).
          {diff > 0 && best.ra.breakdown.demand > best.rb.breakdown.demand && ' A has more demand, but B has far less competition.'}
        </p>
      )}
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Business</th>
            <th style={s.th}>A</th>
            <th style={s.th}>B</th>
            <th style={s.th}>Shops A / B</th>
            <th style={s.th}>Better</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ ra, rb }) => (
            <tr key={ra.id}>
              <td style={s.td}>{displayName(ra)}</td>
              <td style={s.td}>{ra.score}</td>
              <td style={s.td}>{rb ? rb.score : '–'}</td>
              <td style={s.td}>
                {ra.competitorCount} / {rb ? rb.competitorCount : '–'}
              </td>
              <td style={{ ...s.td, fontWeight: 700 }}>{!rb ? '–' : rb.score > ra.score ? 'B' : rb.score < ra.score ? 'A' : '='}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

const s = {
  title: { fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--brown)', margin: '0 0 6px' },
  subtitle: { color: 'var(--ink-muted)', margin: '0 0 20px' },
  card: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: 20,
    marginBottom: 16,
  },
  stepLabel: { fontWeight: 700, color: 'var(--forest)', marginBottom: 12, fontSize: 15 },
  row: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  input: {
    flex: 1,
    minWidth: 180,
    border: '1px solid var(--tan)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 15,
    background: 'var(--white)',
    color: 'var(--ink)',
  },
  btnPrimary: {
    background: 'var(--forest)',
    color: 'var(--white)',
    border: 'none',
    borderRadius: 10,
    padding: '10px 18px',
    fontWeight: 600,
    fontSize: 14.5,
  },
  btnSecondary: {
    background: 'var(--white)',
    color: 'var(--forest)',
    border: '1px solid var(--forest)',
    borderRadius: 10,
    padding: '9px 14px',
    fontWeight: 600,
    fontSize: 14,
  },
  btnBig: {
    marginTop: 18,
    width: '100%',
    background: 'var(--forest)',
    color: 'var(--white)',
    border: 'none',
    borderRadius: 12,
    padding: '14px 18px',
    fontWeight: 700,
    fontSize: 16,
  },
  results: { marginTop: 8, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' },
  resultItem: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: 'var(--white)',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    padding: '9px 12px',
    fontSize: 13.5,
    color: 'var(--ink)',
  },
  pickRow: { display: 'flex', gap: 8, alignItems: 'center', margin: '14px 0 10px', flexWrap: 'wrap' },
  chip: {
    background: 'var(--white)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: '6px 14px',
    fontSize: 13.5,
    color: 'var(--ink)',
  },
  chipOn: { background: 'var(--forest)', color: 'var(--white)', borderColor: 'var(--forest)' },
  pinText: { fontSize: 13, color: 'var(--ink-muted)', marginTop: 8 },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  fieldLabel: { fontSize: 13.5, color: 'var(--ink-muted)', fontWeight: 600 },
  error: {
    background: '#fdecea',
    color: 'var(--danger)',
    border: '1px solid #f5c6c0',
    borderRadius: 10,
    padding: '10px 14px',
    marginBottom: 16,
  },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 },
  stat: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 },
  tag: { background: 'var(--leaf-pale)', color: 'var(--forest-dark)', borderRadius: 14, padding: '4px 10px', fontSize: 13 },
  warnings: { color: '#8a5a00', fontSize: 13, margin: '12px 0 0', paddingLeft: 18 },
  biz: {
    background: 'var(--white)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    cursor: 'pointer',
  },
  bizSelected: { borderColor: 'var(--forest)', boxShadow: '0 0 0 2px var(--leaf)' },
  rank: {
    width: 34,
    height: 34,
    borderRadius: 17,
    background: 'var(--forest)',
    color: 'var(--white)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    flexShrink: 0,
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { textAlign: 'left', borderBottom: '2px solid var(--border)', padding: '8px 6px', color: 'var(--ink-muted)' },
  td: { borderBottom: '1px solid var(--border)', padding: '8px 6px' },
};