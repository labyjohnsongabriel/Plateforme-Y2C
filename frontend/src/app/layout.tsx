import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// ✅ Utiliser une police existante au lieu de "Geist"
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Youth Computing - Association NTIC Madagascar',
  description: 'Promotion des NTIC et de l\'inclusion numérique à Madagascar',
  keywords: [
    'Youth Computing',
    'NTIC Madagascar',
    'Formation Informatique',
    'Communauté Y2C',
    'Innovation Madagascar',
  ],
  authors: [{ name: 'Youth Computing Association' }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://youthcomputing.mg',
    title: 'Youth Computing - Association NTIC Madagascar',
    description: 'Promotion des NTIC et de l\'inclusion numérique à Madagascar',
    siteName: 'Youth Computing',
    images: [
      {
        url: '/images/brand/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Youth Computing Association',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}