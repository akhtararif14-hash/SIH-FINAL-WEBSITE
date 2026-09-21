import { Lora, Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageProvider';
import { AuthProvider } from '@/lib/AuthProvider';
import Header from '@/components/Header';

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
      <body>
        <AuthProvider>
          <LanguageProvider>
            <Header />
            <main>{children}</main>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
