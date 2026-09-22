import React, { useState } from "react";
import { Search, Printer, Trash2 } from "lucide-react";
import { QRRegistryEntry } from "./types";
import { triggerPrintGrid } from "./printer";
import { apiFetch } from "../../lib/api";

interface QRPrintQueueProps {
  registry: QRRegistryEntry[];
  fetchRegistry: () => Promise<void>;
  selectedQRs: string[];
  setSelectedQRs: React.Dispatch<React.SetStateAction<string[]>>;
  onScanTest: (tag: string) => void;
  onRevoke: (tag: string) => Promise<void>;
}

export default function QRPrintQueue({
  registry,
  fetchRegistry,
  selectedQRs,
  setSelectedQRs,
  onScanTest,
  onRevoke,
}: QRPrintQueueProps) {
  const [printLayoutPaper, setPrintLayoutPaper] = useState<"A4_Label_Small" | "A4_Label_Large">("A4_Label_Small");
  const [searchTerm, setSearchTerm] = useState("");
  const [registryFilter, setRegistryFilter] = useState("all");

  const toggleSelectRow = (tag: string) => {
    setSelectedQRs((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
    );
  };

  const handleMarkAsPrinted = async () => {
    if (selectedQRs.length === 0) {
      alert("Please select at least one QR code to print.");
      return;
    }
    try {
      const res = await apiFetch("/api/qr-registry/mark-printed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedQRs }),
      });
      if (res.ok) {
        alert(`Successfully finalized physical printing for ${selectedQRs.length} assets labels!`);
        setSelectedQRs([]);
        await fetchRegistry();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRegistry = registry.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.generatedBy.toLowerCase().includes(searchTerm.toLowerCase());

    if (registryFilter === "all") return matchesSearch;
    return matchesSearch && item.status === registryFilter;
  });

  return (
    <div className="bg-[#0b1227] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Print Sticker Grid Queue</h3>
          <p className="text-[10px] text-slate-400">Pre-generated labels ready for physical placement and binding</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={printLayoutPaper}
            onChange={(e: any) => setPrintLayoutPaper(e.target.value)}
            className="h-8 bg-black/40 border border-white/10 rounded-lg text-[10px] font-bold text-slate-350 px-2 focus:outline-none"
          >
            <option value="A4_Label_Small">Grid A4 Layout Standard (4 Columns)</option>
            <option value="A4_Label_Large">Badge Size Alignment Sheet (3 Columns)</option>
          </select>

          <button
            onClick={() => triggerPrintGrid(registry, selectedQRs, printLayoutPaper)}
            className="h-8 px-3 bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-[10px] rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download grid of selected stickers for physical printing on adhesive sheets"
          >
            <Printer className="h-3.5 w-3.5" /> Print Sheets
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filter by QR Label..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-8 bg-black/40 border border-white/10 rounded-lg pl-8 pr-2.5 text-[11px] text-slate-200 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-1.5 bg-black/30 p-1 rounded-lg border border-white/5">
          {[
            { label: "All QRs", filter: "all" },
            { label: "Unprinted", filter: "generated" },
            { label: "Printed", filter: "printed" },
            { label: "Bound", filter: "bound" },
          ].map((x) => (
            <button
              key={x.filter}
              onClick={() => setRegistryFilter(x.filter)}
              className={`h-6.5 px-2 text-[9px] uppercase font-black rounded-md cursor-pointer ${
                registryFilter === x.filter
                  ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selection helper toolbars */}
      {selectedQRs.length > 0 && (
        <div className="bg-sky-500/10 border border-sky-400/20 rounded-xl p-3 flex sm:items-center justify-between gap-2.5">
          <span className="text-[10px] text-sky-450 font-bold block">
            📦 {selectedQRs.length} QR Stickers selected.
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleMarkAsPrinted}
              className="h-7 px-3 bg-sky-500 hover:bg-sky-600 font-extrabold uppercase text-[9px] text-black rounded transition-colors cursor-pointer"
            >
              Mark Printed
            </button>
            <button
              onClick={() => setSelectedQRs([])}
              className="h-7 px-2.5 bg-white/5 hover:bg-white/10 text-slate-350 text-[9px] rounded cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Stickers Grid list */}
      {filteredRegistry.length === 0 ? (
        <div className="py-12 border border-dashed border-white/10 rounded-xl text-center text-xs text-slate-500">
          No matching institutional QR tags exist in this filter sequence.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredRegistry.map((item) => {
            const isSelected = selectedQRs.includes(item.id);
            return (
              <div
                key={item.id}
                className={`border rounded-xl p-3 relative flex flex-col items-center justify-between text-center transition-all ${
                  isSelected
                    ? "bg-indigo-600/10 border-indigo-500"
                    : "bg-black/30 border-white/5 hover:border-white/15"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelectRow(item.id)}
                  className="absolute top-2 left-2 h-3.5 w-3.5 border-white/10 rounded-sm cursor-pointer accent-indigo-500"
                />

                <div className="pt-2">
                  <img
                    src={item.qrImage}
                    alt="QR code sticker"
                    className="h-20 w-20 bg-white p-0.5 rounded object-contain shadow-md"
                  />
                </div>

                <div className="mt-3.5 space-y-1 w-full">
                  <span className="font-mono font-bold text-[10px] text-slate-100 block truncate" title={item.id}>
                    {item.id}
                  </span>
                  <div className="flex justify-center items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 text-[7px] font-black uppercase rounded ${
                        item.status === "generated"
                          ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/10"
                          : item.status === "printed"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/10"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="text-[8px] text-slate-500 block truncate max-w-[80px]">
                      {item.department}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/5 w-full flex justify-between gap-1">
                  <button
                    onClick={() => onScanTest(item.id)}
                    className="flex-1 h-6 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[8px] font-bold uppercase rounded transition-colors cursor-pointer"
                    title="Verify tag in QR Verification Desk"
                  >
                    Verify Tag
                  </button>
                  <button
                    onClick={() => onRevoke(item.id)}
                    className="h-6 w-6 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 rounded flex items-center justify-center cursor-pointer"
                    title="Retire/Revoke"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
