import type { Metadata } from 'next';
import { Playfair_Display, Inter, Lora } from 'next/font/google';
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

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-accent',
  display: 'swap',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'FLAME FOMO | Campus Event Discovery & Planner',
  description: 'A tactile, scrapbook-inspired mobile-first campus discovery and scheduling planner for FLAME University.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-scrapbook-board text-neutral-100">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
