import React, { useState } from "react";
import { FolderCheck, Check, X, ShieldAlert, FileText, Calendar, HelpCircle, AlertCircle } from "lucide-react";
import { NDCRequest, AssetIssuance, User } from "../../types";
import GlassCard from "../GlassCard";
import ActionButton from "../ActionButton";

interface NDCControlEngineProps {
  ndcRequests: NDCRequest[];
  issuances: AssetIssuance[];
  users: User[];
  onApproveNDC: (requestId: string, status: "Approved" | "Rejected", approvedBy: string) => Promise<boolean>;
  currentUser: User;
}

export default function NDCControlEngine({
  ndcRequests,
  issuances,
  users,
  onApproveNDC,
  currentUser,
}: NDCControlEngineProps) {
  const [filter, setFilter] = useState<"Pending" | "Approved" | "Rejected" | "all">("Pending");
  const [justification, setJustification] = useState<{ [key: string]: string }>({});
  const [loadingMap, setLoadingMap] = useState<{ [key: string]: boolean }>({});

  const handleDecision = async (reqId: string, status: "Approved" | "Rejected") => {
    setLoadingMap((prev) => ({ ...prev, [reqId]: true }));
    const approvedByAndNote = `${currentUser.name} (${justification[reqId] || "Verified inventory logs cleared"})`;
    try {
      await onApproveNDC(reqId, status, approvedByAndNote);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [reqId]: false }));
    }
  };

  const filteredRequests = ndcRequests.filter((req) => filter === "all" || req.status === filter);

  return (
    <div className="space-y-4">
      {/* Top filter control desk bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/35 border border-white/5 p-4 rounded-2xl">
        <div className="flex gap-2.5 items-center">
          <FolderCheck className="h-5 w-5 text-indigo-400" />
          <div>
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-widest">No Demand Certificate (NDC) Control Engine</h2>
            <p className="text-[10.5px] text-slate-400 font-medium">Auto-crosscheck outstanding assets and enforce secure departmental lockouts</p>
          </div>
        </div>

        {/* Tab category selectors */}
        <div className="flex border border-white/10 bg-slate-950 p-1 rounded-xl">
          {(["Pending", "Approved", "Rejected", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${
                filter === t ? "bg-indigo-650 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              {t} {t === "Pending" ? `(${ndcRequests.filter((r) => r.status === "Pending").length})` : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Grid listing clearances cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRequests.map((req) => {
          // Calculate if this user currently has outstanding deployments that prevent approval
          const userHolds = issuances.filter((i) => i.userId === req.userId && i.actualReturnDate === null);
          const blockApproval = userHolds.length > 0;
          const userObj = users.find((u) => u.id === req.userId);

          return (
            <GlassCard key={req.id} className="p-5 space-y-4 border border-white/5 flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-black text-slate-100">{req.userName || userObj?.name || "Academic Candidate"}</h3>
                    <p className="text-[10px] text-slate-400 mt-1">{req.userEmail || userObj?.email}</p>
                    <p className="text-[9.5px] text-indigo-400 font-bold uppercase mt-1">{req.department || userObj?.department}</p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      req.status === "Pending"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/10"
                        : req.status === "Approved"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                {/* Outstanding items block indicators */}
                {blockApproval ? (
                  <div className="p-3 bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl space-y-2">
                    <div className="flex gap-1.5 items-center text-[10.5px] font-extrabold uppercase text-rose-400">
                      <ShieldAlert className="h-4 w-4 animate-pulse shrink-0" /> ELIGIBILITY CHECK: LOCKED
                    </div>
                    <p className="text-[10px] text-slate-300 leading-normal font-medium">
                      Blocked by security protocol: The user currently has {userHolds.length} items on hold. Approval is disabled.
                    </p>
                    <div className="text-[10.5px] font-mono text-rose-300 bg-slate-950/40 p-2 rounded-lg border border-white/5 space-y-1">
                      {userHolds.slice(0, 3).map((hold) => (
                        <div key={hold.id} className="truncate">
                          • {hold.assetName} ({hold.assetTag})
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-950/15 border border-emerald-500/20 text-emerald-300 rounded-xl space-y-1">
                    <div className="flex gap-1.5 items-center text-[10.5px] font-extrabold uppercase text-emerald-400">
                      <Check className="h-4 w-4 shrink-0" /> ELIGIBILITY CHECK: OUTSTANDING CLEAR
                    </div>
                    <p className="text-[10px] text-slate-300 font-medium">
                      All hardware systems checked-in back to general inventory. Candidate is eligible for clearance logs.
                    </p>
                  </div>
                )}

                {/* Remarks by the requesting staff member */}
                <div className="text-[10.5px] bg-slate-950 p-2.5 rounded-lg border border-white/5 mt-2">
                  <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">CANDIDATE REMARKS:</span>
                  <span className="text-slate-300 font-medium italic">"{req.remarks || "No comments left."}"</span>
                </div>

                {req.approvedBy && (
                  <div className="text-[9.5px] text-slate-400 font-mono italic bg-white/[0.01] p-2 rounded-lg border border-white/5">
                    Logged Authority: {req.approvedBy}
                  </div>
                )}
              </div>

              {/* Action HUD Panel */}
              {req.status === "Pending" && (
                <div className="space-y-3 pt-2">
                  <input
                    type="text"
                    placeholder="Enter audit check justification (e.g., cleared all desks)..."
                    value={justification[req.id] || ""}
                    onChange={(e) => setJustification((prev) => ({ ...prev, [req.id]: e.target.value }))}
                    className="w-full bg-slate-950 px-3 py-2 border border-white/10 rounded-lg text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                  />

                  <div className="flex gap-2">
                    <ActionButton
                      variant="primary"
                      onClick={() => handleDecision(req.id, "Approved")}
                      disabled={blockApproval || loadingMap[req.id]}
                      className="flex-1 bg-indigo-650 hover:bg-indigo-700"
                      loading={loadingMap[req.id]}
                    >
                      Approve Clearance
                    </ActionButton>

                    <ActionButton
                      variant="danger"
                      onClick={() => handleDecision(req.id, "Rejected")}
                      disabled={loadingMap[req.id]}
                      className="flex-1"
                      loading={loadingMap[req.id]}
                    >
                      Reject with Note
                    </ActionButton>
                  </div>
                </div>
              )}
            </GlassCard>
          );
        })}

        {filteredRequests.length === 0 && (
          <div className="col-span-2 text-center text-slate-500 text-xs py-12 font-bold uppercase tracking-wider">
            No clearance requests matching current stage
          </div>
        )}
      </div>
    </div>
  );
}
