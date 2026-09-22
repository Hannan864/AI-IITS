import React from "react";
import { Bell, Check, Inbox, AlertTriangle, AlertCircle, Info, MessageSquare } from "lucide-react";
import { Notification, Asset, AssetIssuance } from "../../types";

interface NotificationFeedProps {
  myNotifications: Notification[];
  myActiveIssuances: AssetIssuance[];
  assets: Asset[];
  todayStr: string;
  onMarkNotificationRead: (id: string) => void;
}

export default function NotificationFeed({
  myNotifications,
  myActiveIssuances,
  assets,
  todayStr,
  onMarkNotificationRead,
}: NotificationFeedProps) {
  const getDaysRemaining = (returnDate: string) => {
    const deadline = new Date(returnDate);
    const today = new Date(todayStr);
    const diff = deadline.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  // Compile real-time alerts based on assigned hardware
  const compiledAlerts: {
    id: string;
    title: string;
    message: string;
    severity: "INFO" | "WARNING" | "CRITICAL";
    createdAt: string;
    isDynamic?: boolean;
    read?: boolean;
  }[] = [];

  myActiveIssuances.forEach((iss) => {
    const asset = assets.find((a) => a.id === iss.assetId);
    if (!asset) return;
    
    const daysLeft = getDaysRemaining(iss.returnDate);
    if (daysLeft < 0) {
      compiledAlerts.push({
        id: `dyn-overdue-${iss.id}`,
        title: "ACCOUNT LIABILITIES OVERDUE WARNING",
        message: `DEVIATION ALERT: Your allocated university hardware asset [${asset.assetName}] with Tag code [${asset.assetTag}] has exceeded its expected return deadline by ${Math.abs(daysLeft)} days. Settle immediately.`,
        severity: "CRITICAL",
        createdAt: todayStr,
        isDynamic: true,
        read: false,
      });
    } else if (daysLeft <= 15) {
      compiledAlerts.push({
        id: `dyn-near-${iss.id}`,
        title: "APPROACHING RETURN DEADLINE REMINDER",
        message: `NOTICE: Assigned asset [${asset.assetName}] (Barcode: ${asset.assetTag}) is due for checkout-reclaim in ${daysLeft} days. Please schedule physical checks with administrative store managers.`,
        severity: "WARNING",
        createdAt: todayStr,
        isDynamic: true,
        read: false,
      });
    }
  });

  // Map database notifications and map categorization
  const mappedNotices: {
    id: string;
    title: string;
    message: string;
    severity: "INFO" | "WARNING" | "CRITICAL";
    createdAt: string;
    isDynamic?: boolean;
    read?: boolean;
  }[] = myNotifications.map((not) => {
    let severity: "INFO" | "WARNING" | "CRITICAL" = "INFO";
    const msgLower = not.message.toLowerCase();
    const titleLower = not.title.toLowerCase();

    if (msgLower.includes("overdue") || msgLower.includes("critical") || titleLower.includes("risk") || titleLower.includes("warning")) {
      severity = "CRITICAL";
    } else if (msgLower.includes("expiration") || msgLower.includes("urgent") || msgLower.includes("deadline") || titleLower.includes("pending")) {
      severity = "WARNING";
    }

    return {
      id: not.id,
      title: not.title,
      message: not.message,
      severity,
      createdAt: not.createdAt,
      isDynamic: false,
      read: not.read,
    };
  });

  // Combine database notifications and compiled system alerts
  const allNotices = [...compiledAlerts, ...mappedNotices];

  // Sort: Critical first, then Warning, then Info, and chronological
  allNotices.sort((a, b) => {
    const severityWeight = { CRITICAL: 3, WARNING: 2, INFO: 1 };
    const weightDiff = severityWeight[b.severity] - severityWeight[a.severity];
    if (weightDiff !== 0) return weightDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <Bell className="h-4.5 w-4.5 text-indigo-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Intel Notifications Center</h4>
        </div>
        <span className="text-[10px] bg-white/5 border border-white/10 text-slate-400 px-2.5 py-0.5 rounded font-mono">
          {allNotices.length} Logs Active
        </span>
      </div>

      <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
        {allNotices.map((not) => {
          const isCritical = not.severity === "CRITICAL";
          const isWarning = not.severity === "WARNING";

          return (
            <div 
              key={not.id} 
              id={`notif-${not.id}`}
              className={`rounded-xl border p-4 space-y-3 transition-all relative overflow-hidden ${
                isCritical 
                  ? "bg-rose-500/[0.01] border-rose-500/25 shadow-md shadow-rose-950/10" 
                  : isWarning
                  ? "bg-amber-500/[0.01] border-amber-500/25 shadow-md shadow-amber-950/10 animate-pulse"
                  : "bg-white/[0.01] border-white/5"
              }`}
            >
              {/* Severity side marker strip */}
              <div className={`absolute top-0 left-0 w-1 h-full ${
                isCritical ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-indigo-500"
              }`} />

              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-2.5">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                    isCritical 
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
                      : isWarning
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                  }`}>
                    {isCritical ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : isWarning ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Info className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-[11px] uppercase font-black tracking-wider text-slate-200">{not.title}</h5>
                    <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">Severity: {not.severity}</span>
                  </div>
                </div>

                {/* Mark Read button (only for DB notifications) */}
                {!not.isDynamic && !("read" in not && not.read) && (
                  <button
                    onClick={() => onMarkNotificationRead(not.id)}
                    className="h-5.5 w-5.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded border border-white/10 flex items-center justify-center shrink-0 transition-all cursor-pointer"
                    title="Acknowledge & Dismiss notification logs"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                )}
              </div>

              <p className="text-[11.5px] leading-relaxed text-slate-300 font-medium pl-9 font-sans">{not.message}</p>
              
              <div className="pl-9 flex justify-between items-center text-[9px] text-slate-550 font-mono">
                <span>TIMESTAMP: {not.createdAt}</span>
                {not.isDynamic && <span className="text-[8.5px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded border border-indigo-500/20">System Trigger</span>}
              </div>
            </div>
          );
        })}

        {allNotices.length === 0 && (
          <div className="text-center py-16 text-slate-500 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
            <Inbox className="h-10 w-10 text-white/5 mx-auto mb-2" />
            <p className="text-xs font-semibold">Security notification desk cleared.</p>
            <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">Custodial checks and compliance signals are fully satisfied.</p>
          </div>
        )}
      </div>

      {/* Institutional Note */}
      <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5 text-[10.5px] text-slate-400 leading-normal flex items-start gap-2">
        <MessageSquare className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
        <span>Please deliver your hardware assets directly to Sajid Mahmood during active laboratory hours to claim certificates.</span>
      </div>
    </div>
  );
}
