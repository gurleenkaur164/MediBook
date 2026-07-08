import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { notificationService } from '../services';
import { connectSocket, disconnectSocket } from '../services/socket';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [connected, setConnected] = useState(false);

  const refresh = useCallback(() => {
    if (!user) return;
    notificationService
      .getAll({ limit: 20 })
      .then(({ data }) => {
        setNotifications(data.data.notifications || []);
        setUnread(data.data.unreadCount || 0);
      })
      .catch(() => {});
  }, [user]);

  // Initial load + socket connection when a user is present
  useEffect(() => {
    if (!user) {
      disconnectSocket();
      setNotifications([]);
      setUnread(0);
      setConnected(false);
      return;
    }

    refresh();

    const token = localStorage.getItem('accessToken');
    const socket = connectSocket(token);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onNotification = (n) => {
      setNotifications((prev) => [n, ...prev].slice(0, 50));
      setUnread((c) => c + 1);
      toast(
        (t) => (
          <span onClick={() => toast.dismiss(t.id)} style={{ cursor: 'pointer' }}>
            <strong style={{ display: 'block', fontSize: '0.85rem' }}>{n.title}</strong>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{n.message}</span>
          </span>
        ),
        { icon: '🔔', duration: 5000 }
      );
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('notification', onNotification);
    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('notification', onNotification);
    };
  }, [user, refresh]);

  const markRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnread((c) => Math.max(0, c - 1));
    try {
      await notificationService.markRead(id);
    } catch {
      // ignore — optimistic
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
    try {
      await notificationService.markAllRead();
    } catch {
      // ignore — optimistic
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unread, connected, refresh, markRead, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
