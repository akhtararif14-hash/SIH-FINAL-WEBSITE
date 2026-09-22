'use client';

import Link from 'next/link';
import { useTranslate } from '@/lib/LanguageProvider';

export default function HomePage() {
  const { t } = useTranslate();

  return (
    <>
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <h1 style={styles.heroTitle}>{t('heroTitle')}</h1>
          <p style={styles.heroSubtitle}>{t('heroSubtitle')}</p>
          <Link href="/chat" style={styles.heroButton}>
            {t('chatWithAI')} →
          </Link>
        </div>
      </section>

      <div className="page" style={{ paddingTop: 40 }}>
        <div style={styles.grid}>
          <Link href="/chat" style={{ ...styles.card, ...styles.cardForest }}>
            <h3 style={styles.cardTitle}>{t('aiAdvisor')}</h3>
            <p style={styles.cardText}>{t('chatPlaceholder')}</p>
          </Link>
          <Link href="/schemes" style={{ ...styles.card, ...styles.cardBrown }}>
            <h3 style={styles.cardTitle}>{t('exploreSchemes')}</h3>
            <p style={styles.cardText}>{t('exploreSchemesSub')}</p>
          </Link>
          <Link href="/calculator" style={{ ...styles.card, ...styles.cardTan }}>
            <h3 style={styles.cardTitle}>{t('calculator')}</h3>
            <p style={styles.cardText}>{t('projectCostLabel')}</p>
          </Link>
        </div>

        <div style={styles.tip}>
          <div style={styles.tipTitle}>{t('tipTitle')}</div>
          <div style={styles.tipText}>{t('tipText')}</div>
        </div>
      </div>
    </>
  );
}

const styles = {
  hero: {
    background: 'linear-gradient(180deg, var(--forest) 0%, var(--forest-dark) 100%)',
    padding: '64px 20px 56px',
  },
  heroInner: {
    maxWidth: 680,
    margin: '0 auto',
    textAlign: 'center',
  },
  heroTitle: {
    fontFamily: 'var(--font-display)',
    color: 'var(--white)',
    fontSize: 'clamp(28px, 5vw, 44px)',
    lineHeight: 1.2,
    fontWeight: 600,
    margin: '0 0 16px',
  },
  heroSubtitle: {
    color: 'var(--leaf)',
    fontSize: 17,
    lineHeight: 1.6,
    margin: '0 0 32px',
  },
  heroButton: {
    display: 'inline-block',
    background: 'var(--tan)',
    color: 'var(--white)',
    fontWeight: 600,
    fontSize: 15.5,
    padding: '14px 30px',
    borderRadius: 30,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  card: {
    display: 'block',
    borderRadius: 'var(--radius-md)',
    padding: 22,
    color: 'var(--white)',
  },
  cardForest: { background: 'var(--forest)' },
  cardBrown: { background: 'var(--brown)' },
  cardTan: { background: 'var(--tan)' },
  cardEmoji: { fontSize: 26 },
  cardTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 19,
    margin: '10px 0 6px',
    fontWeight: 600,
  },
  cardText: { fontSize: 13.5, opacity: 0.9, margin: 0, lineHeight: 1.5 },
  tip: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: 20,
  },
  tipTitle: { color: 'var(--brown)', fontWeight: 700, marginBottom: 6 },
  tipText: { color: 'var(--ink)', fontSize: 14, lineHeight: 1.6 },
};
