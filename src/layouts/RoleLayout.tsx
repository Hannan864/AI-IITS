import React from "react";
import { ShieldX } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { User } from "../types";

interface RoleLayoutProps {
  currentUser: User;
  allowedRoles: Array<"Admin" | "Store Manager" | "Faculty" | "Visiting Faculty">;
  children: React.ReactNode;
}

export default function RoleLayout({ currentUser, allowedRoles, children }: RoleLayoutProps) {
  const isAuthorized = allowedRoles.includes(currentUser.role as any);

  if (!isAuthorized) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-[#020617]">
        <GlassCard className="max-w-md text-center py-10 space-y-4 border-rose-500/20">
          <div className="h-12 w-12 bg-rose-500/10 border border-rose-500/25 rounded-xl flex items-center justify-center text-rose-400 mx-auto animate-pulse">
            <ShieldX className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest">Administrative Lock</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your security profile role <span className="font-semibold text-rose-400">"{currentUser.role}"</span> is not whitelisted for this operation desk.
            </p>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed pt-2.5 border-t border-white/5">
            Please sign in with an Administrator or Store Manager account to access this operational desk.
          </p>
        </GlassCard>
      </div>
    );
  }

  return <>{children}</>;
}
