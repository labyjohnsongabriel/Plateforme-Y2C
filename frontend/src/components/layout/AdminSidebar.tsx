'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { adminNavigation, isActiveRoute } from '@/config/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ============================================================
// TYPES (étendus pour badges et sections)
// ============================================================
interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  exact?: boolean;
  children?: NavItem[];
  badge?: string | number; // Nouveau : badge (ex: "12", "3")
  section?: string; // Nouveau : pour grouper les items
}

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export function AdminSidebar({ collapsed = false, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const userRole = user?.role || 'VIEWER';

  // État pour ouvrir/fermer les sous-menus
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    // Par défaut, ouvrir les sections contenant la route active
    const initial: Record<string, boolean> = {};
    const traverse = (items: NavItem[]) => {
      for (const item of items) {
        if (item.children) {
          const hasActiveChild = item.children.some((child) =>
            isActiveRoute(pathname, child.href, child.exact)
          );
          if (hasActiveChild) {
            initial[item.href] = true;
          }
          traverse(item.children);
        }
      }
    };
    traverse(adminNavigation);
    return initial;
  });

  // Filtrer la navigation selon le rôle
  const filteredNav = useMemo(() => {
    const filterItems = (items: NavItem[]): NavItem[] => {
      return items
        .filter((item) => {
          if (!item.roles) return true;
          return item.roles.includes(userRole);
        })
        .map((item) => {
          if (item.children) {
            const filteredChildren = filterItems(item.children);
            return { ...item, children: filteredChildren };
          }
          return item;
        })
        .filter((item) => {
          if (item.children) {
            return item.children.length > 0;
          }
          return true;
        });
    };
    return filterItems(adminNavigation);
  }, [userRole]);

  // Basculer l'état d'un sous-menu
  const toggleSection = (href: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  // Rendu récursif des items
  const renderNavItem = (item: NavItem, depth = 0): JSX.Element => {
    const isActive = isActiveRoute(pathname, item.href, item.exact);
    const hasChildren = !!(item.children && item.children.length > 0);
    const isOpen = openSections[item.href] || false;
    const itemKey = item.href + item.label;

    // --- Mode "collapsed" (icônes seules) ---
    if (collapsed) {
      // On affiche uniquement les éléments sans enfants ou alors on affiche juste l'icône avec tooltip
      return (
        <TooltipProvider key={itemKey}>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <Link
                href={item.href === '#' ? '#' : item.href}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-secondary text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
                onClick={(e) => {
                  if (item.href === '#') e.preventDefault();
                  if (hasChildren && !collapsed) toggleSection(item.href);
                }}
              >
                <item.icon className="h-5 w-5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[8px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // --- Mode normal ---
    // Si l'élément a une section, on le rend comme un titre de groupe
    if (item.section && !collapsed) {
      return (
        <div key={itemKey} className="mt-4 first:mt-0">
          <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            {item.section}
          </div>
          <div className="mt-1 space-y-0.5">
            {item.children?.map((child) => renderNavItem(child, depth))}
          </div>
        </div>
      );
    }

    // Élément avec enfants (sous-menu)
    if (hasChildren) {
      return (
        <div key={itemKey} className="space-y-0.5">
          <button
            onClick={() => toggleSection(item.href)}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-secondary text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                {item.badge}
              </Badge>
            )}
            <span className="ml-auto text-muted-foreground/50">
              {isOpen ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </span>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-2 overflow-hidden border-l-2 border-border pl-2"
              >
                {item.children!.map((child) => renderNavItem(child, depth + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Élément simple (feuille)
    return (
      <Link
        key={itemKey}
        href={item.href === '#' ? '#' : item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-secondary text-white shadow-sm'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          depth > 0 && 'pl-8'
        )}
        aria-current={isActive ? 'page' : undefined}
        onClick={(e) => {
          if (item.href === '#') e.preventDefault();
        }}
      >
        <item.icon className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  // Séparer les éléments avec section et sans section pour un meilleur rendu
  const itemsWithSection = filteredNav.filter((item) => item.section);
  const itemsWithoutSection = filteredNav.filter((item) => !item.section);

  if (filteredNav.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Aucun accès disponible
      </div>
    );
  }

  return (
    <nav
      className={cn(
        'flex h-full flex-col overflow-y-auto px-2 py-3',
        collapsed ? 'items-center' : ''
      )}
      aria-label="Navigation principale"
    >
      {/* Affichage des éléments sans section d'abord */}
      {itemsWithoutSection.map((item) => renderNavItem(item))}
      {/* Puis les sections */}
      {itemsWithSection.map((item) => renderNavItem(item))}
    </nav>
  );
}