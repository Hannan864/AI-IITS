import React from "react";
import { Laptop, AlertTriangle, User, Check, RotateCcw, ArrowUpRight } from "lucide-react";

interface ScannerExtractedSpecsProps {
  isScanning: boolean;
  errorMsg: string;
  scannedResult: any;
  scannedCondition: string;
  onScannedConditionChange: (v: string) => void;
  onQuickReturn: (assetId: string, condition: string) => void;
  onQuickIssue: (assetId: string) => void;
  onClose: () => void;
  onLookupRefetch: (tag: string) => void;
}

export default function ScannerExtractedSpecs({
  isScanning,
  errorMsg,
  scannedResult,
  scannedCondition,
  onScannedConditionChange,
  onQuickReturn,
  onQuickIssue,
  onClose,
  onLookupRefetch,
}: ScannerExtractedSpecsProps) {
  return (
    <div className="lg:col-span-6 flex flex-col justify-between bg-slate-950/45 border border-white/5 rounded-2xl p-6 backdrop-blur-xl relative animate-fade-in">
      <div className="space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-3">
          OPTICALLY EXTRACTED DATA SUMMARY:
        </h3>

        {errorMsg && (
          <div className="rounded-xl bg-red-950/30 border border-red-500/20 p-4 flex gap-3 text-xs leading-relaxed font-sans">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-red-200 block">Decoder Error:</span>
              <span className="text-red-300 font-medium">{errorMsg}</span>
            </div>
          </div>
        )}

        {scannedResult ? (
          <div className="space-y-4 animate-fade-in text-xs">
            {/* Main Product metadata header */}
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Laptop className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">{scannedResult.asset?.assetName}</h4>
                <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                  <span className="font-mono text-[10px] bg-slate-900 border border-white/5 px-2 py-0.5 rounded text-slate-400">
                    TAG: {scannedResult.asset?.assetTag}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      scannedResult.asset?.status === "Available"
                        ? "bg-emerald-500/12 text-emerald-400 border-emerald-500/20"
                        : scannedResult.asset?.status === "Issued"
                        ? "bg-blue-500/12 text-blue-400 border-blue-500/20"
                        : "bg-red-500/12 text-red-400 border-red-500/20"
                    }`}
                  >
                    ● {scannedResult.asset?.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Grid matrix specifications list */}
            <div className="rounded-xl bg-slate-900/60 p-4 border border-white/5 space-y-3.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Department Allocation:</span>
                <span className="font-bold text-slate-200 font-sans">{scannedResult.asset?.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Core Category:</span>
                <span className="font-bold text-slate-200 font-sans">{scannedResult.asset?.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Wear condition:</span>
                <span className="font-bold text-indigo-405 font-sans">{scannedResult.asset?.condition}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Serial S/N:</span>
                <span className="font-mono font-bold text-slate-350">{scannedResult.asset?.serialNumber}</span>
              </div>

              {scannedResult.owner ? (
                <div className="border-t border-white/5 pt-3.5 mt-2 space-y-3 font-sans">
                  <div className="flex items-center justify-between font-semibold text-xs">
                    <span className="text-indigo-400 flex items-center gap-1">
                      <User className="h-3.5 w-3.5" /> Allocated custodian:
                    </span>
                    <span className="text-slate-100 font-bold">{scannedResult.owner.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="font-sans">Corporate email:</span>
                    <span>{scannedResult.owner.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="font-sans">Issued timestamp:</span>
                    <span>{scannedResult.issuance?.issuedDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="font-sans">Expected returning:</span>
                    <span className="font-mono text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                      {scannedResult.issuance?.returnDate}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="border-t border-white/5 pt-3.5 mt-2 flex items-center gap-1.5 text-emerald-400 font-bold text-[11.5px] leading-relaxed font-sans">
                  <Check className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                  Free asset: Ready for assignment to visiting regular personnel.
                </div>
              )}
            </div>
          </div>
        ) : (
          !isScanning && (
            <div className="text-center py-16 space-y-3.5">
              <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
                No decrypted output found. Choose a test carrier code tag or file manual RFID number on the left panel to execute.
              </p>
            </div>
          )
        )}
      </div>

      {/* INTERACTIVE ACTIONS CHEVRONS TRAY */}
      {scannedResult && !isScanning && (
        <div className="border-t border-white/5 pt-4 mt-6">
          {scannedResult.asset?.status === "Issued" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Verify wear state:
                </label>
                <select
                  value={scannedCondition}
                  onChange={(e) => onScannedConditionChange(e.target.value)}
                  className="rounded-lg border border-white/10 bg-slate-900 py-1.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                >
                  <option value="New">Perfect Box</option>
                  <option value="Good">Good/Refurbished</option>
                  <option value="Fair">Fair Wear</option>
                  <option value="Damaged">Damaged Faulty</option>
                </select>
              </div>
              <button
                onClick={() => {
                  onQuickReturn(scannedResult.asset.id, scannedCondition);
                  setTimeout(() => onLookupRefetch(scannedResult.asset.assetTag), 500);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <RotateCcw className="h-4 w-4" />
                Accept Safe Return Hand-back
              </button>
            </div>
          ) : scannedResult.asset?.status === "Available" ? (
            <button
              onClick={() => {
                onClose();
                onQuickIssue(scannedResult.asset.id);
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <ArrowUpRight className="h-4 w-4" />
              Issue to Visiting Regular Staff
            </button>
          ) : (
            <div className="text-xs text-red-400 font-bold tracking-wide p-3.5 rounded-lg bg-red-950/20 border border-red-500/10 flex items-center justify-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-red-400 shrink-0" />
              Item is status-locked ({scannedResult.asset?.status}) and cannot checkout.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
