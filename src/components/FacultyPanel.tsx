import React from "react";
import { CalendarClock } from "lucide-react";
import { User, Asset, AssetIssuance, NDCRequest, Notification } from "../types";
import AllocatedAssetsList from "./faculty/AllocatedAssetsList";
import NdcClearanceDrawer from "./faculty/NdcClearanceDrawer";
import NotificationBoard from "./faculty/NotificationBoard";
import HistoricReturnReceipts from "./faculty/HistoricReturnReceipts";

interface FacultyPanelProps {
  currentUser: User;
  assets: Asset[];
  issuances: AssetIssuance[];
  ndcRequests: NDCRequest[];
  notifications: Notification[];
  onRequestNDC: (userId: string, remarks: string) => Promise<boolean>;
  onMarkNotificationRead: (id: string) => void;
}

export default function FacultyPanel({
  currentUser,
  assets,
  issuances,
  ndcRequests,
  notifications,
  onRequestNDC,
  onMarkNotificationRead,
}: FacultyPanelProps) {
  // Get active asset borrow cards
  const myActiveIssuances = issuances.filter(
    (iss) => iss.userId === currentUser.id && iss.actualReturnDate === null
  );

  // My historical return logs
  const myHistoricalIssuances = issuances.filter(
    (iss) => iss.userId === currentUser.id && iss.actualReturnDate !== null
  );

  // My custom NDC clearance requests
  const myNdcRequests = ndcRequests.filter((req) => req.userId === currentUser.id);

  // My Notifications (system push logs)
  const myNotifications = notifications.filter((n) => n.userId === currentUser.id);
  const unreadNotifications = myNotifications.filter((n) => !n.read);

  return (
    <div className="space-y-6">
      {/* Top Welcome Card with Quick Stats */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 selection:bg-indigo-500/10">
        <div>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            {currentUser.role} Dashboard
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Peace be upon you, {currentUser.name}!</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Faculty Room ID: {currentUser.department} • Member ID: {currentUser.id}
          </p>
        </div>

        {/* Tenure Contract Tracker Card */}
        <div className="rounded-lg bg-white/5 border border-white/10 p-3 flex items-center gap-3">
          <CalendarClock className="h-5 w-5 text-indigo-400" />
          <div className="text-xs">
            <span className="text-slate-400 font-medium block">Tenure Calendar Expiry:</span>
            {currentUser.contractEndDate ? (
              <span className="font-mono text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 block mt-0.5">
                {currentUser.contractEndDate} (Visiting basis)
              </span>
            ) : (
              <span className="font-bold text-slate-200 block mt-0.5">Continuous Regular Tenure</span>
            )}
          </div>
        </div>
      </div>

      {/* Primary Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MY ACTIVE BORROWED ASSETS & NDC (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          <AllocatedAssetsList
            assets={assets}
            myActiveIssuances={myActiveIssuances}
          />

          <NdcClearanceDrawer
            currentUser={currentUser}
            myActiveIssuancesCount={myActiveIssuances.length}
            myNdcRequests={myNdcRequests}
            onRequestNDC={onRequestNDC}
          />
        </div>

        {/* NOTIFICATIONS BOARD (lg:col-span-4) */}
        <div className="lg:col-span-4">
          <NotificationBoard
            myNotifications={myNotifications}
            unreadNotificationsCount={unreadNotifications.length}
            onMarkNotificationRead={onMarkNotificationRead}
          />
        </div>
      </div>

      {/* Return logs historic activity */}
      {myHistoricalIssuances.length > 0 && (
        <HistoricReturnReceipts
          myHistoricalIssuances={myHistoricalIssuances}
          assets={assets}
        />
      )}
    </div>
  );
}
