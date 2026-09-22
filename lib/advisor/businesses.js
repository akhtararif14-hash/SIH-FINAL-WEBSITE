// lib/advisor/businesses.js
// The list of business types the advisor can recommend.
//
// Every business has:
//   competitors : OpenStreetMap tags that identify an EXISTING shop of this type
//   anchors     : nearby places that bring customers, with a weight 0–1
//   weights     : how much population / anchors / accessibility matter for demand
//                 (pop + anchors + access must add up to 1.0)
//   saturation  : how many "strong" competitors cut the opportunity in half
//   setupCost   : rough starting investment in ₹ [min, max]
//   category    : used for the user's interest filter
//
// IMPORTANT: setupCost, weights and saturation are OUR ASSUMPTIONS, not measured
// data. Tune them after talking to real shop owners — and say so if a judge asks.

export const ANCHOR_TYPES = {
  college: { label: 'Colleges / universities', tags: [['amenity', ['college', 'university']]] },
  school: { label: 'Schools', tags: [['amenity', ['school']]] },
  hospital: { label: 'Hospitals', tags: [['amenity', ['hospital']]] },
  clinic: { label: 'Clinics / doctors', tags: [['amenity', ['clinic', 'doctors']]] },
  station: {
    label: 'Metro / railway / bus stations',
    tags: [
      ['railway', ['station', 'halt']],
      ['amenity', ['bus_station']],
    ],
  },
  busStop: { label: 'Bus stops', tags: [['highway', ['bus_stop']]] },
  office: { label: 'Offices', tags: [['office', '*']] },
  market: {
    label: 'Markets / malls',
    tags: [
      ['amenity', ['marketplace']],
      ['shop', ['mall', 'department_store']],
    ],
  },
  hotel: { label: 'Hotels / hostels / PGs', tags: [['tourism', ['hotel', 'guest_house', 'hostel']]] },
  worship: { label: 'Temples / mosques / churches', tags: [['amenity', ['place_of_worship']]] },
};

export const BUSINESSES = [
  {
    id: 'cafe',
    name: 'Café / tea stall',
    nameHi: 'कैफ़े / चाय की दुकान',
    category: 'food',
    competitors: [['amenity', ['cafe']]],
    anchors: { college: 1.0, station: 0.9, office: 0.8, hospital: 0.5, market: 0.6, school: 0.3 },
    weights: { pop: 0.3, anchors: 0.5, access: 0.2 },
    saturation: 3,
    setupCost: [150000, 500000],
  },
  {
    id: 'restaurant',
    name: 'Restaurant / fast food / dhaba',
    nameHi: 'रेस्टोरेंट / फ़ास्ट फ़ूड / ढाबा',
    category: 'food',
    competitors: [['amenity', ['restaurant', 'fast_food', 'food_court']]],
    anchors: { office: 0.9, college: 0.8, station: 0.8, market: 0.8, hotel: 0.6, hospital: 0.5 },
    weights: { pop: 0.35, anchors: 0.45, access: 0.2 },
    saturation: 5,
    setupCost: [300000, 1500000],
  },
  {
    id: 'bakery',
    name: 'Bakery / sweet shop',
    nameHi: 'बेकरी / मिठाई की दुकान',
    category: 'food',
    competitors: [['shop', ['bakery', 'confectionery', 'pastry']]],
    anchors: { worship: 0.7, market: 0.7, school: 0.5, station: 0.4, office: 0.4 },
    weights: { pop: 0.55, anchors: 0.3, access: 0.15 },
    saturation: 3,
    setupCost: [200000, 800000],
  },
  {
    id: 'juice',
    name: 'Juice / ice-cream shop',
    nameHi: 'जूस / आइसक्रीम की दुकान',
    category: 'food',
    competitors: [
      ['shop', ['ice_cream', 'beverages']],
      ['amenity', ['ice_cream']],
    ],
    anchors: { college: 0.9, school: 0.7, station: 0.8, market: 0.8, hospital: 0.4 },
    weights: { pop: 0.35, anchors: 0.45, access: 0.2 },
    saturation: 3,
    setupCost: [80000, 300000],
    climate: 'hot', // does better where there are many hot days
  },
  {
    id: 'grocery',
    name: 'Kirana / grocery store',
    nameHi: 'किराना / राशन की दुकान',
    category: 'retail',
    competitors: [['shop', ['convenience', 'supermarket', 'grocery', 'general']]],
    anchors: { school: 0.3, worship: 0.3, station: 0.3 },
    weights: { pop: 0.75, anchors: 0.1, access: 0.15 },
    saturation: 6,
    setupCost: [200000, 800000],
  },
  {
    id: 'pharmacy',
    name: 'Medical store / pharmacy',
    nameHi: 'मेडिकल स्टोर / दवाई की दुकान',
    category: 'health',
    competitors: [
      ['amenity', ['pharmacy']],
      ['shop', ['chemist']],
    ],
    anchors: { hospital: 1.0, clinic: 0.9 },
    weights: { pop: 0.45, anchors: 0.45, access: 0.1 },
    saturation: 4,
    setupCost: [300000, 1000000],
    note: 'Needs a registered pharmacist and a drug licence.',
  },
  {
    id: 'stationery',
    name: 'Stationery / photocopy shop',
    nameHi: 'स्टेशनरी / फ़ोटोकॉपी की दुकान',
    category: 'retail',
    competitors: [['shop', ['stationery', 'copyshop', 'books']]],
    anchors: { college: 1.0, school: 1.0, office: 0.5 },
    weights: { pop: 0.2, anchors: 0.65, access: 0.15 },
    saturation: 2,
    setupCost: [80000, 300000],
  },
  {
    id: 'mobile',
    name: 'Mobile repair & accessories',
    nameHi: 'मोबाइल रिपेयर और एक्सेसरीज़',
    category: 'services',
    competitors: [
      ['shop', ['mobile_phone', 'electronics']],
      ['craft', ['electronics_repair']],
    ],
    anchors: { college: 0.8, station: 0.8, market: 0.9, office: 0.5 },
    weights: { pop: 0.4, anchors: 0.4, access: 0.2 },
    saturation: 4,
    setupCost: [50000, 250000],
  },
  {
    id: 'salon',
    name: 'Salon / beauty parlour',
    nameHi: 'सैलून / ब्यूटी पार्लर',
    category: 'services',
    competitors: [['shop', ['hairdresser', 'beauty']]],
    anchors: { college: 0.6, office: 0.5, market: 0.5 },
    weights: { pop: 0.7, anchors: 0.2, access: 0.1 },
    saturation: 4,
    setupCost: [100000, 500000],
  },
  {
    id: 'tailor',
    name: 'Tailoring / boutique',
    nameHi: 'सिलाई / बुटीक',
    category: 'services',
    competitors: [
      ['shop', ['tailor', 'fabric']],
      ['craft', ['tailor', 'dressmaker']],
    ],
    anchors: { market: 0.8, college: 0.4, school: 0.4 },
    weights: { pop: 0.7, anchors: 0.2, access: 0.1 },
    saturation: 3,
    setupCost: [40000, 250000],
  },
  {
    id: 'laundry',
    name: 'Laundry / dry cleaning',
    nameHi: 'लॉन्ड्री / ड्राई क्लीनिंग',
    category: 'services',
    competitors: [['shop', ['laundry', 'dry_cleaning']]],
    anchors: { college: 0.9, hotel: 0.9, office: 0.6, hospital: 0.5 },
    weights: { pop: 0.5, anchors: 0.4, access: 0.1 },
    saturation: 2,
    setupCost: [150000, 600000],
  },
  {
    id: 'gym',
    name: 'Gym / fitness centre',
    nameHi: 'जिम / फ़िटनेस सेंटर',
    category: 'services',
    competitors: [['leisure', ['fitness_centre', 'sports_centre']]],
    anchors: { college: 0.9, office: 0.8 },
    weights: { pop: 0.55, anchors: 0.3, access: 0.15 },
    saturation: 2,
    setupCost: [500000, 2500000],
  },
  {
    id: 'coaching',
    name: 'Coaching / tuition centre',
    nameHi: 'कोचिंग / ट्यूशन सेंटर',
    category: 'education',
    competitors: [['amenity', ['prep_school', 'training', 'language_school']]],
    anchors: { school: 1.0, college: 0.8 },
    weights: { pop: 0.45, anchors: 0.45, access: 0.1 },
    saturation: 3,
    setupCost: [50000, 400000],
  },
  {
    id: 'hardware',
    name: 'Hardware / paint shop',
    nameHi: 'हार्डवेयर / पेंट की दुकान',
    category: 'retail',
    competitors: [['shop', ['hardware', 'doityourself', 'paint', 'trade']]],
    anchors: { market: 0.5 },
    weights: { pop: 0.7, anchors: 0.1, access: 0.2 },
    saturation: 3,
    setupCost: [300000, 1200000],
  },
  {
    id: 'appliance_repair',
    name: 'AC / cooler / appliance repair',
    nameHi: 'AC / कूलर / उपकरण रिपेयर',
    category: 'services',
    competitors: [['shop', ['appliance']]],
    anchors: { office: 0.5, hotel: 0.5, market: 0.4 },
    weights: { pop: 0.7, anchors: 0.15, access: 0.15 },
    saturation: 3,
    setupCost: [50000, 200000],
    climate: 'hot',
  },
];

export const CATEGORIES = ['food', 'retail', 'services', 'health', 'education'];

// Returns true if an OSM element's tags match any selector in the list.
// A selector is [key, [allowed values]] or [key, '*'] for "any value".
export function matchesTags(tags, selectors) {
  if (!tags) return false;
  return selectors.some(([key, values]) => {
    const v = tags[key];
    if (v === undefined) return false;
    return values === '*' ? true : values.includes(v);
  });
}