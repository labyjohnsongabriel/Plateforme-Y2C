// src/hooks/usePermissions.ts
'use client';

import { useAuth } from '@/hooks/useAuth';

export type Permission =
  | 'view_dashboard'
  | 'manage_users'
  | 'manage_roles'
  | 'manage_articles'
  | 'manage_formations'
  | 'manage_y2c'
  | 'manage_projects'
  | 'manage_events'
  | 'manage_team'
  | 'manage_partners'
  | 'manage_recruitments'
  | 'manage_payments'
  | 'manage_contact'
  | 'export_data'
  | 'view_reports';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: [
    'view_dashboard',
    'manage_users',
    'manage_roles',
    'manage_articles',
    'manage_formations',
    'manage_y2c',
    'manage_projects',
    'manage_events',
    'manage_team',
    'manage_partners',
    'manage_recruitments',
    'manage_payments',
    'manage_contact',
    'export_data',
    'view_reports',
  ],
  ADMIN: [
    'view_dashboard',
    'manage_users',
    'manage_articles',
    'manage_formations',
    'manage_y2c',
    'manage_projects',
    'manage_events',
    'manage_team',
    'manage_partners',
    'manage_recruitments',
    'manage_payments',
    'manage_contact',
    'export_data',
    'view_reports',
  ],
  // ✅ Correction : les éditeurs peuvent gérer tout le contenu
  // sauf les utilisateurs, rôles, paiements, export et rapports
  EDITOR: [
    'view_dashboard',
    'manage_articles',
    'manage_formations',
    'manage_y2c',
    'manage_projects',
    'manage_events',
    'manage_team',
    'manage_partners',
    'manage_recruitments',
    'manage_contact',
  ],
  CONTRIBUTOR: [
    'view_dashboard',
  ],
  VIEWER: [],
};

export const usePermissions = () => {
  const { user } = useAuth();

  const role = user?.role || 'VIEWER';
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isEditor = role === 'EDITOR';
  const isContributor = role === 'CONTRIBUTOR';
  const isViewer = role === 'VIEWER';

  const hasRole = (roles: string[]): boolean => roles.includes(role);

  const hasPermission = (permission: Permission): boolean => {
    if (isSuperAdmin) return true;
    return (ROLE_PERMISSIONS[role] || []).includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean =>
    permissions.some((p) => hasPermission(p));

  const hasAllPermissions = (permissions: Permission[]): boolean =>
    permissions.every((p) => hasPermission(p));

  return {
    role,
    isAdmin,
    isSuperAdmin,
    isEditor,
    isContributor,
    isViewer,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canManageUsers: isAdmin || isSuperAdmin,
    canManageRoles: isSuperAdmin,
    canEditContent: isEditor || isAdmin || isSuperAdmin,
    canViewDashboard: !!user,
    canManageSettings: isAdmin || isSuperAdmin,
    canExportData: isAdmin || isSuperAdmin,
    canViewReports: isAdmin || isSuperAdmin,
  };
};