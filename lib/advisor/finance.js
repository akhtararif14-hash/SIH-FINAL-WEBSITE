// lib/advisor/finance.js
// Money side of the advisor: what it costs to start, what it may earn,
// and how long before the owner gets the money back.
//
// EVERY NUMBER HERE IS AN ASSUMPTION, not measured data. They are typical
// small-town / city-outskirts figures for India in 2026. The app always shows
// them to the user so they can judge (and later edit) them.
// Tune them after talking to real shop owners.
//
//   catchmentM : how far customers realistically walk/come for this business.
//                Revenue is based on the people inside THIS circle, not the
//                whole study radius — so changing the radius slider does not
//                inflate the revenue estimate.
//   model      : 'daily'   -> customers buy every day (shop)
//                'monthly' -> customers pay a monthly fee (gym, coaching)
//   ticket     : average bill per customer (daily model) or monthly fee
//   per1000    : customers per day (or members per month) per 1000 people
//                living inside the catchment circle, BEFORE competition
//   margin     : gross profit margin (what is left after cost of goods)
//   capacity   : the most customers ONE small shop of this type can actually
//                serve in a day (or members it can hold, for monthly models).
//                Without this, a big circle would suggest impossible sales
//                like 167 AC repairs a day from a single technician.

export const FINANCE = {
  cafe:        { areaSqft: 200,  equipment: 150000, interiors: 120000, inventory: 30000,  licence: 15000, staff: 2, utilities: 8000,  ticket: 80,   per1000: 4.0, margin: 0.60, model: 'daily',   catchmentM: 800,  capacity: 250, licenceName: 'FSSAI + trade licence' },
  restaurant:  { areaSqft: 500,  equipment: 400000, interiors: 500000, inventory: 80000,  licence: 25000, staff: 5, utilities: 20000, ticket: 250,  per1000: 2.5, margin: 0.55, model: 'daily',   catchmentM: 1500, capacity: 180, licenceName: 'FSSAI + fire + trade licence' },
  bakery:      { areaSqft: 250,  equipment: 250000, interiors: 150000, inventory: 50000,  licence: 15000, staff: 2, utilities: 10000, ticket: 120,  per1000: 3.0, margin: 0.45, model: 'daily',   catchmentM: 1000, capacity: 220, licenceName: 'FSSAI + trade licence' },
  juice:       { areaSqft: 120,  equipment: 80000,  interiors: 60000,  inventory: 20000,  licence: 12000, staff: 1, utilities: 6000,  ticket: 60,   per1000: 4.0, margin: 0.55, model: 'daily',   catchmentM: 700,  capacity: 200, licenceName: 'FSSAI + trade licence' },
  grocery:     { areaSqft: 250,  equipment: 80000,  interiors: 120000, inventory: 250000, licence: 5000,  staff: 1, utilities: 6000,  ticket: 220,  per1000: 5.0, margin: 0.18, model: 'daily',   catchmentM: 700,  capacity: 200, licenceName: 'Shop & establishment + FSSAI (packaged food)' },
  pharmacy:    { areaSqft: 200,  equipment: 100000, interiors: 150000, inventory: 350000, licence: 20000, staff: 1, utilities: 6000,  ticket: 320,  per1000: 2.5, margin: 0.22, model: 'daily',   catchmentM: 1200, capacity: 150, licenceName: 'Drug licence (needs a registered pharmacist)' },
  stationery:  { areaSqft: 150,  equipment: 60000,  interiors: 60000,  inventory: 80000,  licence: 5000,  staff: 1, utilities: 5000,  ticket: 90,   per1000: 3.0, margin: 0.30, model: 'daily',   catchmentM: 800,  capacity: 150, licenceName: 'Shop & establishment' },
  mobile:      { areaSqft: 120,  equipment: 50000,  interiors: 60000,  inventory: 120000, licence: 5000,  staff: 1, utilities: 4000,  ticket: 350,  per1000: 1.2, margin: 0.28, model: 'daily',   catchmentM: 1500, capacity: 25, licenceName: 'Shop & establishment + GST' },
  salon:       { areaSqft: 200,  equipment: 120000, interiors: 180000, inventory: 30000,  licence: 8000,  staff: 2, utilities: 8000,  ticket: 250,  per1000: 1.2, margin: 0.55, model: 'daily',   catchmentM: 1000, capacity: 24, licenceName: 'Shop & establishment' },
  tailor:      { areaSqft: 120,  equipment: 60000,  interiors: 40000,  inventory: 20000,  licence: 5000,  staff: 1, utilities: 3000,  ticket: 350,  per1000: 0.6, margin: 0.60, model: 'daily',   catchmentM: 1200, capacity: 10, licenceName: 'Shop & establishment' },
  laundry:     { areaSqft: 200,  equipment: 300000, interiors: 100000, inventory: 20000,  licence: 8000,  staff: 2, utilities: 15000, ticket: 200,  per1000: 1.0, margin: 0.45, model: 'daily',   catchmentM: 1200, capacity: 60, licenceName: 'Shop & establishment + water/effluent rules' },
  gym:         { areaSqft: 1200, equipment: 900000, interiors: 400000, inventory: 20000,  licence: 15000, staff: 3, utilities: 25000, ticket: 1200, per1000: 3.0, margin: 0.85, model: 'monthly', catchmentM: 2000, capacity: 300, licenceName: 'Shop & establishment + fire safety' },
  coaching:    { areaSqft: 400,  equipment: 60000,  interiors: 100000, inventory: 10000,  licence: 5000,  staff: 2, utilities: 8000,  ticket: 1500, per1000: 3.0, margin: 0.90, model: 'monthly', catchmentM: 1500, capacity: 150, licenceName: 'Shop & establishment' },
  hardware:    { areaSqft: 300,  equipment: 60000,  interiors: 120000, inventory: 400000, licence: 8000,  staff: 1, utilities: 6000,  ticket: 450,  per1000: 1.0, margin: 0.20, model: 'daily',   catchmentM: 2500, capacity: 70, licenceName: 'Shop & establishment + GST' },
  appliance_repair: { areaSqft: 150, equipment: 60000, interiors: 50000, inventory: 40000, licence: 5000, staff: 1, utilities: 4000, ticket: 600, per1000: 0.5, margin: 0.50, model: 'daily', catchmentM: 2500, capacity: 10, licenceName: 'Shop & establishment' },
};

export const STAFF_SALARY = 12000; // ₹ per worker per month
export const DEPOSIT_MONTHS = 3; // rent deposit asked by most landlords
export const WORKING_CAPITAL_MONTHS = 2; // months of running cost kept in hand

// Rent depends on how busy the area is. We estimate it from population
// density, because a crowded market street costs more than a quiet lane.
export function rentPerSqft(density) {
  if (!density) return { rate: 45, tier: 'unknown area (typical rate used)' };
  if (density >= 15000) return { rate: 90, tier: 'very busy area' };
  if (density >= 8000) return { rate: 60, tier: 'busy area' };
  if (density >= 3000) return { rate: 40, tier: 'medium area' };
  return { rate: 25, tier: 'quiet / rural area' };
}

const round = (n) => Math.round(n);

// The main calculation. `scored` is one result from scoreBusiness().
export function computeFinance(businessId, scored, { population, budget } = {}) {
  const f = FINANCE[businessId];
  if (!f) return null;

  const density = population?.density || null;
  const rent = rentPerSqft(density);

  // ---- 1. What it costs to start ----
  const monthlyRent = round(f.areaSqft * rent.rate);
  const deposit = monthlyRent * DEPOSIT_MONTHS;
  const staffCost = f.staff * STAFF_SALARY;
  const monthlyRunning = monthlyRent + staffCost + f.utilities;
  const workingCapital = monthlyRunning * WORKING_CAPITAL_MONTHS;

  const setup = [
    { label: 'Machines & equipment', amount: f.equipment, note: 'One-time purchase' },
    { label: 'Shop interiors & civil work', amount: f.interiors, note: 'Counter, shelves, paint, wiring' },
    { label: 'Opening stock', amount: f.inventory, note: 'Goods to fill the shop on day one' },
    { label: 'Licences & registration', amount: f.licence, note: f.licenceName },
    { label: `Rent deposit (${DEPOSIT_MONTHS} months)`, amount: deposit, note: `${f.areaSqft} sqft × ₹${rent.rate}/sqft` },
    { label: `Working capital (${WORKING_CAPITAL_MONTHS} months running cost)`, amount: workingCapital, note: 'Money to survive until sales pick up' },
  ];
  const totalInvestment = setup.reduce((s, r) => s + r.amount, 0);

  // ---- 2. How many customers are realistically reachable ----
  // People inside the CATCHMENT circle (not the whole study radius).
  const catchmentKm2 = (Math.PI * f.catchmentM * f.catchmentM) / 1e6;
  const catchmentPeople = density ? round(density * catchmentKm2) : null;

  // Competition share: our own competition factor (1 = no competitors).
  const share = scored?.breakdown?.competition ?? 1;

  let customers = null;
  let monthlyRevenue = null;
  let capacityLimited = false;
  if (catchmentPeople) {
    const base = (catchmentPeople / 1000) * f.per1000 * share;
    const wanted = Math.max(1, round(base));
    // One shop can only serve so many people, however big the crowd is.
    customers = Math.min(wanted, f.capacity);
    capacityLimited = wanted > f.capacity;
    monthlyRevenue = f.model === 'monthly' ? round(customers * f.ticket) : round(customers * f.ticket * 30);
  }

  // ---- 3. Monthly profit and payback ----
  const grossProfit = monthlyRevenue == null ? null : round(monthlyRevenue * f.margin);
  const netProfit = grossProfit == null ? null : grossProfit - monthlyRunning;
  const paybackMonths = netProfit && netProfit > 0 ? Math.ceil(totalInvestment / netProfit) : null;

  // Sales needed just to cover the running cost (the real break-even point).
  const breakEvenSales = round(monthlyRunning / f.margin);
  const breakEvenCustomersPerDay =
    f.model === 'monthly' ? round(breakEvenSales / f.ticket) : round(breakEvenSales / (f.ticket * 30));

  // ---- 4. Verdict ----
  const verdict = [];
  if (budget && totalInvestment > budget) {
    verdict.push({ level: 'bad', text: `Needs ₹${totalInvestment.toLocaleString('en-IN')}, which is more than your budget of ₹${budget.toLocaleString('en-IN')}.` });
  } else if (budget) {
    verdict.push({ level: 'good', text: `Fits your budget, with about ₹${(budget - totalInvestment).toLocaleString('en-IN')} left over.` });
  }
  if (capacityLimited) {
    verdict.push({ level: 'good', text: `There is more demand here than one ${f.model === 'monthly' ? 'centre' : 'shop'} can serve, so a second branch is possible later.` });
  }
  if (netProfit == null) {
    verdict.push({ level: 'warn', text: 'Population data is missing here, so the income estimate could not be made.' });
  } else if (netProfit <= 0) {
    verdict.push({ level: 'bad', text: 'At these assumptions the shop does not cover its monthly costs. Try a cheaper location or a smaller shop.' });
  } else if (paybackMonths <= 18) {
    verdict.push({ level: 'good', text: `Money back in about ${paybackMonths} months, which is fast for this kind of shop.` });
  } else if (paybackMonths <= 36) {
    verdict.push({ level: 'warn', text: `Money back in about ${paybackMonths} months. Workable, but keep costs tight.` });
  } else {
    verdict.push({ level: 'bad', text: `Money back takes about ${paybackMonths} months, which is slow and risky.` });
  }

  return {
    // costs
    setup,
    totalInvestment,
    monthlyRent,
    staffCost,
    utilities: f.utilities,
    monthlyRunning,
    rentTier: rent.tier,
    rentRate: rent.rate,
    areaSqft: f.areaSqft,
    // income
    model: f.model,
    ticket: f.ticket,
    margin: f.margin,
    catchmentM: f.catchmentM,
    catchmentPeople,
    customers,
    capacity: f.capacity,
    capacityLimited,
    monthlyRevenue,
    grossProfit,
    netProfit,
    paybackMonths,
    breakEvenSales,
    breakEvenCustomersPerDay,
    verdict,
    licenceName: f.licenceName,
    assumptions: [
      `${f.areaSqft} sqft shop at ₹${rent.rate}/sqft (${rent.tier})`,
      `${f.staff} worker(s) at ₹${STAFF_SALARY.toLocaleString('en-IN')} each`,
      f.model === 'monthly'
        ? `₹${f.ticket.toLocaleString('en-IN')} monthly fee per customer`
        : `₹${f.ticket} average bill per customer`,
      f.model === 'monthly'
        ? `${f.per1000} paying members per 1000 people living within ${f.catchmentM} m`
        : `${f.per1000} customers per day per 1000 people living within ${f.catchmentM} m`,
      `${Math.round(f.margin * 100)}% gross margin`,
      f.model === 'monthly'
        ? `one centre can hold about ${f.capacity} members at a time`
        : `one shop can serve about ${f.capacity} customers a day`,
    ],
  };
}