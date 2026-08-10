import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes publiques (accessibles sans authentification)
const publicRoutes = [
  '/',
  '/a-propos',
  '/formations',
  '/communaute-y2c',
  '/projets',
  '/blog',
  '/contact',
  '/connexion',
  '/inscription',
  '/mot-de-passe-oublie',
];

// Routes administratives (nécessitent authentification)
const adminRoutes = [
  '/admin',
  '/admin/dashboard',
  '/admin/formations',
  '/admin/inscriptions',
  '/admin/y2c',
  '/admin/articles',
  '/admin/projets',
  '/admin/utilisateurs',
  '/admin/messages',
  '/admin/parametres',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // Vérifier si la route est admin
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Si c'est une route admin, vérifier l'authentification
  if (isAdminRoute) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      const url = new URL('/connexion', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // Vérifier les rôles pour les routes admin spécifiques
    const role = token.role as string;
    const isSuperAdminRoute = pathname.startsWith('/admin/parametres') || 
                             pathname.startsWith('/admin/utilisateurs');
    
    if (isSuperAdminRoute && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // Si c'est une route d'authentification et que l'utilisateur est connecté
  if ((pathname === '/connexion' || pathname === '/inscription') && 
      await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled by backend)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};