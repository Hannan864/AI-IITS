import React, { useState } from "react";
import { CheckCircle2, Layers3, Copy, Check, ExternalLink, ArrowRight, ShieldCheck, Clock, Sparkles } from "lucide-react";

export interface BindingRecord {
  qrId: string;
  assetId?: string;
  assetName: string;
  category?: string;
  serialNumber?: string;
  department?: string;
  timestamp: string;
}

interface AssetBindingFeedbackProps {
  recentBinding: BindingRecord | null;
  bindingHistory?: BindingRecord[];
  onBindAnother?: () => void;
}

export default function AssetBindingFeedback({
  recentBinding,
  bindingHistory = [],
  onBindAnother,
}: AssetBindingFeedbackProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-[#0b1227] border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl min-h-[420px] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Live Binding Ledger & Verification
          </h3>
        </div>
        {bindingHistory.length > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {bindingHistory.length} Bound This Session
          </span>
        )}
      </div>

      {recentBinding ? (
        <div className="flex-1 flex flex-col justify-between space-y-4">
          {/* Main Success Highlight Card */}
          <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border-2 border-emerald-500/40 rounded-xl p-4 text-center space-y-3 flex flex-col items-center shadow-lg shadow-emerald-950/40 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="h-3 w-3" /> Relational Link Verified
              </div>
              <h4 className="text-sm font-black text-white">Physical Binding Complete!</h4>
              <p className="text-[11px] text-slate-300 mt-1 max-w-xs leading-relaxed">
                Barcode tag is now permanently assigned to this hardware unit in the central database.
              </p>
            </div>

            {/* Spec breakdown */}
            <div className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-left space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10.5px]">QR Tag ID:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                    {recentBinding.qrId}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(recentBinding.qrId)}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 cursor-pointer"
                    title="Copy QR ID"
                  >
                    {copiedId === recentBinding.qrId ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10.5px]">Asset Name:</span>
                <span className="font-bold text-white truncate max-w-[180px]">{recentBinding.assetName}</span>
              </div>

              {recentBinding.serialNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10.5px]">Serial Number:</span>
                  <span className="font-mono text-slate-200">{recentBinding.serialNumber}</span>
                </div>
              )}

              {recentBinding.department && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10.5px]">Department:</span>
                  <span className="text-indigo-300 font-medium">{recentBinding.department}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                <span className="text-slate-500">Lock Timestamp:</span>
                <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {recentBinding.timestamp}
                </span>
              </div>
            </div>

            {onBindAnother && (
              <button
                type="button"
                onClick={onBindAnother}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md hover:shadow-indigo-500/20 flex items-center justify-center gap-1.5"
              >
                <span>Ready to Bind Another Item</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Session History Feed if multiple items bound */}
          {bindingHistory.length > 1 && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Previous Session Bindings ({bindingHistory.length})
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {bindingHistory.slice(1).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-slate-900/80 border border-white/5 rounded-lg flex items-center justify-between text-xs hover:border-white/20 transition-all"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-200 truncate text-[11px]">{item.assetName}</p>
                      <span className="font-mono text-[9.5px] text-amber-300/90">{item.qrId}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono shrink-0">{item.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
            <Layers3 className="h-8 w-8 stroke-[1.25]" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-300">Ready for Mapping Operation</p>
            <p className="text-[10.5px] text-slate-400 max-w-xs mt-1 leading-relaxed">
              Select an available QR tag and choose or register a hardware asset to commit the permanent relationship.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

