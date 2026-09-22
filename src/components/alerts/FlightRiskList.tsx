import React from "react";
import { Calendar } from "lucide-react";
import { SmartAlert } from "../../types";

interface FlightRiskListProps {
  alerts: SmartAlert[];
  selectedAlertId: string | null;
  onSelectAlertId: (id: string) => void;
}

export default function FlightRiskList({
  alerts,
  selectedAlertId,
  onSelectAlertId,
}: FlightRiskListProps) {
  return (
    <div className="lg:col-span-5 space-y-3.5">
      <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Members With Expiring Contracts</h3>
      <div className="space-y-3">
        {alerts.map((al) => {
          const isSelected = al.id === selectedAlertId;
          return (
            <button
              key={al.id}
              onClick={() => onSelectAlertId(al.id)}
              className={`w-full text-left rounded-xl border p-4 transition-all focus:outline-none flex flex-col gap-2.5 cursor-pointer ${
                isSelected
                  ? "bg-indigo-600/20 border-indigo-500/80 shadow-lg shadow-indigo-550/10 ring-1 ring-indigo-500/35"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 shadow-xs"
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <div>
                  <h4 className="text-sm font-bold text-white">{al.userName}</h4>
                  <p className="text-xs text-slate-400">
                    {al.department} • {al.facultyType}
                  </p>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                    al.riskLevel === "High"
                      ? "bg-red-500/20 text-red-300 border border-red-500/20"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/20"
                  }`}
                >
                  {al.riskLevel} Risk
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-300 bg-black/20 p-2 rounded-lg border border-white/5">
                <div className="flex items-center gap-1 font-semibold">
                  <Calendar className="h-3 w-3 text-indigo-400" />
                  Expires: {al.contractEndDate}
                </div>
                <div className="font-bold text-indigo-400">
                  {al.daysRemaining < 0
                    ? `${Math.abs(al.daysRemaining)} Days Expired`
                    : `${al.daysRemaining} Days Left`}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Outstanding Assets:</span>
                <span className="font-bold bg-amber-500/15 text-amber-300 border border-amber-500/20 rounded-md px-2 py-0.5">
                  {al.outstandingCount} Units
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
