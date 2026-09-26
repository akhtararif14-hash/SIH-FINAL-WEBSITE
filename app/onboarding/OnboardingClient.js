'use client';
// app/onboarding/OnboardingClient.js
//
// The way in, for everyone:
//   1. Language          — pick your language, press Continue
//   2. Login or Sign up  — two clear choices
//        Login  -> Google popup -> we check the database
//                  · found     -> straight into the app
//                  · not found -> "Please sign up first"
//        Signup -> name, gender, age, district, state (no phone number)
//                  -> Google popup -> account saved in the database
// Once done, the browser remembers, so returning users skip all of it.

import { useState } from 'react';
import Icon from '@/components/Icon';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { getUserDoc, createUserDoc } from '@/lib/userDb';
import { useTranslate } from '@/lib/LanguageProvider';
import { useProfile } from '@/lib/ProfileProvider';
import { LANGUAGES } from '@/lib/translations';

const TEXT = {
  en: {
    step: 'Step', of: 'of',
    chooseLanguage: 'Choose your language', langHint: 'Pick the language you are most comfortable in.',
    continue: 'Continue', back: 'Back',
    choiceTitle: 'Welcome', choiceHint: 'Already with us, or joining today?',
    login: 'Log in', loginSub: 'I already have an account',
    signup: 'Sign up', signupSub: 'I am new here',
    about: 'Tell us about you', aboutHint: 'This helps us give advice that fits your area. We never ask for your phone number.',
    name: 'Full name', gender: 'Gender', age: 'Age', district: 'District', state: 'State',
    male: 'Male', female: 'Female', other: 'Other',
    lastStep: 'Last step — sign in with Google', lastStepHint: 'Your details are saved to your Google account, so you never fill this form again.',
    google: 'Continue with Google', checking: 'Checking your account…',
    notRegistered: 'This Google account is not registered yet. Please sign up first.',
    goSignup: 'Sign up now',
    required: 'Please fill your name, district and state.',
    welcome: 'Welcome to SriGen',
    tagline: 'Your trusted business advisor — find the right business for your area, in your language.',
  },
  hi: {
    step: 'चरण', of: 'में से',
    chooseLanguage: 'अपनी भाषा चुनें', langHint: 'वह भाषा चुनें जिसमें आप सहज हैं।',
    continue: 'आगे बढ़ें', back: 'वापस',
    choiceTitle: 'स्वागत है', choiceHint: 'पहले से खाता है, या आज जुड़ रहे हैं?',
    login: 'लॉग इन', loginSub: 'मेरा खाता पहले से है',
    signup: 'साइन अप', signupSub: 'मैं नया हूँ',
    about: 'अपने बारे में बताएं', aboutHint: 'इससे आपके इलाके के हिसाब से सलाह मिलेगी। हम आपका मोबाइल नंबर कभी नहीं पूछते।',
    name: 'पूरा नाम', gender: 'लिंग', age: 'उम्र', district: 'जिला', state: 'राज्य',
    male: 'पुरुष', female: 'महिला', other: 'अन्य',
    lastStep: 'आख़िरी कदम — Google से साइन इन करें', lastStepHint: 'आपकी जानकारी आपके Google खाते से जुड़ जाएगी, ताकि दोबारा भरना न पड़े।',
    google: 'Google से जारी रखें', checking: 'आपका खाता देख रहे हैं…',
    notRegistered: 'यह Google खाता अभी पंजीकृत नहीं है। कृपया पहले साइन अप करें।',
    goSignup: 'अभी साइन अप करें',
    required: 'कृपया नाम, जिला और राज्य भरें।',
    welcome: 'श्रीजेन में आपका स्वागत है',
    tagline: 'आपका भरोसेमंद बिज़नेस सलाहकार — अपने इलाके के लिए सही बिज़नेस चुनें, अपनी भाषा में।',
  },
  ur: {
    step: 'مرحلہ', of: 'میں سے',
    chooseLanguage: 'اپنی زبان منتخب کریں', langHint: 'وہ زبان منتخب کریں جس میں آپ آرام محسوس کرتے ہیں۔',
    continue: 'آگے بڑھیں', back: 'واپس',
    choiceTitle: 'خوش آمدید', choiceHint: 'پہلے سے اکاؤنٹ ہے، یا آج شامل ہو رہے ہیں؟',
    login: 'لاگ اِن', loginSub: 'میرا اکاؤنٹ پہلے سے ہے',
    signup: 'سائن اپ', signupSub: 'میں نیا ہوں',
    about: 'اپنے بارے میں بتائیں', aboutHint: 'اس سے آپ کے علاقے کے مطابق مشورہ ملے گا۔ ہم موبائل نمبر کبھی نہیں پوچھتے۔',
    name: 'پورا نام', gender: 'صنف', age: 'عمر', district: 'ضلع', state: 'ریاست',
    male: 'مرد', female: 'عورت', other: 'دیگر',
    lastStep: 'آخری مرحلہ — Google سے سائن اِن کریں', lastStepHint: 'آپ کی تفصیلات آپ کے Google اکاؤنٹ سے محفوظ ہو جائیں گی۔',
    google: 'Google سے جاری رکھیں', checking: 'آپ کا اکاؤنٹ دیکھ رہے ہیں…',
    notRegistered: 'یہ Google اکاؤنٹ ابھی رجسٹرڈ نہیں ہے۔ براہ کرم پہلے سائن اپ کریں۔',
    goSignup: 'ابھی سائن اپ کریں',
    required: 'براہ کرم نام، ضلع اور ریاست بھریں۔',
    welcome: 'سری جین میں خوش آمدید',
    tagline: 'آپ کا بھروسہ مند بزنس مشیر — اپنے علاقے کے لیے صحیح کاروبار، اپنی زبان میں۔',
  },
  bn: {
    step: 'ধাপ', of: 'এর',
    chooseLanguage: 'আপনার ভাষা বেছে নিন', langHint: 'যে ভাষায় আপনি স্বচ্ছন্দ সেটি বেছে নিন।',
    continue: 'এগিয়ে যান', back: 'ফিরুন',
    choiceTitle: 'স্বাগতম', choiceHint: 'আগে থেকে অ্যাকাউন্ট আছে, নাকি আজ যোগ দিচ্ছেন?',
    login: 'লগ ইন', loginSub: 'আমার অ্যাকাউন্ট আছে',
    signup: 'সাইন আপ', signupSub: 'আমি নতুন',
    about: 'আপনার সম্পর্কে বলুন', aboutHint: 'এতে আপনার এলাকার উপযোগী পরামর্শ পাবেন। আমরা কখনও মোবাইল নম্বর চাই না।',
    name: 'পুরো নাম', gender: 'লিঙ্গ', age: 'বয়স', district: 'জেলা', state: 'রাজ্য',
    male: 'পুরুষ', female: 'মহিলা', other: 'অন্যান্য',
    lastStep: 'শেষ ধাপ — Google দিয়ে সাইন ইন করুন', lastStepHint: 'আপনার তথ্য Google অ্যাকাউন্টে সংরক্ষিত থাকবে, তাই আর ফর্ম ভরতে হবে না।',
    google: 'Google দিয়ে এগিয়ে যান', checking: 'আপনার অ্যাকাউন্ট দেখা হচ্ছে…',
    notRegistered: 'এই Google অ্যাকাউন্ট এখনও নিবন্ধিত নয়। অনুগ্রহ করে আগে সাইন আপ করুন।',
    goSignup: 'এখনই সাইন আপ করুন',
    required: 'অনুগ্রহ করে নাম, জেলা ও রাজ্য পূরণ করুন।',
    welcome: 'শ্রীজেন-এ স্বাগতম',
    tagline: 'আপনার বিশ্বস্ত ব্যবসা পরামর্শদাতা — আপনার এলাকার জন্য সঠিক ব্যবসা, আপনার ভাষায়।',
  },
};

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh', 'Andaman & Nicobar Islands',
  'Dadra & Nagar Haveli and Daman & Diu', 'Lakshadweep',
];

// 'language' -> 'choice' -> 'signup' -> (google) -> app
//                        -> (google login) -> app
export default function OnboardingClient() {
  const router = useRouter();
  const { lang, setLang } = useTranslate();
  const { profile, saveProfile } = useProfile();

  const [stage, setStage] = useState('language');
  const [form, setForm] = useState({
    name: profile.name || '',
    gender: profile.gender || '',
    age: profile.age || '',
    district: profile.district || '',
    state: profile.state || '',
  });
  const [error, setError] = useState('');
  const [needsSignup, setNeedsSignup] = useState(false);
  const [busy, setBusy] = useState(false);

  const x = TEXT[lang] || TEXT.en;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const stepNumber = stage === 'language' ? 1 : stage === 'choice' ? 2 : 3;

  const enterApp = (details) => {
    saveProfile({ ...details, language: lang, onboarded: true });
    router.replace('/');
  };

  const describeError = (err) => {
    if (err?.code === 'auth/popup-closed-by-user') return 'The sign-in window was closed. Please try again.';
    if (err?.code === 'auth/unauthorized-domain') return 'This website address is not allowed in Firebase. Add it under Authentication → Settings → Authorized domains.';
    if (err?.code === 'permission-denied') return 'The database refused the request. Check your Firestore security rules.';
    if (err?.code === 'unavailable' || /offline|firestore/i.test(err?.message || '')) return 'Could not reach the database. Check that Firestore is enabled in your Firebase project.';
    return `Something went wrong (${err?.code || err?.message || 'unknown'}). Please try again.`;
  };

  // ---------- LOG IN: only existing accounts may pass ----------
  const handleLogin = async () => {
    setBusy(true);
    setError('');
    setNeedsSignup(false);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const existing = await getUserDoc(cred.user.uid);
      if (!existing) {
        // Not in our database — sign back out and send them to sign up.
        await fbSignOut(auth);
        setNeedsSignup(true);
        setError(x.notRegistered);
        setBusy(false);
        return;
      }
      enterApp({
        name: existing.name,
        gender: existing.gender,
        age: existing.age,
        district: existing.district,
        state: existing.state,
      });
    } catch (err) {
      setError(describeError(err));
      setBusy(false);
    }
  };

  // ---------- SIGN UP: save the details, then create the account ----------
  const handleSignup = async () => {
    if (!form.name.trim() || !form.district.trim() || !form.state) return setError(x.required);
    setBusy(true);
    setError('');
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await createUserDoc(cred.user.uid, { ...form, language: lang }, cred.user);
      enterApp(form);
    } catch (err) {
      setError(describeError(err));
      setBusy(false);
    }
  };

  return (
    <div className="onb">
      <div className="onb-side">
        <Image src="/app-logo.png" alt="" width={54} height={54} style={{ borderRadius: 14 }} />
        <h1>{x.welcome}</h1>
        <p>{x.tagline}</p>
        <ul className="onb-points">
          <li> {lang === 'hi' ? 'अपने इलाके के लिए सही बिज़नेस' : 'The right business for your area'}</li>
          <li> {lang === 'hi' ? 'लागत, मुनाफ़ा और सरकारी योजनाएं' : 'Costs, profit and government schemes'}</li>
          <li> {lang === 'hi' ? 'आपकी भाषा में सलाह' : 'Advice in your own language'}</li>
        </ul>
      </div>

      <div className="onb-panel">
        <div className="onb-steps">
          {[1, 2, 3].map((n) => (
            <span key={n} className={`onb-dot ${stepNumber >= n ? 'on' : ''}`} />
          ))}
          <small>{x.step} {stepNumber} {x.of} 3</small>
        </div>

        {/* ---------- 1. LANGUAGE ---------- */}
        {stage === 'language' && (
          <>
            <h2>{x.chooseLanguage}</h2>
            <p className="onb-hint">{x.langHint}</p>
            <div className="onb-langs">
              {LANGUAGES.map((l) => (
                <button key={l.code} className={`onb-lang ${lang === l.code ? 'on' : ''}`} onClick={() => setLang(l.code)}>
                  <span className="onb-lang-letter">
                    {l.code === 'hi' ? 'अ' : l.code === 'ur' ? 'ا' : l.code === 'bn' ? 'ব' : 'A'}
                  </span>
                  <span>{l.label}</span>
                  {lang === l.code && <span className="onb-check">✓</span>}
                </button>
              ))}
            </div>
            <button className="onb-primary" onClick={() => setStage('choice')}>{x.continue} →</button>
          </>
        )}

        {/* ---------- 2. LOGIN OR SIGN UP ---------- */}
        {stage === 'choice' && (
          <>
            <h2>{x.choiceTitle}</h2>
            <p className="onb-hint">{x.choiceHint}</p>

            <div className="onb-choices">
              <button className="onb-choice" onClick={handleLogin} disabled={busy}>
                <span className="onb-choice-icon"><Icon name="login" size={21} /></span>
                <span>
                  <strong>{busy ? x.checking : x.login}</strong>
                  <small>{x.loginSub}</small>
                </span>
                <span className="onb-choice-arrow">→</span>
              </button>

              <button
                className="onb-choice primary"
                onClick={() => { setError(''); setNeedsSignup(false); setStage('signup'); }}
                disabled={busy}
              >
                <span className="onb-choice-icon"><Icon name="userAdd" size={21} /></span>
                <span>
                  <strong>{x.signup}</strong>
                  <small>{x.signupSub}</small>
                </span>
                <span className="onb-choice-arrow">→</span>
              </button>
            </div>

            {error && (
              <div className="onb-error">
                {error}
                {needsSignup && (
                  <button className="onb-inline-link" onClick={() => { setError(''); setNeedsSignup(false); setStage('signup'); }}>
                    {x.goSignup} →
                  </button>
                )}
              </div>
            )}

            <button className="onb-ghost" onClick={() => setStage('language')}>← {x.back}</button>
          </>
        )}

        {/* ---------- 3. SIGN UP DETAILS + GOOGLE ---------- */}
        {stage === 'signup' && (
          <>
            <h2>{x.about}</h2>
            <p className="onb-hint">{x.aboutHint}</p>
            <div className="onb-form">
              <label>
                <span>{x.name}</span>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={lang === 'hi' ? 'जैसे, सुनीता देवी' : 'e.g. Sunita Devi'} />
              </label>
              <div className="onb-row2">
                <label>
                  <span>{x.gender}</span>
                  <select value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                    <option value="">—</option>
                    <option value="female">{x.female}</option>
                    <option value="male">{x.male}</option>
                    <option value="other">{x.other}</option>
                  </select>
                </label>
                <label>
                  <span>{x.age}</span>
                  <input type="number" min={12} max={100} value={form.age} onChange={(e) => set('age', e.target.value)} placeholder="32" />
                </label>
              </div>
              <label>
                <span>{x.district}</span>
                <input value={form.district} onChange={(e) => set('district', e.target.value)} placeholder={lang === 'hi' ? 'जैसे, महाराजगंज' : 'e.g. Maharajganj'} />
              </label>
              <label>
                <span>{x.state}</span>
                <select value={form.state} onChange={(e) => set('state', e.target.value)}>
                  <option value="">—</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="onb-lastline">
              <strong>{x.lastStep}</strong>
              <span>{x.lastStepHint}</span>
            </div>

            <button className="onb-google" onClick={handleSignup} disabled={busy}>
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.1 24.5c0-1.6-.2-3.2-.5-4.7H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.1 5.5c4.2-3.8 6.6-9.5 6.6-16.2z" />
                <path fill="#FBBC05" d="M10.4 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C1 16.3 0 20 0 24s1 7.7 2.6 10.8l7.8-6.1z" />
                <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.3-4.6 2.1-8.8 2.1-6.4 0-11.7-3.7-13.6-8.9l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
              </svg>
              {busy ? '…' : x.google}
            </button>

            {error && <div className="onb-error">{error}</div>}

            <button className="onb-ghost" onClick={() => setStage('choice')}>← {x.back}</button>
          </>
        )}
      </div>
    </div>
  );
}