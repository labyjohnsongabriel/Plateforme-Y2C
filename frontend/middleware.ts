import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // Vérifier si la route est admin
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Si c'est une route admin, rediriger vers login
  if (isAdminRoute) {
    // Vérification simple avec cookie
    const token = request.cookies.get('auth-token');
    
    if (!token) {
      const url = new URL('/connexion', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Si c'est une route d'authentification et que l'utilisateur est connecté
  if (pathname === '/connexion' || pathname === '/inscription') {
    const token = request.cookies.get('auth-token');
    if (token) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Configuration du middleware
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