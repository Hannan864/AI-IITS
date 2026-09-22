import React from "react";
import { Laptop, CheckCircle2, AlertTriangle, ShieldCheck, PieChart, Activity } from "lucide-react";
import { Asset, AssetIssuance } from "../../types";
import GlassCard from "../GlassCard";

interface AdminKPICardsProps {
  assets: Asset[];
  issuances: AssetIssuance[];
}

export default function AdminKPICards({ assets, issuances }: AdminKPICardsProps) {
  const activeIssues = issuances.filter((i) => i.actualReturnDate === null);
  const available = assets.filter((a) => a.status === "Available").length;
  const damaged = assets.filter((a) => a.status === "Damaged" || a.condition === "Damaged").length;
  const retired = assets.filter((a) => a.status === "Retired" || a.condition === "Repairing").length;

  // Department-wise distribution computing
  const deptCounts: { [key: string]: number } = {};
  assets.forEach((a) => {
    const dept = a.department || "General Store";
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });

  const totalAssets = assets.length || 1;
  const deptData = Object.entries(deptCounts).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / totalAssets) * 100),
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard hoverable className="flex items-center gap-4 border-l-2 border-l-indigo-500">
          <div className="h-10 w-10 bg-indigo-505/10 rounded-lg flex items-center justify-center text-indigo-400">
            <Laptop className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Total Core Assets</span>
            <h3 className="text-xl font-black text-slate-100">{assets.length}</h3>
          </div>
        </GlassCard>

        <GlassCard hoverable className="flex items-center gap-4 border-l-2 border-l-emerald-500">
          <div className="h-10 w-10 bg-emerald-550/10 rounded-lg flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">In-faculty Allocation</span>
            <h3 className="text-xl font-black text-slate-100">{activeIssues.length}</h3>
          </div>
        </GlassCard>

        <GlassCard hoverable className="flex items-center gap-4 border-l-2 border-l-rose-500">
          <div className="h-10 w-10 bg-rose-550/10 rounded-lg flex items-center justify-center text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Critical Defect Reps</span>
            <h3 className="text-xl font-black text-slate-100">{damaged}</h3>
          </div>
        </GlassCard>

        <GlassCard hoverable className="flex items-center gap-4 border-l-2 border-l-amber-500">
          <div className="h-10 w-10 bg-amber-550/10 rounded-lg flex items-center justify-center text-amber-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Buffer Stock Available</span>
            <h3 className="text-xl font-black text-slate-100">{available} Units</h3>
          </div>
        </GlassCard>
      </div>

      {/* Grid: Heatmap Distribution and Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Heatmap/Bar chart lists */}
        <GlassCard className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
            <PieChart className="h-4.5 w-4.5 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Sector Deployment Distribution</h3>
          </div>

          <div className="space-y-4">
            {deptData.map((d, index) => (
              <div key={d.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">{d.name}</span>
                  <span className="text-[11px] font-mono font-extrabold text-indigo-300">{d.count} Units ({d.percentage}%)</span>
                </div>
                <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full rounded-full ${
                      index % 3 === 0 
                        ? "bg-indigo-500" 
                        : index % 3 === 1 
                        ? "bg-emerald-500" 
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${d.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Timeline Timeline status of Assets */}
        <GlassCard className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
            <Activity className="h-4.5 w-4.5 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Institutional Lifecycle Log</h3>
          </div>

          <div className="relative border-l border-white/5 pl-5 ml-2.5 space-y-5 py-2">
            <div className="relative">
              <span className="absolute -left-[25px] top-0.5 h-3 w-3 rounded-full bg-indigo-500 ring-4 ring-indigo-500/10" />
              <div className="text-xs">
                <span className="font-extrabold text-slate-200">Procurement & Sourcing Phase</span>
                <p className="text-[10.5px] text-slate-400 mt-0.5 mt-1 leading-normal">
                  All equipment tags pass through double-verification register matching upon arrival from vendors.
                </p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-[25px] top-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" />
              <div className="text-xs">
                <span className="font-extrabold text-slate-200">Active Service Allocation</span>
                <p className="text-[10.5px] text-slate-400 mt-1 leading-normal">
                  Barcode scanner validation syncs current custodians in real-time. Lockout rules apply for warning stages.
                </p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-[25px] top-0.5 h-3 w-3 rounded-full bg-amber-500 ring-4 ring-amber-500/10" />
              <div className="text-xs">
                <span className="font-extrabold text-slate-200">Condition Tracking & Maintenance</span>
                <p className="text-[10.5px] text-slate-400 mt-1 leading-normal">
                  Annual inspect-checks audit units for defects, triggering depreciation tracking or handback return receipts.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
