import React from "react";
import { ShieldAlert } from "lucide-react";
import { Asset } from "../../types";

interface ReportingDamagedLedgerProps {
  assets: Asset[];
}

export default function ReportingDamagedLedger({ assets }: ReportingDamagedLedgerProps) {
  const flaggedAssets = assets.filter((a) => a.status === "Damaged" || a.status === "Retired");

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden animate-fade-in text-gray-900">
      <div className="bg-slate-50 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold text-gray-900">Current Damaged / Retired Equipment Ledger</span>
        </div>
        <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
          {flaggedAssets.length} Flags
        </span>
      </div>
      <div className="overflow-x-auto text-[11px] font-mono">
        <table className="min-w-full divide-y divide-gray-100 text-left">
          <thead>
            <tr className="bg-gray-50/50 text-[10px] font-bold uppercase tracking-wider text-gray-500 font-sans">
              <th className="px-5 py-3 font-sans">Tag</th>
              <th className="px-5 py-3 font-sans">Asset Description</th>
              <th className="px-5 py-3 font-sans">Hardware Category</th>
              <th className="px-5 py-3 font-sans">Department</th>
              <th className="px-5 py-3 font-sans">Physical Condition</th>
              <th className="px-5 py-3 font-sans">Lifecycle State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
            {flaggedAssets.map((ast) => (
              <tr key={ast.id} className="hover:bg-slate-50/50">
                <td className="px-5 py-4 font-mono font-semibold text-gray-600">{ast.assetTag}</td>
                <td className="px-5 py-4 font-medium text-gray-900 font-sans">{ast.assetName}</td>
                <td className="px-5 py-4 text-gray-500 font-sans">{ast.category}</td>
                <td className="px-5 py-4 text-gray-500 font-sans">{ast.department}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex rounded-full px-2 py-0.5 font-bold bg-red-100 text-red-850 font-sans text-[10px]">
                    {ast.condition}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex rounded-full px-2 py-0.5 font-bold bg-gray-150 text-gray-750 font-sans text-[10px]">
                    {ast.status}
                  </span>
                </td>
              </tr>
            ))}
            {flaggedAssets.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-gray-400 font-sans">
                  No damaged or retired equipment flagged in the database. All assets are online and operational.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
