import React, { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useAssets } from "./hooks/useAssets";
import AppLayout from "./layouts/AppLayout";
import { io } from "socket.io-client";
import Login from "./pages/Login";
import ProfilePage from "./pages/ProfilePage";
import QRScannerModal from "./components/QRScannerModal";
import AdminRoleRouter from "./layouts/AdminRoleRouter";
import ManagerRoleRouter from "./layouts/ManagerRoleRouter";
import FacultyRoleRouter from "./layouts/FacultyRoleRouter";

export default function App() {
  const { currentUser, loading: authLoading, authError, handleLogin, handleRegister, handleLogout } = useAuth();
  const { assets, issuances, ndcRequests, alerts, notifications, addAsset, deleteAsset, updateAsset, issueAsset, returnAsset, approveNDC, requestNDC, transmitNotification, markNotificationRead, refreshAll, users = [], addUser, updateUser, deleteUser } = useAssets(currentUser?.id);

  const [activeTab, setActiveTab] = useState<string>("admin-dashboard");
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      const socket = io({
        transports: ["websocket", "polling"],
        reconnectionAttempts: 3,
        autoConnect: true,
      });
      socket.on("connect", () => console.log("Connected to dynamic state WebSocket synchronization"));
      socket.on("connect_error", () => {
        /* Soft connection fallback */
      });
      socket.on("state_update", () => refreshAll());
      return () => { socket.disconnect(); };
    }
  }, [currentUser, refreshAll]);

  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "Faculty" || currentUser.role === "Visiting Faculty") setActiveTab("faculty-liabilities");
      else if (currentUser.role === "Admin") setActiveTab("admin-dashboard");
      else setActiveTab("manager-dashboard");
    }
  }, [currentUser]);

  if (!currentUser) return <Login onLoginSubmit={handleLogin} onRegisterSubmit={handleRegister} authLoading={authLoading} authError={authError} />;

  const getTabTitle = () => {
    const titles: Record<string, string> = {
      "manager-dashboard": "Store Manager Dashboard",
      "manager-inventory": "All Assets & Inventory",
      "warehouse": "Warehouse Storage",
      "manager-checkout": "Issue Equipment to Staff",
      "manager-returns": "Return Item & Check-In",
      "return-verification": "Verify Returned Item",
      "qr-generator": "Generate QR Codes",
      "qr-print-center": "Print QR Codes",
      "asset-binding-center": "Attach QR Code to Item",
      "qr-registry": "QR Codes List",
      "qr-scanner-desk": "Scan QR Code",
      "manager-alerts": "Contract Expiry Alerts",
      "qr-audit-trail": "QR Scan History",

      "faculty-liabilities": "My Borrowed Items",
      "faculty-compliance": "My Item Status",
      "faculty-return-portal": "Return Equipment",
      "faculty-active-returns": "Active Return Verification Passes",
      "faculty-ndc": "Request No-Dues Clearance",
      "faculty-history": "Clearance Records & Receipts",
      "faculty-notifications": "Notifications & Alerts",

      "admin-dashboard": "Admin Dashboard",
      "admin-governance": "Department Analytics",
      "admin-health": "Settings & System Health",
      "admin-assets": "All Assets List",
      "admin-compliance": "Faculty Accounts & Items",
      "admin-risk": "Risk & Contract Expiry Alerts",
      "admin-ndc": "No-Dues Clearance Requests",
      "admin-audit": "Audit & Activity Logs",

      "profile": "User Profile"
    };
    return titles[activeTab] || "Asset Management System";
  };

  return (
    <AppLayout currentUser={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} alertsCount={alerts.length} notifications={notifications} issuances={issuances} title={getTabTitle()} refreshAll={refreshAll} onMarkNotificationRead={markNotificationRead}>
      {currentUser.role === "Admin" && (
        <AdminRoleRouter currentUser={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} assets={assets} issuances={issuances} alerts={alerts} users={users} ndcRequests={ndcRequests} updateAsset={updateAsset} deleteAsset={deleteAsset} approveNDC={approveNDC} refreshAll={refreshAll} returnAsset={returnAsset} addUser={addUser} updateUser={updateUser} deleteUser={deleteUser} />
      )}
      {currentUser.role === "Store Manager" && (
        <ManagerRoleRouter currentUser={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} assets={assets} issuances={issuances} alerts={alerts} users={users} setIsScannerOpen={setIsScannerOpen} addAsset={addAsset} updateAsset={updateAsset} deleteAsset={deleteAsset} issueAsset={issueAsset} returnAsset={returnAsset} transmitNotification={transmitNotification} refreshAll={refreshAll} />
      )}
      {(currentUser.role === "Faculty" || currentUser.role === "Visiting Faculty") && (
        <FacultyRoleRouter currentUser={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} assets={assets} issuances={issuances} ndcRequests={ndcRequests} notifications={notifications} requestNDC={requestNDC} markNotificationRead={markNotificationRead} returnAsset={returnAsset} refreshAll={refreshAll} />
      )}
      
      {activeTab === "profile" && <ProfilePage currentUser={currentUser} assets={assets} issuances={issuances} />}
      
      <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} assets={assets} onQuickIssue={() => { setIsScannerOpen(false); setActiveTab("manager-checkout"); }} onQuickReturn={async (aid, cond) => { await returnAsset(aid, cond); setIsScannerOpen(false); }} />
    </AppLayout>
  );
}
