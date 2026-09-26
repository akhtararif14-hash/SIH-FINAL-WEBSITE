// lib/loanCalculator.js
// Works out which NSFDC scheme a project falls under and what the
// instalment would be.
//
// This returns KEYS, not sentences, so the page can show the result in
// whichever language the user picked.

export function calculateLoan(projectCost) {
  if (!projectCost || projectCost <= 0 || Number.isNaN(projectCost)) {
    return { errorKey: 'calcErrInvalid' };
  }

  let schemeId, maxLoanCap, interestRate, years, moratoriumMonths;

  if (projectCost <= 140000) {
    schemeId = 'nsfdc-mfs';
    maxLoanCap = 125000;
    interestRate = 6.5;
    years = 3;
    moratoriumMonths = 3;
  } else if (projectCost <= 5000000) {
    schemeId = 'nsfdc-term-loan';
    maxLoanCap = 4500000;
    interestRate = 8;
    years = 7;
    moratoriumMonths = 6;
  } else {
    return { errorKey: 'calcErrTooBig' };
  }

  const loanAmount = Math.min(projectCost * 0.9, maxLoanCap);

  // NSFDC is repaid QUARTERLY, so the instalment maths has to be done in
  // quarters: a quarterly interest rate over a number of quarters.
  // (The earlier version used a quarterly rate over a count of months,
  // which inflated the figure by roughly 50%.)
  const totalQuarters = (years * 12 - moratoriumMonths) / 3;
  const quarterlyRate = interestRate / 4 / 100;

  const growth = Math.pow(1 + quarterlyRate, totalQuarters);
  const instalment = (loanAmount * quarterlyRate * growth) / (growth - 1);

  const totalPaid = instalment * totalQuarters;

  return {
    schemeId,
    loanAmount: Math.round(loanAmount),
    interestRate,
    years,
    moratoriumMonths,
    quarters: Math.round(totalQuarters),
    instalment: Number(instalment.toFixed(2)),
    // Handy for someone who budgets month to month.
    perMonth: Number((instalment / 3).toFixed(2)),
    totalPaid: Math.round(totalPaid),
    totalInterest: Math.round(totalPaid - loanAmount),
  };
}

export function formatINR(num) {
  return '₹' + Math.round(num).toLocaleString('en-IN');
}

export function formatINRDecimal(num) {
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}