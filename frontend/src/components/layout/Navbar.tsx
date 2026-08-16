// src/components/Navbar.tsx (ou public/Navbar)

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Bell,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  UserCircle,
  Mail,
  Shield,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { MobileMenu } from './MobileMenu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDate } from '@/lib/utils';
import { publicNavigation } from '@/config/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store/notification.store';
import { useSocket } from '@/contexts/SocketContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    setUnreadCount,
  } = useNotificationStore();
  const { socket, isConnected } = useSocket();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Chargement initial des notifications ─────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/notifications');
      const data = response.data?.data || response.data || [];
      const notifs = Array.isArray(data) ? data : [];
      notifs.forEach((notif: any) => addNotification(notif));
      const unread = notifs.filter((n: any) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [addNotification, setUnreadCount]);

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
    else setIsLoading(false);
  }, [isAuthenticated, fetchNotifications]);

  // ─── Socket.IO temps réel ──────────────────────────────────
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = (data: any) => {
      addNotification(data);
      toast.success(data.title, { duration: 5000 });
    };

    const handleUnreadCount = (data: { count: number }) => {
      setUnreadCount(data.count);
    };

    socket.on('notification:receive', handleNewNotification);
    socket.on('notification:count', handleUnreadCount);

    return () => {
      socket.off('notification:receive', handleNewNotification);
      socket.off('notification:count', handleUnreadCount);
    };
  }, [socket, isConnected, addNotification, setUnreadCount]);

  // ─── Détection du scroll ──────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Actions notifications ────────────────────────────────
  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      markAsRead(id);
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await api.post('/notifications/read-all');
      markAllAsRead();
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
    }
  }, [markAllAsRead]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/');
    toast.success('Déconnexion réussie');
  }, [logout, router]);

  // ─── Initiales et nom ─────────────────────────────────────
  const initials =
    user && user.firstName && user.lastName
      ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
      : 'U';

  const fullName =
    user && user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : 'Utilisateur';

  return (
    <>
      <header
        className={cn(
          'fixed top-0 z-50 w-full transition-all duration-500 ease-out',
          isScrolled
            ? 'bg-background/80 backdrop-blur-xl shadow-lg dark:bg-background/70'
            : 'bg-transparent'
        )}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 p-1 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
              <Image
                src="/images/Youth Computing.png"
                alt="Youth Computing"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <motion.span
              whileHover={{ scale: 1.02 }}
              className="hidden text-xl font-extrabold tracking-tight sm:block"
            >
              <span className="text-primary">Youth</span>
              <span className="text-secondary">Computing</span>
            </motion.span>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden items-center gap-1 md:flex">
            {publicNavigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-secondary/10 hover:text-secondary',
                    isActive
                      ? 'bg-secondary/10 text-secondary'
                      : 'text-foreground/80'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-1/2 h-0.5 w-1/2 -translate-x-1/2 rounded-full bg-secondary"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions droite */}
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle variant="ghost" size="icon" className="rounded-full" />

            {isAuthenticated && (
              <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="flex items-center justify-between border-b p-3">
                    <span className="font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 px-2 text-xs"
                        onClick={handleMarkAllAsRead}
                      >
                        Tout marquer lu
                      </Button>
                    )}
                  </div>

                  <ScrollArea className="max-h-[300px]">
                    {isLoading ? (
                      <div className="space-y-2 p-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <Bell className="h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Aucune notification
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 p-1">
                        {notifications.slice(0, 20).map((notif) => (
                          <div
                            key={notif.id}
                            className={cn(
                              'flex cursor-pointer items-start gap-3 rounded-md p-3 transition-colors hover:bg-muted/50',
                              !notif.isRead && 'bg-secondary/5'
                            )}
                            onClick={() => {
                              if (!notif.isRead) handleMarkAsRead(notif.id);
                              if (notif.link) {
                                router.push(notif.link);
                                setIsNotificationOpen(false);
                              }
                            }}
                          >
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium">{notif.title}</p>
                              <p className="text-xs text-muted-foreground">{notif.message}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {formatDate(notif.createdAt)}
                              </p>
                            </div>
                            {!notif.isRead && (
                              <span className="mt-1 h-2 w-2 rounded-full bg-secondary" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  {notifications.length > 0 && (
                    <div className="border-t p-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => {
                          setIsNotificationOpen(false);
                          router.push('/admin/notifications');
                        }}
                      >
                        Voir toutes les notifications
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            )}

            {/* Profil utilisateur */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 gap-2 rounded-full px-2 transition-all hover:bg-secondary/10"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all hover:ring-primary/40">
                      {/* ✅ Affichage de l'avatar avec fallback */}
                      <AvatarImage src={user.avatar || undefined} alt={fullName} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-xs font-bold text-secondary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium lg:inline-block">
                      {user.firstName}
                    </span>
                    <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="font-medium">{fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <Badge variant="secondary" className="mt-1 w-fit text-[10px] uppercase">
                        {user.role}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Tableau de bord
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/admin/profile')}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      Mon profil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/admin/notifications')}>
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                      {unreadCount > 0 && (
                        <Badge className="ml-auto text-[10px]" variant="secondary">
                          {unreadCount}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/admin/parametres')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/admin/security')}>
                      <Shield className="mr-2 h-4 w-4" />
                      Sécurité
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/aide')}>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Aide
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link href="/connexion">Connexion</Link>
                </Button>
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:shadow-lg"
                >
                  <Link href="/inscription">S'inscrire</Link>
                </Button>
              </div>
            )}

            {/* Menu mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Menu mobile */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}