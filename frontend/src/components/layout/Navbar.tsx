'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Menu,
  X,
  Bell,
  Settings,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  UserCircle,
  Shield,
  HelpCircle,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { MobileMenu } from './MobileMenu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buildImageUrl } from '@/lib/imageUtils';
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
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  guestNavigation,
  publicNavigation,
  getAdminNavByRole,
} from '@/config/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store/notification.store';
import { useSocket } from '@/contexts/SocketContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { showNotificationToast } from '../../lib/notification-utils';

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
    clearNotifications,
  } = useNotificationStore();

  const { socket, isConnected } = useSocket();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifError, setNotifError] = useState(false);

  // --- Navigation items ---
  const baseNavItems = useMemo(() => {
    if (isAuthenticated) {
      return Array.isArray(publicNavigation) ? publicNavigation : [];
    }
    return Array.isArray(guestNavigation) ? guestNavigation : [];
  }, [isAuthenticated]);

  const navItems = useMemo(() => {
    const items = [...baseNavItems];
    if (!items.some((item) => item.href === '/recrutements')) {
      items.push({ href: '/recrutements', label: 'Recrutement' });
    }
    if (!items.some((item) => item.href === '/partenaires')) {
      items.push({ href: '/partenaires', label: 'Partenaires' });
    }
    return items;
  }, [baseNavItems]);

  const adminItems = useMemo(() => {
    if (isAuthenticated && user) {
      return getAdminNavByRole(user.role) || [];
    }
    return [];
  }, [isAuthenticated, user]);

  // --- Chargement des notifications (URL corrigée) ---
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setNotifError(false);
      // ✅ Utilisation de /notifications/my-notifications
      const response = await api.get('/notifications/my-notifications');
      const data = response.data?.data || response.data || [];
      const notifs = Array.isArray(data) ? data : [];
      clearNotifications();
      notifs.forEach((notif: any) => addNotification(notif));
      const unread = notifs.filter((n: any) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      setNotifError(true);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, addNotification, setUnreadCount, clearNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // --- Socket.IO ---
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = (data: any) => {
      const exists = notifications.some((n) => n.id === data.id);
      if (!exists) {
        addNotification(data);
        showNotificationToast({
          title: data.title || 'Nouvelle notification',
          message: data.message,
          link: data.link,
          icon: '🔔',
        });
      }
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
  }, [socket, isConnected, addNotification, setUnreadCount, notifications]);

  // --- Scroll ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Actions ---
  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      markAsRead(id);
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all');
      markAllAsRead();
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
      toast.error('Erreur lors du marquage');
    }
  }, [markAllAsRead]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      clearNotifications();
      router.push('/');
      router.refresh();
      toast.success('Déconnexion réussie 👋');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  }, [logout, router, clearNotifications]);

  // --- Utilitaires ---
  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
      : 'U';

  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : 'Utilisateur';

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
  };

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
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 p-1"
            >
              <Image
                src="/images/Youth Computing.png"
                alt="Youth Computing"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </motion.div>
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
            {navItems.map((item) => {
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
                  <span className="relative z-10">{item.label}</span>
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

            {/* Menu Admin */}
            {adminItems.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1 rounded-full px-4 py-2 text-sm font-medium">
                    Admin <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 rounded-2xl border border-border/50 bg-background/95 backdrop-blur-md shadow-xl p-2">
                  <motion.div variants={dropdownVariants} initial="hidden" animate="visible" exit="hidden">
                    {adminItems.map((item) => {
                      if (item.children) {
                        return (
                          <DropdownMenuGroup key={item.label}>
                            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1">
                              {item.label}
                            </DropdownMenuLabel>
                            {item.children.map((child) => (
                              <DropdownMenuItem
                                key={child.href}
                                onClick={() => router.push(child.href)}
                                className="cursor-pointer rounded-lg px-3 py-2 transition-colors hover:bg-secondary/10"
                              >
                                {child.icon && <child.icon className="mr-2 h-4 w-4" />}
                                {child.label}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator className="my-1" />
                          </DropdownMenuGroup>
                        );
                      }
                      return (
                        <DropdownMenuItem
                          key={item.href}
                          onClick={() => router.push(item.href)}
                          className="cursor-pointer rounded-lg px-3 py-2 transition-colors hover:bg-secondary/10"
                        >
                          {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                          {item.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </motion.div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Actions droite */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle variant="ghost" size="icon" className="rounded-full" />

            {/* Notifications */}
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
                        className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold animate-pulse"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 rounded-2xl border border-border/50 bg-background/95 p-0 shadow-2xl backdrop-blur-md" align="end">
                  <motion.div variants={dropdownVariants} initial="hidden" animate="visible" exit="hidden">
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
                      ) : notifError ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Impossible de charger les notifications
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                          <Bell className="h-8 w-8 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">Aucune notification</p>
                        </div>
                      ) : (
                        <div className="space-y-1 p-1">
                          {notifications.slice(0, 20).map((notif) => (
                            <div
                              key={notif.id}
                              className={cn(
                                'flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50',
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
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {notif.message}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                              {!notif.isRead && <span className="mt-1 h-2 w-2 rounded-full bg-secondary" />}
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
                  </motion.div>
                </PopoverContent>
              </Popover>
            )}

            {/* Profil utilisateur */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 gap-2 rounded-full px-2 hover:bg-secondary/10">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                      <AvatarImage src={user.avatar ? buildImageUrl(user.avatar, false) : undefined} alt={fullName} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-xs font-bold text-secondary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium lg:inline-block">{user.firstName}</span>
                    <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-2xl border border-border/50 bg-background/95 p-2 shadow-2xl backdrop-blur-md">
                  <motion.div variants={dropdownVariants} initial="hidden" animate="visible" exit="hidden">
                    <DropdownMenuLabel className="px-2 py-1.5">
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
                      {['ADMIN', 'SUPER_ADMIN'].includes(user.role) && (
                        <DropdownMenuItem
                          onClick={() => router.push('/admin/dashboard')}
                          className="cursor-pointer rounded-lg px-3 py-2 transition-colors hover:bg-secondary/10"
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Tableau de bord
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => router.push('/profile')}
                        className="cursor-pointer rounded-lg px-3 py-2 transition-colors hover:bg-secondary/10"
                      >
                        <UserCircle className="mr-2 h-4 w-4" />
                        Mon profil
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push('/paiements')}
                        className="cursor-pointer rounded-lg px-3 py-2 transition-colors hover:bg-secondary/10"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Mes paiements
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push('/notifications')}
                        className="cursor-pointer rounded-lg px-3 py-2 transition-colors hover:bg-secondary/10"
                      >
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
                      <DropdownMenuItem
                        onClick={() => router.push('/parametres')}
                        className="cursor-pointer rounded-lg px-3 py-2 transition-colors hover:bg-secondary/10"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Paramètres
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push('/security')}
                        className="cursor-pointer rounded-lg px-3 py-2 transition-colors hover:bg-secondary/10"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Sécurité
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push('/aide')}
                        className="cursor-pointer rounded-lg px-3 py-2 transition-colors hover:bg-secondary/10"
                      >
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Aide
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer rounded-lg px-3 py-2 text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </DropdownMenuItem>
                  </motion.div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-3 md:flex">
                <Button asChild variant="ghost" size="sm" className="rounded-full px-4">
                  <Link href="/connexion">Connexion</Link>
                </Button>
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:shadow-lg transition-all px-5"
                >
                  <Link href="/inscription">S'inscrire</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navItems={navItems}
        adminItems={adminItems}
      />
    </>
  );
}