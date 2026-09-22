import React from "react";
import { AlertOctagon, Search } from "lucide-react";

interface TelemetryDisplayPanelProps {
  scanResult: any;
}

export default function TelemetryDisplayPanel({ scanResult }: TelemetryDisplayPanelProps) {
  return (
    <div className="bg-[#0b1227] border border-[#223366]/40 rounded-2xl p-5 space-y-4 shadow-xl min-h-[350px] flex flex-col justify-between">
      <h3 className="text-xs font-black text-white uppercase tracking-widest pb-2 border-b border-white/5">
        📟 SCANNED ASSET DETAILS
      </h3>

      {scanResult ? (
        <div className="flex-1 space-y-4 py-2 animate-fade-in text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#0c1630]/60 p-4 rounded-xl border border-indigo-500/10">
            <div>
              <span className="text-[9px] uppercase font-bold text-indigo-400">Scanned Tag Match</span>
              <h4 className="text-sm font-black font-mono text-white select-all">{scanResult.record.id}</h4>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 text-[9px] bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded font-black uppercase">
                Code State: {scanResult.record.status}
              </span>
            </div>
          </div>

          {scanResult.asset ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="bg-black/30 p-3 rounded-lg border border-white/5 space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-550 font-bold block">Asset Name</span>
                <p className="text-white font-extrabold">{scanResult.asset.assetName}</p>
              </div>

              <div className="bg-black/30 p-3 rounded-lg border border-white/5 space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-550 font-bold block">Category Portfolio</span>
                <p className="text-white font-extrabold">{scanResult.asset.category}</p>
              </div>

              <div className="bg-black/30 p-3 rounded-lg border border-white/5 space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-550 font-bold block">Physical S/N Code</span>
                <p className="text-white font-extrabold font-mono">{scanResult.asset.serialNumber}</p>
              </div>

              <div className="bg-black/30 p-3 rounded-lg border border-white/5 space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-550 font-bold block">Department Pool</span>
                <p className="text-white font-extrabold">{scanResult.asset.department}</p>
              </div>

              <div className="bg-black/30 p-3 rounded-lg border border-white/5 space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-550 font-bold block">State Condition Badge</span>
                <span className={`px-2 py-0.5 text-[8.5px] rounded font-black uppercase inline-block mt-1 ${
                  scanResult.asset.condition === "New" ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20" :
                  scanResult.asset.condition === "Good" ? "bg-cyan-500/10 text-cyan-405 border border-cyan-500/20" :
                  scanResult.asset.condition === "Fair" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" :
                  "bg-rose-500/10 text-rose-450 border border-rose-500/20"
                }`}>
                  {scanResult.asset.condition}
                </span>
              </div>

              <div className="bg-black/30 p-3 rounded-lg border border-white/5 space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-550 font-bold block">Logistics Status</span>
                <span className={`px-2 py-0.5 text-[8.5px] rounded font-black uppercase inline-block mt-1 ${
                  scanResult.asset.status === "Available" ? "bg-emerald-500/15 text-emerald-400" :
                  scanResult.asset.status === "Issued" ? "bg-amber-500/15 text-amber-500 animate-pulse" :
                  "bg-slate-700/20 text-slate-400"
                }`}>
                  {scanResult.asset.status}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-xs text-slate-350">
              <AlertOctagon className="h-5 w-5 text-amber-505 shrink-0" />
              <div className="min-w-0">
                <span className="font-bold text-white uppercase block text-[10px]">Unbound QR Tag Record Captured</span>
                <span className="block mt-0.5 text-slate-400 leading-relaxed">
                  This QR tag is valid in the university registry but has not yet been bound to an equipment item. Proceed to the Asset Binding Desk to associate it.
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-650 italic select-none py-12">
          <Search className="h-10 w-10 text-slate-800 animate-pulse mb-2" />
          <p className="text-xs font-bold text-slate-400">Waiting For Scan Trigger</p>
          <p className="text-[10px] mt-1 text-slate-500 max-w-[280px] leading-relaxed">
            Ready to trace. Click "Fire Simulation Beep" to perform sub-compliance checks.
          </p>
        </div>
      )}
    </div>
  );
}
