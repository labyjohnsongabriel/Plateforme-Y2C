// src/components/admin/AdminHeader.tsx

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  LogOut,
  Settings,
  User,
  LayoutDashboard,
  Search,
  ChevronDown,
  HelpCircle,
  LifeBuoy,
  UserCircle,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth'; // cohérence
import { useNotificationStore } from '@/store/notification.store';
import { useSocket } from '@/contexts/SocketContext';
import { cn, formatDate } from '@/lib/utils';
import { AdminSearchOverlay } from './AdminSearchOverlay';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Configuration des rôles ──────────────────────────────
const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-500/20 text-purple-600 dark:bg-purple-500/30 dark:text-purple-400',
  ADMIN: 'bg-blue-500/20 text-blue-600 dark:bg-blue-500/30 dark:text-blue-400',
  EDITOR: 'bg-amber-500/20 text-amber-600 dark:bg-amber-500/30 dark:text-amber-400',
  CONTRIBUTOR: 'bg-green-500/20 text-green-600 dark:bg-green-500/30 dark:text-green-400',
  MEMBER: 'bg-gray-500/20 text-gray-600 dark:bg-gray-500/30 dark:text-gray-400',
};

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrateur',
  EDITOR: 'Éditeur',
  CONTRIBUTOR: 'Contributeur',
  MEMBER: 'Membre',
};

export function AdminHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    setUnreadCount,
  } = useNotificationStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [showScrolled, setShowScrolled] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Chargement initial des notifications ─────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/notifications');
      const data = response.data?.data || response.data || [];
      // Normalisation en tableau
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
    if (user) fetchNotifications();
    else setIsLoading(false);
  }, [user, fetchNotifications]);

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
    const handleScroll = () => setShowScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Raccourci clavier recherche ──────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
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
    router.push('/connexion');
    toast.success('Déconnexion réussie');
  }, [logout, router]);

  // ─── Gestion de l'absence d'utilisateur ──────────────────
  if (!user) return null;

  // ─── Calcul des initiales ─────────────────────────────────
  const initials =
    user.firstName && user.lastName
      ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
      : 'U';

  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : 'Utilisateur';

  const role = user.role || 'MEMBER';
  const roleColor = roleColors[role] || 'bg-gray-500/20 text-gray-600';
  const roleLabel = roleLabels[role] || role;

  // ─── Rendu ──────────────────────────────────────────────────
  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 transition-all duration-300',
          showScrolled
            ? 'border-b bg-background/95 backdrop-blur-xl shadow-sm'
            : 'border-b bg-background/80 backdrop-blur-md'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 font-ubuntu"
            >
              <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
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
                <span className="hidden sm:inline-block text-lg font-semibold text-foreground">
                  Youth <span className="text-secondary">Computing</span>
                </span>
                <Badge variant="outline" className="hidden md:inline-flex text-[10px] uppercase h-5 ml-1">
                  Admin
                </Badge>
              </Link>
            </motion.div>

            {/* Barre de recherche */}
            <Button
              variant="ghost"
              className="hidden md:flex h-9 w-48 lg:w-64 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted/70 justify-start gap-2 text-sm border border-border/50"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span>Rechercher...</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          {/* Actions droite */}
          <div className="flex items-center gap-1.5">
            {/* Statut connexion */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/50">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] font-medium text-green-700 dark:text-green-400">
                      En ligne
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Connecté en temps réel</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <ThemeToggle variant="ghost" size="icon" className="hidden sm:flex" />

            {/* Notifications */}
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
                      <p className="mt-2 text-sm text-muted-foreground">Aucune notification</p>
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

            {/* Profil */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 gap-2 rounded-full px-2 hover:bg-muted transition-all"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-background shadow-md">
                    {/* ✅ Affichage de l'avatar avec fallback */}
                    <AvatarImage src={user.avatar || undefined} alt={fullName} />
                    <AvatarFallback className="bg-secondary/10 text-secondary text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium lg:inline-block">
                    {user.firstName}
                  </span>
                  <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-1.5">
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar || undefined} alt={fullName} />
                      <AvatarFallback className="bg-secondary/10 text-secondary text-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5">
                      <p className="font-semibold text-sm">{fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <Badge className={cn('text-[10px] uppercase w-fit', roleColor)}>
                        {roleLabel}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Tableau de bord
                    <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/admin/profile')}>
                    <User className="mr-2 h-4 w-4" />
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
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Overlay de recherche */}
      <AdminSearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}