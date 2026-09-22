import React from "react";
import { QRRegistryEntry } from "./types";

interface RegisteredBindingTableProps {
  registry: QRRegistryEntry[];
  assets: any[];
  onRevoke: (tag: string) => Promise<void>;
}

export default function RegisteredBindingTable({
  registry,
  assets,
  onRevoke,
}: RegisteredBindingTableProps) {
  return (
    <div className="bg-[#0b1227] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
      <div>
        <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Registered Binding Inventory</h3>
        <p className="text-[10px] text-slate-400">Verifying the linkage between pre-printed stickers and digital assets</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans text-xs">
          <thead>
            <tr className="border-b border-white/5 text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
              <th className="pb-2.5">QR Tag</th>
              <th className="pb-2.5">Mapped Hardware</th>
              <th className="pb-2.5">Status Check</th>
              <th className="pb-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {registry
              .filter((r) => r.linkedAssetId)
              .map((r) => {
                const assetObj = assets.find((a) => a.id === r.linkedAssetId);
                return (
                  <tr key={r.id} className="hover:bg-white/[0.01]">
                    <td className="py-3 font-mono font-bold text-slate-100">{r.id}</td>
                    <td className="py-3">
                      {assetObj ? (
                        <div>
                          <span className="text-white font-medium block">{assetObj.assetName}</span>
                          <span className="text-[9px] text-slate-500 font-mono">SN: {assetObj.serialNumber}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unknown asset: {r.linkedAssetId}</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className="px-1.5 py-0.5 text-[8px] font-black uppercase rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                        COMPLIANT BIND
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onRevoke(r.id)}
                        className="text-xs text-rose-400 hover:text-rose-350 font-bold uppercase transition-colors cursor-pointer"
                      >
                        Unbind
                      </button>
                    </td>
                  </tr>
                );
              })}
            {registry.filter((r) => r.linkedAssetId).length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500 italic">
                  No physical asset mappings have been finalized yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
