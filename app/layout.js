import { Lora, Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageProvider';
import { AuthProvider } from '@/lib/AuthProvider';
import { ProfileProvider } from '@/lib/ProfileProvider';
import AppShell from '@/components/AppShell';

const lora = Lora({ subsets: ['latin'], variable: '--font-lora', weight: ['500', '600', '700'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', weight: ['400', '500', '600', '700'] });

export const metadata = {
  title: 'SriGen — AI Business Advisor',
  description: 'Multilingual AI business advisory and financial scheme guidance for micro-entrepreneurs.',
  icons: { icon: '/favicon.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${lora.variable} ${inter.variable}`}>
      <head>
        {/* Open the network connection to the map servers early, so map tiles
            start downloading the moment the map code is ready. */}
        <link rel="preconnect" href="https://tile.openstreetmap.org" crossOrigin="" />
        <link rel="preconnect" href="https://maps.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://maps.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://overpass-api.de" />
      </head>
      <body>
        <AuthProvider>
          <LanguageProvider>
            <ProfileProvider>
              <AppShell>{children}</AppShell>
            </ProfileProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}