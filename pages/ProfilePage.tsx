import React, { useState } from "react";
import { User, Mail, ShieldAlert, Landmark, Calendar, Key, RefreshCw, Lock, CheckCircle2, Download, Copy } from "lucide-react";
import { User as UserType } from "../types";
import ActionButton from "../components/ActionButton";
import { useSystemSnapshot } from "../hooks/useSystemSnapshot";
import { apiFetch } from "../lib/api";

interface ProfilePageProps {
  currentUser: UserType;
  onRefresh?: () => void;
  assets?: any[];
  issuances?: any[];
}

export default function ProfilePage({ currentUser, assets = [], issuances = [] }: ProfilePageProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { fetchSnapshot } = useSystemSnapshot();
  const [isExporting, setIsExporting] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [token, setToken] = useState<string>(() => {
    return `srv-sec-auth-${currentUser.id}-${Date.now().toString(16).toUpperCase()}`;
  });

  // Calculate stats for this user
  const userAllocations = issuances.filter(
    (ins) => ins.userId === currentUser.id && ins.actualReturnDate === null
  );
  
  const totalAllocatedCount = userAllocations.length;
  
  const handleRegenerateToken = () => {
    const freshToken = `srv-sec-auth-${currentUser.id}-${Math.floor(Math.random() * 100000).toString(16).toUpperCase()}`;
    setToken(freshToken);
    setMsg({ text: "Secure JWT access token successfully regenerated.", type: "success" });
    setTimeout(() => setMsg(null), 3000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setMsg({ text: "Please fill in all security fields.", type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({ text: "New password does not match confirmation fields.", type: "error" });
      return;
    }

    setIsUpdating(true);
    setMsg(null);

    try {
      const response = await apiFetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to change secure credentials.");
      }

      setMsg({ text: "Credentials updated successfully. New password is live.", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMsg({ text: err.message || "Credential update failed.", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setMsg(null);
    const data = await fetchSnapshot();
    if (data) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setMsg({ text: "Full system snapshot copied to clipboard.", type: "success" });
    } else {
      setMsg({ text: "Failed to fetch snapshot.", type: "error" });
    }
    setIsExporting(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      {/* Visual Identity Profile Banner */}
      <div className="relative bg-gradient-to-r from-indigo-950/40 via-slate-900/40 to-slate-950/40 border border-white/5 rounded-2xl p-6 sm:p-8 overflow-hidden">
        {/* Subtle glow decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 bg-indigo-650/25 border-2 border-indigo-500/40 rounded-2xl flex items-center justify-center text-indigo-400 font-extrabold text-2xl shadow-xl">
              {currentUser.name ? currentUser.name.charAt(0) : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight">{currentUser.name}</h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[9.5px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 uppercase">
                  ACTIVE SESSION
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                <Mail className="h-4 w-4 text-slate-500" />
                {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/40 border border-white/5 px-4.5 py-2.5 rounded-xl text-center">
              <span className="block text-[9.5px] font-extrabold text-slate-500 uppercase tracking-wider">Active Workspace</span>
              <span className="text-xs font-bold text-white uppercase mt-1 block">
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-fade-in ${
            msg.type === "success"
              ? "bg-emerald-950/30 border-emerald-500/25 text-emerald-300"
              : "bg-rose-950/30 border-rose-500/25 text-rose-300"
          }`}
        >
          {msg.type === "success" ? <CheckCircle2 className="h-4.5 w-4.5" /> : <ShieldAlert className="h-4.5 w-4.5" />}
          {msg.text}
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Directory Details */}
        <div className="bg-slate-900/25 border border-white/5 rounded-2xl p-6 space-y-6">
          <h2 className="text-sm font-bold text-white flex items-center gap-2.5 border-b border-white/5 pb-3">
            <Landmark className="h-4.5 w-4.5 text-indigo-400" /> Academic / Department Profile
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 py-1 border-b border-white/[0.02]">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">Registry Name</span>
              <span className="text-xs font-semibold text-slate-200 text-right">{currentUser.name}</span>
            </div>

            <div className="grid grid-cols-2 py-1 border-b border-white/[0.02]">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">Official Area</span>
              <span className="text-xs font-semibold text-indigo-300 text-right">{currentUser.department || "Administration Sector"}</span>
            </div>

            <div className="grid grid-cols-2 py-1 border-b border-white/[0.02]">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">Employment Contract</span>
              <span className="text-xs font-semibold text-slate-200 text-right">
                {currentUser.facultyType === "N/A" ? "Staff Logistics" : currentUser.facultyType === "Permanent" ? "Permanent Tenured" : "Visiting Contract"}
              </span>
            </div>

            {currentUser.facultyType === "Visiting" && currentUser.contractEndDate && (
              <div className="grid grid-cols-2 py-1 border-b border-white/[0.02]">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Contract Expiry
                </span>
                <span className="text-xs font-bold text-amber-300 text-right">
                  {currentUser.contractEndDate}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 py-1">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">Total Allocations</span>
              <span className="text-xs font-bold text-emerald-400 text-right">{totalAllocatedCount} active items</span>
            </div>
          </div>

          <div className="pt-2">
            <div className="p-3.5 rounded-xl bg-indigo-950/10 border border-indigo-500/10 space-y-2">
              <h3 className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5" /> API Credential Vault
              </h3>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                This token is used by local terminal applications to verify asset clearances via barcode tracking logs.
              </p>
              <div className="flex gap-2 items-center mt-2">
                <code className="text-[10px] bg-slate-950/80 p-2.5 rounded-lg border border-white/5 font-mono text-indigo-200 overflow-x-auto flex-1 select-all">
                  {token}
                </code>
                <button
                  type="button"
                  onClick={handleRegenerateToken}
                  className="h-8.5 w-8.5 flex items-center justify-center bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg border border-indigo-500/20 shadow duration-150 shrink-0"
                  title="Generate Fresh Token"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Security Controls */}
        <div className="bg-slate-900/25 border border-white/5 rounded-2xl p-6 space-y-6">
          <h2 className="text-sm font-bold text-white flex items-center gap-2.5 border-b border-white/5 pb-3">
            <Lock className="h-4.5 w-4.5 text-indigo-400" /> Secure Password Management
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Current Password Check
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-950 px-3.5 py-2.5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                New Security Password
              </label>
              <input
                type="password"
                required
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 px-3.5 py-2.5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 px-3.5 py-2.5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            <ActionButton
              type="submit"
              variant="primary"
              loading={isUpdating}
              className="w-full"
            >
              Update Security Credentials
            </ActionButton>
          </form>

          <div className="pt-4 border-t border-white/5">
            <h3 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
                <Download className="h-4 w-4 text-indigo-400" /> System Debug Snapshot
            </h3>
            <ActionButton
               variant="secondary"
               onClick={handleExport}
               loading={isExporting}
               className="w-full flex items-center justify-center gap-2"
            >
                <Copy className="h-3.5 w-3.5" /> Export Data & Copy to Clipboard
            </ActionButton>
          </div>
        </div>

      </div>
    </div>
  );
}
