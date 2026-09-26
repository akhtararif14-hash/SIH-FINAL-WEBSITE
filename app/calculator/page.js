'use client';
// app/calculator/page.js
// Every visible string comes from t(), so the page follows the language
// the user picked. Scheme names come from lib/schemes.js, which is also
// translated.

import { useState } from 'react';
import { useTranslate } from '@/lib/LanguageProvider';
import { calculateLoan, formatINR, formatINRDecimal } from '@/lib/loanCalculator';
import { schemeName } from '@/lib/schemes';

export default function CalculatorPage() {
  const { t, lang } = useTranslate();
  const [projectCost, setProjectCost] = useState('');
  const [result, setResult] = useState(null);

  const handleCalculate = (e) => {
    e.preventDefault();
    setResult(calculateLoan(parseFloat(projectCost)));
  };

  return (
    <div className="page" style={{ maxWidth: 560 }}>
      <h1 style={styles.title}>{t('calculator')}</h1>

      <form onSubmit={handleCalculate}>
        <label style={styles.label} htmlFor="cost">
          {t('projectCostLabel')}
        </label>
        <input
          id="cost"
          type="number"
          inputMode="numeric"
          style={styles.input}
          value={projectCost}
          onChange={(e) => setProjectCost(e.target.value)}
          placeholder={t('costPlaceholder')}
        />
        <button type="submit" style={styles.button}>
          {t('calculate')}
        </button>
      </form>

      {result?.errorKey && <p style={styles.error}>{t(result.errorKey)}</p>}

      {result && !result.errorKey && (
        <div style={styles.resultBox}>
          <Row label={t('resScheme')} value={schemeName(result.schemeId, lang)} />
          <Row label={t('resMaxLoan')} value={formatINR(result.loanAmount)} />
          <Row label={t('resInterest')} value={`${result.interestRate}%`} />
          <Row
            label={t('resRepayment')}
            value={`${result.years} ${t('yearsWord')} · ${t('moratoriumNote', {
              n: result.moratoriumMonths,
            })}`}
          />

          <div style={styles.instalment}>
            <span style={styles.instalmentLabel}>{t('resInstalment')}</span>
            <span style={styles.instalmentValue}>{formatINRDecimal(result.instalment)}</span>
          </div>
          <div style={styles.perMonth}>
            {t('resMonthlySet')}: {formatINRDecimal(result.perMonth)}
          </div>

          <p style={styles.note}>{t('calcNote')}</p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={styles.rowValue}>{value}</span>
    </div>
  );
}

const styles = {
  title: { fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--brown)', margin: '0 0 24px' },
  label: { display: 'block', fontSize: 15, color: 'var(--ink)', marginBottom: 8 },
  input: {
    width: '100%',
    border: '1px solid var(--tan)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 14px',
    fontSize: 16,
    marginBottom: 14,
    background: 'var(--card)',
    color: 'var(--ink)',
  },
  button: {
    background: 'var(--forest)',
    color: 'var(--white)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '13px 20px',
    fontWeight: 700,
    fontSize: 15.5,
    width: '100%',
    cursor: 'pointer',
  },
  error: { color: 'var(--danger)', marginTop: 18, lineHeight: 1.6 },
  resultBox: {
    marginTop: 22,
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: 20,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 14,
    padding: '8px 0',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    flexWrap: 'wrap',
  },
  rowLabel: { fontSize: 14, color: 'var(--ink-muted)' },
  rowValue: { fontSize: 14.5, color: 'var(--ink)', fontWeight: 600, textAlign: 'right' },
  instalment: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  instalmentLabel: { fontSize: 14.5, color: 'var(--ink)' },
  instalmentValue: { fontSize: 22, fontWeight: 800, color: 'var(--forest)' },
  perMonth: { fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 },
  note: { fontSize: 12.5, color: 'var(--ink-muted)', lineHeight: 1.6, margin: '14px 0 0' },
};