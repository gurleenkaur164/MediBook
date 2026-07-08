import { formatDistanceToNow } from 'date-fns';
import { Navbar } from '../components/Navbar';
import { EmptyState } from '../components/LoadingStates';
import { useNotifications } from '../context/NotificationContext';
import { Bell, CheckCheck, Calendar, Wifi, WifiOff } from 'lucide-react';

const timeAgo = (ts) => {
  try {
    return formatDistanceToNow(new Date(ts), { addSuffix: true });
  } catch {
    return '';
  }
};

export const Notifications = () => {
  const { notifications, unread, connected, markRead, markAllRead } = useNotifications();

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-16 page-enter">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="icon-tile w-11 h-11"><Bell className="w-5 h-5 text-indigo-300" /></span>
              Notifications
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              {connected ? (
                <><span className="live-dot" /> <Wifi className="w-3.5 h-3.5 text-emerald-400" /> Live · {unread} unread</>
              ) : (
                <><WifiOff className="w-3.5 h-3.5 text-slate-500" /> Reconnecting…</>
              )}
            </div>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="btn-ghost px-4 py-2 text-sm">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            description="New appointment updates will appear here in real time."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`glass-card card-hover w-full text-left p-4 flex items-start gap-4 ${
                  !n.is_read ? 'border-indigo-500/40' : ''
                }`}
              >
                <span className={`icon-tile w-10 h-10 flex-shrink-0 ${!n.is_read ? '' : 'opacity-60'}`}>
                  <Calendar className="w-5 h-5 text-indigo-300" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-100 text-sm">{n.title}</p>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-600 mt-1.5">{timeAgo(n.created_at)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
