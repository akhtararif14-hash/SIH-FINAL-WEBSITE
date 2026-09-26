// lib/schemes.js
// Government loan schemes shown on the /schemes page.
//
// Every scheme belongs to one category. Right now only "General Schemes"
// has entries; "Special Schemes" is deliberately empty and will be filled later.
//
// Each scheme carries its text in all four languages. Category names and
// fact labels live in lib/translations.js, because other pages use them too.
//
// Source of the numbers: NSFDC (National Scheduled Castes Finance and
// Development Corporation), Ministry of Social Justice & Empowerment,
// Loan/Credit Schemes page, last updated 04.09.2026.

export const SCHEME_CATEGORIES = [
  { id: 'general', labelKey: 'catGeneral', noteKey: 'catGeneralNote' },
  { id: 'special', labelKey: 'catSpecial', noteKey: 'catSpecialNote' },
];

// The five facts every scheme lists, in the order they are shown.
// The label comes from translations; only the value differs per scheme.
const FACT_KEYS = [
  'factProjectCost',
  'factMaxLoan',
  'factInterest',
  'factRepayment',
  'factMoratorium',
];

export const SCHEMES = [
  {
    id: 'nsfdc-mfs',
    category: 'general',
    provider: 'NSFDC',
    applyVia: 'PM SURAJ',
    applyUrl: 'https://pmsuraj.dosje.gov.in/',
    helpline: '1800110396',
    text: {
      en: {
        name: 'Micro Finance Scheme (MFS)',
        tagline: 'Micro credit for very small units costing up to ₹1.40 lakh',
        detail:
          'NSFDC gives micro credit for units whose total project cost is up to ₹1.40 lakh. The loan covers up to 90% of the project cost, so you arrange only the remaining 10% yourself. The money reaches you through a State Channelising Agency (SCA) or Channel Agency (CA), and you repay that agency.',
        facts: [
          'Units costing up to ₹1.40 lakh',
          'Up to 90% of project cost, maximum ₹1.25 lakh per unit',
          '6.5% per year (NSFDC charges 2.5% from the SCA/CA)',
          'Quarterly instalments, within 3 years of disbursement',
          '3 months (no instalment during this period)',
        ],
      },
      hi: {
        name: 'माइक्रो फाइनेंस योजना (MFS)',
        tagline: '₹1.40 लाख तक की छोटी यूनिट के लिए माइक्रो लोन',
        detail:
          'NSFDC उन यूनिट के लिए माइक्रो लोन देता है जिनकी कुल लागत ₹1.40 लाख तक है। लोन परियोजना लागत का 90% तक देता है, यानी आपको सिर्फ़ बाकी 10% का इंतज़ाम करना होता है। पैसा राज्य चैनलाइज़िंग एजेंसी (SCA) या चैनल एजेंसी (CA) के ज़रिए आप तक पहुँचता है, और आप उसी एजेंसी को चुकाते हैं।',
        facts: [
          'लागत ₹1.40 लाख तक की यूनिट',
          'परियोजना लागत का 90% तक, अधिकतम ₹1.25 लाख प्रति यूनिट',
          'हर साल 6.5% (NSFDC, SCA/CA से 2.5% लेता है)',
          'तिमाही किस्तों में, पैसा मिलने के 3 साल के भीतर',
          '3 महीने (इस दौरान कोई किस्त नहीं)',
        ],
      },
      ur: {
        name: 'مائیکرو فنانس اسکیم (MFS)',
        tagline: '₹1.40 لاکھ تک لاگت والی چھوٹی یونٹ کے لیے مائیکرو قرض',
        detail:
          'NSFDC ان یونٹوں کے لیے مائیکرو قرض دیتا ہے جن کی کل لاگت ₹1.40 لاکھ تک ہے۔ قرض پراجیکٹ لاگت کا 90% تک ہوتا ہے، یعنی آپ کو صرف باقی 10% کا انتظام کرنا ہوتا ہے۔ رقم ریاستی چینلائزنگ ایجنسی (SCA) یا چینل ایجنسی (CA) کے ذریعے آپ تک پہنچتی ہے، اور آپ اسی ایجنسی کو واپس کرتے ہیں۔',
        facts: [
          '₹1.40 لاکھ تک لاگت والی یونٹ',
          'پراجیکٹ لاگت کا 90% تک، زیادہ سے زیادہ ₹1.25 لاکھ فی یونٹ',
          'سالانہ 6.5% (NSFDC، SCA/CA سے 2.5% لیتا ہے)',
          'سہ ماہی قسطوں میں، رقم ملنے کے 3 سال کے اندر',
          '3 ماہ (اس دوران کوئی قسط نہیں)',
        ],
      },
      bn: {
        name: 'মাইক্রো ফাইন্যান্স স্কিম (MFS)',
        tagline: '₹1.40 লাখ পর্যন্ত খরচের ছোট ইউনিটের জন্য মাইক্রো ঋণ',
        detail:
          'NSFDC সেইসব ইউনিটের জন্য মাইক্রো ঋণ দেয় যার মোট প্রকল্প খরচ ₹1.40 লাখ পর্যন্ত। ঋণ প্রকল্প খরচের 90% পর্যন্ত দেয়, অর্থাৎ আপনাকে শুধু বাকি 10% জোগাড় করতে হয়। টাকা রাজ্য চ্যানেলাইজিং এজেন্সি (SCA) বা চ্যানেল এজেন্সির (CA) মাধ্যমে আপনার কাছে আসে, এবং আপনি সেই এজেন্সিকেই শোধ করেন।',
        facts: [
          '₹1.40 লাখ পর্যন্ত খরচের ইউনিট',
          'প্রকল্প খরচের 90% পর্যন্ত, ইউনিট প্রতি সর্বোচ্চ ₹1.25 লাখ',
          'বছরে 6.5% (NSFDC, SCA/CA থেকে 2.5% নেয়)',
          'ত্রৈমাসিক কিস্তিতে, টাকা পাওয়ার 3 বছরের মধ্যে',
          '3 মাস (এই সময়ে কোনো কিস্তি নেই)',
        ],
      },
    },
  },
  {
    id: 'nsfdc-term-loan',
    category: 'general',
    provider: 'NSFDC',
    applyVia: 'PM SURAJ',
    applyUrl: 'https://pmsuraj.dosje.gov.in/',
    helpline: '1800110396',
    text: {
      en: {
        name: 'Term Loan',
        tagline: 'Bigger loan for units costing above ₹1.40 lakh, up to ₹50 lakh',
        detail:
          'For a unit that costs more than ₹1.40 lakh, NSFDC gives a Term Loan of up to 90% of the project cost. This is the scheme to look at when you need machines, a bigger shop or a small manufacturing setup. Repayment is spread over a longer period than the Micro Finance Scheme, and there is a longer gap before the first instalment.',
        facts: [
          'Units costing above ₹1.40 lakh and up to ₹50 lakh',
          'Up to 90% of project cost, above ₹1.25 lakh and up to ₹45 lakh per unit',
          '8% per year (NSFDC charges 4% from the SCA/CA)',
          'Quarterly instalments, within 7 years',
          '6 months (12 months for plantation and construction work)',
        ],
      },
      hi: {
        name: 'टर्म लोन',
        tagline: '₹1.40 लाख से ऊपर और ₹50 लाख तक की यूनिट के लिए बड़ा लोन',
        detail:
          '₹1.40 लाख से ज़्यादा लागत वाली यूनिट के लिए NSFDC परियोजना लागत का 90% तक टर्म लोन देता है। मशीन, बड़ी दुकान या छोटे मैन्युफैक्चरिंग सेटअप के लिए यही योजना देखें। चुकाने की अवधि माइक्रो फाइनेंस योजना से लंबी है, और पहली किस्त से पहले ज़्यादा समय मिलता है।',
        facts: [
          'लागत ₹1.40 लाख से ऊपर और ₹50 लाख तक की यूनिट',
          'परियोजना लागत का 90% तक, ₹1.25 लाख से ऊपर और ₹45 लाख प्रति यूनिट तक',
          'हर साल 8% (NSFDC, SCA/CA से 4% लेता है)',
          'तिमाही किस्तों में, 7 साल के भीतर',
          '6 महीने (बागान और निर्माण कार्य के लिए 12 महीने)',
        ],
      },
      ur: {
        name: 'ٹرم لون',
        tagline: '₹1.40 لاکھ سے اوپر اور ₹50 لاکھ تک کی یونٹ کے لیے بڑا قرض',
        detail:
          '₹1.40 لاکھ سے زیادہ لاگت والی یونٹ کے لیے NSFDC پراجیکٹ لاگت کا 90% تک ٹرم لون دیتا ہے۔ مشین، بڑی دکان یا چھوٹے مینوفیکچرنگ سیٹ اپ کے لیے یہی اسکیم دیکھیں۔ واپسی کی مدت مائیکرو فنانس اسکیم سے لمبی ہے، اور پہلی قسط سے پہلے زیادہ وقت ملتا ہے۔',
        facts: [
          '₹1.40 لاکھ سے اوپر اور ₹50 لاکھ تک لاگت والی یونٹ',
          'پراجیکٹ لاگت کا 90% تک، ₹1.25 لاکھ سے اوپر اور ₹45 لاکھ فی یونٹ تک',
          'سالانہ 8% (NSFDC، SCA/CA سے 4% لیتا ہے)',
          'سہ ماہی قسطوں میں، 7 سال کے اندر',
          '6 ماہ (باغبانی اور تعمیراتی کام کے لیے 12 ماہ)',
        ],
      },
      bn: {
        name: 'টার্ম লোন',
        tagline: '₹1.40 লাখের বেশি ও ₹50 লাখ পর্যন্ত ইউনিটের জন্য বড় ঋণ',
        detail:
          '₹1.40 লাখের বেশি খরচের ইউনিটের জন্য NSFDC প্রকল্প খরচের 90% পর্যন্ত টার্ম লোন দেয়। মেশিন, বড় দোকান বা ছোট উৎপাদন সেটআপের জন্য এই স্কিমটিই দেখুন। শোধের মেয়াদ মাইক্রো ফাইন্যান্স স্কিমের চেয়ে লম্বা, এবং প্রথম কিস্তির আগে বেশি সময় পাওয়া যায়।',
        facts: [
          '₹1.40 লাখের বেশি ও ₹50 লাখ পর্যন্ত খরচের ইউনিট',
          'প্রকল্প খরচের 90% পর্যন্ত, ₹1.25 লাখের বেশি ও ইউনিট প্রতি ₹45 লাখ পর্যন্ত',
          'বছরে 8% (NSFDC, SCA/CA থেকে 4% নেয়)',
          'ত্রৈমাসিক কিস্তিতে, 7 বছরের মধ্যে',
          '6 মাস (বাগান ও নির্মাণ কাজের জন্য 12 মাস)',
        ],
      },
    },
  },
];

// One scheme, with its text already picked for the chosen language.
// Falls back to English if a translation is missing.
export function localiseScheme(scheme, lang) {
  const text = scheme.text[lang] || scheme.text.en;
  return {
    id: scheme.id,
    category: scheme.category,
    provider: scheme.provider,
    applyVia: scheme.applyVia,
    applyUrl: scheme.applyUrl,
    helpline: scheme.helpline,
    name: text.name,
    tagline: text.tagline,
    detail: text.detail,
    // Pair each value with the translation key for its label.
    facts: text.facts.map((value, i) => ({ labelKey: FACT_KEYS[i], value })),
  };
}

export function schemesInCategory(categoryId, lang = 'en') {
  return SCHEMES.filter((s) => s.category === categoryId).map((s) => localiseScheme(s, lang));
}

// Used by the calculator, which only needs the name.
export function schemeName(id, lang = 'en') {
  const scheme = SCHEMES.find((s) => s.id === id);
  if (!scheme) return id;
  return (scheme.text[lang] || scheme.text.en).name;
}