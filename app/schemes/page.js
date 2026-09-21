'use client';

import { useRouter } from 'next/navigation';
import { useTranslate } from '@/lib/LanguageProvider';
import { SCHEMES } from '@/lib/schemes';

export default function SchemesPage() {
  const { t } = useTranslate();
  const router = useRouter();

  const askAI = (schemeName) => {
    const q = `Tell me about ${schemeName} and if it fits my business.`;
    router.push(`/chat?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="page">
      <h1 style={styles.title}>{t('bestSchemes')}</h1>
      <div style={styles.list}>
        {SCHEMES.map((s) => (
          <div key={s.id} style={styles.card}>
            <h2 style={styles.name}>{s.name}</h2>
            <div style={styles.tagline}>{s.tagline}</div>
            <p style={styles.detail}>{s.detail}</p>
            <button style={styles.askBtn} onClick={() => askAI(s.name)}>
              {t('askAIAbout')} {s.name} →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 30,
    color: 'var(--brown)',
    margin: '0 0 24px',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 16 },
  card: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-md)',
    padding: 22,
    borderLeft: '5px solid var(--leaf)',
  },
  name: { fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--brown)', margin: 0 },
  tagline: { color: 'var(--forest-dark)', fontWeight: 600, fontSize: 13.5, margin: '4px 0 10px' },
  detail: { color: 'var(--ink)', fontSize: 14.5, lineHeight: 1.6, margin: '0 0 14px' },
  askBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--forest)',
    fontWeight: 700,
    fontSize: 14,
    padding: 0,
  },
};
