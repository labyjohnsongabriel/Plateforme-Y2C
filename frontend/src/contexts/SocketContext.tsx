'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
  useRef,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import { NotificationPayload, ChatMessage, PresencePayload } from '@/types';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isLoading: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

// ✅ Permettre la désactivation complète via variable d'environnement
const ENABLE_SOCKET = process.env.NEXT_PUBLIC_ENABLE_SOCKET !== 'false';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const { tokens, isAuthenticated } = useAuthStore();
  const {
    addNotification,
    setUnreadCount,
    markAsRead: markNotificationAsRead,
  } = useNotificationStore();

  const connect = useCallback(() => {
    // ✅ Vérifier si Socket.IO est activé
    if (!ENABLE_SOCKET) {
      setIsLoading(false);
      console.log('🔌 Socket.IO désactivé par configuration');
      return;
    }

    if (!isAuthenticated || !tokens?.accessToken) {
      setIsLoading(false);
      return;
    }

    if (socketRef.current?.connected) {
      setIsConnected(true);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: tokens.accessToken,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('🔌 Socket.IO connected');
        setIsConnected(true);
        setIsLoading(false);
        reconnectAttempts.current = 0;
        toast.success('Connexion temps réel établie');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        reconnectAttempts.current += 1;
        if (reconnectAttempts.current >= maxReconnectAttempts) {
          setIsLoading(false);
          // ✅ Ne pas afficher d'erreur pour ne pas déranger l'utilisateur
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Socket.IO disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('reconnect', () => {
        console.log('🔌 Socket.IO reconnected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      });

      // Écouteurs d'événements (les mêmes que votre code)
      newSocket.on('notification:receive', (payload: NotificationPayload) => {
        addNotification(payload);
        toast.success(payload.title, { duration: 5000 });
      });

      newSocket.on('notification:count', (data: { unread: number }) => {
        setUnreadCount(data.unread);
      });

      newSocket.on('notification:updated', (data: { id: string; isRead: boolean }) => {
        if (data.isRead) {
          markNotificationAsRead(data.id);
        }
      });

      newSocket.on('chat:receive', (message: ChatMessage) => {
        console.log('📩 Nouveau message:', message);
      });

      newSocket.on('presence:list', (users: PresencePayload[]) => {
        console.log('👤 Utilisateurs en ligne:', users);
      });

      newSocket.on('presence:update', (data: PresencePayload) => {
        console.log(`👤 ${data.userId} est ${data.status}`);
      });

      newSocket.on('broadcast:receive', (data: any) => {
        toast.info(data.message, { duration: 8000 });
      });

    } catch (error) {
      console.error('Socket.IO initialization error:', error);
      setIsLoading(false);
    }
  }, [isAuthenticated, tokens, addNotification, setUnreadCount, markNotificationAsRead]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setIsLoading(false);
    }
  }, []);

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && tokens?.accessToken && ENABLE_SOCKET) {
      connect();
    } else {
      disconnect();
    }
    return () => {
      disconnect();
    };
  }, [isAuthenticated, tokens?.accessToken, connect, disconnect]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      socket,
      isConnected,
      isLoading,
      connect,
      disconnect,
      emit,
      on,
      off,
    }),
    [socket, isConnected, isLoading, connect, disconnect, emit, on, off]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;