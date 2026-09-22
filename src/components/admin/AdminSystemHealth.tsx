import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Database, 
  HardDrive, 
  RefreshCcw, 
  Cpu, 
  Layers, 
  QrCode, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Terminal,
  Activity,
  Users,
  Search,
  UserCheck,
  FileText,
  Truck,
  Building2,
  X
} from "lucide-react";
import GlassCard from "../GlassCard";
import { apiFetch } from "../../lib/api";
import { User } from "../../types";

interface SystemHealthData {
  status: string;
  latencyMs: number;
  database: {
    status: string;
    engine: string;
    dbSizeBytes: number;
    dbSizeFormatted: string;
    tables: {
      assets: number;
      issuances: number;
      activeIssuances: number;
      users: number;
      qrCodes: number;
      boundQRCodes: number;
      ndcRequests: number;
      logs: number;
    };
    inventory: {
      available: number;
      issued: number;
      damaged: number;
    };
  };
  runtime: {
    nodeVersion: string;
    platform: string;
    uptimeSec: number;
    uptimeFormatted: string;
    memoryMB: number;
    totalMemoryMB: number;
    rssMB: number;
    port: number;
    host: string;
  };
  recentLogs: Array<{
    id: string;
    date: string;
    actor: string;
    department: string;
    action: string;
    type: string;
    severity: string;
    details: string;
  }>;
}

interface AdminSystemHealthProps {
  onRefresh?: () => void;
  users?: User[];
  onDeleteUser?: (id: string) => Promise<boolean>;
}

export default function AdminSystemHealth({ onRefresh, users = [], onDeleteUser }: AdminSystemHealthProps) {
  const [data, setData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal dialog states
  const [showClearModal, setShowClearModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Accounts search & filter
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("All");

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/system/health");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err: any) {
      console.error("Failed to fetch system health:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const executeResetDB = async () => {
    setShowResetModal(false);
    try {
      setActionLoading(true);
      setActionFeedback(null);
      const res = await apiFetch("/api/system/reset-db", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setActionFeedback({ type: "success", message: json.message || "Database restored to standard FYP benchmark state." });
        if (onRefresh) onRefresh();
        await fetchHealth();
      } else {
        setActionFeedback({ type: "error", message: json.error || "Failed to reset database." });
      }
    } catch (err: any) {
      setActionFeedback({ type: "error", message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const executeClearDB = async () => {
    setShowClearModal(false);
    try {
      setActionLoading(true);
      setActionFeedback(null);
      const res = await apiFetch("/api/system/clear-db", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setActionFeedback({ type: "success", message: json.message || "Database completely cleared to blank state." });
        if (onRefresh) onRefresh();
        await fetchHealth();
      } else {
        setActionFeedback({ type: "error", message: json.error || "Failed to clear database." });
      }
    } catch (err: any) {
      setActionFeedback({ type: "error", message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUserAccount = async (id: string, name: string) => {
    if (!onDeleteUser) return;
    if (window.confirm(`Are you sure you want to permanently delete the account for ${name}?`)) {
      const ok = await onDeleteUser(id);
      if (ok) {
        setActionFeedback({ type: "success", message: `Account for ${name} removed from SQLite database.` });
        if (onRefresh) onRefresh();
        fetchHealth();
      }
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || u.email.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole = userRoleFilter === "All" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6" id="system-health-panel">
      {/* Top Header & Status Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-white/5 p-4 rounded-2xl">
        <div className="flex gap-3 items-center">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest">Live Platform Core & Diagnostics</h2>
            <p className="text-[11px] text-slate-400 font-medium">Real-time SQLite database metrics, accounts directory, and database restoration suite</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchHealth(); if (onRefresh) onRefresh(); }}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-white/5"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
            Refresh Health Status
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            SYSTEM ONLINE
          </div>
        </div>
      </div>

      {actionFeedback && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold animate-fade-in ${
          actionFeedback.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" 
            : "bg-rose-500/10 border-rose-500/30 text-rose-300"
        }`}>
          <div className="flex items-center gap-2">
            {actionFeedback.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <span>{actionFeedback.message}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="hover:opacity-75 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Database Engine</span>
            <Database className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-lg font-black text-slate-100">{data?.database.engine || "SQLite 3"}</div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Allocated File Size:</span>
            <span className="font-mono text-indigo-300 font-bold">{data?.database.dbSizeFormatted || "128 KB"}</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Active Registered Accounts</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-lg font-black text-slate-100">{data?.database.tables.users ?? users.length}</div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Master Admin & Staff Profiles:</span>
            <span className="font-mono text-emerald-300 font-bold">{users.length} Listed</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">University Inventory Assets</span>
            <Layers className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-lg font-black text-slate-100">{data?.database.tables.assets ?? 0}</div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Available / Active Issued:</span>
            <span className="font-mono text-sky-300 font-bold">{data?.database.inventory.available ?? 0} / {data?.database.inventory.issued ?? 0}</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Server Uptime Status</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-lg font-black text-slate-100">{data?.runtime.uptimeFormatted || "Active"}</div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Memory Allocated:</span>
            <span className="font-mono text-amber-300 font-bold">{data?.runtime.memoryMB || 45} MB</span>
          </div>
        </GlassCard>
      </div>

      {/* Database Controls & Restoration Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="border-b border-white/5 pb-2.5">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Database className="h-4 w-4 text-indigo-400" /> SQLite Database Tables Inventory
            </h3>
          </div>

          <GlassCard className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">users (System Accounts)</span>
                <span className="font-bold text-indigo-300 font-mono">{data?.database.tables.users ?? users.length}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">assets (University Assets)</span>
                <span className="font-bold text-sky-300 font-mono">{data?.database.tables.assets ?? 0}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">issuances (Asset Loans)</span>
                <span className="font-bold text-emerald-300 font-mono">{data?.database.tables.issuances ?? 0}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">qr_codes (Master Tags)</span>
                <span className="font-bold text-amber-300 font-mono">{data?.database.tables.qrCodes ?? 0}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">ndc_requests (Clearances)</span>
                <span className="font-bold text-purple-300 font-mono">{data?.database.tables.ndcRequests ?? 0}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">logs (Audit Records)</span>
                <span className="font-bold text-teal-300 font-mono">{data?.database.tables.logs ?? 0}</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Database Restore & Clear Control Buttons */}
        <div className="lg:col-span-6 space-y-4">
          <div className="border-b border-white/5 pb-2.5">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-400" /> Database Maintenance & Restoration
            </h3>
          </div>

          <GlassCard className="p-4 space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Use these administrative controls to clear all database records or restore standard benchmark testing data.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowResetModal(true)}
                disabled={actionLoading}
                className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all group disabled:opacity-50 cursor-pointer"
              >
                <RotateCcw className="h-5 w-5 text-indigo-400 group-hover:rotate-180 transition-transform duration-500" />
                <span>Restore Benchmark Dataset</span>
                <span className="text-[10px] font-normal text-indigo-400/80 text-center">Restores standard assets, issuances & staff accounts</span>
              </button>

              <button
                onClick={() => setShowClearModal(true)}
                disabled={actionLoading}
                className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all group disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="h-5 w-5 text-rose-400 group-hover:scale-110 transition-transform" />
                <span>Clear Database to Blank Slate</span>
                <span className="text-[10px] font-normal text-rose-400/80 text-center">Wipes all assets, QR tags & non-admin users</span>
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* All System Accounts Directory */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-2.5">
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-400" /> Registered System Accounts Directory ({users.length})
            </h3>
            <p className="text-[11px] text-slate-400">All authentication user accounts stored in SQLite database</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search accounts..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="rounded-lg bg-slate-950 border border-white/10 px-2.5 py-1.5 text-xs text-slate-200 font-bold focus:outline-none"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Store Manager">Store Manager</option>
              <option value="Faculty">Faculty</option>
              <option value="Visiting Faculty">Visiting Faculty</option>
            </select>
          </div>
        </div>

        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Staff Account</th>
                  <th className="py-3 px-4">Account Type</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Faculty Tenure</th>
                  <th className="py-3 px-4">Contract End Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((usr) => {
                  const isQuickLogin = ["admin@iiui.edu", "manager@iiui.edu", "dr.tariq@iiui.edu", "prof.sohail@iiui.edu"].includes(usr.email.toLowerCase());
                  return (
                    <tr key={usr.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100">{usr.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{usr.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        {isQuickLogin ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            ⚡ Quick Login
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-500/20 text-slate-300 border border-slate-500/30">
                            👤 Manual User
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          usr.role === "Admin" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" :
                          usr.role === "Store Manager" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" :
                          "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        }`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">{usr.department}</td>
                      <td className="py-3 px-4 text-slate-400 font-semibold">{usr.facultyType || "N/A"}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {usr.contractEndDate ? (
                          <span className="text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                            {usr.contractEndDate}
                          </span>
                        ) : (
                          <span className="text-slate-500">Permanent</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isQuickLogin ? (
                          <span className="text-[10px] text-slate-500 font-semibold italic">System Quick Login</span>
                        ) : (
                          onDeleteUser && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUserAccount(usr.id, usr.name)}
                              className="px-2.5 py-1 text-rose-400 hover:bg-rose-500/10 rounded-md font-bold transition-colors cursor-pointer text-[11px] border border-rose-500/20"
                            >
                              Delete Account
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No user accounts found matching your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Confirmation Modal: CLEAR DATABASE */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="h-10 w-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Clear Entire Database?</h3>
                <p className="text-[11px] text-slate-400">Action will purge all active records</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-white/5">
              Are you sure you want to <b>clear all data from the database</b>?
              <br /><br />
              This will wipe all <b>assets</b>, <b>equipment loans</b>, <b>QR tags</b>, <b>suppliers</b>, <b>NDC requests</b>, <b>notifications</b>, and custom accounts created manually.
              <br /><br />
              <span className="text-emerald-400 font-semibold">The 4 quick login accounts (Admin, Store Manager, Faculty, Visiting) will be kept so you can easily log in, but all their data will be wiped clean to a fresh empty state.</span>
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeClearDB}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-lg shadow-rose-600/30"
              >
                Yes, Clear Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: RESTORE BENCHMARK DATASET */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-indigo-400">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Restore Benchmark Dataset?</h3>
                <p className="text-[11px] text-slate-400">Restores standard testing dataset</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-white/5">
              Do you want to restore standard <b>FYP benchmark seed records</b>?
              <br /><br />
              This will populate sample university assets, active faculty equipment issuances, binding QR codes, and default testing staff accounts.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeResetDB}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                Yes, Restore Dataset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
