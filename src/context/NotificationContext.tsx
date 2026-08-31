'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { saveNotificationToSupabase, fetchNotificationsFromSupabase } from '@/lib/supabase';

export interface NotificationItem {
  id: string;
  userId?: string; // Target User ID (undefined for global broadcast)
  title: string;
  message: string;
  type: 'BASVURU_ONAY' | 'BASVURU_RED' | 'BILMECE_SONUC' | 'FOTOGRAF_ONAY' | 'FOTOGRAF_RED' | 'DUYURU' | 'SISTEM';
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (title: string, message: string, type?: NotificationItem['type'], targetUserId?: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  addNotification: () => {},
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin } = useAuth();
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>([]);

  // Load notifications on mount or user change from Supabase & Local Storage
  useEffect(() => {
    async function syncNotifications() {
      const saved = localStorage.getItem('kon_notifications');
      let localList: NotificationItem[] = [];
      if (saved) {
        try {
          localList = JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }

      // Try fetching from Supabase if online
      const remoteData = await fetchNotificationsFromSupabase(user?.id);
      if (remoteData && remoteData.length > 0) {
        setAllNotifications(remoteData);
        localStorage.setItem('kon_notifications', JSON.stringify(remoteData));
      } else if (localList.length > 0) {
        setAllNotifications(localList);
      } else {
        const defaultNotifs: NotificationItem[] = [
          {
            id: 'n-1',
            title: 'Konparlamento 2026 Platformuna Hoş Geldiniz!',
            message: 'Etkinlik başvuruları ve bilmece sistemi aktiftir.',
            type: 'DUYURU',
            isRead: false,
            createdAt: new Date().toISOString(),
          },
        ];
        setAllNotifications(defaultNotifs);
        localStorage.setItem('kon_notifications', JSON.stringify(defaultNotifs));
      }
    }

    syncNotifications();
  }, [user?.id]);

  const saveNotifs = (notifs: NotificationItem[]) => {
    setAllNotifications(notifs);
    localStorage.setItem('kon_notifications', JSON.stringify(notifs));
  };

  const markAsRead = (id: string) => {
    const updated = allNotifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    saveNotifs(updated);
  };

  const markAllAsRead = () => {
    const updated = allNotifications.map((n) => ({ ...n, isRead: true }));
    saveNotifs(updated);
  };

  const addNotification = (
    title: string,
    message: string,
    type: NotificationItem['type'] = 'DUYURU',
    targetUserId?: string
  ) => {
    const newNotif: NotificationItem = {
      id: 'n-' + Date.now(),
      userId: targetUserId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [newNotif, ...allNotifications];
    saveNotifs(updated);

    // Sync directly to Supabase table
    saveNotificationToSupabase({
      id: newNotif.id,
      userId: targetUserId,
      title,
      message,
      type,
    });
  };

  // Filter notifications strictly for the logged-in user
  const userNotifications = allNotifications.filter((n) => {
    // Global broadcasts (no userId) are visible to everyone
    if (!n.userId || n.userId === 'ALL') return true;
    // Admins can see all notifications
    if (isAdmin) return true;
    // Targeted personal notification: must match logged-in user's ID or email
    return n.userId === user?.id || (user?.email && n.userId === user.email);
  });

  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications: userNotifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
