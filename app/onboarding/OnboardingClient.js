'use client';
// app/onboarding/OnboardingClient.js
// Shown only the FIRST time someone opens the app:
//   Step 1 — choose language
//   Step 2 — name, gender, age, district, state   (no mobile number is asked)
//   Step 3 — sign in with Google
// After this the details are remembered, so the user never fills them again.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useTranslate } from '@/lib/LanguageProvider';
import { useProfile } from '@/lib/ProfileProvider';
import { LANGUAGES } from '@/lib/translations';

const TEXT = {
  en: {
    step: 'Step', of: 'of', chooseLanguage: 'Choose your language', langHint: 'Pick the language you are most comfortable in.',
    about: 'Tell us about you', aboutHint: 'This helps us give advice that fits your area. We never ask for your phone number.',
    name: 'Full name', gender: 'Gender', age: 'Age', district: 'District', state: 'State',
    male: 'Male', female: 'Female', other: 'Other',
    signin: 'Sign in to save your work', signinHint: 'Sign in once with Google. Next time you open the app, you go straight in.',
    google: 'Continue with Google', skip: 'Skip for now', next: 'Continue', back: 'Back',
    welcome: 'Welcome to SriGen', tagline: 'Your trusted business advisor — find the right business for your area, in your language.',
    required: 'Please fill your name, district and state.',
  },
  hi: {
    step: 'चरण', of: 'में से', chooseLanguage: 'अपनी भाषा चुनें', langHint: 'वह भाषा चुनें जिसमें आप सहज हैं।',
    about: 'अपने बारे में बताएं', aboutHint: 'इससे आपके इलाके के हिसाब से सलाह मिलेगी। हम आपका मोबाइल नंबर कभी नहीं पूछते।',
    name: 'पूरा नाम', gender: 'लिंग', age: 'उम्र', district: 'जिला', state: 'राज्य',
    male: 'पुरुष', female: 'महिला', other: 'अन्य',
    signin: 'अपना काम सुरक्षित रखने के लिए साइन इन करें', signinHint: 'एक बार Google से साइन इन करें। अगली बार सीधे अंदर पहुंचेंगे।',
    google: 'Google से जारी रखें', skip: 'अभी छोड़ें', next: 'आगे बढ़ें', back: 'वापस',
    welcome: 'श्रीजेन में आपका स्वागत है', tagline: 'आपका भरोसेमंद बिज़नेस सलाहकार — अपने इलाके के लिए सही बिज़नेस चुनें, अपनी भाषा में।',
    required: 'कृपया नाम, जिला और राज्य भरें।',
  },
  ur: {
    step: 'مرحلہ', of: 'میں سے', chooseLanguage: 'اپنی زبان منتخب کریں', langHint: 'وہ زبان منتخب کریں جس میں آپ آرام محسوس کرتے ہیں۔',
    about: 'اپنے بارے میں بتائیں', aboutHint: 'اس سے آپ کے علاقے کے مطابق مشورہ ملے گا۔ ہم موبائل نمبر کبھی نہیں پوچھتے۔',
    name: 'پورا نام', gender: 'صنف', age: 'عمر', district: 'ضلع', state: 'ریاست',
    male: 'مرد', female: 'عورت', other: 'دیگر',
    signin: 'اپنا کام محفوظ رکھنے کے لیے سائن اِن کریں', signinHint: 'ایک بار Google سے سائن اِن کریں۔ اگلی بار سیدھے اندر آئیں گے۔',
    google: 'Google سے جاری رکھیں', skip: 'ابھی چھوڑیں', next: 'آگے بڑھیں', back: 'واپس',
    welcome: 'سری جین میں خوش آمدید', tagline: 'آپ کا بھروسہ مند بزنس مشیر — اپنے علاقے کے لیے صحیح کاروبار، اپنی زبان میں۔',
    required: 'براہ کرم نام، ضلع اور ریاست بھریں۔',
  },
  bn: {
    step: 'ধাপ', of: 'এর', chooseLanguage: 'আপনার ভাষা বেছে নিন', langHint: 'যে ভাষায় আপনি স্বচ্ছন্দ সেটি বেছে নিন।',
    about: 'আপনার সম্পর্কে বলুন', aboutHint: 'এতে আপনার এলাকার উপযোগী পরামর্শ পাবেন। আমরা কখনও মোবাইল নম্বর চাই না।',
    name: 'পুরো নাম', gender: 'লিঙ্গ', age: 'বয়স', district: 'জেলা', state: 'রাজ্য',
    male: 'পুরুষ', female: 'মহিলা', other: 'অন্যান্য',
    signin: 'আপনার কাজ সংরক্ষণ করতে সাইন ইন করুন', signinHint: 'একবার Google দিয়ে সাইন ইন করুন। পরের বার সরাসরি ঢুকবেন।',
    google: 'Google দিয়ে এগিয়ে যান', skip: 'এখন থাক', next: 'এগিয়ে যান', back: 'ফিরুন',
    welcome: 'শ্রীজেন-এ স্বাগতম', tagline: 'আপনার বিশ্বস্ত ব্যবসা পরামর্শদাতা — আপনার এলাকার জন্য সঠিক ব্যবসা, আপনার ভাষায়।',
    required: 'অনুগ্রহ করে নাম, জেলা ও রাজ্য পূরণ করুন।',
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

export default function OnboardingClient() {
  const router = useRouter();
  const { lang, setLang } = useTranslate();
  const { profile, saveProfile } = useProfile();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: profile.name || '',
    gender: profile.gender || '',
    age: profile.age || '',
    district: profile.district || '',
    state: profile.state || '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const x = TEXT[lang] || TEXT.en;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const finish = () => {
    saveProfile({ ...form, language: lang, onboarded: true });
    router.replace('/');
  };

  const googleSignIn = async () => {
    setBusy(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      finish();
    } catch (err) {
      setError(
        err?.code === 'auth/popup-closed-by-user'
          ? 'Sign-in window was closed. Try again, or skip for now.'
          : `Could not sign in (${err?.code || err.message}). You can skip for now.`
      );
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
          <li>📍 {lang === 'hi' ? 'अपने इलाके के लिए सही बिज़नेस' : 'The right business for your area'}</li>
          <li>💰 {lang === 'hi' ? 'लागत, मुनाफ़ा और सरकारी योजनाएं' : 'Costs, profit and government schemes'}</li>
          <li>🗣️ {lang === 'hi' ? 'आपकी भाषा में सलाह' : 'Advice in your own language'}</li>
        </ul>
      </div>

      <div className="onb-panel">
        <div className="onb-steps">
          {[1, 2, 3].map((n) => (
            <span key={n} className={`onb-dot ${step >= n ? 'on' : ''}`} />
          ))}
          <small>{x.step} {step} {x.of} 3</small>
        </div>

        {step === 1 && (
          <>
            <h2>{x.chooseLanguage}</h2>
            <p className="onb-hint">{x.langHint}</p>
            <div className="onb-langs">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  className={`onb-lang ${lang === l.code ? 'on' : ''}`}
                  onClick={() => setLang(l.code)}
                >
                  <span className="onb-lang-letter">
                    {l.code === 'hi' ? 'अ' : l.code === 'ur' ? 'ا' : l.code === 'bn' ? 'ব' : 'A'}
                  </span>
                  <span>{l.label}</span>
                  {lang === l.code && <span className="onb-check">✓</span>}
                </button>
              ))}
            </div>
            <button className="onb-primary" onClick={() => setStep(2)}>{x.next} →</button>
          </>
        )}

        {step === 2 && (
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
            {error && <div className="onb-error">{error}</div>}
            <div className="onb-actions">
              <button className="onb-ghost" onClick={() => setStep(1)}>← {x.back}</button>
              <button
                className="onb-primary"
                onClick={() => {
                  if (!form.name.trim() || !form.district.trim() || !form.state) return setError(x.required);
                  setError('');
                  setStep(3);
                }}
              >
                {x.next} →
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2>{x.signin}</h2>
            <p className="onb-hint">{x.signinHint}</p>
            <button className="onb-google" onClick={googleSignIn} disabled={busy}>
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.1 24.5c0-1.6-.2-3.2-.5-4.7H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.1 5.5c4.2-3.8 6.6-9.5 6.6-16.2z" />
                <path fill="#FBBC05" d="M10.4 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C1 16.3 0 20 0 24s1 7.7 2.6 10.8l7.8-6.1z" />
                <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.3-4.6 2.1-8.8 2.1-6.4 0-11.7-3.7-13.6-8.9l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
              </svg>
              {busy ? '…' : x.google}
            </button>
            {error && <div className="onb-error">{error}</div>}
            <div className="onb-actions">
              <button className="onb-ghost" onClick={() => setStep(2)}>← {x.back}</button>
              <button className="onb-ghost" onClick={finish}>{x.skip} →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}