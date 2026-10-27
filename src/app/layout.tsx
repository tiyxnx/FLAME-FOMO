import type { Metadata } from 'next';
import { Playfair_Display, Inter, Patrick_Hand } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'FLAME FOMO | Campus Event Discovery & Planner',
  description: 'A tactile, scrapbook-inspired mobile-first campus discovery and scheduling planner for FLAME University.',
  icons: {
    icon: [
      { url: '/icon.png?v=4', type: 'image/png', sizes: '128x128' },
      { url: '/favicon.ico?v=4', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-icon.png?v=4', sizes: '128x128', type: 'image/png' },
    ],
    shortcut: ['/icon.png?v=4'],
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
      className={`${playfair.variable} ${inter.variable} ${patrickHand.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" type="image/png" sizes="128x128" href="/icon.png?v=4" />
        <link rel="shortcut icon" href="/icon.png?v=4" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=4" />
      </head>
      <body className="min-h-full flex flex-col bg-scrapbook-board text-neutral-100">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
