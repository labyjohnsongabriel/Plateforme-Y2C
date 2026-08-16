'use client';

import { useSocket as useSocketContext } from '../contexts/SocketContext';

export function useSocket() {
  const context = useSocketContext();
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}