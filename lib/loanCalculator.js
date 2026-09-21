// lib/loanCalculator.js
// Ported directly from the Expo app's calculateLoan / formatINR functions.

export function calculateLoan(projectCost) {
  if (!projectCost || projectCost <= 0) return null;

  let scheme, maxLoanCap, interestRate, years, moratoriumMonths;

  if (projectCost <= 140000) {
    scheme = 'Micro Finance Scheme (MFS)';
    maxLoanCap = 125000;
    interestRate = 6.5;
    years = 3;
    moratoriumMonths = 3;
  } else if (projectCost <= 5000000) {
    scheme = 'Term Loan';
    maxLoanCap = 4500000;
    interestRate = 8;
    years = 7;
    moratoriumMonths = 6;
  } else {
    return { error: 'Project cost exceeds ₹50 lakh — outside NSFDC MFS/Term Loan limits.' };
  }

  const loanAmount = Math.min(projectCost * 0.9, maxLoanCap);
  const totalMonths = years * 12;
  const eqiMonths = totalMonths - moratoriumMonths;
  const monthlyRate = interestRate / 4 / 100;

  const eqi =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, eqiMonths)) /
    (Math.pow(1 + monthlyRate, eqiMonths) - 1);

  return {
    scheme,
    loanAmount: Math.round(loanAmount),
    interestRate,
    years,
    moratoriumMonths,
    eqi: Number(eqi.toFixed(2)),
  };
}

export function formatINR(num) {
  return '₹' + num.toLocaleString('en-IN');
}

export function formatINRDecimal(num) {
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
