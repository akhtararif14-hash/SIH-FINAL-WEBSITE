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
import Icon from '@/components/Icon';
import { useClearKeptState } from '@/lib/KeepState';
import { preloadMap, preloadMapWhenIdle } from '@/lib/mapPreload';

// All icons come from components/Icon.js — edit that file to change a logo.
const NAV = [
  { href: '/', key: 'home', icon: 'home' },
  { href: '/chat', key: 'aiAdvisor', icon: 'chat' },
  { href: '/advisor', key: 'locationAdvisor', icon: 'pin' },
  { href: '/schemes', key: 'schemes', icon: 'doc' },
  { href: '/calculator', key: 'calculator', icon: 'calculator' },
  { href: '/downloads', key: 'downloads', icon: 'download' },
];

// Pages that must NOT show the menu (the user is not set up yet).
const BARE_PAGES = ['/onboarding', '/login'];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang, setLang } = useTranslate();
  const { user, signOut } = useAuth();
  const { profile, ready, clearProfile } = useProfile();
  const clearKept = useClearKeptState();
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // profile menu
  const boxRef = useRef(null);

  const bare = BARE_PAGES.some((p) => pathname?.startsWith(p));

  // First visit -> onboarding. Returning users go straight in.
  useEffect(() => {
    if (!ready || bare) return;
    if (!profile.onboarded) router.replace('/onboarding');
  }, [ready, bare, profile.onboarded, router]);

  // Fetch the map code in the background so the Location Advisor opens with a
  // map already there, instead of a grey box.
  useEffect(() => preloadMapWhenIdle(), []);

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
            <Link
              key={item.href}
              href={item.href}
              className={`side-link ${isActive(item.href) ? 'on' : ''}`}
              onMouseEnter={item.href === '/advisor' ? preloadMap : undefined}
              onTouchStart={item.href === '/advisor' ? preloadMap : undefined}
            >
              <Icon name={item.icon} onDark />
              <span>{t(item.key)}</span>
            </Link>
          ))}
        </nav>

        <div className="side-bottom" ref={boxRef}>
          <button className="side-link" onClick={() => setLangOpen((v) => !v)}>
            <Icon name="globe" onDark />
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
              clearKept(); // don't leave one person's data for the next
              router.replace('/onboarding');
            }}
          >
            <Icon name="user" onDark />
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
                  clearKept(); // don't leave one person's data for the next
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
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-link ${isActive(item.href) ? 'on' : ''}`}
            onTouchStart={item.href === '/advisor' ? preloadMap : undefined}
          >
            <Icon name={item.icon} size={21} />
            <span>{t(item.key)}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}