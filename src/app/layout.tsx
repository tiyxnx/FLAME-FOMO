import type { Metadata } from 'next';
import { Playfair_Display, Inter, Patrick_Hand, Exo_2 } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const patrickHand = Patrick_Hand({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-handwritten',
  display: 'swap',
});

const exo2 = Exo_2({
  weight: ['800', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-exo2',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FLAME FOMO | Campus Event Discovery & Planner',
  description: 'A tactile, scrapbook-inspired mobile-first campus discovery and scheduling planner for FLAME University.',
  icons: {
    icon: [
      { url: '/icon.png?v=20261028b', sizes: '512x512', type: 'image/png' },
      { url: '/favicon-32x32.png?v=20261028b', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png?v=20261028b', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico?v=20261028b' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=20261028b', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/icon.png?v=20261028b'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${patrickHand.variable} ${exo2.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" type="image/png" sizes="512x512" href="/icon.png?v=20261028b" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=20261028b" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=20261028b" />
        <link rel="shortcut icon" href="/favicon.ico?v=20261028b" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=20261028b" />
      </head>
      <body className="min-h-full flex flex-col bg-scrapbook-board text-neutral-100">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
