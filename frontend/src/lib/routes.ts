export const ROUTES = {
  // Public
  HOME: '/',
  ABOUT: '/a-propos',
  FORMATIONS: '/formations',
  FORMATION_DETAIL: (slug: string) => `/formations/${slug}`,
  Y2C: '/communaute-y2c',
  PROJECTS: '/projets',
  PROJECT_DETAIL: (slug: string) => `/projets/${slug}`,
  BLOG: '/blog',
  ARTICLE: (slug: string) => `/blog/${slug}`,
  CONTACT: '/contact',
  ACTUALITES: '/actualites',

  // Auth
  LOGIN: '/connexion',
  REGISTER: '/inscription',
  FORGOT_PASSWORD: '/mot-de-passe-oublie',
  RESET_PASSWORD: '/reinitialiser-mot-de-passe',
  RESET_PASSWORD_TOKEN: (token: string) => `/reinitialiser-mot-de-passe/${token}`,

  // Admin
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  
  // Admin - Formations
  ADMIN_FORMATIONS: '/admin/formations',
  ADMIN_FORMATION_NEW: '/admin/formations/nouveau',
  ADMIN_FORMATION_EDIT: (id: string) => `/admin/formations/${id}`,
  
  // Admin - Inscriptions
  ADMIN_REGISTRATIONS: '/admin/inscriptions',
  ADMIN_REGISTRATION_DETAIL: (id: string) => `/admin/inscriptions/${id}`,
  
  // Admin - Y2C
  ADMIN_Y2C_MEMBERS: '/admin/y2c/membres',
  ADMIN_Y2C_EVENTS: '/admin/y2c/evenements',
  
  // Admin - Articles
  ADMIN_ARTICLES: '/admin/articles',
  ADMIN_ARTICLE_NEW: '/admin/articles/nouveau',
  ADMIN_ARTICLE_EDIT: (id: string) => `/admin/articles/${id}`,
  
  // Admin - Projets
  ADMIN_PROJECTS: '/admin/projets-admin',
  ADMIN_PROJECT_NEW: '/admin/projets-admin/nouveau',
  ADMIN_PROJECT_EDIT: (id: string) => `/admin/projets-admin/${id}`,
  
  // Admin - Utilisateurs
  ADMIN_USERS: '/admin/utilisateurs',
  ADMIN_USER_EDIT: (id: string) => `/admin/utilisateurs/${id}`,
  
  // Admin - Messages
  ADMIN_MESSAGES: '/admin/messages',
  
  // Admin - Partenaires
  ADMIN_PARTNERS: '/admin/partenaires',
  ADMIN_PARTNER_NEW: '/admin/partenaires/nouveau',
  ADMIN_PARTNER_EDIT: (id: string) => `/admin/partenaires/${id}`,
  
  // Admin - Recrutements
  ADMIN_RECRUITMENTS: '/admin/recrutements',
  ADMIN_RECRUITMENT_NEW: '/admin/recrutements/nouveau',
  ADMIN_RECRUITMENT_EDIT: (id: string) => `/admin/recrutements/${id}`,
  
  // Admin - Candidatures
  ADMIN_CANDIDATURES: '/admin/candidatures',
  
  // Admin - Paiements
  ADMIN_PAYMENTS: '/admin/paiements',
  
  // Admin - Exports
  ADMIN_EXPORTS: '/admin/exports',
  
  // Admin - Paramètres
  ADMIN_SETTINGS: '/admin/parametres',
} as const;

export type RouteKey = keyof typeof ROUTES;