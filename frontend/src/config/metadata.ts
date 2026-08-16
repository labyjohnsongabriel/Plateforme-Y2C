import type { Metadata, Viewport } from 'next';
import { siteConfig } from './site';

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'Youth Computing',
    'NTIC',
    'Madagascar',
    'Formation',
    'Innovation',
    'Technologie',
    'Association',
    'Communauté Y2C',
    'Programmation',
    'Développement Web',
    'Intelligence Artificielle',
    'Data Science',
    'Hackathon',
    'Éducation Numérique',
  ],
  authors: [
    {
      name: 'Youth Computing',
      url: siteConfig.url,
    },
  ],
  creator: 'Youth Computing',
  publisher: 'Youth Computing',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: ['en_US', 'mg_MG'],
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
    creator: '@youthcomputing',
    site: '@youthcomputing',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      {
        url: '/images/brand/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/images/brand/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/images/brand/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/images/brand/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: siteConfig.shortName,
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: false,
  },
  category: 'Technology',
  classification: 'Éducation, Technologie, Association',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: siteConfig.colors.primary },
    { media: '(prefers-color-scheme: dark)', color: siteConfig.colors.primary },
  ],
  colorScheme: 'dark light',
};

// Métadonnées pour les pages spécifiques
export const pageMetadata = {
  home: {
    title: 'Accueil',
    description:
      'Youth Computing - Association pour la promotion des NTIC à Madagascar. Découvrez nos formations, notre communauté Y2C et nos projets.',
  },
  about: {
    title: 'À propos',
    description:
      'Découvrez l\'histoire de Youth Computing, notre mission, nos valeurs et notre équipe.',
  },
  formations: {
    title: 'Formations',
    description:
      'Découvrez nos formations en NTIC : programmation, data science, intelligence artificielle et développement web.',
  },
  y2c: {
    title: 'Communauté Y2C',
    description:
      'Rejoignez la communauté Youth Computing Community (Y2C) et participez à nos activités et événements.',
  },
  projects: {
    title: 'Projets',
    description:
      'Découvrez les projets réalisés par Youth Computing pour la transformation numérique à Madagascar.',
  },
  blog: {
    title: 'Blog & Actualités',
    description:
      'Suivez l\'actualité de Youth Computing, nos événements et nos ressources éducatives.',
  },
  contact: {
    title: 'Contact',
    description:
      'Contactez Youth Computing pour toute question, collaboration ou demande d\'information.',
  },
  login: {
    title: 'Connexion',
    description: 'Connectez-vous à votre espace Youth Computing.',
  },
  register: {
    title: 'Inscription',
    description: 'Créez votre compte Youth Computing.',
  },
  dashboard: {
    title: 'Tableau de bord',
    description: 'Gérez votre espace Youth Computing.',
  },
};

export const getPageMetadata = (page: keyof typeof pageMetadata): Metadata => {
  const meta = pageMetadata[page];
  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
    },
    twitter: {
      title: meta.title,
      description: meta.description,
    },
  };
};

export default defaultMetadata;