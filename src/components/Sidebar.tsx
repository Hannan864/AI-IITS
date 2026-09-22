import React, { useState, useEffect } from "react";
import {
  Building2,
  Laptop,
  Users,
  ShieldAlert,
  FolderLock,
  History,
  Activity,
  Repeat,
  FilePlus,
  Scale,
  FileText,
  Bell,
  Award,
  LogOut,
  UserCheck,
  QrCode,
  Printer,
  Link2,
  RotateCcw,
  ShieldCheck,
  Package,
  X,
  MessageSquare,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { User, Notification, AssetIssuance } from "../types";
import { getStoredWarnings } from "../lib/warningRegistry";

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
  alertsCount?: number;
  notifications?: Notification[];
  issuances?: AssetIssuance[];
  onCloseSidebar?: () => void;
  onOpenChat?: () => void;
}

export default function Sidebar({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  alertsCount = 0,
  notifications = [],
  issuances = [],
  onCloseSidebar,
  onOpenChat
}: SidebarProps) {
  const isFaculty = currentUser.role.includes("Faculty");
  const isAdmin = currentUser.role === "Admin";
  const isStoreManager = currentUser.role === "Store Manager";

  // Filter unread notifications for currently logged-in faculty
  const myUnreadCount = notifications.filter(
    (n) => n.userId === currentUser.id && !n.read
  ).length;

  const myLiabilitiesCount = issuances.filter(
    (i) => i.userId === currentUser.id && i.actualReturnDate === null
  ).length;

  const [activeDeficiencyCount, setActiveDeficiencyCount] = useState<number>(0);

  useEffect(() => {
    const updateCount = () => {
      try {
        const warnings = getStoredWarnings();
        const active = warnings.filter((w) => w.status === "ACTIVE_NOTICE").length;
        setActiveDeficiencyCount(active);
      } catch (e) {
        setActiveDeficiencyCount(0);
      }
    };

    updateCount();
    window.addEventListener("storage", updateCount);
    window.addEventListener("deficiency-warnings-updated", updateCount);

    return () => {
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("deficiency-warnings-updated", updateCount);
    };
  }, []);

  const navButtonClass = (targetTab: string) => `
    w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all border shrink-0 cursor-pointer text-left
    ${activeTab === targetTab
      ? `bg-emerald-600/15 dark:bg-indigo-600/15 border-emerald-500/40 dark:border-indigo-500/30 text-emerald-900 dark:text-white font-bold ring-1 ring-emerald-500/20 dark:ring-indigo-500/20 shadow-sm`
      : `bg-transparent border-transparent text-slate-600 dark:text-slate-400 hover:bg-emerald-50/60 dark:hover:bg-white/[0.04] hover:text-emerald-900 dark:hover:text-slate-200`
    }
  `;

  return (
    <aside className="w-full h-full bg-[#090d1a] border-r border-white/5 flex flex-col justify-between select-none overflow-hidden transition-colors">
      <div className="p-3.5 flex-1 flex flex-col justify-between overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="space-y-4">
          {/* Dashboard Branding Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black shrink-0 shadow shadow-emerald-700/20">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-emerald-600 dark:text-indigo-400 font-bold uppercase tracking-wider block">IIUI Asset Core</span>
                <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">AIITS Gateway</h2>
              </div>
            </div>
            
            {onCloseSidebar && (
              <button
                onClick={onCloseSidebar}
                className="lg:hidden p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>


          {/* Role Navigation Block Options */}
          <nav className="space-y-3">
            {/* ========================================================= */}
            {/* 1. STORE MANAGER WORKFLOW */}
            {/* ========================================================= */}
            {isStoreManager && (
              <>
                {/* Group 1: Overview & Storage */}
                <div className="space-y-1">
                  <div className="px-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-indigo-400/80">
                    Overview & Inventory
                  </div>
                  <button onClick={() => setActiveTab("manager-dashboard")} className={navButtonClass("manager-dashboard")}>
                    <span className="flex items-center gap-2.5"><Activity className="h-3.5 w-3.5 text-indigo-400" /> Manager Dashboard</span>
                  </button>
                  <button onClick={() => setActiveTab("manager-inventory")} className={navButtonClass("manager-inventory")}>
                    <span className="flex items-center gap-2.5"><Laptop className="h-3.5 w-3.5 text-emerald-400" /> All Assets List</span>
                  </button>
                  <button onClick={() => setActiveTab("warehouse")} className={navButtonClass("warehouse")}>
                    <span className="flex items-center gap-2.5"><Package className="h-3.5 w-3.5 text-purple-400" /> Warehouse Storage</span>
                  </button>
                </div>

                {/* Group 2: Daily Workflow */}
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <div className="px-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-sky-400/80">
                    Issue & Return Operations
                  </div>
                  <button onClick={() => setActiveTab("manager-checkout")} className={navButtonClass("manager-checkout")}>
                    <span className="flex items-center gap-2.5"><Repeat className="h-3.5 w-3.5 text-sky-400" /> Issue Equipment</span>
                  </button>
                  <button onClick={() => setActiveTab("manager-returns")} className={navButtonClass("manager-returns")}>
                    <span className="flex items-center gap-2.5"><RotateCcw className="h-3.5 w-3.5 text-amber-400" /> Return & Inspection Desk</span>
                  </button>
                  <button onClick={() => setActiveTab("return-verification")} className={navButtonClass("return-verification")}>
                    <span className="flex items-center gap-2.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Return Verification Scanner</span>
                  </button>
                </div>

                {/* Group 3: QR Operations */}
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <div className="px-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-violet-400/80">
                    QR Tag System
                  </div>
                  <button onClick={() => setActiveTab("qr-generator")} className={navButtonClass("qr-generator")}>
                    <span className="flex items-center gap-2.5"><FilePlus className="h-3.5 w-3.5 text-violet-400" /> Generate QR Tags</span>
                  </button>
                  <button onClick={() => setActiveTab("qr-print-center")} className={navButtonClass("qr-print-center")}>
                    <span className="flex items-center gap-2.5"><Printer className="h-3.5 w-3.5 text-emerald-400" /> Print QR Tags</span>
                  </button>
                  <button onClick={() => setActiveTab("asset-binding-center")} className={navButtonClass("asset-binding-center")}>
                    <span className="flex items-center gap-2.5"><Link2 className="h-3.5 w-3.5 text-sky-400" /> Attach QR to Item</span>
                  </button>
                  <button onClick={() => setActiveTab("qr-registry")} className={navButtonClass("qr-registry")}>
                    <span className="flex items-center gap-2.5"><QrCode className="h-3.5 w-3.5 text-indigo-400" /> All QR Codes List</span>
                  </button>
                  <button onClick={() => setActiveTab("qr-scanner-desk")} className={navButtonClass("qr-scanner-desk")}>
                    <span className="flex items-center gap-2.5"><QrCode className="h-3.5 w-3.5 text-rose-400" /> QR Scan Desk</span>
                  </button>
                </div>

                {/* Group 4: Risk & Audit */}
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <div className="px-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-rose-400/80">
                    Alerts & History
                  </div>
                  <button onClick={() => setActiveTab("manager-alerts")} className={navButtonClass("manager-alerts")}>
                    <span className="flex items-center gap-2.5"><ShieldAlert className="h-3.5 w-3.5 text-rose-400" /> Contract Expiry Alerts</span>
                    {alertsCount > 0 && <span className="px-1.5 bg-rose-500/20 text-rose-400 text-[9px] font-bold rounded border border-rose-500/30">{alertsCount}</span>}
                  </button>
                  <button onClick={() => setActiveTab("qr-audit-trail")} className={navButtonClass("qr-audit-trail")}>
                    <span className="flex items-center gap-2.5"><ShieldCheck className="h-3.5 w-3.5 text-teal-400" /> QR Scan History</span>
                  </button>
                </div>
              </>
            )}

            {/* ========================================================= */}
            {/* 2. ADMIN WORKFLOW */}
            {/* ========================================================= */}
            {isAdmin && (
              <>
                {/* Group 1: Dashboard & Settings */}
                <div className="space-y-1">
                  <div className="px-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-indigo-400/80">
                    Dashboard & Analytics
                  </div>
                  <button onClick={() => setActiveTab("admin-dashboard")} className={navButtonClass("admin-dashboard")}>
                    <span className="flex items-center gap-2.5"><Activity className="h-3.5 w-3.5 text-indigo-400" /> Admin Dashboard</span>
                  </button>
                  <button onClick={() => setActiveTab("admin-governance")} className={navButtonClass("admin-governance")}>
                    <span className="flex items-center gap-2.5"><Building2 className="h-3.5 w-3.5 text-violet-400" /> Department Analytics</span>
                  </button>
                  <button onClick={() => setActiveTab("admin-health")} className={navButtonClass("admin-health")}>
                    <span className="flex items-center gap-2.5"><Activity className="h-3.5 w-3.5 text-emerald-400" /> Settings & Health</span>
                  </button>
                </div>

                {/* Group 2: Assets & Faculty */}
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <div className="px-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400/80">
                    Assets & Accounts
                  </div>
                  <button onClick={() => setActiveTab("admin-assets")} className={navButtonClass("admin-assets")}>
                    <span className="flex items-center gap-2.5"><Laptop className="h-3.5 w-3.5 text-emerald-400" /> All Assets List</span>
                  </button>
                  <button onClick={() => setActiveTab("admin-compliance")} className={navButtonClass("admin-compliance")}>
                    <span className="flex items-center gap-2.5"><Users className="h-3.5 w-3.5 text-indigo-400" /> Faculty Accounts</span>
                  </button>
                  <button onClick={() => setActiveTab("qr-registry")} className={navButtonClass("qr-registry")}>
                    <span className="flex items-center gap-2.5"><QrCode className="h-3.5 w-3.5 text-sky-400" /> All QR Codes List</span>
                  </button>
                </div>

                {/* Group 3: Risk & Exit Clearance */}
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <div className="px-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-rose-400/80">
                    Alerts & Clearances
                  </div>
                  <button onClick={() => setActiveTab("admin-deficiencies")} className={navButtonClass("admin-deficiencies")}>
                    <span className="flex items-center gap-2.5"><AlertTriangle className="h-3.5 w-3.5 text-rose-400" /> Deficiency Clearance Roster</span>
                    {activeDeficiencyCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-400 text-[9px] font-bold rounded border border-rose-500/30 font-mono animate-pulse">
                        {activeDeficiencyCount}
                      </span>
                    )}
                  </button>
                  <button onClick={() => setActiveTab("admin-risk")} className={navButtonClass("admin-risk")}>
                    <span className="flex items-center gap-2.5"><ShieldAlert className="h-3.5 w-3.5 text-rose-400" /> Contract Expiry Alerts</span>
                    {alertsCount > 0 && <span className="px-1.5 bg-rose-500/20 text-rose-400 text-[9px] font-bold rounded border border-rose-500/30">{alertsCount}</span>}
                  </button>
                  <button onClick={() => setActiveTab("admin-ndc")} className={navButtonClass("admin-ndc")}>
                    <span className="flex items-center gap-2.5"><FolderLock className="h-3.5 w-3.5 text-amber-400" /> No-Dues Clearance Requests</span>
                  </button>
                </div>

                {/* Group 4: Forensic Audit */}
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <div className="px-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Activity Logs
                  </div>
                  <button onClick={() => setActiveTab("admin-audit")} className={navButtonClass("admin-audit")}>
                    <span className="flex items-center gap-2.5"><History className="h-3.5 w-3.5 text-sky-400" /> Activity & Audit Logs</span>
                  </button>
                  <button onClick={() => setActiveTab("qr-audit-trail")} className={navButtonClass("qr-audit-trail")}>
                    <span className="flex items-center gap-2.5"><ShieldCheck className="h-3.5 w-3.5 text-teal-400" /> QR Scan History</span>
                  </button>
                </div>
              </>
            )}

            {/* ========================================================= */}
            {/* 3. FACULTY WORKFLOW */}
            {/* ========================================================= */}
            {isFaculty && (
              <>
                {/* Group 1: My Assets & Standing */}
                <div className="space-y-1">
                  <div className="px-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-indigo-400/80">
                    My Equipment & Status
                  </div>
                  <button onClick={() => setActiveTab("faculty-liabilities")} className={navButtonClass("faculty-liabilities")}>
                    <span className="flex items-center gap-2.5"><Laptop className="h-3.5 w-3.5 text-indigo-400" /> My Borrowed Items</span>
                    {myLiabilitiesCount > 0 && <span className="px-1.5 bg-indigo-500/20 text-indigo-300 text-[9px] font-bold border border-indigo-500/30 rounded-full font-mono">{myLiabilitiesCount}</span>}
                  </button>
                  <button onClick={() => setActiveTab("faculty-compliance")} className={navButtonClass("faculty-compliance")}>
                    <span className="flex items-center gap-2.5"><Scale className="h-3.5 w-3.5 text-emerald-400" /> My Item Status</span>
                  </button>
                </div>

                {/* Group 2: Returns & Exit Clearance */}
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <div className="px-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-amber-400/80">
                    Return Equipment & Clearance
                  </div>
                  <button onClick={() => setActiveTab("faculty-return-portal")} className={navButtonClass("faculty-return-portal")}>
                    <span className="flex items-center gap-2.5"><RotateCcw className="h-3.5 w-3.5 text-rose-400" /> Return Equipment</span>
                  </button>
                  <button onClick={() => setActiveTab("faculty-active-returns")} className={navButtonClass("faculty-active-returns")}>
                    <span className="flex items-center gap-2.5"><QrCode className="h-3.5 w-3.5 text-amber-400" /> Active Return Passes</span>
                  </button>
                  <button onClick={() => setActiveTab("faculty-ndc")} className={navButtonClass("faculty-ndc")}>
                    <span className="flex items-center gap-2.5"><FileText className="h-3.5 w-3.5 text-indigo-400" /> Request Clearance (NDC)</span>
                  </button>
                  <button onClick={() => setActiveTab("faculty-history")} className={navButtonClass("faculty-history")}>
                    <span className="flex items-center gap-2.5"><Award className="h-3.5 w-3.5 text-sky-400" /> Clearance Certificates</span>
                  </button>
                </div>

                {/* Group 3: Communications */}
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <div className="px-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-violet-400/80">
                    Notifications & Alerts
                  </div>
                  <button onClick={() => setActiveTab("faculty-notifications")} className={navButtonClass("faculty-notifications")}>
                    <span className="flex items-center gap-2.5"><Bell className="h-3.5 w-3.5 text-violet-400" /> Notifications & Alerts</span>
                    {myUnreadCount > 0 && <span className="px-1.5 bg-rose-500 text-white text-[8px] font-bold rounded-full animate-bounce">{myUnreadCount}</span>}
                  </button>
                </div>
              </>
            )}
          </nav>
        </div>

        {/* User Identity HUD Pill bottom */}
        <div className="border-t border-white/5 pt-3 space-y-2 shrink-0 divider-border">
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg border border-emerald-500/20 dark:border-indigo-500/20 bg-emerald-500/5 dark:bg-indigo-500/5 hover:bg-emerald-500/10 dark:hover:bg-indigo-500/10 transition-colors cursor-pointer group"
            >
              <div className="h-6 w-6 rounded-md flex items-center justify-center shrink-0 bg-emerald-500/20 dark:bg-indigo-500/20 text-emerald-600 dark:text-indigo-400">
                <MessageSquare className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold truncate text-emerald-900 dark:text-indigo-200">Internal Comms</p>
                <p className="text-[8px] text-emerald-600/80 dark:text-indigo-400/70 font-semibold uppercase">Realtime Channel</p>
              </div>
            </button>
          )}

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left flex items-center gap-2.5 p-2 rounded-lg transition-colors border shrink-0 cursor-pointer ${
              activeTab === "profile"
                ? "bg-emerald-600/15 dark:bg-indigo-600/15 border-emerald-500/30 dark:border-indigo-500/30 text-emerald-950 dark:text-white ring-1 ring-emerald-500/20 dark:ring-indigo-500/20 font-bold"
                : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300"
            }`}
          >
            <div className="h-7 w-7 rounded-md flex items-center justify-center shrink-0 font-black text-xs bg-emerald-500/10 dark:bg-indigo-500/10 border border-emerald-500/20 dark:border-indigo-500/20 text-emerald-600 dark:text-indigo-400">
              <UserCheck className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate leading-tight text-slate-900 dark:text-white">{currentUser.name}</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-semibold truncate mt-0.5">{currentUser.role}</p>
            </div>
          </button>

          <button
            onClick={onLogout}
            className="w-full h-8 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:bg-rose-500/10 hover:border-rose-500/25 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="h-3 w-3" />
            Sign Out
          </button>
        </div>

      </div>
    </aside>
  );
}
