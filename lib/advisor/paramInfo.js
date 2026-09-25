// lib/advisor/paramInfo.js
// Plain-language explanation for every number shown on a business card.
// Used by the small "i" buttons. Each entry says WHAT it is, HOW it is
// calculated, and WHERE the data comes from — with the user's own numbers
// filled in, so the explanation is about their location, not a generic note.

const pct = (v) => `${Math.round(v * 100)}%`;

export const PARAM_INFO = {
  score: {
    title: 'Opportunity score (0–100)',
    build: (r) => ({
      what: 'One number that mixes how many customers are available, how many shops already serve them, and whether the weather suits this business.',
      how: `Score = 100 × Demand × Low-competition × Weather = 100 × ${r.breakdown.demand} × ${r.breakdown.competition} × ${r.breakdown.environment} = ${r.score}`,
      source: 'Our own scoring engine. Every part of it is shown below, so you can check the maths.',
      tip: 'Compare scores between two places, not against a "pass mark". A 35 in a busy city can be better than a 60 in an empty area.',
    }),
  },
  demand: {
    title: 'Demand',
    build: (r) => ({
      what: 'How many customers this spot can realistically give you, before counting competition.',
      how: `Demand = ${r.breakdown.weights.pop} × population (${r.breakdown.population}) + ${r.breakdown.weights.anchors} × nearby places (${r.breakdown.anchors}) + ${r.breakdown.weights.access} × accessibility (${r.breakdown.access}) = ${r.breakdown.demand}`,
      source: 'The three parts below. The weights change per business — a kirana store depends mostly on population, a stationery shop mostly on schools and colleges.',
      tip: 'A value above 0.6 means plenty of customers are within reach.',
    }),
  },
  population: {
    title: 'Population score',
    build: (r, ctx) => ({
      what: 'How crowded the area around your pin is.',
      how: ctx.population
        ? `${ctx.population.people.toLocaleString('en-IN')} people live inside your circle, which is ${ctx.population.density.toLocaleString('en-IN')} per km². Score = density ÷ 20,000 (capped at 1) = ${r.breakdown.population}`
        : 'Population data could not be loaded, so a neutral 0.5 was used.',
      source: 'WorldPop 2020 population grid (University of Southampton), about 100 m detail.',
      tip: '20,000 people per km² counts as "full marks" — that is the density of a busy Indian city neighbourhood.',
    }),
  },
  anchors: {
    title: 'Nearby places score',
    build: (r) => ({
      what: 'Places near you that push customers towards your shop — colleges, hospitals, metro stations, offices, markets.',
      how: r.breakdown.anchorParts.length
        ? `Found: ${r.breakdown.anchorParts.map((p) => `${p.count} ${p.label.toLowerCase()}`).join(', ')}. Each type has a weight for this business, counts above 3 stop adding, and the total is divided by 5. Score = ${r.breakdown.anchors}`
        : 'No customer-pulling places were found nearby, so this score is 0.',
      source: 'OpenStreetMap (Overpass API) — mapped by volunteers, so some places may be missing.',
      tip: 'This is why the same shop scores differently 500 m apart: one side of the road may have a college, the other may not.',
    }),
  },
  access: {
    title: 'Accessibility score',
    build: (r, ctx) => ({
      what: 'How easily customers can reach your shop.',
      how: `Main roads within 300 m: ${ctx.access?.majorRoads ?? 0}. Stations: ${ctx.anchors?.station ?? 0}, bus stops: ${ctx.anchors?.busStop ?? 0}. Parking spots: ${ctx.access?.parking ?? 0}. Score = 0.4 × roads + 0.45 × transport + 0.15 × parking = ${r.breakdown.access}`,
      source: 'OpenStreetMap roads, stations, bus stops and parking.',
      tip: 'Low access is not always bad for a kirana store (neighbours walk), but it hurts a restaurant or gym.',
    }),
  },
  competition: {
    title: 'Low-competition factor',
    build: (r) => ({
      what: 'How much the shops already here cut into your share. 1.0 means no competition, 0.3 means a very crowded market.',
      how: `${r.competitorCount} similar shop(s) found, giving a competitor strength of ${r.breakdown.competitorStrengthSum}. Factor = 1 ÷ (1 + strength ÷ saturation limit) = ${r.breakdown.competition}`,
      source: r.competitorSource === 'google'
        ? 'Google Places, including star ratings. A shop above 4★ with 100+ reviews counts as a strong competitor (1.0), a weak one counts 0.3.'
        : 'OpenStreetMap. No ratings are available there, so each shop counts as 0.7 (unknown strength).',
      tip: 'The saturation limit grows with the area you study, so a 10 km circle is not unfairly punished for having more shops.',
    }),
  },
  environment: {
    title: 'Weather fit',
    build: (r, ctx) => ({
      what: 'Whether the local weather helps or hurts this business.',
      how: r.breakdown.environment === 1
        ? 'No weather penalty for this business (value 1.0).'
        : `${r.breakdown.environmentReason}. Value = ${r.breakdown.environment}`,
      source: ctx.climate
        ? `Open-Meteo, last 12 months: average day temperature ${ctx.climate.avgMaxTemp} °C, ${ctx.climate.hotDays} days at or above 40 °C, ${ctx.climate.annualRainMm} mm rain.`
        : 'Open-Meteo weather data could not be loaded.',
      tip: 'Only weather-sensitive businesses are affected, such as juice/ice-cream shops and AC or cooler repair.',
    }),
  },
  risk: {
    title: 'Dependence risk',
    build: (r) => ({
      what: 'Whether too many of your customers would come from one single source.',
      how: r.risk.source
        ? `${pct(r.risk.share)} of outside demand comes from ${r.risk.source.toLowerCase()} → "${r.risk.level}" risk.`
        : 'No outside customer sources were found, so this cannot be judged.',
      source: 'Calculated from the nearby places listed above.',
      tip: 'High risk usually means seasonal sales — for example, a shop that depends on a college goes quiet during vacations.',
    }),
  },
  investment: {
    title: 'Total investment needed',
    build: (r, ctx, fin) => ({
      what: 'All the money needed before the shop can open and survive the first months.',
      how: fin
        ? `Equipment ₹${fin.setup[0].amount.toLocaleString('en-IN')} + interiors ₹${fin.setup[1].amount.toLocaleString('en-IN')} + opening stock ₹${fin.setup[2].amount.toLocaleString('en-IN')} + licences ₹${fin.setup[3].amount.toLocaleString('en-IN')} + rent deposit ₹${fin.setup[4].amount.toLocaleString('en-IN')} + working capital ₹${fin.setup[5].amount.toLocaleString('en-IN')} = ₹${fin.totalInvestment.toLocaleString('en-IN')}`
        : 'Not available.',
      source: 'Typical costs for this business type, with rent estimated from how crowded the area is.',
      tip: 'Working capital is the part first-time owners forget. It is the money that pays rent and salaries before sales pick up.',
    }),
  },
  revenue: {
    title: 'Monthly sales estimate',
    build: (r, ctx, fin) => ({
      what: 'A rough guess of what the shop could sell in a month at this location.',
      how: fin && fin.customers
        ? fin.model === 'monthly'
          ? `About ${fin.catchmentPeople.toLocaleString('en-IN')} people live within ${fin.catchmentM} m. At ${'' + (fin.customers)} paying members × ₹${fin.ticket.toLocaleString('en-IN')} per month = ₹${fin.monthlyRevenue.toLocaleString('en-IN')}`
          : `About ${fin.catchmentPeople.toLocaleString('en-IN')} people live within ${fin.catchmentM} m. That gives roughly ${fin.customers} customers a day × ₹${fin.ticket} average bill × 30 days = ₹${fin.monthlyRevenue.toLocaleString('en-IN')}`
        : 'Population data is missing, so sales could not be estimated.',
      source: 'Population from WorldPop, competition from the score above, and typical bill sizes for this business.',
      tip: 'Treat this as a starting point for your own market check, not a promise. Ask 5 nearby shop owners what they actually sell in a day.',
    }),
  },
  payback: {
    title: 'Payback time',
    build: (r, ctx, fin) => ({
      what: 'How long until the profit adds up to the money you put in.',
      how: fin && fin.paybackMonths
        ? `Investment ₹${fin.totalInvestment.toLocaleString('en-IN')} ÷ monthly profit ₹${fin.netProfit.toLocaleString('en-IN')} = about ${fin.paybackMonths} months`
        : 'Cannot be calculated, because the estimated monthly profit is zero or negative here.',
      source: 'Our investment and sales estimates above.',
      tip: 'Under 18 months is good for a small shop. Over 36 months means a small drop in sales can put you in trouble.',
    }),
  },
  breakeven: {
    title: 'Break-even sales',
    build: (r, ctx, fin) => ({
      what: 'The minimum sales needed each month just to cover rent, salaries and bills.',
      how: fin
        ? `Monthly running cost ₹${fin.monthlyRunning.toLocaleString('en-IN')} ÷ ${Math.round(fin.margin * 100)}% margin = ₹${fin.breakEvenSales.toLocaleString('en-IN')} of sales, which is about ${fin.breakEvenCustomersPerDay} ${fin.model === 'monthly' ? 'members' : 'customers a day'}.`
        : 'Not available.',
      source: 'Rent, salaries and utilities estimated for this area and shop size.',
      tip: 'Below this number you are losing money every month, however busy the shop looks.',
    }),
  },
  confidence: {
    title: 'Data confidence',
    build: (r, ctx) => ({
      what: 'How complete our map data is for this area.',
      how: `${ctx.mappedShops ?? 0} shops are mapped inside your circle${ctx.population ? ` for ${ctx.population.people.toLocaleString('en-IN')} people` : ''}. Fewer than 0.5 shops per 1,000 people is marked "low".`,
      source: 'OpenStreetMap is built by volunteers, so small Indian shops are often missing.',
      tip: 'When confidence is low, competition numbers are probably too low. Walk the street, or add a Google Places key.',
    }),
  },
};

export function getParamInfo(key, scored, context, finance) {
  const entry = PARAM_INFO[key];
  if (!entry) return null;
  return { title: entry.title, ...entry.build(scored, context || {}, finance) };
}