import React from "react";
import { History } from "lucide-react";
import { Asset, AssetIssuance } from "../../types";

interface HistoricReturnReceiptsProps {
  myHistoricalIssuances: AssetIssuance[];
  assets: Asset[];
}

export default function HistoricReturnReceipts({
  myHistoricalIssuances,
  assets,
}: HistoricReturnReceiptsProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-lg animate-fade-in font-mono">
      <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1 mb-3 font-sans">
        <History className="h-4 w-4 text-emerald-400" />
        My Historic Asset Hand-back Receipts
      </h3>
      <div className="overflow-x-auto text-[11px]">
        <table className="min-w-full divide-y divide-white/5 text-left text-xs">
          <thead>
            <tr className="bg-white/2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans border-b border-white/10">
              <th className="px-4 py-3">Device Model</th>
              <th className="px-4 py-3">Asset Tag</th>
              <th className="px-4 py-3">Issued Date</th>
              <th className="px-4 py-3">Reclaimed Date</th>
              <th className="px-4 py-3">Endorsed Status</th>
              <th className="px-4 py-3">Signee Store clerk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {myHistoricalIssuances.map((iss) => {
              const asset = assets.find((a) => a.id === iss.assetId);
              return (
                <tr key={iss.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white font-sans">
                    {asset ? asset.assetName : "General Laptop"}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400">{asset ? asset.assetTag : "N/A"}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{iss.issuedDate}</td>
                  <td className="px-4 py-3 font-mono text-emerald-400 font-bold">{iss.actualReturnDate}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 font-bold text-[10px]">
                      {iss.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-400 font-sans">{iss.issuedBy}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
