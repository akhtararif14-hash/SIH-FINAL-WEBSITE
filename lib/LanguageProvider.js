'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from './translations';

const LanguageContext = createContext({
  lang: 'en',
  t: (key) => key,
  setLang: () => {},
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('en');

  // Remember the chosen language across visits.
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('srigen-lang') : null;
    if (saved && TRANSLATIONS[saved]) setLangState(saved);
  }, []);

  const setLang = (code) => {
    setLangState(code);
    if (typeof window !== 'undefined') window.localStorage.setItem('srigen-lang', code);
  };

  // t('yearsWord')                     -> "years"
  // t('moratoriumNote', { n: 6 })      -> "including 6-month moratorium"
  // Falls back to English if a language is missing the key.
  const t = (key, vars) => {
    let text = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.en[key] || key;
    if (vars) {
      for (const name of Object.keys(vars)) {
        text = text.split(`{${name}}`).join(String(vars[name]));
      }
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, t, setLang }}>{children}</LanguageContext.Provider>
  );
}

export function useTranslate() {
  return useContext(LanguageContext);
}