'use client';
// components/AppShell.js
// The frame around every page:
//   • wide screens  -> menu on the LEFT (sidebar)
//   • phones        -> menu at the BOTTOM (tab bar), with a small top bar
// It also sends first-time users to the onboarding screens.

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslate } from '@/lib/LanguageProvider';
import { useAuth } from '@/lib/AuthProvider';
import { useProfile } from '@/lib/ProfileProvider';
import { LANGUAGES } from '@/lib/translations';

// Simple line icons, drawn inline so the app needs no icon library.
const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);
const icons = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 10v10h14V10" /></>,
  chat: <><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>,
  map: <><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.6" /></>,
  scheme: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h5" /></>,
  calc: <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 6h8M8 11h2m3 0h3M8 15h2m3 0h3M8 19h8" /></>,
  download: <><path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M4 21h16" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" /></>,
};

const NAV = [
  { href: '/', key: 'home', icon: icons.home },
  { href: '/chat', key: 'aiAdvisor', icon: icons.chat },
  { href: '/advisor', key: 'locationAdvisor', icon: icons.map },
  { href: '/schemes', key: 'schemes', icon: icons.scheme },
  { href: '/calculator', key: 'calculator', icon: icons.calc },
  { href: '/downloads', key: 'downloads', icon: icons.download },
];

// Pages that must NOT show the menu (the user is not set up yet).
const BARE_PAGES = ['/onboarding', '/login'];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang, setLang } = useTranslate();
  const { user, signOut } = useAuth();
  const { profile, ready, clearProfile } = useProfile();
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // profile menu
  const boxRef = useRef(null);

  const bare = BARE_PAGES.some((p) => pathname?.startsWith(p));

  // First visit -> onboarding. Returning users go straight in.
  useEffect(() => {
    if (!ready || bare) return;
    if (!profile.onboarded) router.replace('/onboarding');
  }, [ready, bare, profile.onboarded, router]);

  useEffect(() => {
    const close = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setLangOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  if (bare) return <>{children}</>;

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname?.startsWith(href));
  const initial = (profile.name || user?.displayName || 'S').charAt(0).toUpperCase();

  return (
    <div className="shell">
      {/* ---------- LEFT MENU (wide screens) ---------- */}
      <aside className="sidebar">
        <Link href="/" className="side-brand">
          <Image src="/app-logo.png" alt="" width={32} height={32} style={{ borderRadius: 8 }} />
          <span>{t('appTitle')}</span>
        </Link>

        <div className="side-user">
          <div className="avatar">{initial}</div>
          <div className="side-user-text">
            <strong>{profile.name || user?.displayName || 'Guest'}</strong>
            <span>{[profile.district, profile.state].filter(Boolean).join(', ') || 'Set your area'}</span>
          </div>
        </div>

        <nav className="side-nav">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={`side-link ${isActive(item.href) ? 'on' : ''}`}>
              <Icon d={item.icon} />
              <span>{t(item.key)}</span>
            </Link>
          ))}
        </nav>

        <div className="side-bottom" ref={boxRef}>
          <button className="side-link" onClick={() => setLangOpen((v) => !v)}>
            <Icon d={icons.globe} />
            <span>{LANGUAGES.find((l) => l.code === lang)?.label || t('chooseLanguage')}</span>
          </button>
          {langOpen && (
            <div className="side-langs">
              {LANGUAGES.map((l) => (
                <button key={l.code} className={l.code === lang ? 'on' : ''} onClick={() => { setLang(l.code); setLangOpen(false); }}>
                  {l.label}
                </button>
              ))}
            </div>
          )}
          <button
            className="side-link"
            onClick={async () => {
              if (user) await signOut();
              clearProfile();
              router.replace('/onboarding');
            }}
          >
            <Icon d={icons.user} />
            <span>{user ? t('logout') : t('login')}</span>
          </button>
        </div>
      </aside>

      {/* ---------- MAIN AREA ---------- */}
      <div className="shell-main">
        <header className="topbar-mobile">
          <Link href="/" className="side-brand small">
            <Image src="/app-logo.png" alt="" width={26} height={26} style={{ borderRadius: 6 }} />
            <span>{t('appTitle')}</span>
          </Link>
          <button className="avatar tiny" onClick={() => setMenuOpen((v) => !v)} aria-label={t('profile')}>
            {initial}
          </button>
          {menuOpen && (
            <div className="mobile-menu">
              <div className="mobile-menu-name">{profile.name || user?.displayName || 'Guest'}</div>
              {LANGUAGES.map((l) => (
                <button key={l.code} className={l.code === lang ? 'on' : ''} onClick={() => { setLang(l.code); setMenuOpen(false); }}>
                  {l.code === lang ? '✓ ' : ''}{l.label}
                </button>
              ))}
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  if (user) await signOut();
                  clearProfile();
                  router.replace('/onboarding');
                }}
              >
                {user ? t('logout') : t('login')}
              </button>
            </div>
          )}
        </header>

        <main className="shell-content">{children}</main>
      </div>

      {/* ---------- BOTTOM MENU (phones) ---------- */}
      <nav className="bottom-nav">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className={`bottom-link ${isActive(item.href) ? 'on' : ''}`}>
            <Icon d={item.icon} size={21} />
            <span>{t(item.key)}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}