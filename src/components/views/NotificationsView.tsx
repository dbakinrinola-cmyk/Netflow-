import React, { useState, useEffect } from 'react';
import { NotificationItem, User } from '../../types/index.js';
import { api } from '../../services/api.js';
import { Bell, Heart, MessageCircle, UserPlus, Sparkles, Check, CheckCheck } from 'lucide-react';

interface NotificationsViewProps {
  currentUser: User;
  onNavigateTab: (tab: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ currentUser, onNavigateTab }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between p-4 rounded-3xl bg-[#0f172a]/90 border border-slate-800 shadow-md">
        <div>
          <h1 className="text-xl font-black text-white">Notifications</h1>
          <p className="text-xs text-slate-400 mt-0.5">Stay updated on discussions, approvals, and AI study tips</p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark all read</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0f172a]/90 border border-slate-800 text-center text-slate-500">
          <Bell className="w-10 h-10 mx-auto mb-2 text-slate-700" />
          <p className="text-sm">No new notifications. You're completely up to date!</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notif) => {
            let Icon = Bell;
            let iconColor = 'text-blue-400 bg-blue-600/20';

            if (notif.type === 'like') {
              Icon = Heart;
              iconColor = 'text-rose-400 bg-rose-600/20';
            } else if (notif.type === 'comment') {
              Icon = MessageCircle;
              iconColor = 'text-cyan-400 bg-cyan-600/20';
            } else if (notif.type === 'follow') {
              Icon = UserPlus;
              iconColor = 'text-emerald-400 bg-emerald-600/20';
            } else if (notif.type === 'ai_recommendation') {
              Icon = Sparkles;
              iconColor = 'text-purple-400 bg-purple-600/20';
            }

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  !notif.read
                    ? 'bg-slate-900/90 border-blue-500/40 shadow-sm'
                    : 'bg-[#0f172a]/70 border-slate-800/80 text-slate-400'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-slate-200">{notif.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
