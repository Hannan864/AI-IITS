import React from "react";
import { Bell, Check, Inbox } from "lucide-react";
import { Notification } from "../../types";

interface NotificationBoardProps {
  myNotifications: Notification[];
  unreadNotificationsCount: number;
  onMarkNotificationRead: (id: string) => void;
}

export default function NotificationBoard({
  myNotifications,
  unreadNotificationsCount,
  onMarkNotificationRead,
}: NotificationBoardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-lg space-y-4 h-full flex flex-col justify-between animate-fade-in">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
            <Bell className="h-4 w-4 text-indigo-400 animate-bounce" />
            System Notifications Board
          </h3>
          {unreadNotificationsCount > 0 && (
            <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-bold animate-pulse">
              {unreadNotificationsCount} New
            </span>
          )}
        </div>

        <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
          {myNotifications.map((not) => (
            <div
              key={not.id}
              className={`rounded-xl border p-3.5 relative space-y-2.5 transition-all text-xs ${
                not.read
                  ? "bg-white/2 border-white/5 opacity-60"
                  : "bg-indigo-950/40 border-indigo-500/35 shadow-md shadow-indigo-950/20 animate-pulse"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-white leading-normal">{not.title}</h4>
                {!not.read && (
                  <button
                    onClick={() => onMarkNotificationRead(not.id)}
                    className="h-5 w-5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/35 rounded-full flex items-center justify-center shrink-0 border border-white/5 cursor-pointer"
                    title="Mark read"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                )}
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px] font-normal">{not.message}</p>
              <span className="text-[9px] text-slate-500 font-medium font-mono block">
                {new Date(not.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}

          {myNotifications.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Inbox className="h-8 w-8 text-white/5 mx-auto mb-1" />
              <p className="text-xs font-semibold">No notifications logged currently.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick procedural reminders footer */}
      <div className="bg-white/2 rounded-xl p-3 border border-white/5 mt-5">
        <span className="text-[9px] font-bold text-indigo-400 uppercase block font-mono">IIUI Store Notice</span>
        <p className="text-[10.5px] text-slate-400 leading-normal mt-1">
          Please deliver all electronic assets and hardware to store manager Major Sajid Malik upon conclusion of your term to release
          your clearance locks.
        </p>
      </div>
    </div>
  );
}
