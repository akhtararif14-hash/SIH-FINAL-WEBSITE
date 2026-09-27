import { Lora, Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageProvider';
import { AuthProvider } from '@/lib/AuthProvider';
import { ProfileProvider } from '@/lib/ProfileProvider';
import AppShell from '@/components/AppShell';
import { KeepStateProvider } from '@/lib/KeepState';

const lora = Lora({ subsets: ['latin'], variable: '--font-lora', weight: ['500', '600', '700'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', weight: ['400', '500', '600', '700'] });

export const metadata = {
  title: 'SriGen — AI Business Advisor',
  description: 'Multilingual AI business advisory and financial scheme guidance for micro-entrepreneurs.',
  applicationName: 'SriGen',
  manifest: '/manifest.json',
  // Browser tab, phone home screen, and the picture shown when someone
  // shares the link. All generated from the one logo file.
  // These names match the files sitting in /public exactly. If a name here
  // does not match a real file, the browser gets a 404 and shows no icon.
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/android-chrome-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/android-chrome-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    title: 'SriGen — AI Business Advisor',
    description: 'Multilingual AI business advisory and financial scheme guidance for micro-entrepreneurs.',
    siteName: 'SriGen',
    images: [{ url: '/android-chrome-512x512.png', width: 512, height: 512 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SriGen — AI Business Advisor',
    description: 'Multilingual AI business advisory and financial scheme guidance for micro-entrepreneurs.',
    images: ['/android-chrome-512x512.png'],
  },
};

export const viewport = {
  themeColor: '#2e5339',
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
              {/* Sits above the pages, so a page's data and any study still
                  running survive when the user moves to another page. */}
              <KeepStateProvider>
                <AppShell>{children}</AppShell>
              </KeepStateProvider>
            </ProfileProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}