import React from "react";
import { ShieldAlert, AlertCircle, TrendingUp, Users, HeartCrack, HelpCircle, ArrowUpRight } from "lucide-react";
import { User, AssetIssuance, SmartAlert } from "../../types";
import GlassCard from "../GlassCard";

interface AdminRiskPanelProps {
  users: User[];
  issuances: AssetIssuance[];
  alerts: SmartAlert[];
}

export default function AdminRiskPanel({ users, issuances, alerts }: AdminRiskPanelProps) {
  // Compute flight risks on raw data to catch any new visiting assets dynamically
  const visitingFaculty = users.filter((u) => u.role === "Visiting Faculty" && u.contractEndDate);

  const dynamicRisks = visitingFaculty.map((user) => {
    const activeHolds = issuances.filter((iss) => iss.userId === user.id && iss.actualReturnDate === null);
    const outstandingCount = activeHolds.length;

    let daysRemaining = 999;
    if (user.contractEndDate) {
      const expiry = new Date(user.contractEndDate);
      const today = new Date();
      const diffTime = expiry.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // High risk flag is triggered when Visiting Faculty + contract end in <= 15 days + outstanding assets > 0
    const isHighRisk = daysRemaining <= 15 && outstandingCount > 0;
    const isCritical = daysRemaining <= 7 && outstandingCount > 0;

    return {
      ...user,
      daysRemaining,
      outstandingCount,
      isHighRisk,
      isCritical,
      riskLevel: isCritical ? "CRITICAL" : isHighRisk ? "HIGH" : daysRemaining <= 15 ? "MEDIUM" : "LOW",
    };
  }).filter((u) => u.riskLevel !== "LOW").sort((a, b) => b.outstandingCount - a.outstandingCount);

  // Compute total exposed assets
  const exposedCount = dynamicRisks.reduce((acc, r) => acc + r.outstandingCount, 0);

  return (
    <div className="space-y-6">
      {/* Top Warning banner exposure */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="border-l-2 border-l-rose-500 bg-rose-950/5 flex items-center gap-4">
          <div className="h-10 w-10 bg-rose-500/10 rounded-lg flex items-center justify-center text-rose-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold flex items-center gap-1">
              Exposed Assets
            </span>
            <h3 className="text-xl font-bold text-rose-400">{exposedCount} Holds</h3>
          </div>
        </GlassCard>

        <GlassCard className="border-l-2 border-l-amber-500 bg-amber-950/5 flex items-center gap-4">
          <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Exposure Index score</span>
            <h3 className="text-xl font-bold text-amber-400">
              {dynamicRisks.length > 0 ? `${Math.round((exposedCount / (issuances.length || 1)) * 100)}%` : "0% Safe"}
            </h3>
          </div>
        </GlassCard>

        <GlassCard className="border-l-2 border-l-indigo-500 bg-indigo-950/5 flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Active Watch accounts</span>
            <h3 className="text-xl font-bold text-slate-200">{dynamicRisks.length} Academic(s)</h3>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Main watchlist */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
            <AlertCircle className="h-4.5 w-4.5 text-rose-500" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">High Risk Contract Expiry List</h3>
          </div>

          <div className="space-y-3">
            {dynamicRisks.map((risk) => (
              <div 
                key={risk.id} 
                className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:border-white/20 ${
                  risk.riskLevel === "CRITICAL"
                    ? "bg-rose-950/20 border-rose-500/30 text-rose-200"
                    : "bg-amber-950/15 border-amber-500/20 text-amber-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl font-extrabold flex items-center justify-center text-xs shrink-0 border ${
                    risk.riskLevel === "CRITICAL"
                      ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                      : "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  }`}>
                    {risk.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-xs text-white">{risk.name}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase border ${
                        risk.riskLevel === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }`}>
                        {risk.riskLevel} Risk
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>{risk.email}</span>
                      <span>•</span>
                      <span className="text-indigo-300 font-bold">{risk.department}</span>
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-1 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                    Holds <strong className="text-white">{risk.outstandingCount}</strong> Hardware Item(s)
                  </span>
                  <span className="text-[11px] font-mono font-semibold block text-white bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                    Contract Ends: <strong className="text-rose-400">{risk.daysRemaining} days left</strong> ({risk.contractEndDate})
                  </span>
                </div>
              </div>
            ))}

            {dynamicRisks.length === 0 && (
              <div className="p-8 border border-dashed border-white/5 rounded-2xl text-center text-slate-500 text-xs py-10 font-bold uppercase tracking-wider">
                No high risk contract alerts active. All contracts are clear of borrowed items.
              </div>
            )}
          </div>
        </div>

        {/* Predictive scoring analytics panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
            <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Risk Predictor Engine</h3>
          </div>

          <GlassCard className="space-y-4 text-xs">
            <h4 className="font-bold text-slate-200 uppercase tracking-widest text-[9px] text-indigo-400">Exposure Profile Map</h4>
            
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Automatic Lockout Status</span>
                <span className="text-emerald-400 font-bold mt-1 block flex items-center gap-1.5 text-[10.5px]">
                  ✓ ACTIVE SHIELD (NDC auto block)
                </span>
                <span className="text-[9.5px] text-slate-400 mt-1 block font-medium">
                  The automated checking desk forbids clicking NDC clearance approvals if there are holds present.
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Notification Alerts Triggers</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block">
                  Visiting contracts with ≤ 15 days left dispatch daily automatic reminders to target custodians.
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
