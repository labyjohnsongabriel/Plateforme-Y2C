// src/components/ProtectedRoute.tsx
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions, Permission } from '@/hooks/usePermissions';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
  permissions?: Permission[];
  redirectTo?: string;
  showError?: boolean;
  loadingComponent?: ReactNode;
}

export default function ProtectedRoute({
  children,
  roles = [],
  permissions = [],
  redirectTo = '/connexion',
  showError = true,
  loadingComponent = <div className="flex justify-center items-center min-h-screen">Chargement...</div>,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { hasRole, hasAnyPermission } = usePermissions();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push(redirectTo);
      return;
    }

    let authorized = true;

    if (roles.length > 0 && !hasRole(roles)) {
      authorized = false;
    }

    if (authorized && permissions.length > 0 && !hasAnyPermission(permissions)) {
      authorized = false;
    }

    setIsAuthorized(authorized);

    if (!authorized) {
      if (showError) {
        // Vous pouvez utiliser un toast ici
        console.warn('Accès refusé : rôles ou permissions insuffisants');
      }
      router.push('/acces-refuse');
    }
  }, [user, isLoading, roles, permissions, hasRole, hasAnyPermission, router, showError, redirectTo]);

  if (isLoading || isAuthorized === null) {
    return <>{loadingComponent}</>;
  }

  if (!user || !isAuthorized) {
    return null;
  }

  return <>{children}</>;
}