'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTranslate } from '@/lib/LanguageProvider';
import { useAuth } from '@/lib/AuthProvider';
import { LANGUAGES } from '@/lib/translations';

const WHATSAPP_NUMBER = '919334638282';

const NAV_LINKS = [
  { href: '/', key: 'home' },
  { href: '/chat', key: 'aiAdvisor' },
  { href: '/schemes', key: 'schemes' },
  { href: '/calculator', key: 'calculator' },
];

export default function Header() {
  const { t, lang, setLang } = useTranslate();
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const langRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <Link href="/" style={styles.brand}>
          <Image src="/app-logo.png" alt="" width={30} height={30} style={styles.logoImg} />
          <span style={styles.brandText}>{t('appTitle')}</span>
        </Link>

        <nav style={styles.nav}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                ...styles.navLink,
                ...(pathname === link.href ? styles.navLinkActive : {}),
              }}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div style={styles.actions}>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.iconBtn}
            aria-label="WhatsApp"
            title="WhatsApp"
          >
            💬
          </a>

          <div ref={langRef} style={{ position: 'relative' }}>
            <button
              style={styles.iconBtn}
              onClick={() => setLangOpen((v) => !v)}
              aria-label={t('chooseLanguage')}
              title={t('chooseLanguage')}
            >
              🌐
            </button>
            {langOpen && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownTitle}>{t('chooseLanguage')}</div>
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    style={{
                      ...styles.dropdownItem,
                      ...(l.code === lang ? styles.dropdownItemActive : {}),
                    }}
                    onClick={() => {
                      setLang(l.code);
                      setLangOpen(false);
                    }}
                  >
                    {l.code === lang ? '✓ ' : ''}
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              style={styles.iconBtn}
              onClick={() => setProfileOpen((v) => !v)}
              aria-label={t('profile')}
              title={t('profile')}
            >
              👤
            </button>
            {profileOpen && (
              <div style={styles.dropdown}>
                {loading ? (
                  <div style={styles.dropdownItem}>…</div>
                ) : user ? (
                  <>
                    <div style={styles.dropdownTitle}>
                      {user.displayName || user.email || 'Account'}
                    </div>
                    <button
                      style={styles.dropdownItem}
                      onClick={async () => {
                        setProfileOpen(false);
                        await signOut();
                        router.push('/');
                      }}
                    >
                      {t('logout')}
                    </button>
                  </>
                ) : (
                  <button
                    style={styles.dropdownItem}
                    onClick={() => {
                      setProfileOpen(false);
                      router.push('/login');
                    }}
                  >
                    {t('login')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 40,
    background: 'var(--forest)',
    borderBottom: '1px solid var(--forest-dark)',
  },
  inner: {
    maxWidth: 1040,
    margin: '0 auto',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 24,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  logoImg: { borderRadius: 8 },
  brandText: {
    color: 'var(--white)',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: 19,
    letterSpacing: '0.01em',
  },
  nav: { display: 'flex', gap: 4, flex: 1 },
  navLink: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14.5,
    fontWeight: 500,
    padding: '8px 12px',
    borderRadius: 8,
  },
  navLinkActive: {
    color: 'var(--white)',
    background: 'rgba(255,255,255,0.12)',
  },
  actions: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    border: 'none',
    background: 'rgba(255,255,255,0.15)',
    color: 'var(--white)',
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: 44,
    background: 'var(--card)',
    borderRadius: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
    padding: 8,
    minWidth: 200,
  },
  dropdownTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--brown)',
    padding: '6px 10px',
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    padding: '9px 10px',
    borderRadius: 8,
    fontSize: 14,
    color: 'var(--ink)',
  },
  dropdownItemActive: { color: 'var(--forest)', fontWeight: 700 },
};
