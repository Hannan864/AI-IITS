import React, { useState } from "react";
import { Mail, Lock, Building2, ShieldCheck, UserCheck, Sparkles } from "lucide-react";
import RegisterForm from "../components/auth/RegisterForm";
import ThemeToggle from "../components/ThemeToggle";

interface LoginProps {
  onLoginSubmit: (email: string, password: string) => Promise<boolean>;
  onRegisterSubmit: (
    name: string,
    email: string,
    password: string,
    role: "Admin" | "Store Manager" | "Faculty" | "Visiting Faculty",
    department: string,
    facultyType: "Permanent" | "Visiting" | "N/A",
    contractEndDate: string | null
  ) => Promise<boolean>;
  authLoading: boolean;
  authError: string | null;
}

export default function Login({
  onLoginSubmit,
  onRegisterSubmit,
  authLoading,
  authError,
}: LoginProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  const handleLoginSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput && passwordInput) {
      await onLoginSubmit(emailInput, passwordInput);
    }
  };

  const handleQuickLogin = (email: string) => {
    setEmailInput(email);
    setPasswordInput("password123");
    onLoginSubmit(email, "password123");
  };

  return (
    <div id="login-screen-root" className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 relative overflow-y-auto text-slate-100 transition-colors">
      {/* Top Bar Switcher on Login Page */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <ThemeToggle showLabel={true} />
      </div>

      {/* Dynamic Ambient Background Sparkles */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 login-ambient-bg">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* DIME-DENSE COMPACT CENTRAL HUB */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden relative z-10 animate-fade-in transition-all login-card">
        {/* BRAND HEADER RAIL */}
        <div className="bg-emerald-950/30 p-5 text-center space-y-2 border-b border-white/5 login-brand-header">
          <div className="h-11 w-11 bg-emerald-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center mx-auto text-emerald-400 login-brand-icon">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight uppercase text-white login-title">Automated Inventory Issuance & Tracking System</h1>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5 login-subtitle">International Islamic University Islamabad</p>
          </div>
        </div>

        {/* TIGHT SLICED MODE CHANNELS */}
        <div className="flex border-b border-white/5 bg-slate-950/30 p-1 login-tabs-rail">
          <button
            onClick={() => setIsRegisterMode(false)}
            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              !isRegisterMode ? "bg-emerald-600 font-black text-white shadow shadow-emerald-600/20" : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsRegisterMode(true)}
            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              isRegisterMode ? "bg-emerald-600 font-black text-white shadow shadow-emerald-600/20" : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>


        {authError && (
          <div className="mx-4 mt-3.5 p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs font-bold text-center">
            {authError}
          </div>
        )}

        {!isRegisterMode ? (
          <div className="p-5 space-y-4">
            {/* QUICK ONE-CLICK DEMO PROFILE SWITCHER */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-indigo-400" /> Instant Role Access
                </span>
                <span className="text-[9px] text-slate-500 font-mono">1-Click Launch</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("admin@iiui.edu")}
                  disabled={authLoading}
                  className="px-2.5 py-2 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/20 hover:border-indigo-400/40 rounded-lg text-left transition-all group cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-indigo-200 group-hover:text-white flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" /> Admin
                  </div>
                  <div className="text-[9px] text-slate-400 truncate mt-0.5">admin@iiui.edu</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("manager@iiui.edu")}
                  disabled={authLoading}
                  className="px-2.5 py-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/20 hover:border-emerald-400/40 rounded-lg text-left transition-all group cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-emerald-200 group-hover:text-white flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-400" /> Store Manager
                  </div>
                  <div className="text-[9px] text-slate-400 truncate mt-0.5">manager@iiui.edu</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("prof.sohail@iiui.edu")}
                  disabled={authLoading}
                  className="px-2.5 py-2 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/20 hover:border-amber-400/40 rounded-lg text-left transition-all group cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-amber-200 group-hover:text-white flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-amber-400" /> Visiting Faculty
                  </div>
                  <div className="text-[9px] text-slate-400 truncate mt-0.5">prof.sohail@iiui.edu</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("dr.tariq@iiui.edu")}
                  disabled={authLoading}
                  className="px-2.5 py-2 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/20 hover:border-cyan-400/40 rounded-lg text-left transition-all group cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-cyan-200 group-hover:text-white flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-cyan-400" /> Perm. Faculty
                  </div>
                  <div className="text-[9px] text-slate-400 truncate mt-0.5">dr.tariq@iiui.edu</div>
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-slate-900 px-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">or sign in manually</span>
              <div className="border-t border-white/10 w-full" />
            </div>

            <form onSubmit={handleLoginSubmitForm} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">University Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="name@iiui.edu"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/50 border border-white/10 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/50 border border-white/10 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800/50 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer shadow shadow-indigo-600/20"
              >
                {authLoading ? "Verifying Credentials..." : "Authenticate & Open Dashboard"}
              </button>
            </form>
          </div>
        ) : (
          <RegisterForm
            onRegisterSubmit={onRegisterSubmit}
            authLoading={authLoading}
            onSuccess={() => setIsRegisterMode(false)}
          />
        )}
      </div>
    </div>
  );
}
