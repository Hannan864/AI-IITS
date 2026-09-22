import React from "react";
import { BarChart3, RefreshCcw } from "lucide-react";
import GlassCard from "../GlassCard";

export interface AssetLifecycleRecord {
  id: string;
  assetName: string;
  category: string;
  assetTag: string;
  buyPrice: number;
  yearsElapsed: string;
  currentSimValue: number;
  totalIncidents: number;
  demandsReplacement: boolean;
  usageHistoryCount: number;
  depreciationPercent: number;
  history: Array<{
    userName?: string;
    issuedDate: string;
    actualReturnDate: string | null;
  }>;
}

interface AssetLifecycleIntelTabProps {
  computedLifecycles: AssetLifecycleRecord[];
  onRefresh?: () => void;
}

export default function AssetLifecycleIntelTab({
  computedLifecycles,
  onRefresh
}: AssetLifecycleIntelTabProps) {
  return (
    <div className="space-y-6" id="asset-lifecycle-intel-tab">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/20 p-4 border border-white/5 rounded-2xl">
        <div className="flex gap-2 items-center">
          <BarChart3 className="h-4.5 w-4.5 text-indigo-400" />
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">Asset Lifecycle Intelligence Desk</h4>
            <p className="text-[10.5px] text-slate-400 font-sans">Simulate depreciation profiles, evaluate physical wear, and audit hardware replacements.</p>
          </div>
        </div>
        
        <button 
          onClick={onRefresh}
          className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-405 rounded-xl px-3 py-2 flex items-center gap-1.5 cursor-pointer hover:bg-indigo-600 hover:text-white transition-all duration-155"
        >
          <RefreshCcw className="h-3 w-3" /> Refresh Asset Intelligence
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {computedLifecycles.slice(0, 10).map(lc => (
          <GlassCard key={lc.id} className="p-5 space-y-4" id={`lifecycle-card-${lc.id}`}>
            <div className="flex justify-between items-start gap-4 pb-2 border-b border-white/5">
              <div>
                <h5 className="font-extrabold text-xs text-slate-100">{lc.assetName}</h5>
                <p className="text-[10px] text-slate-400 font-mono font-semibold mt-0.5">Tag: {lc.assetTag} • Category: {lc.category}</p>
              </div>

              {lc.demandsReplacement ? (
                <span className="text-[8.5px] uppercase font-black px-2 py-0.5 rounded border border-rose-500/20 bg-rose-500/10 text-rose-400 animate-pulse select-none">
                  ⚠️ Replace Recommended
                </span>
              ) : (
                <span className="text-[8.5px] uppercase font-bold px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-550/10 text-emerald-450 select-none">
                  ✓ Optimal Status
                </span>
              )}
            </div>

            {/* Sub telemetry details simulation block */}
            <div className="grid grid-cols-2 gap-3 text-[11px] bg-slate-950/40 p-3 rounded-xl border border-white/5">
              <div>
                <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-mono">Purchase Cost:</span>
                <strong className="text-slate-300 font-mono font-bold">${lc.buyPrice} USD</strong>
              </div>
              <div>
                <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-mono">Residual Book Value:</span>
                <strong className="text-indigo-400 font-mono font-black">${lc.currentSimValue} USD</strong>
              </div>
              <div>
                <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-mono">Depreciation simulated:</span>
                <strong className="text-red-400 font-mono font-bold">-{lc.depreciationPercent}% ({lc.yearsElapsed} yrs old)</strong>
              </div>
              <div>
                <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-mono">Active Incidents logged:</span>
                <strong className="text-amber-400 font-mono font-bold">{lc.totalIncidents} Repairs Completed</strong>
              </div>
            </div>

            {/* Event usage history timeline slider */}
            <div className="space-y-2">
              <span className="text-[8.5px] uppercase font-bold tracking-widest text-slate-500 font-mono block">Timeline Custody tape ({lc.usageHistoryCount} allocations)</span>
              {lc.history.length > 0 ? (
                <div className="space-y-1.5 pl-2 border-l border-indigo-500/30">
                  {lc.history.map((h, idx) => (
                    <div key={idx} className="text-[10px] text-slate-400 flex justify-between items-center">
                      <span>👤 Assigned to: <strong>{h.userName || "Faculty Custodian"}</strong></span>
                      <span className="font-mono text-slate-500 text-[9px]">[{h.issuedDate} ~ {h.actualReturnDate ? "Returned" : "Active"}]</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[9.5px] text-slate-500 leading-normal italic font-sans">// No custody distribution logs logged against this unique tag.</p>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
