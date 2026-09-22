import React from "react";
import { Scan, QrCode, CheckCircle2 } from "lucide-react";
import { Asset } from "../../types";

interface ScannerViewportHUDProps {
  assets: Asset[];
  isScanning: boolean;
  selectedTag: string;
  typedTag: string;
  onTypedTagChange: (v: string) => void;
  onManualScan: (e: React.FormEvent) => void;
  onSelectAssetFromDropdown: (tag: string) => void;
  scannedResult: any;
}

export default function ScannerViewportHUD({
  assets,
  isScanning,
  selectedTag,
  typedTag,
  onTypedTagChange,
  onManualScan,
  onSelectAssetFromDropdown,
  scannedResult,
}: ScannerViewportHUDProps) {
  return (
    <div className="lg:col-span-6 flex flex-col justify-between bg-slate-900/40 border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl animate-fade-in">
      {/* Cyber Framing Corner Borders */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-500 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-500 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-500 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-505 rounded-br-lg" />

      {/* ACTIVE VIEWPORT FRAME */}
      <div className="h-64 rounded-xl border border-dashed border-indigo-500/30 relative overflow-hidden flex flex-col items-center justify-center bg-black/60 shadow-inner">
        {/* Red Scanned Laser Sweep Line */}
        {isScanning && (
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute top-0 animate-[bounce_1.5s_infinite] shadow-md shadow-emerald-500" />
        )}

        {/* Simulated crosshairs HUD */}
        <div className="absolute inset-8 border border-white/5 pointer-events-none rounded-lg flex items-center justify-center">
          <div className="h-6 w-6 border-t-2 border-l-2 border-white/20 absolute top-0 left-0" />
          <div className="h-6 w-6 border-t-2 border-r-2 border-white/20 absolute top-0 right-0" />
          <div className="h-6 w-6 border-b-2 border-l-2 border-white/20 absolute bottom-0 left-0" />
          <div className="h-6 w-6 border-b-2 border-r-2 border-white/20 absolute bottom-0 right-0" />
          <div className="h-0.5 w-6 bg-indigo-500/30" />
          <div className="w-0.5 h-6 bg-indigo-500/30 absolute" />
        </div>

        {/* Central Decoded State Text */}
        <div className="text-center z-10 px-4">
          {isScanning ? (
            <div className="space-y-3">
              <div className="h-8 w-8 border-2 border-t-emerald-400 border-r-transparent border-b-emerald-400 border-l-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-emerald-400 tracking-wider font-bold">DECODING SCAN PATTERNS...</p>
            </div>
          ) : scannedResult ? (
            <div className="space-y-2 animate-fade-in">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto animate-pulse" />
              <p className="text-sm font-mono font-bold text-slate-150">{scannedResult.asset?.assetTag}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="text-xs font-mono text-slate-400 animate-pulse">OPTICAL CAMERA ENGINE STANDBY</p>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">
                Choose tag or type code below to fire
              </span>
            </div>
          )}
        </div>
      </div>

      {/* SIMULATED TAG SELECTOR TRAY */}
      <div className="mt-6 space-y-4 font-mono">
        <div>
          <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5 font-sans">
            Simulation Test Carrier:
          </label>
          <select
            value={selectedTag}
            onChange={(e) => onSelectAssetFromDropdown(e.target.value)}
            className="w-full rounded-lg bg-slate-950/80 border border-white/10 py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
          >
            <option value="" className="text-slate-900 font-sans">
              -- Click to pick pre-seeded Tag --
            </option>
            {assets.map((a) => (
              <option key={a.id} value={a.assetTag} className="text-slate-900 font-semibold text-xs font-sans">
                [{a.assetTag}] - {a.assetName} ({a.status})
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex items-center">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-3 text-[9px] text-slate-500 font-bold tracking-wider uppercase font-sans">
            OR TYPE TAG
          </span>
          <div className="flex-grow border border-white/2"></div>
        </div>

        <form onSubmit={onManualScan} className="flex gap-2">
          <input
            type="text"
            placeholder="Tag code (e.g. QR-000002)"
            value={typedTag}
            onChange={(e) => onTypedTagChange(e.target.value)}
            className="flex-1 rounded-lg bg-slate-950/80 border border-white/10 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-mono font-bold outline-none"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-sm font-sans"
          >
            <Scan className="h-3.5 w-3.5" />
            Fire Laser
          </button>
        </form>
      </div>
    </div>
  );
}
