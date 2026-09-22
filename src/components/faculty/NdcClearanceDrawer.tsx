import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { NDCRequest, User } from "../../types";

interface NdcClearanceDrawerProps {
  currentUser: User;
  myActiveIssuancesCount: number;
  myNdcRequests: NDCRequest[];
  onRequestNDC: (userId: string, remarks: string) => Promise<boolean>;
}

export default function NdcClearanceDrawer({
  currentUser,
  myActiveIssuancesCount,
  myNdcRequests,
  onRequestNDC,
}: NdcClearanceDrawerProps) {
  const [ndcRemarks, setNdcRemarks] = useState("");
  const [ndcMsg, setNdcMsg] = useState("");

  const handleSubmitNdcRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onRequestNDC(currentUser.id, ndcRemarks);
    if (success) {
      setNdcMsg("Clearance request logged! Admin and store staff notified.");
      setNdcRemarks("");
      setTimeout(() => setNdcMsg(""), 3000);
    } else {
      setNdcMsg("Failed to log clearance request.");
      setTimeout(() => setNdcMsg(""), 3000);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-lg space-y-4 animate-fade-in">
      <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">No Dues Certificate (NDC) Clearance Drawer</h3>

      {/* NDC Form */}
      <form onSubmit={handleSubmitNdcRequest} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Reason for clearance</label>
          <div className="text-[10px] text-indigo-400 font-semibold flex items-center gap-0.5">
            <Sparkles className="h-3 w-3" /> Auto-audits outstanding inventory
          </div>
        </div>
        <input
          type="text"
          required
          placeholder="Remarks, e.g. Visiting assignment finished / Transferring to new department module"
          value={ndcRemarks}
          onChange={(e) => setNdcRemarks(e.target.value)}
          className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-500 outline-none font-semibold font-mono"
        />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[10px] text-slate-400 leading-normal max-w-sm font-sans">
            Submitting an NDC clearance lock prompts store managers to inspect your remaining holding laptop & laboratory assets.
          </p>
          <button
            type="submit"
            disabled={myActiveIssuancesCount > 0}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-white/5 disabled:text-slate-500 border border-indigo-500/20 text-white font-bold px-4 py-1.5 rounded-lg text-xs tracking-wide transition-all uppercase shrink-0 cursor-pointer"
          >
            Request NDC Clearance
          </button>
        </div>
        {myActiveIssuancesCount > 0 && (
          <p className="text-[10px] text-amber-300 font-medium bg-amber-500/10 p-2 rounded-md border border-amber-500/20 flex items-center gap-1 font-mono">
            ⚠️ Clearances cannot be requested while you hold outstanding assets. Please return your {myActiveIssuancesCount} device(s) first.
          </p>
        )}
        {ndcMsg && (
          <p className="text-xs text-center text-emerald-300 font-semibold bg-emerald-500/10 p-1.5 border border-emerald-500/20 rounded-md mt-2 font-mono">
            {ndcMsg}
          </p>
        )}
      </form>

      {/* Previous Requests list */}
      {myNdcRequests.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Clearance Log History</h4>
          <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-black/20 font-mono">
            {myNdcRequests.map((ndc) => (
              <div key={ndc.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-white/5">
                <div>
                  <div className="font-bold text-white">Department No Dues Log</div>
                  <div className="text-[10px] text-slate-400 max-w-xs mt-0.5 italic">
                    "{ndc.remarks}" • Issued On: {ndc.requestDate}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      ndc.status === "Approved"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/10"
                        : ndc.status === "Pending"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/10"
                        : "bg-red-500/20 text-red-300 border border-red-500/10"
                    }`}
                  >
                    {ndc.status}
                  </span>
                  {ndc.approvedBy && (
                    <span className="text-[10px] text-slate-400 font-semibold bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      Signed: {ndc.approvedBy}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
