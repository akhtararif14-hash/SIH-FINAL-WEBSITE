// lib/advisor/i18n.js
// Every word the Location Advisor shows — the page, the SWOT analysis,
// the saved report and the Downloads page — in all four languages.
//
// Kept separate from lib/translations.js because this is a lot of text and
// only the advisor needs it.
//
// Use it like this:
//     import { advisorT } from '@/lib/advisor/i18n';
//     const A = advisorT(lang);
//     A('myLocation')                     -> "My location"
//     A('sFastPayback', { n: 14 })        -> "Money comes back fast: about 14 months…"

const TEXT = {
  /* ================================================================== */
  en: {
    // --- searching for a place ---
    searchPlaceholder: 'Search a place, e.g. Batla House, Delhi',
    searchBtn: 'Search',
    searching: 'Searching…',
    myLocation: 'My location',
    errMapData: 'Could not load map data for this spot. Please try again in a minute.',
    errShort3: 'Type at least 3 letters of a place name.',
    errNoPlace: 'No place found. Try adding the city name, e.g. "Lajpat Nagar, Delhi".',
    errSearchFailed: 'Search failed',
    errNoGeo: 'Your browser does not support location.',
    errGeoDenied: 'Location permission was denied. Search or tap on the map instead.',
    errPinBFirst: 'Drop pin B on the map first.',
    errChooseFirst: 'Choose a location first.',
    errAnalysisFailed: 'Analysis failed',
    errTimeout:
      'The study took too long and the server stopped it. Try a smaller radius (5 km), then run it again — the second try is much faster.',

    // --- running the study ---
    findBest: 'Find the best business here →',
    studyingArea: 'Studying this area…',
    biggerCircleNote: 'A bigger circle takes longer. The same spot loads instantly next time.',
    step1: 'Finding the address of your pin…',
    step2: 'Reading every shop and landmark on the map…',
    step3: 'Counting the people who live inside your circle…',
    step4: 'Checking last 12 months of weather…',
    step5: 'Scoring 15 businesses against the data…',
    step6: 'Writing your advice in simple words…',

    // --- what we found ---
    whatWeFound: 'What we found around {label}',
    peopleInCircle: 'People living in this circle',
    popUnavailable: 'population data unavailable',
    avgTemp: 'Average day temperature',
    rainLast12: 'Rain last 12 months',
    heightAboveSea: 'Height above sea level',
    dataConfidence: 'data confidence',
    nothingNotable: 'Nothing notable found.',

    // --- results ---
    bestIdeasFor: 'Best business ideas for {label} (tap one to see its competitors on the map)',
    noBusinessFits: 'No business fits these filters. Try a bigger budget or fewer interests.',
    notInInterests: 'not in chosen interests',
    opportunityScore: 'opportunity score',
    nearbyPlacesLbl: 'nearby places',
    lowCompetition: 'Low competition',
    weatherFit: 'Weather fit',
    dependenceRisk: 'Dependence risk',
    howScoreBuilt: 'How this score was built',
    nearbyWord: 'nearby',
    reviewsNote: 'Reviews from Google. Read what people complain about, then do that one thing better.',

    // --- money panel ---
    moneyToStart: 'Money needed to start',
    totalInvestment: 'Total investment',
    everyMonth: 'Every month, if it runs as expected',
    monthlySales: 'monthly sales',
    grossProfit: 'Gross profit',
    rent: 'Rent',
    staffSalaries: 'Staff salaries',
    utilities: 'Electricity, water, internet',
    netProfit: 'Profit left with the owner',
    paybackTime: 'Payback time',
    breakEvenSales: 'Break-even sales',
    firstYearProfit: 'First-year profit',
    customersADay: 'customers a day',
    notReached: 'not reached',
    financeNote:
      'These are typical figures, not quotes. Confirm rent, stock and licence costs locally before investing.',

    // --- SWOT box titles ---
    swotTitle: 'SWOT analysis for this location',
    swotGood: 'good here, now',
    swotMissing: 'missing here',
    swotGaps: 'gaps you can use',
    swotWrong: 'what could go wrong',

    // --- comparing two places ---
    compareWith: 'Compare with another location',
    selectWord: 'Select',
    pinB: 'Pin B',
    setPinB: 'Set pin B',
    studyingB: 'Studying location B…',
    analyseB: 'Analyse location B',
    businessCol: 'Business',
    betterCol: 'Better',
    theSame: 'the same',
    aMoreDemandBLessComp: 'A has more demand, but B has far less competition.',

    // --- saving the report ---
    keepReport: 'Keep this report',
    keepReportSub:
      'Save it to your Downloads page — it opens later even without internet, and can be printed as a PDF.',
    saveReport: 'Save this report',
    savedToDownloads: '✓ Saved to Downloads',

    // --- the saved report file ---
    repDocTitle: 'Business report — {place}',
    repHeading: 'Business opportunity report',
    repFileName: 'Business report — {place}',
    repCircle: 'Circle studied',
    repCreated: 'Created',
    repPreparedFor: 'Prepared for',
    repPeople: 'People in this circle',
    repNotAvailable: 'not available',
    repBestIdeas: 'Best business ideas here',
    repRank: '#',
    repBusiness: 'Business',
    repScore: 'Score',
    repInvestment: 'Investment',
    repMonthlyProfit: 'Monthly profit',
    repPayback: 'Payback',
    repSimilarNearby: '{n} similar shops nearby',
    repMonths: 'months',
    repSwotFor: 'SWOT — {name}',
    repStrengths: 'Strengths',
    repWeaknesses: 'Weaknesses',
    repOpportunities: 'Opportunities',
    repThreats: 'Threats',
    repAdvisorSummary: 'Advisor summary',
    repData: 'Data',
    repDisclaimer:
      'All figures are estimates to guide your own research. Visit the area at different times of day before investing.',
    repMadeBy: 'Generated by SriGen — AI Business Advisor.',

    // --- Downloads page ---
    dlSubtitle:
      'Reports you saved. Open them any time, download them, or print them as PDF from your browser.',
    dlNoFiles: 'No files yet',
    dlNoFilesSub: 'Run a location study and press Save this report. It will appear here.',
    dlGoAdvisor: 'Go to Location Advisor →',
    dlOpen: 'Open',
    dlDownload: 'Download',
    dlDelete: 'Delete',
    dlFooter:
      'Files are stored in this browser only. To keep one permanently, press Download, or open it and print it as a PDF.',

    // --- warnings from the server ---
    warnReducedRadius:
      'The map server was busy, so we studied a smaller {km} km circle instead. Try again in a minute for the full radius.',
    warnTruncated:
      'This area has a very large number of mapped places, so we read only part of it. Results are still usable but may undercount shops.',
    warnNoGoogleKey:
      'Google Places is not switched on, so shop counts come from OpenStreetMap only, which misses many small Indian shops.',

    // --- SWOT sentences ---
    areaAbout: 'about {km} km²',
    areaThis: 'this area',
    peopleCount: '{n} people',
    popMissing: 'population data missing',
    sCrowded: 'Crowded area: {people} live around this point ({density} per km²).',
    sSteady: 'Steady local crowd: {people} live around this point.',
    wThin: 'Thin crowd: only {density} people per km² live here, so walk-in customers will be fewer.',
    sSources: 'Customer sources nearby: {list}.',
    wNoAnchors: 'No colleges, hospitals, offices or markets nearby to pull in outside customers.',
    oLocalOnly:
      'Demand here is mostly from local residents, so home delivery or WhatsApp orders can widen your reach.',
    sAccess: 'Easy to reach: main roads and public transport are close by.',
    wAccess: 'Weak access: few main roads or transport stops nearby, so customers must come on purpose.',
    oNoCompetitor:
      'No shop of this type is mapped here yet — you could be the first, but confirm on foot before investing.',
    sLightComp:
      'Light competition: {n} similar shop(s) spread across {area}, which is thin for an area this size.',
    wRealComp: 'Real competition: {n} similar shops already run inside {area}.',
    wCrowdedMarket:
      'Crowded market: {n} similar shops are already inside {area}, so winning customers will be slow and costly.',
    tPriceWar:
      'A price war is likely in a market this full. Plan a clear difference (speed, quality, timings) before opening.',
    oWeakRivals:
      '{weak} of {total} nearby shops score below 3.5★ — customers here are unhappy and will switch to a better shop.',
    tStrongRivals: 'Nearby shops are well rated ({n} above 4★), so they already have loyal customers.',
    wWeather: 'Weather is not ideal: {reason}.',
    sWeather: 'Weather helps this business: {reason}.',
    tHotDays: '{n} days crossed 40 °C last year — expect higher cooling bills and fewer afternoon customers.',
    tHeavyRain:
      'Heavy rain area ({mm} mm last year) — monsoon months can cut footfall and risk water damage.',
    tRiskHigh:
      '{pct}% of your outside customers would come from {source}. If they close (holidays, vacations, shifting), sales drop sharply.',
    tRiskMed: 'A large share of customers depends on {source}, so plan for their off-season.',
    sFastPayback: 'Money comes back fast: about {n} months at our estimated sales.',
    wSlowPayback: 'Slow payback: roughly {n} months to recover the investment.',
    wNoProfit: 'At normal prices for this area, monthly sales may not cover rent and salaries.',
    tHighRent: 'High rent (about ₹{n} a month) — any slow month hurts badly.',
    oLoan: 'An NSFDC or MUDRA loan can cover most of the ₹{n} needed — check the Schemes page.',
    tRules: 'Rules to clear first: {note}',
    oSecondStream:
      'Strong overall demand here supports a second income stream later (deliveries, tie-ups with nearby offices or hostels).',
    oCapacity:
      'Demand here is bigger than one outlet can serve — a second branch or home delivery could add income later.',
    sNone: 'No clear advantage found at this exact spot. Try moving the pin closer to a market, college or station.',
    wNone: 'Nothing weak stood out in the data — but our map data misses many small shops, so check the street yourself.',
    oNone: 'No special gap found here. Standard openings remain: longer opening hours, delivery, and online payments.',
    tNone: 'No specific threat found in the data. The usual ones still apply: a new competitor opening, or rent going up.',

    // --- places that bring customers ---
    envHotMany: '{n} days at or above 40 °C last year — strong summer demand',
    envWarm: 'Warm climate — decent summer demand',
    envMild: 'Mild climate — lower demand for cooling products',

    short_college: 'colleges',
    short_school: 'schools',
    short_hospital: 'hospitals',
    short_clinic: 'clinics',
    short_station: 'stations',
    short_busStop: 'bus stops',
    short_office: 'offices',
    short_market: 'markets/malls',
    short_hotel: 'hotels/hostels',
    short_worship: 'places of worship',
    radiusHint: '5 km = your immediate market · 10 km = the wider town. A bigger circle takes longer to study.',

    demandLbl: 'Demand',
    populationLbl: 'population',
    accessibilityLbl: 'accessibility',
    budgetPlaceholder: 'e.g. 300000',

    anchor_college: 'Colleges / universities',
    anchor_school: 'Schools',
    anchor_hospital: 'Hospitals',
    anchor_clinic: 'Clinics / doctors',
    anchor_station: 'Metro / railway / bus stations',
    anchor_busStop: 'Bus stops',
    anchor_office: 'Offices',
    anchor_market: 'Markets / malls',
    anchor_hotel: 'Hotels / hostels / PGs',
    anchor_worship: 'Temples / mosques / churches',

    // --- business categories ---
    cat_food: 'Food',
    cat_retail: 'Retail',
    cat_services: 'Services',
    cat_health: 'Health',
    cat_education: 'Education',
  },

  /* ================================================================== */
  hi: {
    searchPlaceholder: 'कोई जगह खोजें, जैसे बटला हाउस, दिल्ली',
    searchBtn: 'खोजें',
    searching: 'खोज रहे हैं…',
    myLocation: 'मेरी जगह',
    errMapData: 'इस जगह का नक्शा डेटा नहीं आ सका। एक मिनट बाद फिर कोशिश करें।',
    errShort3: 'जगह के नाम के कम से कम 3 अक्षर लिखें।',
    errNoPlace: 'कोई जगह नहीं मिली। शहर का नाम भी जोड़ें, जैसे "लाजपत नगर, दिल्ली"।',
    errSearchFailed: 'खोज नहीं हो पाई',
    errNoGeo: 'आपका ब्राउज़र जगह पता करने की सुविधा नहीं देता।',
    errGeoDenied: 'जगह की अनुमति नहीं मिली। खोजें या नक्शे पर टैप करें।',
    errPinBFirst: 'पहले नक्शे पर पिन B लगाएँ।',
    errChooseFirst: 'पहले कोई जगह चुनें।',
    errAnalysisFailed: 'विश्लेषण नहीं हो पाया',
    errTimeout:
      'अध्ययन में बहुत समय लगा और सर्वर ने इसे रोक दिया। छोटा दायरा (5 किमी) चुनकर दोबारा चलाएँ — दूसरी बार बहुत तेज़ होगा।',

    findBest: 'यहाँ का सबसे अच्छा बिज़नेस खोजें →',
    studyingArea: 'इस इलाके का अध्ययन हो रहा है…',
    biggerCircleNote: 'बड़ा दायरा ज़्यादा समय लेता है। अगली बार यही जगह तुरंत खुलेगी।',
    step1: 'आपके पिन का पता ढूँढ रहे हैं…',
    step2: 'नक्शे की हर दुकान और जगह पढ़ रहे हैं…',
    step3: 'आपके दायरे में रहने वाले लोग गिन रहे हैं…',
    step4: 'पिछले 12 महीनों का मौसम देख रहे हैं…',
    step5: '15 बिज़नेस को डेटा पर परख रहे हैं…',
    step6: 'आपकी सलाह आसान शब्दों में लिख रहे हैं…',

    whatWeFound: '{label} के आसपास हमें क्या मिला',
    peopleInCircle: 'इस दायरे में रहने वाले लोग',
    popUnavailable: 'आबादी का डेटा उपलब्ध नहीं',
    avgTemp: 'दिन का औसत तापमान',
    rainLast12: 'पिछले 12 महीनों की बारिश',
    heightAboveSea: 'समुद्र तल से ऊँचाई',
    dataConfidence: 'डेटा भरोसा',
    nothingNotable: 'कुछ खास नहीं मिला।',

    bestIdeasFor: '{label} के लिए सबसे अच्छे बिज़नेस (किसी एक पर टैप करें और नक्शे पर उसकी प्रतिस्पर्धा देखें)',
    noBusinessFits: 'इन फ़िल्टरों में कोई बिज़नेस नहीं आता। बजट बढ़ाएँ या कम रुचियाँ चुनें।',
    notInInterests: 'चुनी हुई रुचियों में नहीं',
    opportunityScore: 'अवसर स्कोर',
    nearbyPlacesLbl: 'आसपास की जगहें',
    lowCompetition: 'कम प्रतिस्पर्धा',
    weatherFit: 'मौसम की अनुकूलता',
    dependenceRisk: 'निर्भरता का जोखिम',
    howScoreBuilt: 'यह स्कोर कैसे बना',
    nearbyWord: 'आसपास',
    reviewsNote: 'Google से समीक्षाएँ। लोग किस बात की शिकायत करते हैं पढ़ें, फिर वही एक काम बेहतर करें।',

    moneyToStart: 'शुरू करने के लिए ज़रूरी पैसा',
    totalInvestment: 'कुल निवेश',
    everyMonth: 'हर महीने, अगर सब ठीक चले',
    monthlySales: 'महीने की बिक्री',
    grossProfit: 'सकल मुनाफ़ा',
    rent: 'किराया',
    staffSalaries: 'कर्मचारियों की तनख़्वाह',
    utilities: 'बिजली, पानी, इंटरनेट',
    netProfit: 'मालिक के पास बचा मुनाफ़ा',
    paybackTime: 'पैसा वापस आने का समय',
    breakEvenSales: 'बराबरी की बिक्री',
    firstYearProfit: 'पहले साल का मुनाफ़ा',
    customersADay: 'ग्राहक रोज़',
    notReached: 'नहीं पहुँचा',
    financeNote:
      'ये आम अनुमान हैं, पक्के दाम नहीं। निवेश से पहले किराया, माल और लाइसेंस की लागत अपने इलाके में पक्की कर लें।',

    swotTitle: 'इस जगह का SWOT विश्लेषण',
    swotGood: 'यहाँ अभी क्या अच्छा है',
    swotMissing: 'यहाँ क्या कमी है',
    swotGaps: 'कौन-से मौके आप ले सकते हैं',
    swotWrong: 'क्या गड़बड़ हो सकती है',

    compareWith: 'दूसरी जगह से तुलना करें',
    selectWord: 'चुनें',
    pinB: 'पिन B',
    setPinB: 'पिन B लगाएँ',
    studyingB: 'जगह B का अध्ययन हो रहा है…',
    analyseB: 'जगह B का विश्लेषण करें',
    businessCol: 'बिज़नेस',
    betterCol: 'बेहतर',
    theSame: 'बराबर',
    aMoreDemandBLessComp: 'A में माँग ज़्यादा है, लेकिन B में प्रतिस्पर्धा बहुत कम है।',

    keepReport: 'यह रिपोर्ट रखें',
    keepReportSub:
      'इसे अपने डाउनलोड पेज में सहेजें — यह बाद में बिना इंटरनेट के भी खुलेगी, और PDF में छापी जा सकती है।',
    saveReport: 'यह रिपोर्ट सहेजें',
    savedToDownloads: '✓ डाउनलोड में सहेजी गई',

    repDocTitle: 'बिज़नेस रिपोर्ट — {place}',
    repHeading: 'बिज़नेस अवसर रिपोर्ट',
    repFileName: 'बिज़नेस रिपोर्ट — {place}',
    repCircle: 'अध्ययन किया गया दायरा',
    repCreated: 'बनाई गई',
    repPreparedFor: 'किसके लिए बनाई गई',
    repPeople: 'इस दायरे में लोग',
    repNotAvailable: 'उपलब्ध नहीं',
    repBestIdeas: 'यहाँ के सबसे अच्छे बिज़नेस',
    repRank: 'क्रम',
    repBusiness: 'बिज़नेस',
    repScore: 'स्कोर',
    repInvestment: 'निवेश',
    repMonthlyProfit: 'मासिक मुनाफ़ा',
    repPayback: 'पैसा वापसी',
    repSimilarNearby: 'आसपास {n} मिलती-जुलती दुकानें',
    repMonths: 'महीने',
    repSwotFor: 'SWOT — {name}',
    repStrengths: 'मज़बूतियाँ',
    repWeaknesses: 'कमज़ोरियाँ',
    repOpportunities: 'मौके',
    repThreats: 'ख़तरे',
    repAdvisorSummary: 'सलाहकार का सार',
    repData: 'डेटा',
    repDisclaimer:
      'सभी आँकड़े अनुमान हैं और आपकी अपनी जाँच में मदद के लिए हैं। निवेश से पहले दिन के अलग-अलग समय पर इलाके में जाकर देखें।',
    repMadeBy: 'श्रीजेन — AI बिज़नेस सलाहकार द्वारा बनाई गई।',

    dlSubtitle:
      'आपकी सहेजी हुई रिपोर्टें। इन्हें कभी भी खोलें, डाउनलोड करें, या ब्राउज़र से PDF में छापें।',
    dlNoFiles: 'अभी कोई फ़ाइल नहीं',
    dlNoFilesSub: 'कोई जगह का अध्ययन चलाएँ और "यह रिपोर्ट सहेजें" दबाएँ। वह यहाँ दिखेगी।',
    dlGoAdvisor: 'स्थान सलाहकार पर जाएँ →',
    dlOpen: 'खोलें',
    dlDownload: 'डाउनलोड',
    dlDelete: 'हटाएँ',
    dlFooter:
      'फ़ाइलें सिर्फ़ इसी ब्राउज़र में रखी जाती हैं। पक्का रखने के लिए डाउनलोड दबाएँ, या खोलकर PDF में छाप लें।',

    warnReducedRadius:
      'नक्शा सर्वर व्यस्त था, इसलिए हमने {km} किमी का छोटा दायरा देखा। पूरे दायरे के लिए एक मिनट बाद फिर कोशिश करें।',
    warnTruncated:
      'इस इलाके में नक्शे पर बहुत ज़्यादा जगहें हैं, इसलिए हमने इसका कुछ हिस्सा ही पढ़ा। नतीजे काम के हैं पर दुकानें कम गिनी जा सकती हैं।',
    warnNoGoogleKey:
      'Google Places चालू नहीं है, इसलिए दुकानों की गिनती सिर्फ़ OpenStreetMap से है, जो कई छोटी भारतीय दुकानें छोड़ देता है।',

    areaAbout: 'लगभग {km} किमी²',
    areaThis: 'यह इलाका',
    peopleCount: '{n} लोग',
    popMissing: 'आबादी का डेटा नहीं है',
    sCrowded: 'भीड़भाड़ वाला इलाका: इस जगह के आसपास {people} रहते हैं ({density} प्रति किमी²)।',
    sSteady: 'लगातार स्थानीय भीड़: इस जगह के आसपास {people} रहते हैं।',
    wThin: 'कम भीड़: यहाँ सिर्फ़ {density} लोग प्रति किमी² रहते हैं, इसलिए चलते-फिरते ग्राहक कम मिलेंगे।',
    sSources: 'आसपास ग्राहकों के स्रोत: {list}।',
    wNoAnchors: 'आसपास कोई कॉलेज, अस्पताल, दफ़्तर या बाज़ार नहीं है जो बाहर से ग्राहक लाए।',
    oLocalOnly:
      'यहाँ माँग ज़्यादातर आसपास रहने वालों से है, इसलिए होम डिलीवरी या WhatsApp ऑर्डर से पहुँच बढ़ सकती है।',
    sAccess: 'पहुँचना आसान: मुख्य सड़कें और सार्वजनिक परिवहन पास हैं।',
    wAccess: 'पहुँच कमज़ोर: आसपास कम मुख्य सड़कें या स्टॉप हैं, इसलिए ग्राहक को जान-बूझकर आना पड़ेगा।',
    oNoCompetitor:
      'इस तरह की कोई दुकान अभी नक्शे पर नहीं है — आप पहले हो सकते हैं, पर निवेश से पहले पैदल जाकर पक्का करें।',
    sLightComp: 'हल्की प्रतिस्पर्धा: {area} में सिर्फ़ {n} मिलती-जुलती दुकानें हैं, जो इतने बड़े इलाके के लिए कम है।',
    wRealComp: 'असली प्रतिस्पर्धा: {area} में पहले से {n} मिलती-जुलती दुकानें चल रही हैं।',
    wCrowdedMarket:
      'भरा हुआ बाज़ार: {area} में पहले से {n} मिलती-जुलती दुकानें हैं, इसलिए ग्राहक जीतना धीमा और महँगा होगा।',
    tPriceWar:
      'इतने भरे बाज़ार में दाम की लड़ाई हो सकती है। खोलने से पहले साफ़ अलगाव तय करें (तेज़ी, गुणवत्ता, समय)।',
    oWeakRivals:
      'आसपास की {total} में से {weak} दुकानों को 3.5★ से कम मिले हैं — यहाँ ग्राहक ख़ुश नहीं हैं और बेहतर दुकान पर चले जाएँगे।',
    tStrongRivals: 'आसपास की दुकानों की रेटिंग अच्छी है ({n} को 4★ से ऊपर), यानी उनके पक्के ग्राहक हैं।',
    wWeather: 'मौसम अनुकूल नहीं: {reason}।',
    sWeather: 'मौसम इस बिज़नेस में मदद करता है: {reason}।',
    tHotDays: 'पिछले साल {n} दिन 40 °C से ऊपर रहे — ठंडक का ख़र्च बढ़ेगा और दोपहर में ग्राहक घटेंगे।',
    tHeavyRain:
      'तेज़ बारिश वाला इलाका (पिछले साल {mm} मिमी) — बरसात के महीनों में आवाजाही घट सकती है और पानी से नुक़सान का ख़तरा है।',
    tRiskHigh:
      'आपके बाहरी ग्राहकों में से {pct}% {source} से आएँगे। अगर वे बंद हों (छुट्टी, अवकाश, जगह बदलना), बिक्री तेज़ी से गिरेगी।',
    tRiskMed: 'ग्राहकों का बड़ा हिस्सा {source} पर निर्भर है, इसलिए उनके ऑफ़-सीज़न की तैयारी रखें।',
    sFastPayback: 'पैसा जल्दी वापस आता है: हमारे अनुमानित बिक्री पर लगभग {n} महीने।',
    wSlowPayback: 'पैसा धीरे वापस आता है: निवेश निकालने में लगभग {n} महीने।',
    wNoProfit: 'इस इलाके के आम दामों पर महीने की बिक्री किराया और तनख़्वाह पूरी नहीं कर पाएगी।',
    tHighRent: 'किराया ज़्यादा (लगभग ₹{n} महीना) — कोई भी सुस्त महीना भारी पड़ेगा।',
    oLoan: 'ज़रूरी ₹{n} का बड़ा हिस्सा NSFDC या MUDRA लोन से आ सकता है — योजनाएं पेज देखें।',
    tRules: 'पहले ये नियम पूरे करें: {note}',
    oSecondStream:
      'यहाँ कुल माँग मज़बूत है, इसलिए आगे दूसरी कमाई जोड़ी जा सकती है (डिलीवरी, पास के दफ़्तरों या हॉस्टल से तालमेल)।',
    oCapacity:
      'यहाँ माँग एक दुकान से ज़्यादा है — आगे दूसरी शाखा या होम डिलीवरी से कमाई बढ़ सकती है।',
    sNone: 'इस ठीक जगह पर कोई साफ़ फ़ायदा नहीं मिला। पिन को बाज़ार, कॉलेज या स्टेशन के पास ले जाकर देखें।',
    wNone: 'डेटा में कोई बड़ी कमज़ोरी नहीं दिखी — पर हमारा नक्शा डेटा कई छोटी दुकानें छोड़ देता है, इसलिए गली ख़ुद देखें।',
    oNone: 'यहाँ कोई ख़ास मौका नहीं मिला। आम मौके बने रहते हैं: ज़्यादा खुलने का समय, डिलीवरी और ऑनलाइन भुगतान।',
    tNone: 'डेटा में कोई ख़ास ख़तरा नहीं मिला। आम ख़तरे फिर भी हैं: नई दुकान खुलना, या किराया बढ़ना।',

    envHotMany: 'पिछले साल {n} दिन 40 °C या उससे ऊपर — गर्मी में माँग मज़बूत',
    envWarm: 'गर्म जलवायु — गर्मी में ठीक-ठाक माँग',
    envMild: 'हल्की जलवायु — ठंडक वाले सामान की माँग कम',

    short_college: 'कॉलेज',
    short_school: 'स्कूल',
    short_hospital: 'अस्पताल',
    short_clinic: 'क्लिनिक',
    short_station: 'स्टेशन',
    short_busStop: 'बस स्टॉप',
    short_office: 'दफ़्तर',
    short_market: 'बाज़ार/मॉल',
    short_hotel: 'होटल/हॉस्टल',
    short_worship: 'पूजा स्थल',
    radiusHint: '5 किमी = आपका नज़दीकी बाज़ार · 10 किमी = पूरा कस्बा। बड़ा दायरा देखने में ज़्यादा समय लेता है।',

    demandLbl: 'माँग',
    populationLbl: 'आबादी',
    accessibilityLbl: 'पहुँच',
    budgetPlaceholder: 'जैसे 300000',

    anchor_college: 'कॉलेज / विश्वविद्यालय',
    anchor_school: 'स्कूल',
    anchor_hospital: 'अस्पताल',
    anchor_clinic: 'क्लिनिक / डॉक्टर',
    anchor_station: 'मेट्रो / रेलवे / बस स्टेशन',
    anchor_busStop: 'बस स्टॉप',
    anchor_office: 'दफ़्तर',
    anchor_market: 'बाज़ार / मॉल',
    anchor_hotel: 'होटल / हॉस्टल / PG',
    anchor_worship: 'मंदिर / मस्जिद / चर्च',

    cat_food: 'खाना',
    cat_retail: 'खुदरा',
    cat_services: 'सेवाएं',
    cat_health: 'स्वास्थ्य',
    cat_education: 'शिक्षा',
  },

  /* ================================================================== */
  ur: {
    searchPlaceholder: 'کوئی جگہ تلاش کریں، جیسے بٹلہ ہاؤس، دہلی',
    searchBtn: 'تلاش کریں',
    searching: 'تلاش ہو رہی ہے…',
    myLocation: 'میری جگہ',
    errMapData: 'اس جگہ کا نقشہ ڈیٹا نہیں آ سکا۔ ایک منٹ بعد دوبارہ کوشش کریں۔',
    errShort3: 'جگہ کے نام کے کم از کم 3 حروف لکھیں۔',
    errNoPlace: 'کوئی جگہ نہیں ملی۔ شہر کا نام بھی شامل کریں، جیسے "لاجپت نگر، دہلی"۔',
    errSearchFailed: 'تلاش نہیں ہو سکی',
    errNoGeo: 'آپ کا براؤزر مقام معلوم کرنے کی سہولت نہیں دیتا۔',
    errGeoDenied: 'مقام کی اجازت نہیں ملی۔ تلاش کریں یا نقشے پر ٹیپ کریں۔',
    errPinBFirst: 'پہلے نقشے پر پن B لگائیں۔',
    errChooseFirst: 'پہلے کوئی جگہ منتخب کریں۔',
    errAnalysisFailed: 'تجزیہ نہیں ہو سکا',
    errTimeout:
      'مطالعے میں بہت وقت لگا اور سرور نے اسے روک دیا۔ چھوٹا دائرہ (5 کلومیٹر) منتخب کر کے دوبارہ چلائیں — دوسری بار بہت تیز ہوگا۔',

    findBest: 'یہاں کا بہترین کاروبار تلاش کریں ←',
    studyingArea: 'اس علاقے کا مطالعہ ہو رہا ہے…',
    biggerCircleNote: 'بڑا دائرہ زیادہ وقت لیتا ہے۔ اگلی بار یہی جگہ فوراً کھلے گی۔',
    step1: 'آپ کے پن کا پتہ تلاش کر رہے ہیں…',
    step2: 'نقشے کی ہر دکان اور جگہ پڑھ رہے ہیں…',
    step3: 'آپ کے دائرے میں رہنے والے لوگ گن رہے ہیں…',
    step4: 'پچھلے 12 مہینوں کا موسم دیکھ رہے ہیں…',
    step5: '15 کاروباروں کو ڈیٹا پر پرکھ رہے ہیں…',
    step6: 'آپ کا مشورہ آسان الفاظ میں لکھ رہے ہیں…',

    whatWeFound: '{label} کے آس پاس ہمیں کیا ملا',
    peopleInCircle: 'اس دائرے میں رہنے والے لوگ',
    popUnavailable: 'آبادی کا ڈیٹا دستیاب نہیں',
    avgTemp: 'دن کا اوسط درجہ حرارت',
    rainLast12: 'پچھلے 12 مہینوں کی بارش',
    heightAboveSea: 'سطح سمندر سے بلندی',
    dataConfidence: 'ڈیٹا بھروسہ',
    nothingNotable: 'کوئی خاص چیز نہیں ملی۔',

    bestIdeasFor: '{label} کے لیے بہترین کاروبار (کسی ایک پر ٹیپ کریں اور نقشے پر اس کے مقابل دیکھیں)',
    noBusinessFits: 'ان فلٹروں میں کوئی کاروبار نہیں آتا۔ بجٹ بڑھائیں یا کم دلچسپیاں منتخب کریں۔',
    notInInterests: 'منتخب دلچسپیوں میں نہیں',
    opportunityScore: 'موقع اسکور',
    nearbyPlacesLbl: 'قریبی مقامات',
    lowCompetition: 'کم مقابلہ',
    weatherFit: 'موسم کی مناسبت',
    dependenceRisk: 'انحصار کا خطرہ',
    howScoreBuilt: 'یہ اسکور کیسے بنا',
    nearbyWord: 'قریب',
    reviewsNote: 'Google سے تبصرے۔ لوگ کس بات کی شکایت کرتے ہیں پڑھیں، پھر وہی ایک کام بہتر کریں۔',

    moneyToStart: 'شروع کرنے کے لیے ضروری رقم',
    totalInvestment: 'کل سرمایہ کاری',
    everyMonth: 'ہر مہینے، اگر سب ٹھیک چلے',
    monthlySales: 'مہینے کی فروخت',
    grossProfit: 'مجموعی منافع',
    rent: 'کرایہ',
    staffSalaries: 'عملے کی تنخواہ',
    utilities: 'بجلی، پانی، انٹرنیٹ',
    netProfit: 'مالک کے پاس بچا منافع',
    paybackTime: 'رقم واپس آنے کا وقت',
    breakEvenSales: 'برابری کی فروخت',
    firstYearProfit: 'پہلے سال کا منافع',
    customersADay: 'گاہک روزانہ',
    notReached: 'نہیں پہنچا',
    financeNote:
      'یہ عام اندازے ہیں، پکے نرخ نہیں۔ سرمایہ کاری سے پہلے کرایہ، مال اور لائسنس کی لاگت اپنے علاقے میں تصدیق کر لیں۔',

    swotTitle: 'اس جگہ کا SWOT تجزیہ',
    swotGood: 'یہاں ابھی کیا اچھا ہے',
    swotMissing: 'یہاں کیا کمی ہے',
    swotGaps: 'کون سے مواقع آپ لے سکتے ہیں',
    swotWrong: 'کیا خرابی ہو سکتی ہے',

    compareWith: 'دوسری جگہ سے موازنہ کریں',
    selectWord: 'منتخب کریں',
    pinB: 'پن B',
    setPinB: 'پن B لگائیں',
    studyingB: 'جگہ B کا مطالعہ ہو رہا ہے…',
    analyseB: 'جگہ B کا تجزیہ کریں',
    businessCol: 'کاروبار',
    betterCol: 'بہتر',
    theSame: 'برابر',
    aMoreDemandBLessComp: 'A میں طلب زیادہ ہے، لیکن B میں مقابلہ بہت کم ہے۔',

    keepReport: 'یہ رپورٹ رکھیں',
    keepReportSub:
      'اسے اپنے ڈاؤن لوڈ پیج میں محفوظ کریں — یہ بعد میں بغیر انٹرنیٹ بھی کھلے گی، اور PDF میں چھاپی جا سکتی ہے۔',
    saveReport: 'یہ رپورٹ محفوظ کریں',
    savedToDownloads: '✓ ڈاؤن لوڈ میں محفوظ',

    repDocTitle: 'کاروباری رپورٹ — {place}',
    repHeading: 'کاروباری موقع رپورٹ',
    repFileName: 'کاروباری رپورٹ — {place}',
    repCircle: 'مطالعہ کیا گیا دائرہ',
    repCreated: 'بنائی گئی',
    repPreparedFor: 'کس کے لیے بنائی گئی',
    repPeople: 'اس دائرے میں لوگ',
    repNotAvailable: 'دستیاب نہیں',
    repBestIdeas: 'یہاں کے بہترین کاروبار',
    repRank: 'نمبر',
    repBusiness: 'کاروبار',
    repScore: 'اسکور',
    repInvestment: 'سرمایہ کاری',
    repMonthlyProfit: 'ماہانہ منافع',
    repPayback: 'رقم واپسی',
    repSimilarNearby: 'قریب {n} ملتی جلتی دکانیں',
    repMonths: 'مہینے',
    repSwotFor: 'SWOT — {name}',
    repStrengths: 'مضبوطیاں',
    repWeaknesses: 'کمزوریاں',
    repOpportunities: 'مواقع',
    repThreats: 'خطرات',
    repAdvisorSummary: 'مشیر کا خلاصہ',
    repData: 'ڈیٹا',
    repDisclaimer:
      'تمام اعداد و شمار اندازے ہیں اور آپ کی اپنی تحقیق میں مدد کے لیے ہیں۔ سرمایہ کاری سے پہلے دن کے مختلف اوقات میں علاقے کا دورہ کریں۔',
    repMadeBy: 'سری جین — AI بزنس ایڈوائزر کی بنائی ہوئی۔',

    dlSubtitle:
      'آپ کی محفوظ کردہ رپورٹیں۔ انہیں کبھی بھی کھولیں، ڈاؤن لوڈ کریں، یا براؤزر سے PDF میں چھاپیں۔',
    dlNoFiles: 'ابھی کوئی فائل نہیں',
    dlNoFilesSub: 'کوئی جگہ کا مطالعہ چلائیں اور "یہ رپورٹ محفوظ کریں" دبائیں۔ وہ یہاں نظر آئے گی۔',
    dlGoAdvisor: 'مقام مشیر پر جائیں ←',
    dlOpen: 'کھولیں',
    dlDownload: 'ڈاؤن لوڈ',
    dlDelete: 'حذف کریں',
    dlFooter:
      'فائلیں صرف اسی براؤزر میں رکھی جاتی ہیں۔ پکا رکھنے کے لیے ڈاؤن لوڈ دبائیں، یا کھول کر PDF میں چھاپ لیں۔',

    warnReducedRadius:
      'نقشہ سرور مصروف تھا، اس لیے ہم نے {km} کلومیٹر کا چھوٹا دائرہ دیکھا۔ پورے دائرے کے لیے ایک منٹ بعد دوبارہ کوشش کریں۔',
    warnTruncated:
      'اس علاقے میں نقشے پر بہت زیادہ مقامات ہیں، اس لیے ہم نے اس کا کچھ حصہ ہی پڑھا۔ نتائج کارآمد ہیں مگر دکانیں کم گنی جا سکتی ہیں۔',
    warnNoGoogleKey:
      'Google Places چالو نہیں ہے، اس لیے دکانوں کی گنتی صرف OpenStreetMap سے ہے، جو کئی چھوٹی بھارتی دکانیں چھوڑ دیتا ہے۔',

    areaAbout: 'تقریباً {km} کلومیٹر²',
    areaThis: 'یہ علاقہ',
    peopleCount: '{n} لوگ',
    popMissing: 'آبادی کا ڈیٹا نہیں ہے',
    sCrowded: 'گنجان علاقہ: اس جگہ کے آس پاس {people} رہتے ہیں ({density} فی کلومیٹر²)۔',
    sSteady: 'مستقل مقامی رونق: اس جگہ کے آس پاس {people} رہتے ہیں۔',
    wThin: 'کم رونق: یہاں صرف {density} لوگ فی کلومیٹر² رہتے ہیں، اس لیے چلتے پھرتے گاہک کم ملیں گے۔',
    sSources: 'آس پاس گاہکوں کے ذرائع: {list}۔',
    wNoAnchors: 'آس پاس کوئی کالج، اسپتال، دفتر یا بازار نہیں جو باہر سے گاہک لائے۔',
    oLocalOnly:
      'یہاں طلب زیادہ تر آس پاس رہنے والوں سے ہے، اس لیے ہوم ڈیلیوری یا WhatsApp آرڈر سے پہنچ بڑھ سکتی ہے۔',
    sAccess: 'پہنچنا آسان: مرکزی سڑکیں اور پبلک ٹرانسپورٹ قریب ہیں۔',
    wAccess: 'رسائی کمزور: آس پاس کم مرکزی سڑکیں یا اسٹاپ ہیں، اس لیے گاہک کو جان بوجھ کر آنا پڑے گا۔',
    oNoCompetitor:
      'اس قسم کی کوئی دکان ابھی نقشے پر نہیں — آپ پہلے ہو سکتے ہیں، مگر سرمایہ کاری سے پہلے پیدل جا کر تصدیق کریں۔',
    sLightComp: 'ہلکا مقابلہ: {area} میں صرف {n} ملتی جلتی دکانیں ہیں، جو اتنے بڑے علاقے کے لیے کم ہے۔',
    wRealComp: 'اصل مقابلہ: {area} میں پہلے سے {n} ملتی جلتی دکانیں چل رہی ہیں۔',
    wCrowdedMarket:
      'بھرا ہوا بازار: {area} میں پہلے سے {n} ملتی جلتی دکانیں ہیں، اس لیے گاہک جیتنا سست اور مہنگا ہوگا۔',
    tPriceWar:
      'اتنے بھرے بازار میں قیمت کی جنگ ہو سکتی ہے۔ کھولنے سے پہلے واضح فرق طے کریں (رفتار، معیار، اوقات)۔',
    oWeakRivals:
      'آس پاس کی {total} میں سے {weak} دکانوں کو 3.5★ سے کم ملے ہیں — یہاں گاہک خوش نہیں اور بہتر دکان پر چلے جائیں گے۔',
    tStrongRivals: 'آس پاس کی دکانوں کی ریٹنگ اچھی ہے ({n} کو 4★ سے اوپر)، یعنی ان کے پکے گاہک ہیں۔',
    wWeather: 'موسم موزوں نہیں: {reason}۔',
    sWeather: 'موسم اس کاروبار میں مدد کرتا ہے: {reason}۔',
    tHotDays: 'پچھلے سال {n} دن 40 °C سے اوپر رہے — ٹھنڈک کا خرچ بڑھے گا اور دوپہر میں گاہک کم ہوں گے۔',
    tHeavyRain:
      'تیز بارش والا علاقہ (پچھلے سال {mm} ملی میٹر) — برسات کے مہینوں میں آمد و رفت کم ہو سکتی ہے اور پانی سے نقصان کا خطرہ ہے۔',
    tRiskHigh:
      'آپ کے باہری گاہکوں میں سے {pct}% {source} سے آئیں گے۔ اگر وہ بند ہوں (چھٹی، تعطیل، جگہ بدلنا)، فروخت تیزی سے گرے گی۔',
    tRiskMed: 'گاہکوں کا بڑا حصہ {source} پر منحصر ہے، اس لیے ان کے آف سیزن کی تیاری رکھیں۔',
    sFastPayback: 'رقم جلد واپس آتی ہے: ہمارے تخمینی فروخت پر تقریباً {n} مہینے۔',
    wSlowPayback: 'رقم دیر سے واپس آتی ہے: سرمایہ نکالنے میں تقریباً {n} مہینے۔',
    wNoProfit: 'اس علاقے کے عام نرخوں پر مہینے کی فروخت کرایہ اور تنخواہ پوری نہیں کر پائے گی۔',
    tHighRent: 'کرایہ زیادہ (تقریباً ₹{n} ماہانہ) — کوئی بھی سست مہینہ بھاری پڑے گا۔',
    oLoan: 'ضروری ₹{n} کا بڑا حصہ NSFDC یا MUDRA لون سے آ سکتا ہے — اسکیمیں پیج دیکھیں۔',
    tRules: 'پہلے یہ قواعد پورے کریں: {note}',
    oSecondStream:
      'یہاں مجموعی طلب مضبوط ہے، اس لیے آگے دوسری آمدنی جوڑی جا سکتی ہے (ڈیلیوری، قریبی دفاتر یا ہاسٹل سے رابطہ)۔',
    oCapacity: 'یہاں طلب ایک دکان سے زیادہ ہے — آگے دوسری شاخ یا ہوم ڈیلیوری سے آمدنی بڑھ سکتی ہے۔',
    sNone: 'اس عین جگہ پر کوئی واضح فائدہ نہیں ملا۔ پن کو بازار، کالج یا اسٹیشن کے قریب لے جا کر دیکھیں۔',
    wNone:
      'ڈیٹا میں کوئی بڑی کمزوری نظر نہیں آئی — مگر ہمارا نقشہ ڈیٹا کئی چھوٹی دکانیں چھوڑ دیتا ہے، اس لیے گلی خود دیکھیں۔',
    oNone: 'یہاں کوئی خاص موقع نہیں ملا۔ عام مواقع باقی ہیں: زیادہ کھلنے کے اوقات، ڈیلیوری اور آن لائن ادائیگی۔',
    tNone: 'ڈیٹا میں کوئی خاص خطرہ نہیں ملا۔ عام خطرات پھر بھی ہیں: نئی دکان کھلنا، یا کرایہ بڑھنا۔',

    envHotMany: 'پچھلے سال {n} دن 40 °C یا اس سے اوپر — گرمی میں طلب مضبوط',
    envWarm: 'گرم آب و ہوا — گرمی میں ٹھیک ٹھاک طلب',
    envMild: 'معتدل آب و ہوا — ٹھنڈک والے سامان کی طلب کم',

    short_college: 'کالج',
    short_school: 'اسکول',
    short_hospital: 'اسپتال',
    short_clinic: 'کلینک',
    short_station: 'اسٹیشن',
    short_busStop: 'بس اسٹاپ',
    short_office: 'دفاتر',
    short_market: 'بازار/مال',
    short_hotel: 'ہوٹل/ہاسٹل',
    short_worship: 'عبادت گاہیں',
    radiusHint: '5 کلومیٹر = آپ کا قریبی بازار · 10 کلومیٹر = پورا قصبہ۔ بڑا دائرہ دیکھنے میں زیادہ وقت لیتا ہے۔',

    demandLbl: 'طلب',
    populationLbl: 'آبادی',
    accessibilityLbl: 'رسائی',
    budgetPlaceholder: 'مثلاً 300000',

    anchor_college: 'کالج / یونیورسٹی',
    anchor_school: 'اسکول',
    anchor_hospital: 'اسپتال',
    anchor_clinic: 'کلینک / ڈاکٹر',
    anchor_station: 'میٹرو / ریلوے / بس اسٹیشن',
    anchor_busStop: 'بس اسٹاپ',
    anchor_office: 'دفاتر',
    anchor_market: 'بازار / مال',
    anchor_hotel: 'ہوٹل / ہاسٹل / PG',
    anchor_worship: 'مندر / مسجد / چرچ',

    cat_food: 'کھانا',
    cat_retail: 'خوردہ',
    cat_services: 'خدمات',
    cat_health: 'صحت',
    cat_education: 'تعلیم',
  },

  /* ================================================================== */
  bn: {
    searchPlaceholder: 'কোনো জায়গা খুঁজুন, যেমন বাটলা হাউস, দিল্লি',
    searchBtn: 'খুঁজুন',
    searching: 'খোঁজা হচ্ছে…',
    myLocation: 'আমার জায়গা',
    errMapData: 'এই জায়গার ম্যাপ ডেটা আনা যায়নি। এক মিনিট পরে আবার চেষ্টা করুন।',
    errShort3: 'জায়গার নামের অন্তত 3টি অক্ষর লিখুন।',
    errNoPlace: 'কোনো জায়গা পাওয়া যায়নি। শহরের নামও যোগ করুন, যেমন "লাজপত নগর, দিল্লি"।',
    errSearchFailed: 'খোঁজা যায়নি',
    errNoGeo: 'আপনার ব্রাউজার অবস্থান জানার সুবিধা দেয় না।',
    errGeoDenied: 'অবস্থানের অনুমতি মেলেনি। খুঁজুন বা ম্যাপে ট্যাপ করুন।',
    errPinBFirst: 'আগে ম্যাপে পিন B বসান।',
    errChooseFirst: 'আগে একটি জায়গা বেছে নিন।',
    errAnalysisFailed: 'বিশ্লেষণ করা যায়নি',
    errTimeout:
      'অধ্যয়নে অনেক সময় লেগেছে এবং সার্ভার এটি থামিয়ে দিয়েছে। ছোট ব্যাসার্ধ (5 কিমি) নিয়ে আবার চালান — দ্বিতীয়বার অনেক দ্রুত হবে।',

    findBest: 'এখানকার সেরা ব্যবসা খুঁজুন →',
    studyingArea: 'এই এলাকার অধ্যয়ন চলছে…',
    biggerCircleNote: 'বড় বৃত্তে বেশি সময় লাগে। পরের বার এই জায়গাই সঙ্গে সঙ্গে খুলবে।',
    step1: 'আপনার পিনের ঠিকানা খোঁজা হচ্ছে…',
    step2: 'ম্যাপের প্রতিটি দোকান ও জায়গা পড়া হচ্ছে…',
    step3: 'আপনার বৃত্তে বসবাসকারী মানুষ গোনা হচ্ছে…',
    step4: 'গত 12 মাসের আবহাওয়া দেখা হচ্ছে…',
    step5: '15টি ব্যবসা ডেটার সঙ্গে মিলিয়ে দেখা হচ্ছে…',
    step6: 'আপনার পরামর্শ সহজ ভাষায় লেখা হচ্ছে…',

    whatWeFound: '{label}-এর আশেপাশে আমরা যা পেয়েছি',
    peopleInCircle: 'এই বৃত্তে বসবাসকারী মানুষ',
    popUnavailable: 'জনসংখ্যার ডেটা নেই',
    avgTemp: 'দিনের গড় তাপমাত্রা',
    rainLast12: 'গত 12 মাসের বৃষ্টি',
    heightAboveSea: 'সমুদ্রপৃষ্ঠ থেকে উচ্চতা',
    dataConfidence: 'ডেটার নির্ভরতা',
    nothingNotable: 'উল্লেখযোগ্য কিছু পাওয়া যায়নি।',

    bestIdeasFor: '{label}-এর জন্য সেরা ব্যবসা (একটিতে ট্যাপ করে ম্যাপে তার প্রতিযোগী দেখুন)',
    noBusinessFits: 'এই ফিল্টারে কোনো ব্যবসা মেলেনি। বাজেট বাড়ান বা কম আগ্রহ বেছে নিন।',
    notInInterests: 'বেছে নেওয়া আগ্রহে নেই',
    opportunityScore: 'সুযোগ স্কোর',
    nearbyPlacesLbl: 'আশেপাশের জায়গা',
    lowCompetition: 'কম প্রতিযোগিতা',
    weatherFit: 'আবহাওয়ার উপযোগিতা',
    dependenceRisk: 'নির্ভরতার ঝুঁকি',
    howScoreBuilt: 'এই স্কোর কীভাবে তৈরি হলো',
    nearbyWord: 'কাছে',
    reviewsNote: 'Google থেকে রিভিউ। মানুষ কী নিয়ে অভিযোগ করে পড়ুন, তারপর সেই একটি কাজ ভালো করুন।',

    moneyToStart: 'শুরু করতে প্রয়োজনীয় টাকা',
    totalInvestment: 'মোট বিনিয়োগ',
    everyMonth: 'প্রতি মাসে, সব ঠিক চললে',
    monthlySales: 'মাসের বিক্রি',
    grossProfit: 'মোট মুনাফা',
    rent: 'ভাড়া',
    staffSalaries: 'কর্মীদের বেতন',
    utilities: 'বিদ্যুৎ, জল, ইন্টারনেট',
    netProfit: 'মালিকের হাতে থাকা মুনাফা',
    paybackTime: 'টাকা ফেরত আসার সময়',
    breakEvenSales: 'সমান-সমান বিক্রি',
    firstYearProfit: 'প্রথম বছরের মুনাফা',
    customersADay: 'গ্রাহক প্রতিদিন',
    notReached: 'পৌঁছায়নি',
    financeNote:
      'এগুলি সাধারণ হিসাব, পাকা দর নয়। বিনিয়োগের আগে ভাড়া, মাল ও লাইসেন্সের খরচ নিজের এলাকায় যাচাই করে নিন।',

    swotTitle: 'এই জায়গার SWOT বিশ্লেষণ',
    swotGood: 'এখানে এখন কী ভালো',
    swotMissing: 'এখানে কী নেই',
    swotGaps: 'কোন সুযোগ আপনি নিতে পারেন',
    swotWrong: 'কী ভুল হতে পারে',

    compareWith: 'অন্য জায়গার সঙ্গে তুলনা করুন',
    selectWord: 'বেছে নিন',
    pinB: 'পিন B',
    setPinB: 'পিন B বসান',
    studyingB: 'জায়গা B-এর অধ্যয়ন চলছে…',
    analyseB: 'জায়গা B বিশ্লেষণ করুন',
    businessCol: 'ব্যবসা',
    betterCol: 'ভালো',
    theSame: 'সমান',
    aMoreDemandBLessComp: 'A-তে চাহিদা বেশি, কিন্তু B-তে প্রতিযোগিতা অনেক কম।',

    keepReport: 'এই রিপোর্ট রাখুন',
    keepReportSub:
      'এটি আপনার ডাউনলোড পেজে সংরক্ষণ করুন — পরে ইন্টারনেট ছাড়াও খুলবে, এবং PDF হিসেবে ছাপা যাবে।',
    saveReport: 'এই রিপোর্ট সংরক্ষণ করুন',
    savedToDownloads: '✓ ডাউনলোডে সংরক্ষিত',

    repDocTitle: 'ব্যবসার রিপোর্ট — {place}',
    repHeading: 'ব্যবসার সুযোগ রিপোর্ট',
    repFileName: 'ব্যবসার রিপোর্ট — {place}',
    repCircle: 'অধ্যয়ন করা বৃত্ত',
    repCreated: 'তৈরি হয়েছে',
    repPreparedFor: 'কার জন্য তৈরি',
    repPeople: 'এই বৃত্তে মানুষ',
    repNotAvailable: 'পাওয়া যায়নি',
    repBestIdeas: 'এখানকার সেরা ব্যবসা',
    repRank: 'ক্রম',
    repBusiness: 'ব্যবসা',
    repScore: 'স্কোর',
    repInvestment: 'বিনিয়োগ',
    repMonthlyProfit: 'মাসিক মুনাফা',
    repPayback: 'টাকা ফেরত',
    repSimilarNearby: 'কাছে {n}টি একই রকম দোকান',
    repMonths: 'মাস',
    repSwotFor: 'SWOT — {name}',
    repStrengths: 'শক্তি',
    repWeaknesses: 'দুর্বলতা',
    repOpportunities: 'সুযোগ',
    repThreats: 'ঝুঁকি',
    repAdvisorSummary: 'পরামর্শদাতার সারসংক্ষেপ',
    repData: 'ডেটা',
    repDisclaimer:
      'সব সংখ্যা আনুমানিক এবং আপনার নিজের অনুসন্ধানে সাহায্যের জন্য। বিনিয়োগের আগে দিনের বিভিন্ন সময়ে এলাকাটি ঘুরে দেখুন।',
    repMadeBy: 'শ্রীজেন — AI বিজনেস অ্যাডভাইজার দ্বারা তৈরি।',

    dlSubtitle:
      'আপনার সংরক্ষিত রিপোর্ট। যেকোনো সময় খুলুন, ডাউনলোড করুন, বা ব্রাউজার থেকে PDF হিসেবে ছাপুন।',
    dlNoFiles: 'এখনো কোনো ফাইল নেই',
    dlNoFilesSub: 'একটি জায়গার অধ্যয়ন চালান এবং "এই রিপোর্ট সংরক্ষণ করুন" চাপুন। সেটি এখানে দেখা যাবে।',
    dlGoAdvisor: 'লোকেশন পরামর্শে যান →',
    dlOpen: 'খুলুন',
    dlDownload: 'ডাউনলোড',
    dlDelete: 'মুছুন',
    dlFooter:
      'ফাইল শুধু এই ব্রাউজারেই রাখা হয়। স্থায়ীভাবে রাখতে ডাউনলোড চাপুন, বা খুলে PDF হিসেবে ছাপুন।',

    warnReducedRadius:
      'ম্যাপ সার্ভার ব্যস্ত ছিল, তাই আমরা {km} কিমি-র ছোট বৃত্ত দেখেছি। পুরো ব্যাসার্ধের জন্য এক মিনিট পরে আবার চেষ্টা করুন।',
    warnTruncated:
      'এই এলাকায় ম্যাপে অনেক বেশি জায়গা আছে, তাই আমরা এর কিছু অংশই পড়েছি। ফল কাজে লাগবে তবে দোকান কম গোনা হতে পারে।',
    warnNoGoogleKey:
      'Google Places চালু নেই, তাই দোকানের সংখ্যা শুধু OpenStreetMap থেকে, যা অনেক ছোট ভারতীয় দোকান বাদ দেয়।',

    areaAbout: 'প্রায় {km} কিমি²',
    areaThis: 'এই এলাকা',
    peopleCount: '{n} জন',
    popMissing: 'জনসংখ্যার ডেটা নেই',
    sCrowded: 'জনবহুল এলাকা: এই জায়গার আশেপাশে {people} থাকেন ({density} প্রতি কিমি²)।',
    sSteady: 'নিয়মিত স্থানীয় ভিড়: এই জায়গার আশেপাশে {people} থাকেন।',
    wThin: 'কম ভিড়: এখানে প্রতি কিমি²-এ মাত্র {density} জন থাকেন, তাই চলতি গ্রাহক কম মিলবে।',
    sSources: 'আশেপাশে গ্রাহকের উৎস: {list}।',
    wNoAnchors: 'আশেপাশে কোনো কলেজ, হাসপাতাল, অফিস বা বাজার নেই যা বাইরে থেকে গ্রাহক আনবে।',
    oLocalOnly:
      'এখানে চাহিদা বেশিরভাগ আশেপাশের বাসিন্দাদের থেকে, তাই হোম ডেলিভারি বা WhatsApp অর্ডারে নাগাল বাড়তে পারে।',
    sAccess: 'পৌঁছানো সহজ: প্রধান রাস্তা ও গণপরিবহন কাছেই।',
    wAccess: 'যাতায়াত দুর্বল: আশেপাশে কম প্রধান রাস্তা বা স্টপ আছে, তাই গ্রাহককে ইচ্ছে করে আসতে হবে।',
    oNoCompetitor:
      'এই ধরনের কোনো দোকান এখনো ম্যাপে নেই — আপনি প্রথম হতে পারেন, তবে বিনিয়োগের আগে হেঁটে গিয়ে যাচাই করুন।',
    sLightComp: 'হালকা প্রতিযোগিতা: {area}-এ মাত্র {n}টি একই রকম দোকান, যা এত বড় এলাকার জন্য কম।',
    wRealComp: 'প্রকৃত প্রতিযোগিতা: {area}-এর ভিতরে আগে থেকেই {n}টি একই রকম দোকান চলছে।',
    wCrowdedMarket:
      'ভরা বাজার: {area}-এর ভিতরে আগে থেকেই {n}টি একই রকম দোকান আছে, তাই গ্রাহক জেতা ধীর ও ব্যয়বহুল হবে।',
    tPriceWar:
      'এত ভরা বাজারে দামের লড়াই হতে পারে। খোলার আগে স্পষ্ট পার্থক্য ঠিক করুন (গতি, মান, সময়)।',
    oWeakRivals:
      'আশেপাশের {total}টির মধ্যে {weak}টি দোকান 3.5★-এর কম পেয়েছে — এখানে গ্রাহক খুশি নন এবং ভালো দোকানে চলে যাবেন।',
    tStrongRivals: 'আশেপাশের দোকানের রেটিং ভালো ({n}টি 4★-এর উপরে), অর্থাৎ তাদের পাকা গ্রাহক আছে।',
    wWeather: 'আবহাওয়া উপযুক্ত নয়: {reason}।',
    sWeather: 'আবহাওয়া এই ব্যবসায় সাহায্য করে: {reason}।',
    tHotDays: 'গত বছর {n} দিন 40 °C ছাড়িয়েছে — ঠান্ডার খরচ বাড়বে এবং দুপুরে গ্রাহক কমবে।',
    tHeavyRain:
      'ভারী বৃষ্টির এলাকা (গত বছর {mm} মিমি) — বর্ষার মাসে যাতায়াত কমতে পারে এবং জলে ক্ষতির ঝুঁকি আছে।',
    tRiskHigh:
      'আপনার বাইরের গ্রাহকদের {pct}% আসবেন {source} থেকে। তাঁরা বন্ধ হলে (ছুটি, অবকাশ, স্থান বদল), বিক্রি দ্রুত কমবে।',
    tRiskMed: 'গ্রাহকদের বড় অংশ {source}-এর উপর নির্ভরশীল, তাই তাঁদের অফ-সিজনের প্রস্তুতি রাখুন।',
    sFastPayback: 'টাকা দ্রুত ফেরত আসে: আমাদের আনুমানিক বিক্রিতে প্রায় {n} মাস।',
    wSlowPayback: 'টাকা ধীরে ফেরত আসে: বিনিয়োগ তুলতে প্রায় {n} মাস।',
    wNoProfit: 'এই এলাকার স্বাভাবিক দামে মাসের বিক্রি ভাড়া ও বেতন পূরণ করতে না-ও পারে।',
    tHighRent: 'ভাড়া বেশি (প্রায় ₹{n} মাসে) — যেকোনো মন্দা মাস ভারী পড়বে।',
    oLoan: 'প্রয়োজনীয় ₹{n}-এর বড় অংশ NSFDC বা MUDRA ঋণ থেকে আসতে পারে — স্কিম পেজ দেখুন।',
    tRules: 'আগে এই নিয়মগুলি পূরণ করুন: {note}',
    oSecondStream:
      'এখানে সামগ্রিক চাহিদা শক্তিশালী, তাই পরে দ্বিতীয় আয়ের পথ যোগ করা যায় (ডেলিভারি, কাছের অফিস বা হস্টেলের সঙ্গে যোগাযোগ)।',
    oCapacity: 'এখানে চাহিদা একটি দোকানের চেয়ে বেশি — পরে দ্বিতীয় শাখা বা হোম ডেলিভারিতে আয় বাড়তে পারে।',
    sNone: 'ঠিক এই জায়গায় স্পষ্ট কোনো সুবিধা মেলেনি। পিনটি বাজার, কলেজ বা স্টেশনের কাছে সরিয়ে দেখুন।',
    wNone:
      'ডেটায় বড় কোনো দুর্বলতা দেখা যায়নি — তবে আমাদের ম্যাপ ডেটা অনেক ছোট দোকান বাদ দেয়, তাই রাস্তাটি নিজে দেখে নিন।',
    oNone: 'এখানে বিশেষ কোনো সুযোগ মেলেনি। সাধারণ সুযোগ থেকেই যায়: বেশি সময় খোলা রাখা, ডেলিভারি ও অনলাইন পেমেন্ট।',
    tNone: 'ডেটায় নির্দিষ্ট কোনো ঝুঁকি মেলেনি। সাধারণ ঝুঁকি তবু থাকে: নতুন দোকান খোলা, বা ভাড়া বাড়া।',

    envHotMany: 'গত বছর {n} দিন 40 °C বা তার বেশি — গরমে চাহিদা শক্তিশালী',
    envWarm: 'গরম আবহাওয়া — গরমে মোটামুটি চাহিদা',
    envMild: 'মৃদু আবহাওয়া — ঠান্ডার সামগ্রীর চাহিদা কম',

    short_college: 'কলেজ',
    short_school: 'স্কুল',
    short_hospital: 'হাসপাতাল',
    short_clinic: 'ক্লিনিক',
    short_station: 'স্টেশন',
    short_busStop: 'বাস স্টপ',
    short_office: 'অফিস',
    short_market: 'বাজার/মল',
    short_hotel: 'হোটেল/হস্টেল',
    short_worship: 'উপাসনাস্থল',
    radiusHint: '5 কিমি = আপনার কাছের বাজার · 10 কিমি = পুরো শহর। বড় বৃত্ত দেখতে বেশি সময় লাগে।',

    demandLbl: 'চাহিদা',
    populationLbl: 'জনসংখ্যা',
    accessibilityLbl: 'যাতায়াত',
    budgetPlaceholder: 'যেমন 300000',

    anchor_college: 'কলেজ / বিশ্ববিদ্যালয়',
    anchor_school: 'স্কুল',
    anchor_hospital: 'হাসপাতাল',
    anchor_clinic: 'ক্লিনিক / ডাক্তার',
    anchor_station: 'মেট্রো / রেল / বাস স্টেশন',
    anchor_busStop: 'বাস স্টপ',
    anchor_office: 'অফিস',
    anchor_market: 'বাজার / মল',
    anchor_hotel: 'হোটেল / হস্টেল / PG',
    anchor_worship: 'মন্দির / মসজিদ / গির্জা',

    cat_food: 'খাবার',
    cat_retail: 'খুচরা',
    cat_services: 'পরিষেবা',
    cat_health: 'স্বাস্থ্য',
    cat_education: 'শিক্ষা',
  },
};

// Returns a translate function for one language.
// Missing keys fall back to English, then to the key itself.
export function advisorT(lang = 'en') {
  const table = TEXT[lang] || TEXT.en;
  return (key, vars) => {
    let text = table[key] ?? TEXT.en[key] ?? key;
    if (vars) {
      for (const name of Object.keys(vars)) {
        text = text.split(`{${name}}`).join(String(vars[name]));
      }
    }
    return text;
  };
}

export const ADVISOR_TEXT = TEXT;