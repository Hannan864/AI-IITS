import React from "react";
import { RefreshCw, Download, Trash2 } from "lucide-react";
import { QRRegistryEntry } from "./types";

interface QRStateRegistryTableProps {
  registry: QRRegistryEntry[];
  assets: any[];
  selectedQRs: string[];
  setSelectedQRs: React.Dispatch<React.SetStateAction<string[]>>;
  fetchRegistry: () => Promise<void>;
  onRevoke: (tag: string) => Promise<void>;
}

export default function QRStateRegistryTable({
  registry,
  assets,
  selectedQRs,
  setSelectedQRs,
  fetchRegistry,
  onRevoke,
}: QRStateRegistryTableProps) {
  const toggleSelectRow = (tag: string) => {
    setSelectedQRs((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="bg-[#0b1227] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 bg-black/20 border-b border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">State-wide Institutional Authority registry</h3>
          <p className="text-[10px] text-slate-400">Real-time status synchronizations are recorded onto local persistent DB logs</p>
        </div>
        <button
          onClick={fetchRegistry}
          className="self-start sm:self-center h-8 bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-slate-350 font-bold px-3 uppercase rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" /> Refresh Registry Records
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-[9px] font-extrabold uppercase tracking-widest text-slate-400 bg-black/10">
              <th className="p-3">Compliance QR ID</th>
              <th className="p-3">Dept Pool</th>
              <th className="p-3">Workflow Lifecycle Stage</th>
              <th className="p-3">Associated Digital Asset</th>
              <th className="p-2 text-right">Label Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs text-slate-300">
            {registry.map((item) => {
              const isSelected = selectedQRs.includes(item.id);
              const linkedAssetObj = assets.find((a) => a.id === item.linkedAssetId);
              return (
                <tr key={item.id} className="hover:bg-white/[0.01]">
                  <td className="p-3 font-mono font-bold text-slate-300">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(item.id)}
                        className="h-3 w-3 accent-indigo-500 rounded cursor-pointer"
                      />
                      {item.id}
                    </div>
                  </td>
                  <td className="p-3">{item.department}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-[8px] font-black uppercase rounded ${
                        item.status === "generated"
                          ? "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                          : item.status === "printed"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : item.status === "bound"
                          ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          : item.status === "issued"
                          ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3">
                    {linkedAssetObj ? (
                      <span className="text-white font-semibold">
                        {linkedAssetObj.assetName}
                      </span>
                    ) : (
                      <span className="text-slate-550 italic">No asset linked (Pre-printed status)</span>
                    )}
                  </td>
                  <td className="p-2 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = item.qrImage;
                          link.download = `IIUI_QR_${item.id}.png`;
                          link.click();
                        }}
                        className="p-1 hover:bg-white/5 text-slate-400 hover:text-white rounded cursor-pointer"
                        title="Download png"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onRevoke(item.id)}
                        className="p-1 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                        title="Revoke / Delete label sticker"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {registry.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-550 italic">
                  No institutional compliance labels detected in pool registry.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
