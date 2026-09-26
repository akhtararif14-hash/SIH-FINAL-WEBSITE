'use client';
// app/schemes/page.js
// Schemes are grouped by category, and every string on the page comes
// from the translations or from the scheme's own text in that language.

import { useRouter } from 'next/navigation';
import { useTranslate } from '@/lib/LanguageProvider';
import { SCHEME_CATEGORIES, schemesInCategory } from '@/lib/schemes';

export default function SchemesPage() {
  const { t, lang } = useTranslate();
  const router = useRouter();

  const askAI = (schemeName) => {
    const q = `${t('askAIAbout')} ${schemeName}`;
    router.push(`/chat?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="page">
      <h1 style={styles.title}>{t('bestSchemes')}</h1>

      {SCHEME_CATEGORIES.map((cat) => {
        const list = schemesInCategory(cat.id, lang);

        return (
          <section key={cat.id} style={styles.section}>
            <div style={styles.catHead}>
              <h2 style={styles.catTitle}>{t(cat.labelKey)}</h2>
              <span style={styles.catCount}>
                {list.length > 0
                  ? `${list.length} ${t(list.length === 1 ? 'schemeOne' : 'schemeMany')}`
                  : '—'}
              </span>
            </div>
            <p style={styles.catNote}>{t(cat.noteKey)}</p>

            {list.length === 0 ? (
              <div style={styles.empty}>{t('schemesEmpty')}</div>
            ) : (
              <div style={styles.list}>
                {list.map((s) => (
                  <div key={s.id} style={styles.card}>
                    <div style={styles.cardTop}>
                      <h3 style={styles.name}>{s.name}</h3>
                      {s.provider && <span style={styles.badge}>{s.provider}</span>}
                    </div>

                    <div style={styles.tagline}>{s.tagline}</div>
                    <p style={styles.detail}>{s.detail}</p>

                    {s.facts?.length > 0 && (
                      <dl style={styles.facts}>
                        {s.facts.map((f) => (
                          <div key={f.labelKey} style={styles.factRow}>
                            <dt style={styles.factLabel}>{t(f.labelKey)}</dt>
                            <dd style={styles.factValue}>{f.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}

                    <div style={styles.actions}>
                      <button style={styles.askBtn} onClick={() => askAI(s.name)}>
                        {t('askAIAbout')} {s.name} →
                      </button>

                      {s.applyUrl && (
                        <a
                          style={styles.applyBtn}
                          href={s.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t('applyOn')} {s.applyVia} ↗
                        </a>
                      )}
                    </div>

                    {s.helpline && (
                      <div style={styles.helpline}>
                        {t('helplineLabel')}: {s.helpline}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      <p style={styles.footnote}>{t('schemesFootnote')}</p>
    </div>
  );
}

const styles = {
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 30,
    color: 'var(--brown)',
    margin: '0 0 22px',
  },
  section: { marginBottom: 34 },
  catHead: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    borderBottom: '2px solid var(--leaf)',
    paddingBottom: 8,
  },
  catTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 21,
    color: 'var(--forest-dark)',
    margin: 0,
  },
  catCount: { fontSize: 12.5, color: 'var(--ink-muted)', fontWeight: 600, whiteSpace: 'nowrap' },
  catNote: { color: 'var(--ink-muted)', fontSize: 13.5, margin: '8px 0 14px' },
  empty: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-md)',
    padding: '20px 22px',
    color: 'var(--ink-muted)',
    fontSize: 14,
    border: '1px dashed rgba(0,0,0,0.14)',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 16 },
  card: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-md)',
    padding: 22,
    borderLeft: '5px solid var(--leaf)',
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  name: { fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--brown)', margin: 0 },
  badge: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.4,
    color: 'var(--forest-dark)',
    background: 'rgba(46,125,50,0.12)',
    borderRadius: 999,
    padding: '3px 9px',
  },
  tagline: { color: 'var(--forest-dark)', fontWeight: 600, fontSize: 13.5, margin: '6px 0 10px' },
  detail: { color: 'var(--ink)', fontSize: 14.5, lineHeight: 1.6, margin: '0 0 14px' },
  facts: { margin: '0 0 16px', padding: 0 },
  factRow: {
    display: 'flex',
    gap: 12,
    padding: '7px 0',
    borderTop: '1px solid rgba(0,0,0,0.07)',
    flexWrap: 'wrap',
  },
  factLabel: {
    flex: '0 0 190px',
    margin: 0,
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--ink-muted)',
  },
  factValue: { flex: '1 1 220px', margin: 0, fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.5 },
  actions: { display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' },
  askBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--forest)',
    fontWeight: 700,
    fontSize: 14,
    padding: 0,
    cursor: 'pointer',
    textAlign: 'left',
  },
  applyBtn: {
    color: 'var(--brown)',
    fontWeight: 700,
    fontSize: 14,
    textDecoration: 'none',
    borderBottom: '2px solid rgba(0,0,0,0.12)',
  },
  helpline: { marginTop: 12, fontSize: 12.5, color: 'var(--ink-muted)' },
  footnote: { fontSize: 12.5, color: 'var(--ink-muted)', lineHeight: 1.6, marginTop: 8 },
};