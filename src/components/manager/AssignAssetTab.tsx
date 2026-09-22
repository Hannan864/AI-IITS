import React, { useState } from "react";
import { Send } from "lucide-react";
import { Asset, User } from "../../types";

interface AssignAssetTabProps {
  availableAssets: Asset[];
  facultyUsers: User[];
  selectedAssetId: string;
  onSelectAssetId: (id: string) => void;
  onIssueAsset: (assetId: string, userId: string, returnDate: string) => Promise<boolean>;
}

export default function AssignAssetTab({
  availableAssets,
  facultyUsers,
  selectedAssetId,
  onSelectAssetId,
  onIssueAsset,
}: AssignAssetTabProps) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [issuanceMsg, setIssuanceMsg] = useState("");

  const handleTriggerIssuance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !selectedUserId || !expectedReturnDate) return;

    const success = await onIssueAsset(selectedAssetId, selectedUserId, expectedReturnDate);
    if (success) {
      setIssuanceMsg("Asset successfully issued to classroom staff.");
      onSelectAssetId("");
      setSelectedUserId("");
      setExpectedReturnDate("");
      setTimeout(() => setIssuanceMsg(""), 3000);
    } else {
      setIssuanceMsg("Error performing asset assignment.");
      setTimeout(() => setIssuanceMsg(""), 3000);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-lg max-w-xl mx-auto space-y-4 animate-fade-in">
      <div className="border-b border-white/10 pb-3 flex items-center gap-1.5">
        <Send className="h-5 w-5 text-indigo-400 animate-pulse" strokeWidth={2.5} />
        <h3 className="text-sm font-semibold text-white">Issue Academic Hardware Assignment</h3>
      </div>

      {availableAssets.length === 0 && !selectedAssetId ? (
        <div className="text-center p-6 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-300 text-xs font-semibold">
          ⚠️ No hardware assets are currently "Available" in the store. Please register a unit first, or accept returning equipment.
        </div>
      ) : (
        <form onSubmit={handleTriggerIssuance} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Select Asset Model to Issue</label>
            <select
              required
              value={selectedAssetId}
              onChange={(e) => onSelectAssetId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 py-1.5 px-3 text-xs focus:ring-1 focus:ring-indigo-500 text-slate-100 font-bold bg-slate-900 outline-none"
            >
              <option value="">-- Choose Available Equipment --</option>
              {/* Force show currently selected asset even if not Available status (in case of override selection transition) */}
              {availableAssets.map((a) => (
                <option key={a.id} value={a.id} className="bg-slate-950">
                  {a.assetTag} - {a.assetName} [Condition: {a.condition}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Assign to Class Teacher / Visiting Staff</label>
            <select
              required
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 py-1.5 px-3 text-xs focus:ring-1 focus:ring-indigo-500 text-slate-100 font-bold bg-slate-900 outline-none"
            >
              <option value="">-- Select Instructor Card --</option>
              {facultyUsers.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-950">
                  {u.name} ({u.role} - {u.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Prescribed Return-By Date</label>
            <input
              type="date"
              required
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 py-1.5 px-3 text-xs focus:ring-1 focus:ring-indigo-500 bg-slate-900 text-slate-100 font-semibold outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-xs tracking-wide transition-all uppercase cursor-pointer border border-indigo-505/20"
          >
            Endorse Asset Issuance Receipt
          </button>
          {issuanceMsg && (
            <p className="text-xs text-center text-emerald-305 font-bold bg-emerald-555/10 py-1.5 rounded-lg border border-emerald-500/20">
              {issuanceMsg}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
