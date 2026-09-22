import React from "react";
import { CalendarClock, BadgeCheck } from "lucide-react";

interface TimelineOverdueWarningsProps {
  overdues: any[];
  handleForceReturn: (item: any) => void;
}

export default function TimelineOverdueWarnings({ overdues, handleForceReturn }: TimelineOverdueWarningsProps) {
  return (
    <div className="bg-[#0b1227] border border-white/5 rounded-2xl p-5 shadow-xl space-y-3.5">
      <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest flex items-center gap-2 pb-2.5 border-b border-white/5">
        <CalendarClock className="h-4.5 w-4.5 text-rose-500" /> TIMELINE OVERDUE WARNINGS
      </h3>

      <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
        {overdues.map((item, idx) => (
          <div key={idx} className="bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/15 rounded-xl p-3.5 space-y-2.5 transition-all text-left animate-fade-in">
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0">
                <span className="font-mono text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded leading-none block w-max">
                  OVERDUE {item.daysOverdue} DAYS
                </span>
                <h4 className="text-white font-bold text-xs truncate mt-1.5 leading-tight">{item.assetName}</h4>
                <span className="text-[9.5px] text-slate-505 block mt-0.5 font-mono">{item.assetTag}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10.5px] border-t border-rose-500/10 pt-2 text-slate-400">
              <div>
                <span className="text-[9px] text-slate-600 uppercase block">Holder Acc</span>
                <span className="text-slate-350 truncate block max-w-[120px]" title={item.issuedBy}>{item.issuedBy || "Faculty Member"}</span>
              </div>
              <button
                onClick={() => handleForceReturn(item)}
                className="h-6.5 px-2.5 bg-rose-500 hover:bg-rose-650 hover:text-white text-white text-[9.5px] font-extrabold uppercase rounded transition-colors cursor-pointer"
              >
                Override Check-In
              </button>
            </div>
          </div>
        ))}

        {overdues.length === 0 && (
          <div className="py-12 text-center text-slate-550 italic text-[11px] flex flex-col items-center justify-center gap-2">
            <BadgeCheck className="h-9 w-9 text-emerald-505 stroke-[1.5]" />
            Zero system return overdue alarms detected. Pure logistical compliance.
          </div>
        )}
      </div>
    </div>
  );
}
