import React from "react";
import { BellRing, Zap } from "lucide-react";
import { AssetIssuance } from "../../types";
import GlassCard from "../GlassCard";

export interface OverdueEscalation {
  iss: AssetIssuance;
  overdueDays: number;
  level: number;
  label: string;
  colorClass: string;
  actionPlan: string;
}

interface LogisticsEscalationTabProps {
  overdueEscalations: OverdueEscalation[];
}

export default function LogisticsEscalationTab({
  overdueEscalations
}: LogisticsEscalationTabProps) {
  return (
    <div className="space-y-6" id="logistics-escalation-tab">
      <div className="bg-slate-950/50 border border-white/5 p-4.5 rounded-2xl">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <BellRing className="h-4.5 w-4.5 text-indigo-400 animate-pulse" /> Overdue Items & Reminder Levels
        </h3>
        <p className="text-[11px] text-slate-400 mt-1">Actions taken based on how many days an item is overdue:</p>
        
        {/* Escalation Level Guides legend */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 text-[10.5px]">
          <div className="p-3 rounded-lg bg-sky-500/5 border border-sky-500/10">
            <strong className="text-sky-400 block mb-1">Level 1: 1 - 5 Days</strong>
            <span className="text-slate-400 leading-normal font-sans">Automated reminder email sent to the user.</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 border-dashed">
            <strong className="text-amber-500 block mb-1">Level 2: 6 - 15 Days</strong>
            <span className="text-slate-400 leading-normal font-sans">Store manager contacts the faculty member directly.</span>
          </div>
          <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
            <strong className="text-orange-500 block mb-1">Level 3: 16 - 30 Days</strong>
            <span className="text-slate-400 leading-normal font-sans">No-Dues Clearance is temporarily paused.</span>
          </div>
          <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
            <strong className="text-rose-500 block mb-1">Level 4: &gt; 30 Days</strong>
            <span className="text-slate-400 leading-normal font-sans">Account flagged for administrative review.</span>
          </div>
        </div>
      </div>

      {/* Active overstay list and level badges */}
      <div className="space-y-3">
        {overdueEscalations.map(esc => (
          <GlassCard 
            key={esc.iss.id} 
            className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/5 hover:border-indigo-500/20 duration-150"
            id={`escalation-row-${esc.iss.id}`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-xs text-slate-200">{esc.iss.assetName}</span>
                <span className="text-[10px] font-mono text-slate-400">[{esc.iss.assetTag}]</span>
                <span className={`text-[8.5px] uppercase font-black px-2 py-0.5 rounded border ${esc.colorClass}`}>
                  {esc.label}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 font-medium">
                Allocated to <span className="font-bold text-slate-200">{esc.iss.userName}</span> ({esc.iss.department}) • Overdue by <strong className="text-rose-400 font-mono font-bold">{esc.overdueDays} Days</strong>
              </p>
              <p className="text-[10.5px] text-indigo-400 font-bold flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-indigo-400 shrink-0" /> Governance action: {esc.actionPlan}
              </p>
            </div>

            <div className="shrink-0 text-left md:text-right text-[10px] font-mono">
              <span className="block text-slate-400">Issued On: {esc.iss.issuedDate}</span>
              <span className="block text-slate-500 font-bold mt-0.5">Deadline: {esc.iss.returnDate}</span>
            </div>
          </GlassCard>
        ))}

        {overdueEscalations.length === 0 && (
          <div className="p-10 text-center text-slate-500 text-xs py-14 border border-dashed border-white/5 rounded-2xl font-mono font-bold tracking-widest uppercase">
            // COMPLIANCE PERFECT: ZERO ACADEMICS CURRENTLY TRIGGER ESCALATION PROTOCOLS
          </div>
        )}
      </div>
    </div>
  );
}
