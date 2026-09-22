import React, { useState, useEffect } from "react";
import { Clock, Shield, Bell, Menu, RefreshCw } from "lucide-react";
import { User, Notification } from "../types";
import ThemeToggle from "./ThemeToggle";

interface TopbarProps {
  currentUser: User | null;
  title: string;
  onToggleSidebar?: () => void;
  onRefresh?: () => void;
  notifications?: Notification[];
  onMarkNotificationRead?: (id: string) => void;
}

export default function Topbar({ currentUser, title, onToggleSidebar, onRefresh, notifications, onMarkNotificationRead }: TopbarProps) {
  const [time, setTime] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Clock ticks to show real-time professional fidelity
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 topbar-header bg-[#090d1a]/95 border-b border-white/5 py-4 px-4 sm:px-6 flex items-center justify-between z-20 sticky top-0 transition-colors">
      {/* Navigation Title Context with mobile menu toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer topbar-icon-btn"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-widest truncate max-w-[180px] sm:max-w-none topbar-title">{title}</h1>
        <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold bg-white/5 border border-white/10 text-slate-400 select-none topbar-time-badge">
          <Clock className="h-3 w-3 inline text-emerald-400" />
          {time || "15:02:40"} PKT
        </span>
      </div>

      {/* Active Secure Audit HUD & Theme Switcher */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Theme Switcher Button at top */}
        <ThemeToggle showLabel={false} />

        {currentUser && (
          <div className="hidden md:flex items-center gap-2 bg-indigo-950/20 border border-indigo-500/20 px-3 py-1 rounded-xl topbar-session-badge">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 shrink-0">
              <Shield className="h-3 w-3 text-emerald-500" /> Session:
            </span>
            <span className="text-[10px] text-slate-300 font-bold topbar-session-name">
              {currentUser.name}
            </span>
            <div className="h-2 w-[1px] bg-white/15 divider-line" />
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-600/35 text-emerald-300 font-extrabold uppercase tracking-wide topbar-role-tag">
              {currentUser.role}
            </span>
          </div>
        )}

      {/* Profile notifications helper indicator */}
      <div className="flex items-center gap-2 sm:gap-3 border-l border-white/5 pl-3 sm:pl-4 relative divider-border">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="h-8 w-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer topbar-icon-btn"
            title="Refresh Global State"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="h-8 w-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer topbar-icon-btn"
            aria-label="Toggle notifications menu"
          >
            <Bell className="h-4.5 w-4.5" />
          </button>
          {(notifications?.filter(n => !n.read).length || 0) > 0 && (
            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
          )}
          {(notifications?.filter(n => !n.read).length || 0) > 0 && (
            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-rose-500" />
          )}

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0c1222] border border-white/10 rounded-xl shadow-2xl py-2 z-50 notifications-dropdown">
              <div className="px-4 pb-2 border-b border-white/10 mb-2 flex justify-between items-center notifications-dropdown-header">
                <h3 className="text-xs font-bold text-slate-200 notifications-dropdown-title">Notifications</h3>
                <span className="text-[10px] bg-white/10 px-1.5 rounded text-slate-300 notifications-count-badge">{notifications?.filter(n => !n.read).length || 0} unread</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications?.length === 0 ? (
                  <div className="px-4 py-6 text-center text-slate-500 text-[10px]">No notifications</div>
                ) : (
                  notifications?.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`px-4 py-2.5 hover:bg-white/5 cursor-pointer mb-1 notif-item ${!notif.read ? 'bg-emerald-500/10' : ''}`}
                      onClick={() => {
                        if (!notif.read && onMarkNotificationRead) {
                          onMarkNotificationRead(notif.id);
                        }
                      }}
                    >
                      <p className={`text-xs notif-title ${!notif.read ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>{notif.title}</p>
                      <p className="text-[10px] text-slate-400 notif-msg mt-1">{notif.message}</p>
                      <p className="text-[9px] text-slate-500 notif-time mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </header>
  );
}

