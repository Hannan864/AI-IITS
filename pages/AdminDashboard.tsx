import React from "react";
import { Laptop, Users, CheckCircle2, AlertTriangle, Activity } from "lucide-react";
import GlassCard from "../components/GlassCard";
import StatusBadge from "../components/StatusBadge";
import { Asset, User, SmartAlert, AssetIssuance } from "../types";

interface AdminDashboardProps {
  assets: Asset[];
  issuances: AssetIssuance[];
  alerts: SmartAlert[];
  usersCount?: number;
  onNavigateToRisk: () => void;
}

export default function AdminDashboard({
  assets,
  issuances,
  alerts,
  usersCount = 5,
  onNavigateToRisk,
}: AdminDashboardProps) {
  const activeIssues = issuances.filter((i) => i.actualReturnDate === null);
  const damagedAssets = assets.filter((a) => a.condition === "Damaged" || a.status === "Damaged");

  return (
    <div className="space-y-6">
      {/* Top metrics dashboard bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard hoverable className="flex items-center gap-4 border-l-2 border-l-indigo-500">
          <div className="h-10 w-10 bg-indigo-505/10 rounded-lg flex items-center justify-center text-indigo-400">
            <Laptop className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Hardware</span>
            <h3 className="text-xl font-bold text-slate-100">{assets.length}</h3>
          </div>
        </GlassCard>

        <GlassCard hoverable className="flex items-center gap-4 border-l-2 border-l-emerald-500">
          <div className="h-10 w-10 bg-emerald-505/10 rounded-lg flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Issued Units</span>
            <h3 className="text-xl font-bold text-slate-100">{activeIssues.length}</h3>
          </div>
        </GlassCard>

        <GlassCard hoverable className="flex items-center gap-4 border-l-2 border-l-rose-500">
          <div className="h-10 w-10 bg-rose-505/10 rounded-lg flex items-center justify-center text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Defect / Repairs</span>
            <h3 className="text-xl font-bold text-slate-100">{damagedAssets.length}</h3>
          </div>
        </GlassCard>

        <GlassCard hoverable className="flex items-center gap-4 border-l-2 border-l-amber-500">
          <div className="h-10 w-10 bg-amber-505/10 rounded-lg flex items-center justify-center text-amber-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Secured Ledgers</span>
            <h3 className="text-xl font-bold text-slate-100">{usersCount} Account(s)</h3>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Critical Smart Alerts Highlight card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Expiring Contract Alerts</h4>
            <button
              onClick={onNavigateToRisk}
              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer uppercase tracking-wider"
            >
              Analyze Detail →
            </button>
          </div>

          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-400 animate-bounce" /> Smart Analysis
              </span>
              <span className="text-[10px] font-bold text-rose-400 uppercase bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                {alerts.length} High Risk
              </span>
            </div>

            {alerts.slice(0, 2).map((a) => (
              <div key={a.id} className="p-3 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-xl space-y-2 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-slate-200 text-xs">{a.userName}</h5>
                    <p className="text-[10.5px] text-slate-400 mt-0.5">{a.department}</p>
                  </div>
                  <span className="text-[10px] text-rose-400 font-bold font-mono">{a.daysRemaining} days left</span>
                </div>
                <p className="text-[10px] text-slate-300 italic font-medium leading-normal bg-rose-950/20 border border-rose-500/10 p-2.5 rounded-lg">
                  "{a.recommendation}"
                </p>
              </div>
            ))}

            {alerts.length === 0 && (
              <p className="text-center text-slate-500 text-[11px] py-6">
                All campus visit contract portfolios are secure or clear of assets.
              </p>
            )}
          </GlassCard>
        </div>

        {/* Audit Logs table summary */}
        <div className="lg:col-span-8 space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-400" /> Recent Ledgers & Operations Log
          </h4>

          <GlassCard className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11.5px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 uppercase text-[10px] font-bold">
                    <th className="px-5 py-3">Asset</th>
                    <th className="px-5 py-3">Faculty / Holder</th>
                    <th className="px-5 py-3">Issued Date</th>
                    <th className="px-5 py-3">Expected Return</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {issuances.slice(0, 4).map((iss) => (
                    <tr key={iss.id} className="hover:bg-white/[0.01]">
                      <td className="px-5 py-3 font-semibold text-slate-200">
                        <div>{iss.assetName}</div>
                        <span className="text-[9px] font-mono text-slate-500 block mt-0.5">{iss.assetTag}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-300">
                        <div>{iss.userName}</div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{iss.department}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-400 font-mono font-medium">{iss.issuedDate}</td>
                      <td className="px-5 py-3 text-slate-400 font-mono font-medium">{iss.returnDate}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={iss.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
