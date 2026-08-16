import {
  Home,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Mail,
  LayoutDashboard,
  FileText,
  Calendar,
  CreditCard,
  Settings,
  UserCog,
  MessageSquare,
  Briefcase,
  FolderOpen,
  Megaphone,
  Upload,
  // ❌ Supprimer Handshake - n'existe pas dans lucide-react
  // Handshake,
  Bell,
  LogOut,
  UserPlus,
} from 'lucide-react';
import { ROUTES } from '../constants/routes';

// ===== NAVIGATION PUBLIQUE =====
export const publicNavigation = [
  {
    href: ROUTES.HOME,
    label: 'Accueil',
    icon: Home,
    exact: true,
  },
  {
    href: ROUTES.ABOUT,
    label: 'À propos',
    icon: Users,
  },
  {
    href: ROUTES.FORMATIONS,
    label: 'Formations',
    icon: GraduationCap,
  },
  {
    href: ROUTES.Y2C,
    label: 'Communauté Y2C',
    icon: Users,
  },
  {
    href: ROUTES.PROJECTS,
    label: 'Projets',
    icon: Building2,
  },
  {
    href: ROUTES.BLOG,
    label: 'Blog',
    icon: BookOpen,
  },
  {
    href: ROUTES.CONTACT,
    label: 'Contact',
    icon: Mail,
  },
];

// ===== NAVIGATION ADMIN =====
export interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  children?: AdminNavItem[];
}

export const adminNavigation: AdminNavItem[] = [
  {
    href: ROUTES.ADMIN_DASHBOARD,
    label: 'Tableau de bord',
    icon: LayoutDashboard,
    roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'CONTRIBUTOR'],
  },
  {
    href: '#',
    label: 'Contenu',
    icon: FileText,
    roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'CONTRIBUTOR'],
    children: [
      {
        href: ROUTES.ADMIN_FORMATIONS,
        label: 'Formations',
        icon: GraduationCap,
      },
      {
        href: ROUTES.ADMIN_ARTICLES,
        label: 'Articles',
        icon: BookOpen,
      },
      {
        href: ROUTES.ADMIN_PROJECTS,
        label: 'Projets',
        icon: FolderOpen,
      },
    ],
  },
  {
    href: '#',
    label: 'Gestion',
    icon: UserCog,
    roles: ['SUPER_ADMIN', 'ADMIN'],
    children: [
      {
        href: ROUTES.ADMIN_REGISTRATIONS,
        label: 'Inscriptions',
        icon: FileText,
      },
      {
        href: ROUTES.ADMIN_Y2C_MEMBERS,
        label: 'Membres Y2C',
        icon: Users,
      },
      {
        href: ROUTES.ADMIN_Y2C_EVENTS,
        label: 'Événements Y2C',
        icon: Calendar,
      },
      {
        href: ROUTES.ADMIN_USERS,
        label: 'Utilisateurs',
        icon: UserCog,
      },
      {
        // ✅ Remplacer Handshake par Users
        href: ROUTES.ADMIN_PARTNERS,
        label: 'Partenaires',
        icon: Users, // ← Correction ici
      },
    ],
  },
  {
    href: '#',
    label: 'RH',
    icon: Briefcase,
    roles: ['SUPER_ADMIN', 'ADMIN'],
    children: [
      {
        href: ROUTES.ADMIN_RECRUITMENTS,
        label: 'Recrutements',
        icon: Megaphone,
      },
      {
        href: ROUTES.ADMIN_CANDIDATURES,
        label: 'Candidatures',
        icon: UserPlus,
      },
    ],
  },
  {
    href: ROUTES.ADMIN_MESSAGES,
    label: 'Messages',
    icon: MessageSquare,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    href: ROUTES.ADMIN_PAYMENTS,
    label: 'Paiements',
    icon: CreditCard,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    href: ROUTES.ADMIN_EXPORTS,
    label: 'Exports',
    icon: Upload,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    href: ROUTES.ADMIN_SETTINGS,
    label: 'Paramètres',
    icon: Settings,
    roles: ['SUPER_ADMIN'],
  },
];

// ===== SIDEBAR ADMIN =====
export const adminSidebarGroups = [
  {
    label: 'Vue d\'ensemble',
    items: adminNavigation.filter((item) =>
      ['Tableau de bord'].includes(item.label)
    ),
  },
  {
    label: 'Contenu',
    items: adminNavigation.filter((item) =>
      ['Contenu'].includes(item.label)
    ),
  },
  {
    label: 'Gestion',
    items: adminNavigation.filter((item) =>
      ['Gestion', 'RH'].includes(item.label)
    ),
  },
  {
    label: 'Autres',
    items: adminNavigation.filter((item) =>
      ['Messages', 'Paiements', 'Exports', 'Paramètres'].includes(item.label)
    ),
  },
];

// ===== FOOTER NAVIGATION =====
export const footerNavigation = {
  company: [
    { href: ROUTES.ABOUT, label: 'À propos' },
    { href: ROUTES.CONTACT, label: 'Contact' },
    { href: '/mentions-legales', label: 'Mentions légales' },
    { href: '/politique-confidentialite', label: 'Politique de confidentialité' },
    { href: '/cookies', label: 'Cookies' },
  ],
  services: [
    { href: ROUTES.FORMATIONS, label: 'Formations' },
    { href: ROUTES.Y2C, label: 'Communauté Y2C' },
    { href: ROUTES.PROJECTS, label: 'Projets' },
    { href: ROUTES.BLOG, label: 'Blog' },
  ],
  social: [
    {
      href: 'https://facebook.com/youthcomputing',
      label: 'Facebook',
      icon: 'facebook',
    },
    {
      href: 'https://instagram.com/youthcomputing',
      label: 'Instagram',
      icon: 'instagram',
    },
    {
      href: 'https://linkedin.com/company/youthcomputing',
      label: 'LinkedIn',
      icon: 'linkedin',
    },
    {
      href: 'https://twitter.com/youthcomputing',
      label: 'Twitter',
      icon: 'twitter',
    },
    {
      href: 'https://wa.me/261341234567',
      label: 'WhatsApp',
      icon: 'whatsapp',
    },
    {
      href: 'https://youtube.com/@youthcomputing',
      label: 'YouTube',
      icon: 'youtube',
    },
  ],
};

// ===== HELPERS =====
export const getAdminNavByRole = (role: string): AdminNavItem[] => {
  return adminNavigation
    .map((item) => {
      if (item.roles && !item.roles.includes(role)) {
        return null;
      }
      if (item.children) {
        const filteredChildren = item.children.filter(
          (child) => !child.roles || child.roles.includes(role)
        );
        if (filteredChildren.length === 0) {
          return null;
        }
        return { ...item, children: filteredChildren };
      }
      return item;
    })
    .filter(Boolean) as AdminNavItem[];
};

export const isActiveRoute = (
  pathname: string,
  href: string,
  exact: boolean = false
): boolean => {
  if (exact) {
    return pathname === href;
  }
  return pathname.startsWith(href) && href !== '/';
};

export default {
  public: publicNavigation,
  admin: adminNavigation,
  footer: footerNavigation,
  getAdminNavByRole,
  isActiveRoute,
};