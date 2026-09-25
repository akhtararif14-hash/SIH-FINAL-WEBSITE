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

// A small "i" button plus the explanation panel it opens.
function InfoBlock({ label, info, inline = false }) {
  const [open, setOpen] = useState(false);
  if (!info) return null;
  return (
    <>
      <button
        type="button"
        aria-label={`What is ${label}?`}
        title={`What is ${label}?`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        style={{ ...s.infoBtn, ...(open ? s.infoBtnOn : {}), ...(inline ? { marginLeft: 6 } : {}) }}
      >
        i
      </button>
      {open && (
        <div style={s.infoPanel} onClick={(e) => e.stopPropagation()}>
          <div style={{ fontWeight: 700, color: 'var(--forest)', marginBottom: 6 }}>{info.title}</div>
          <p style={s.infoLine}><b>What it means:</b> {info.what}</p>
          <p style={s.infoLine}><b>How we got it:</b> {info.how}</p>
          <p style={s.infoLine}><b>Data source:</b> {info.source}</p>
          {info.tip && <p style={{ ...s.infoLine, color: 'var(--forest-dark)' }}><b>Tip:</b> {info.tip}</p>}
        </div>
      )}
    </>
  );
}

// One score line: label, bar, value and its info button.
function MetricRow({ label, value, color, infoKey, r, ctx, indent = false }) {
  return (
    <div style={{ marginBottom: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
        <span style={{ width: 150, color: 'var(--ink-muted)', paddingLeft: indent ? 12 : 0 }}>{label}</span>
        <div style={{ flex: 1, height: 10, background: 'var(--border)', borderRadius: 5 }}>
          <div style={{ width: `${Math.round(value * 100)}%`, height: '100%', background: color, borderRadius: 5 }} />
        </div>
        <span style={{ width: 38, textAlign: 'right' }}>{value.toFixed(2)}</span>
        <InfoBlock label={label} info={getParamInfo(infoKey, r, ctx, r.finance)} />
      </div>
    </div>
  );
}

const SWOT_BOXES = [
  { key: 'strengths', title: 'Strengths', sub: 'good here, now', bg: '#eaf3ec', border: '#7cb68c', color: '#1f3b28' },
  { key: 'weaknesses', title: 'Weaknesses', sub: 'missing here', bg: '#fdecea', border: '#e6a9a2', color: '#7a2318' },
  { key: 'opportunities', title: 'Opportunities', sub: 'gaps you can use', bg: '#f3eefb', border: '#b9a6de', color: '#3f2a63' },
  { key: 'threats', title: 'Threats', sub: 'what could go wrong', bg: '#fdf3e2', border: '#e0bc7c', color: '#7a5312' },
];

function SwotGrid({ swot }) {
  if (!swot) return null;
  return (
    <div style={s.swotGrid}>
      {SWOT_BOXES.map((box) => {
        const items = swot[box.key] || [];
        return (
          <div key={box.key} style={{ ...s.swotBox, background: box.bg, borderColor: box.border }}>
            <div style={{ fontWeight: 700, color: box.color, fontSize: 14 }}>
              {box.title} <span style={{ fontWeight: 400, fontSize: 11.5, opacity: 0.8 }}>· {box.sub}</span>
            </div>
            {items.length ? (
              <ul style={{ margin: '6px 0 0', paddingLeft: 16, color: box.color }}>
                {items.map((t, i) => (
                  <li key={i} style={{ fontSize: 12.5, marginBottom: 4, lineHeight: 1.45 }}>{t}</li>
                ))}
              </ul>
            ) : (
              <div style={{ fontSize: 12.5, opacity: 0.7, marginTop: 6, color: box.color }}>Nothing notable found.</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const VERDICT_COLORS = { good: '#2e7d32', warn: '#b7791f', bad: '#c0392b' };

function FinancePanel({ r, ctx }) {
  const f = r.finance;
  if (!f) return null;
  const money = (n) => (n == null ? '—' : rupees(n));

  return (
    <div style={{ marginTop: 14 }}>
      <div style={s.sectionTitle}>
        Money needed to start
        <InfoBlock label="total investment" info={getParamInfo('investment', r, ctx, f)} inline />
      </div>
      <table style={s.table}>
        <tbody>
          {f.setup.map((row) => (
            <tr key={row.label}>
              <td style={s.td}>
                {row.label}
                <div style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>{row.note}</div>
              </td>
              <td style={{ ...s.td, textAlign: 'right', whiteSpace: 'nowrap' }}>{money(row.amount)}</td>
            </tr>
          ))}
          <tr>
            <td style={{ ...s.td, fontWeight: 700 }}>Total investment</td>
            <td style={{ ...s.td, textAlign: 'right', fontWeight: 700, color: 'var(--forest)' }}>{money(f.totalInvestment)}</td>
          </tr>
        </tbody>
      </table>

      <div style={s.sectionTitle}>
        Every month, if it runs as expected
        <InfoBlock label="monthly sales" info={getParamInfo('revenue', r, ctx, f)} inline />
      </div>
      <table style={s.table}>
        <tbody>
          <tr>
            <td style={s.td}>
              Sales{' '}
              <span style={{ color: 'var(--ink-muted)', fontSize: 12 }}>
                ({f.customers ?? '—'} {f.model === 'monthly' ? 'members' : 'customers/day'} × {rupees(f.ticket)}
                {f.model === 'monthly' ? '/month' : ' × 30 days'})
                {f.capacityLimited && (
                  <span style={{ color: 'var(--forest)' }}> · capped at what one outlet can serve ({f.capacity})</span>
                )}
              </span>
            </td>
            <td style={{ ...s.td, textAlign: 'right' }}>{money(f.monthlyRevenue)}</td>
          </tr>
          <tr>
            <td style={s.td}>Gross profit <span style={{ color: 'var(--ink-muted)', fontSize: 12 }}>({Math.round(f.margin * 100)}% margin)</span></td>
            <td style={{ ...s.td, textAlign: 'right' }}>{money(f.grossProfit)}</td>
          </tr>
          <tr>
            <td style={s.td}>Rent <span style={{ color: 'var(--ink-muted)', fontSize: 12 }}>({f.areaSqft} sqft × ₹{f.rentRate}/sqft, {f.rentTier})</span></td>
            <td style={{ ...s.td, textAlign: 'right' }}>− {money(f.monthlyRent)}</td>
          </tr>
          <tr>
            <td style={s.td}>Staff salaries</td>
            <td style={{ ...s.td, textAlign: 'right' }}>− {money(f.staffCost)}</td>
          </tr>
          <tr>
            <td style={s.td}>Electricity, water, internet</td>
            <td style={{ ...s.td, textAlign: 'right' }}>− {money(f.utilities)}</td>
          </tr>
          <tr>
            <td style={{ ...s.td, fontWeight: 700 }}>Profit left with the owner</td>
            <td style={{ ...s.td, textAlign: 'right', fontWeight: 700, color: f.netProfit > 0 ? '#2e7d32' : '#c0392b' }}>
              {money(f.netProfit)}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={s.moneyRow}>
        <div style={s.moneyCell}>
          <div style={s.moneyLabel}>
            Payback time <InfoBlock label="payback time" info={getParamInfo('payback', r, ctx, f)} inline />
          </div>
          <div style={s.moneyValue}>{f.paybackMonths ? `${f.paybackMonths} months` : 'not reached'}</div>
        </div>
        <div style={s.moneyCell}>
          <div style={s.moneyLabel}>
            Break-even sales <InfoBlock label="break-even sales" info={getParamInfo('breakeven', r, ctx, f)} inline />
          </div>
          <div style={s.moneyValue}>{money(f.breakEvenSales)}/month</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>
            about {f.breakEvenCustomersPerDay} {f.model === 'monthly' ? 'members' : 'customers a day'}
          </div>
        </div>
        <div style={s.moneyCell}>
          <div style={s.moneyLabel}>First-year profit</div>
          <div style={s.moneyValue}>{f.netProfit > 0 ? money(f.netProfit * 12) : '—'}</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>if sales stay steady</div>
        </div>
      </div>

      {f.verdict.map((v, i) => (
        <div key={i} style={{ fontSize: 13, color: VERDICT_COLORS[v.level], marginTop: 6 }}>
          {v.level === 'good' ? '✓' : v.level === 'warn' ? '!' : '×'} {v.text}
        </div>
      ))}

      <details style={{ marginTop: 10 }}>
        <summary style={{ cursor: 'pointer', fontSize: 12.5, color: 'var(--ink-muted)' }}>
          What we assumed (change these in lib/advisor/finance.js)
        </summary>
        <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 12.5, color: 'var(--ink-muted)' }}>
          {f.assumptions.map((a, i) => (
            <li key={i} style={{ marginBottom: 3 }}>{a}</li>
          ))}
          <li>Licence needed: {f.licenceName}</li>
        </ul>
        <div style={{ fontSize: 12.5, color: 'var(--ink-muted)', marginTop: 6 }}>
          These are typical figures, not quotes. Confirm rent, stock and licence costs locally before investing.
        </div>
      </details>
    </div>
  );
}

// Real Google reviews of the competing shops, when the Places key allows them.
function ReviewNotes({ r, ctx }) {
  const notes = (ctx?.reviewNotes || []).filter((n) => n.business === r.id);
  if (!notes.length) return null;
  return (
    <div style={{ marginTop: 14 }}>
      <div style={s.sectionTitle}>What customers say about nearby {r.name.split(' /')[0].toLowerCase()}s</div>
      <div style={{ display: 'grid', gap: 6 }}>
        {notes.slice(0, 6).map((n, i) => (
          <div key={i} style={s.reviewCard}>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
              {n.shop}
              {n.rating != null && <> · {n.rating}★</>}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>{n.text}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginTop: 6 }}>
        Reviews from Google. Read what people complain about, then do that one thing better.
      </div>
    </div>
  );
}

function BusinessCard({ rank, r, ctx, name, selected, onClick }) {
  const b = r.breakdown;
  const f = r.finance;
  return (
    <div onClick={onClick} style={{ ...s.biz, ...(selected ? s.bizSelected : {}) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={s.rank}>{rank}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{name}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
            {r.competitorCount} existing shop{r.competitorCount === 1 ? '' : 's'} nearby ({r.competitorSource === 'google' ? 'Google' : 'OpenStreetMap'})
            {f && <> · needs {rupees(f.totalInvestment)}</>}
            {f && f.netProfit > 0 && <> · about {rupees(f.netProfit)}/month profit</>}
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
        <div style={{ marginTop: 12 }}>
          <div style={s.sectionTitle}>
            How this score was built
            <InfoBlock label="opportunity score" info={getParamInfo('score', r, ctx, f)} inline />
          </div>
          <MetricRow label="Demand" value={b.demand} color="var(--forest)" infoKey="demand" r={r} ctx={ctx} />
          <MetricRow label="· population" value={b.population} color="var(--leaf)" infoKey="population" r={r} ctx={ctx} indent />
          <MetricRow label="· nearby places" value={b.anchors} color="var(--leaf)" infoKey="anchors" r={r} ctx={ctx} indent />
          <MetricRow label="· accessibility" value={b.access} color="var(--leaf)" infoKey="access" r={r} ctx={ctx} indent />
          <MetricRow label="Low competition" value={b.competition} color="var(--tan)" infoKey="competition" r={r} ctx={ctx} />
          {b.environment < 1 && (
            <MetricRow label="Weather fit" value={b.environment} color="var(--brown)" infoKey="environment" r={r} ctx={ctx} />
          )}

          <div style={{ fontSize: 12.5, color: 'var(--ink-muted)', marginTop: 6 }}>
            Score = 100 × {b.demand} × {b.competition}
            {b.environment < 1 ? ` × ${b.environment}` : ''} = {r.score}
            {b.populationMissing && <> · population unavailable, neutral value used</>}
            {r.note && <> · Note: {r.note}</>}
          </div>

          <div style={{ ...s.sectionTitle, marginTop: 16 }}>
            Dependence risk
            <InfoBlock label="dependence risk" info={getParamInfo('risk', r, ctx, f)} inline />
            <span style={{ color: RISK_COLORS[r.risk.level], fontWeight: 700, marginLeft: 6 }}>
              {r.risk.level}
            </span>
          </div>

          <div style={{ ...s.sectionTitle, marginTop: 16 }}>SWOT analysis for this location</div>
          <SwotGrid swot={r.swot} />

          <ReviewNotes r={r} ctx={ctx} />
          <FinancePanel r={r} ctx={ctx} />
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
  loadingBox: {
    marginTop: 14,
    background: 'var(--leaf-pale)',
    border: '1px solid var(--leaf)',
    borderRadius: 12,
    padding: 16,
  },
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
  sectionTitle: {
    fontWeight: 700,
    color: 'var(--forest)',
    fontSize: 14,
    margin: '10px 0 8px',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  infoBtn: {
    width: 18,
    height: 18,
    minWidth: 18,
    borderRadius: 9,
    border: '1px solid var(--tan)',
    background: 'var(--white)',
    color: 'var(--brown)',
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1,
    padding: 0,
    fontStyle: 'italic',
  },
  infoBtnOn: { background: 'var(--forest)', color: 'var(--white)', borderColor: 'var(--forest)' },
  infoPanel: {
    background: 'var(--leaf-pale)',
    border: '1px solid var(--leaf)',
    borderRadius: 10,
    padding: '10px 12px',
    margin: '6px 0 10px',
    fontSize: 12.5,
    lineHeight: 1.55,
    width: '100%',
  },
  infoLine: { margin: '0 0 5px' },
  swotGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 10 },
  swotBox: { border: '1px solid', borderRadius: 10, padding: '10px 12px' },
  reviewCard: {
    background: 'var(--white)',
    border: '1px solid var(--border)',
    borderLeft: '3px solid var(--tan)',
    borderRadius: 0,
    padding: '8px 10px',
  },
  moneyRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginTop: 10 },
  moneyCell: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: 10 },
  moneyLabel: { fontSize: 12.5, color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: 4 },
  moneyValue: { fontSize: 18, fontWeight: 700, color: 'var(--forest)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { textAlign: 'left', borderBottom: '2px solid var(--border)', padding: '8px 6px', color: 'var(--ink-muted)' },
  td: { borderBottom: '1px solid var(--border)', padding: '8px 6px' },
};