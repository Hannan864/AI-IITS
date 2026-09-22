import React from "react";
import { Asset, User, AssetIssuance } from "../../types";

interface ReceiveHandbackTabProps {
  activeIssuances: AssetIssuance[];
  assets: Asset[];
  users: User[];
  onReturnAsset: (assetId: string, condition: string) => Promise<boolean>;
}

export default function ReceiveHandbackTab({
  activeIssuances,
  assets,
  users,
  onReturnAsset,
}: ReceiveHandbackTabProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-lg animate-fade-in">
      <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">
        Outstanding Department Asset Handouts Ledger
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/5 text-left text-xs">
          <thead>
            <tr className="bg-white/2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10">
              <th className="px-4 py-3">Borrower Staff Info</th>
              <th className="px-4 py-3">Device Details</th>
              <th className="px-4 py-3">Department Zone</th>
              <th className="px-4 py-3">Issue Date</th>
              <th className="px-4 py-3">Expected Return Deadline</th>
              <th className="px-4 py-3 text-right">Inventory Reclamation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {activeIssuances.map((iss) => {
              const asset = assets.find((a) => a.id === iss.assetId);
              const user = users.find((u) => u.id === iss.userId);
              if (!asset || !user) return null;

              return (
                <tr key={iss.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white">{user.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{user.role}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-indigo-300">{asset.assetName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Tag: {asset.assetTag}</div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-400">{user.department}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-400">{iss.issuedDate}</td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                      {iss.returnDate}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => onReturnAsset(asset.id, "Good")}
                        className="bg-emerald-550/20 hover:bg-emerald-500/35 border border-emerald-500/20 text-emerald-300 font-bold px-2 py-1 rounded text-[11px] transition-all outline-none cursor-pointer"
                      >
                        Mark Returned Healthy
                      </button>
                      <button
                        onClick={() => onReturnAsset(asset.id, "Damaged")}
                        className="bg-red-550/20 hover:bg-red-500/35 border border-red-500/20 text-red-300 font-bold px-2 py-1 rounded text-[11px] transition-all outline-none cursor-pointer"
                      >
                        Flag Damaged Handover
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {activeIssuances.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-medium">
                  Store shelves are completely full! No unallocated borrowings currently flagged.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
