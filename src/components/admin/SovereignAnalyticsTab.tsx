import React from "react";
import { 
  Building2, ShieldCheck, TrendingUp, AlertOctagon, Zap, Flame, Lock 
} from "lucide-react";
import GlassCard from "../GlassCard";

export interface DepartmentMetric {
  department: string;
  activeHoldsCount: number;
  totalDeptAssets: number;
  utilizationScore: number;
  overdues: number;
  density: "low" | "medium" | "high";
  facultyCount: number;
}

export interface IdleAsset {
  id: string;
  assetName: string;
  category: string;
  department: string;
  daysIdle: number;
}

export interface BottleneckUser {
  user: {
    id: string;
    name: string;
    email: string;
    department: string;
  };
  score: number;
  explanation: string;
}

export interface GlobalComplianceMetrics {
  avgScore: number;
  greenCount: number;
  yellowCount: number;
  redCount: number;
  recoveryRate: number;
  bottlenecks: BottleneckUser[];
}

interface SovereignAnalyticsTabProps {
  globalComplianceMetrics: GlobalComplianceMetrics;
  departmentMetrs: DepartmentMetric[];
  idleAssets: IdleAsset[];
}

export default function SovereignAnalyticsTab({
  globalComplianceMetrics,
  departmentMetrs,
  idleAssets
}: SovereignAnalyticsTabProps) {
  return (
    <div className="space-y-6" id="sovereign-analytics-tab">
      {/* Top KPI row of University Compliance status indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="border-l-2 border-l-emerald-500 bg-emerald-950/5 p-4 flex items-center gap-4" id="kpi-avg-score">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">University Score</span>
            <h3 className="text-xl font-black text-emerald-400">
              {globalComplianceMetrics.avgScore} <span className="text-xs text-slate-400 font-sans">/ 100</span>
            </h3>
          </div>
        </GlassCard>

        <GlassCard className="border-l-2 border-l-sky-500 bg-sky-950/5 p-4 flex items-center gap-4" id="kpi-recovery-rate">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/10">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Recovery Success</span>
            <h3 className="text-xl font-black text-sky-300">{globalComplianceMetrics.recoveryRate}%</h3>
          </div>
        </GlassCard>

        <GlassCard className="border-l-2 border-l-rose-500 bg-rose-950/5 p-4 flex items-center gap-4" id="kpi-bottlenecks">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/10">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Critical Bottlenecks</span>
            <h3 className="text-xl font-black text-rose-400">
              {globalComplianceMetrics.bottlenecks.length} <span className="text-[10px] text-slate-400 font-sans font-semibold">Active Holds</span>
            </h3>
          </div>
        </GlassCard>

        <GlassCard className="border-l-2 border-l-amber-500 bg-amber-950/5 p-4 flex items-center gap-4" id="kpi-watch-bands">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-550 border border-amber-500/10">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Staff Watch Bands</span>
            <h3 className="text-xs font-bold text-slate-300 flex flex-wrap gap-2 mt-1">
              <span className="text-emerald-400 font-bold">{globalComplianceMetrics.greenCount} Safe</span> • 
              <span className="text-amber-500 font-bold">{globalComplianceMetrics.yellowCount} Warning</span> • 
              <span className="text-rose-400 font-bold">{globalComplianceMetrics.redCount} Risk</span>
            </h3>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Workload Balance View */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-300 font-mono flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-400" /> Sector Demands Heatmap & Balancing Scorecard
            </span>
            <span className="text-[9px] font-mono text-slate-500 uppercase">Live calculations (IIUI Campus)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {departmentMetrs.map(dm => (
              <div 
                key={dm.department} 
                className="p-4 bg-white/[0.01] border border-white/5 hover:border-indigo-500/20 duration-150 rounded-2xl flex flex-col justify-between"
                id={`dept-card-${dm.department.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-black text-slate-200 uppercase truncate max-w-[80%]">{dm.department}</h4>
                    <span className={`h-2 w-2 rounded-full ${dm.density === "high" ? "bg-red-500 animate-pulse shadow-md shadow-red-500" : dm.density === "medium" ? "bg-amber-500" : "bg-emerald-500"}`} />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">{dm.facultyCount} Active Academic Staff Allocated</p>
                </div>

                <div className="space-y-2 mt-4">
                  {/* Efficiency Score utilization dynamic bar */}
                  <div>
                    <div className="flex justify-between text-[10px] font-mono mb-1">
                      <span className="text-slate-400">Inventory Allocation Rate:</span>
                      <span className="font-extrabold text-white">{dm.utilizationScore}% Used</span>
                    </div>
                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden p-[1px] border border-white/5">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${dm.utilizationScore}%` }} />
                    </div>
                  </div>

                  {/* Overdues / Active Holds badges */}
                  <div className="flex justify-between items-center pt-1 text-[10px]">
                    <span className="text-slate-500 font-mono">Current holds: <strong>{dm.activeHoldsCount}</strong> / {dm.totalDeptAssets}</span>
                    {dm.overdues > 0 ? (
                      <span className="text-[9px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/25 px-1.5 py-0.5 rounded uppercase">
                        ⚠️ {dm.overdues} Overdue Hold(s)
                      </span>
                    ) : (
                      <span className="text-[8.5px] font-bold text-emerald-400 uppercase bg-emerald-555/10 px-1.5 py-0.5 rounded border border-emerald-500/15">
                        ✓ Zero Overdues
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Idle Asset detection Desk */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-300 font-mono flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-400" /> Idle Asset Detection Engine
            </span>
            <span className="text-[8.5px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.2 rounded font-black font-mono">
              {idleAssets.length} Flagged Unused
            </span>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto">
            {idleAssets.map(asset => (
              <div key={asset.id} className="p-3 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 rounded-xl duration-150 flex justify-between items-center" id={`idle-asset-${asset.id}`}>
                <div>
                  <h5 className="font-extrabold text-xs text-slate-200">{asset.assetName}</h5>
                  <p className="text-[10px] text-indigo-400 font-bold mt-1 uppercase font-mono">{asset.category} • {asset.department}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold font-mono text-orange-400 bg-orange-500/10 px-2 py-1 rounded block uppercase">
                    {asset.daysIdle} Days Idle
                  </span>
                </div>
              </div>
            ))}

            {idleAssets.length === 0 && (
              <div className="p-8 border border-dashed border-white/5 rounded-2xl text-center text-slate-500 text-xs py-10 font-bold uppercase tracking-wider">
                All inventory currently has immediate high turnover / zero long idle states!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending clearout bottlenecks */}
      <div className="space-y-4">
        <span className="text-[10px] uppercase tracking-widest font-mono font-black text-slate-300 flex items-center gap-1.5 border-b border-white/5 pb-2">
          <Lock className="h-4.5 w-4.5 text-rose-500 shrink-0" /> Dynamic Exit Clearance Block list & Bottleneck Accounts
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {globalComplianceMetrics.bottlenecks.map(b => (
            <div key={b.user.id} className="p-4 rounded-2xl bg-rose-950/10 border border-rose-500/20 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center" id={`bottleneck-${b.user.id}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-100">{b.user.name}</span>
                  <span className="text-[8.5px] px-1.5 py-0.1 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded font-bold font-mono uppercase">NDC LOCKED</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{b.user.email} • {b.user.department}</p>
                <p className="text-[10.5px] text-slate-300 font-medium leading-relaxed italic mt-1.5">"{b.explanation}"</p>
              </div>
              <div className="shrink-0 text-left md:text-right">
                <span className="text-xl font-black text-rose-400 font-mono">{b.score}%</span>
                <span className="block text-[8px] text-slate-500 uppercase tracking-wider font-mono">Compliance rating</span>
              </div>
            </div>
          ))}

          {globalComplianceMetrics.bottlenecks.length === 0 && (
            <p className="text-slate-500 italic text-[11px] py-4 col-span-2 text-center border border-dashed border-white/5 rounded-2xl w-full">
              // No active Non-Device Clearance (NDC) block bottlenecks logged at the clearance desk.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
