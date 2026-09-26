'use client';

import { useState } from 'react';
import { useTranslate } from '@/lib/LanguageProvider';
import { calculateLoan, formatINR, formatINRDecimal } from '@/lib/loanCalculator';

export default function CalculatorPage() {
  const { t } = useTranslate();
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
          placeholder="e.g. 200000"
        />
        <button type="submit" style={styles.button}>
          {t('calculate')}
        </button>
      </form>

      {result && result.error && <p style={styles.error}>{result.error}</p>}

      {result && !result.error && (
        <div style={styles.resultBox}>
          <div style={styles.resultLine}>Scheme: {result.scheme}</div>
          <div style={styles.resultLine}>Max Loan Amount: {formatINR(result.loanAmount)}</div>
          <div style={styles.resultLine}>Interest Rate: {result.interestRate}%</div>
          <div style={styles.resultLine}>
            Repayment Period: {result.years} years (incl. {result.moratoriumMonths}-month moratorium)
          </div>
          <div style={styles.eqiLine}>Estimated EQI: {formatINRDecimal(result.eqi)}</div>
        </div>
      )}
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
  },
  error: { color: 'var(--danger)', marginTop: 18 },
  resultBox: {
    marginTop: 22,
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: 20,
  },
  resultLine: { fontSize: 15, marginBottom: 9, color: 'var(--ink)' },
  eqiLine: { fontSize: 18, fontWeight: 800, color: 'var(--forest)', marginTop: 6 },
};
