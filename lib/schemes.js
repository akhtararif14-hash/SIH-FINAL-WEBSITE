// lib/schemes.js
// Government loan schemes shown on the /schemes page.
//
// Every scheme belongs to one category. Right now only "General Schemes"
// has entries; "Special Schemes" is deliberately empty and will be filled later.
//
// Source of the numbers below: NSFDC (National Scheduled Castes Finance and
// Development Corporation), Ministry of Social Justice & Empowerment,
// Loan/Credit Schemes page, last updated 04.09.2026.

export const SCHEME_CATEGORIES = [
  {
    id: 'general',
    label: 'General Schemes',
    note: 'Loan schemes open to eligible applicants across business types.',
  },
  {
    id: 'special',
    label: 'Special Schemes',
    note: 'Coming soon.',
  },
];

export const SCHEMES = [
  {
    id: 'nsfdc-mfs',
    category: 'general',
    name: 'Micro Finance Scheme (MFS)',
    provider: 'NSFDC',
    tagline: 'Micro credit for very small units costing up to ₹1.40 lakh',
    detail:
      'NSFDC gives micro credit for units whose total project cost is up to ₹1.40 lakh. The loan covers up to 90% of the project cost, so you arrange only the remaining 10% yourself. The money reaches you through a State Channelising Agency (SCA) or Channel Agency (CA), and you repay that agency.',
    facts: [
      { label: 'Project cost covered', value: 'Units costing up to ₹1.40 lakh' },
      { label: 'Maximum loan', value: 'Up to 90% of project cost, maximum ₹1.25 lakh per unit' },
      { label: 'Interest you pay', value: '6.5% per year (NSFDC charges 2.5% from the SCA/CA)' },
      { label: 'Repayment', value: 'Quarterly instalments, within 3 years of disbursement' },
      { label: 'Moratorium', value: '3 months (no instalment during this period)' },
    ],
    applyVia: 'PM SURAJ Portal',
    applyUrl: 'https://pmsuraj.dosje.gov.in/',
    helpline: '1800110396',
  },
  {
    id: 'nsfdc-term-loan',
    category: 'general',
    name: 'Term Loan',
    provider: 'NSFDC',
    tagline: 'Bigger loan for units costing above ₹1.40 lakh, up to ₹50 lakh',
    detail:
      'For a unit that costs more than ₹1.40 lakh, NSFDC gives a Term Loan of up to 90% of the project cost. This is the scheme to look at when you need machines, a bigger shop or a small manufacturing setup. Repayment is spread over a longer period than the Micro Finance Scheme, and there is a longer gap before the first instalment.',
    facts: [
      { label: 'Project cost covered', value: 'Units costing above ₹1.40 lakh and up to ₹50 lakh' },
      { label: 'Maximum loan', value: 'Up to 90% of project cost, above ₹1.25 lakh and up to ₹45 lakh per unit' },
      { label: 'Interest you pay', value: '8% per year (NSFDC charges 4% from the SCA/CA)' },
      { label: 'Repayment', value: 'Quarterly instalments, within 7 years' },
      { label: 'Moratorium', value: '6 months (12 months for plantation and construction work)' },
    ],
    applyVia: 'PM SURAJ Portal',
    applyUrl: 'https://pmsuraj.dosje.gov.in/',
    helpline: '1800110396',
  },
];

// Helper used by the page: all schemes sitting in one category.
export function schemesInCategory(categoryId) {
  return SCHEMES.filter((s) => s.category === categoryId);
}