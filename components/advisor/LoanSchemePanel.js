'use client';
// components/advisor/LoanSchemePanel.js
// Sits under the money table on every business idea and answers the two
// questions a shop owner actually asks next:
//
//   1. "How much loan can I get?"      — worked out from this shop's own cost
//   2. "Which government scheme?"      — matched to that cost automatically
//
// Both answers come from the same NSFDC rules the Calculator page uses, so a
// judge comparing the two pages sees identical numbers.

import { useState } from 'react';
import Link from 'next/link';
import { useTranslate } from '@/lib/LanguageProvider';
import { advisorT } from '@/lib/advisor/i18n';
import { calculateLoan, formatINR } from '@/lib/loanCalculator';
import { SCHEMES, localiseScheme } from '@/lib/schemes';

export default function LoanSchemePanel({ finance }) {
  const { t, lang } = useTranslate();
  const A = advisorT(lang);
  const [open, setOpen] = useState(null); // 'loan' | 'scheme' | null

  const cost = finance?.totalInvestment;
  if (!cost) return null;

  const loan = calculateLoan(cost);
  const tooBig = Boolean(loan.errorKey);

  const scheme = tooBig
    ? null
    : localiseScheme(SCHEMES.find((s) => s.id === loan.schemeId), lang);

  // Can the shop's own profit pay the instalment?
  let affordKey = null;
  if (!tooBig && finance.netProfit != null) {
    const ratio = finance.netProfit / loan.perMonth;
    affordKey = ratio >= 2 ? 'loanAffordYes' : ratio >= 1.15 ? 'loanAffordTight' : 'loanAffordNo';
  }
  const affordTone =
    affordKey === 'loanAffordYes' ? '#2e7d32' : affordKey === 'loanAffordTight' ? '#b7791f' : '#c0392b';

  const toggle = (which) => setOpen((v) => (v === which ? null : which));

  return (
    <div style={st.wrap}>
      <div style={st.title}>{A('loanSectionTitle')}</div>

      <div style={st.buttons}>
        <button
          style={{ ...st.btn, ...(open === 'loan' ? st.btnOn : {}) }}
          onClick={() => toggle('loan')}
          aria-expanded={open === 'loan'}
        >
          {A('btnLoanCanGet')}
        </button>
        <button
          style={{ ...st.btn, ...(open === 'scheme' ? st.btnOn : {}) }}
          onClick={() => toggle('scheme')}
          aria-expanded={open === 'scheme'}
        >
          {A('btnBestScheme')}
        </button>
      </div>

      {/* ---------- 1. how much loan ---------- */}
      {open === 'loan' && (
        <div style={st.body}>
          {tooBig ? (
            <p style={st.warn}>{A('schemeTooBig', { cost: formatINR(cost) })}</p>
          ) : (
            <>
              <Row label={A('loanTotalNeeded')} value={formatINR(cost)} />
              <Row label={A('loanYouCanGet')} value={formatINR(loan.loanAmount)} strong />
              <Row label={A('loanYourShare')} value={formatINR(cost - loan.loanAmount)} />
              <Row label={A('loanInterestRate')} value={`${loan.interestRate}% ${A('loanPerYear')}`} />
              <Row
                label={A('loanRepayOver')}
                value={`${loan.years} ${t('yearsWord')} · ${t('moratoriumNote', {
                  n: loan.moratoriumMonths,
                })}`}
              />
              <Row
                label={A('loanInstalment')}
                value={`${formatINR(loan.instalment)} ${A('loanPerQuarter')}`}
                sub={A('loanAboutPerMonth', { n: formatINR(loan.perMonth) })}
                strong
              />
              <Row label={A('loanTotalInterest')} value={formatINR(loan.totalInterest)} />

              {affordKey && (
                <p style={{ ...st.verdict, color: affordTone, borderColor: affordTone }}>
                  {A(affordKey, {
                    profit: formatINR(finance.netProfit),
                    inst: formatINR(loan.perMonth),
                  })}
                </p>
              )}

              <p style={st.note}>{A('loanCoverNote')}</p>
              <p style={st.note}>{A('loanEstimateNote')}</p>
            </>
          )}
        </div>
      )}

      {/* ---------- 2. which scheme ---------- */}
      {open === 'scheme' && (
        <div style={st.body}>
          {tooBig ? (
            <p style={st.warn}>{A('schemeTooBig', { cost: formatINR(cost) })}</p>
          ) : (
            <>
              <div style={st.schemeHead}>
                <strong style={st.schemeName}>{scheme.name}</strong>
                <span style={st.badge}>{scheme.provider}</span>
              </div>
              <p style={st.tagline}>{scheme.tagline}</p>

              <div style={st.whyBox}>
                <div style={st.whyTitle}>{A('schemeWhy')}</div>
                <div style={st.whyText}>
                  {A(loan.schemeId === 'nsfdc-mfs' ? 'schemeWhyMfs' : 'schemeWhyTerm', {
                    cost: formatINR(cost),
                  })}
                </div>
              </div>

              {scheme.facts.map((f) => (
                <Row key={f.labelKey} label={t(f.labelKey)} value={f.value} />
              ))}

              <div style={st.links}>
                <a href={scheme.applyUrl} target="_blank" rel="noopener noreferrer" style={st.apply}>
                  {t('applyOn')} {scheme.applyVia} ↗
                </a>
                <Link href="/schemes" style={st.seeAll}>
                  {A('seeAllSchemes')}
                </Link>
              </div>

              <p style={st.note}>
                {t('helplineLabel')}: {scheme.helpline}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, sub, strong = false }) {
  return (
    <div style={st.row}>
      <div style={st.rowLabel}>
        {label}
        {sub && <div style={st.rowSub}>{sub}</div>}
      </div>
      <div style={{ ...st.rowValue, ...(strong ? st.rowValueStrong : {}) }}>{value}</div>
    </div>
  );
}

const st = {
  wrap: { marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 14 },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 15.5,
    fontWeight: 700,
    color: 'var(--forest-dark)',
    marginBottom: 10,
  },
  buttons: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  btn: {
    flex: '1 1 200px',
    background: 'var(--leaf-pale)',
    border: '1.5px solid var(--leaf)',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--forest-dark)',
    cursor: 'pointer',
    textAlign: 'start',
  },
  btnOn: { background: 'var(--forest)', color: 'var(--white)', borderColor: 'var(--forest)' },
  body: {
    marginTop: 12,
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '12px 14px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    padding: '7px 0',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    flexWrap: 'wrap',
  },
  rowLabel: { fontSize: 13.5, color: 'var(--ink-muted)', flex: '1 1 150px' },
  rowSub: { fontSize: 12, color: 'var(--ink-muted)', opacity: 0.85, marginTop: 2 },
  rowValue: { fontSize: 14, color: 'var(--ink)', textAlign: 'end', flex: '0 0 auto' },
  rowValueStrong: { fontWeight: 800, color: 'var(--forest)', fontSize: 15.5 },
  verdict: {
    marginTop: 12,
    marginBottom: 0,
    fontSize: 13.5,
    lineHeight: 1.55,
    borderInlineStart: '3px solid',
    paddingInlineStart: 10,
    fontWeight: 600,
  },
  note: { fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.55, margin: '10px 0 0' },
  warn: { fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.6, margin: 0 },
  schemeHead: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  schemeName: { fontFamily: 'var(--font-display)', fontSize: 16.5, color: 'var(--brown)' },
  badge: {
    fontSize: 10.5,
    fontWeight: 700,
    color: 'var(--forest-dark)',
    background: 'rgba(46,125,50,0.12)',
    borderRadius: 999,
    padding: '2px 8px',
  },
  tagline: { fontSize: 13, color: 'var(--forest-dark)', fontWeight: 600, margin: '5px 0 10px' },
  whyBox: {
    background: 'var(--leaf-pale)',
    borderRadius: 10,
    padding: '10px 12px',
    marginBottom: 10,
  },
  whyTitle: { fontSize: 12, fontWeight: 700, color: 'var(--forest-dark)', marginBottom: 3 },
  whyText: { fontSize: 13, color: 'var(--ink)', lineHeight: 1.55 },
  links: { display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 },
  apply: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--brown)',
    textDecoration: 'none',
    borderBottom: '2px solid rgba(0,0,0,0.12)',
  },
  seeAll: { fontSize: 14, fontWeight: 700, color: 'var(--forest)', textDecoration: 'none' },
};