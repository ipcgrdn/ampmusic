'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useNotificationStore } from '@/store/notification-store';
import { useUnreadNotificationCount } from '@/hooks/use-notification';

export function InitialDataLoader() {
  const { user } = useAuth();
  const { setUnreadCount } = useNotificationStore();
  const { data: unreadCount } = useUnreadNotificationCount();

  useEffect(() => {
    if (user && typeof unreadCount === 'number') {
      setUnreadCount(unreadCount);
    }
  }, [user, unreadCount, setUnreadCount]);

  return null;
}