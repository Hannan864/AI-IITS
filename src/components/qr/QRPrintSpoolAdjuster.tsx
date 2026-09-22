import React from "react";
import { Settings, Printer, Download } from "lucide-react";

interface QRPrintSpoolAdjusterProps {
  selectedDept: string;
  setSelectedDept: (val: string) => void;
  selectedCat: string;
  setSelectedCat: (val: string) => void;
  selectedBatch: string;
  setSelectedBatch: (val: string) => void;
  selectedStatusOnly: string;
  setSelectedStatusOnly: (val: string) => void;
  labelLayout: "A4_Label_Small" | "Badge_Standard" | "Grid_Compact";
  setLabelLayout: (val: "A4_Label_Small" | "Badge_Standard" | "Grid_Compact") => void;
  departments: string[];
  categories: string[];
  batches: any[];
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  printLoading: boolean;
  handleTriggerPrint: () => void;
  handleDownloadBulkZip: () => void;
}

export default function QRPrintSpoolAdjuster({
  selectedDept,
  setSelectedDept,
  selectedCat,
  setSelectedCat,
  selectedBatch,
  setSelectedBatch,
  selectedStatusOnly,
  setSelectedStatusOnly,
  labelLayout,
  setLabelLayout,
  departments,
  categories,
  batches,
  selectedIds,
  setSelectedIds,
  printLoading,
  handleTriggerPrint,
  handleDownloadBulkZip,
}: QRPrintSpoolAdjusterProps) {
  return (
    <div className="bg-[#0b1227] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
      <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest pb-2 border-b border-white/5 flex items-center gap-2">
        <Settings className="h-4 w-4 text-indigo-400" /> SPOOL SHEET ADJUSTER
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-[9px] font-extrabold text-slate-550 uppercase tracking-widest mb-1">
            Department Channel Selection
          </label>
          <select
            value={selectedDept}
            onChange={(e) => { setSelectedDept(e.target.value); setSelectedIds([]); }}
            className="w-full h-9 bg-black/40 border border-white/5 rounded-lg text-xs font-bold text-slate-350 px-2.5 outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[9px] font-extrabold text-slate-550 uppercase tracking-widest mb-1">
            Category Subset
          </label>
          <select
            value={selectedCat}
            onChange={(e) => { setSelectedCat(e.target.value); setSelectedIds([]); }}
            className="w-full h-9 bg-black/40 border border-white/5 rounded-lg text-xs font-bold text-slate-350 px-2.5 outline-none"
          >
            <option value="all">All Hardware Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[9px] font-extrabold text-slate-550 uppercase tracking-widest mb-1">
            Creation Batch Pack
          </label>
          <select
            value={selectedBatch}
            onChange={(e) => { setSelectedBatch(e.target.value); setSelectedIds([]); }}
            className="w-full h-9 bg-black/40 border border-white/5 rounded-lg text-xs font-bold text-slate-350 px-2.5 outline-none"
          >
            <option value="all">All Batches Combined</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.batchName} ({b.count} QRs)</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[9px] font-extrabold text-slate-550 uppercase tracking-widest mb-1">
            Status Filtration
          </label>
          <select
            value={selectedStatusOnly}
            onChange={(e) => { setSelectedStatusOnly(e.target.value); setSelectedIds([]); }}
            className="w-full h-9 bg-black/40 border border-white/5 rounded-lg text-xs font-bold text-slate-350 px-2.5 outline-none"
          >
            <option value="all">Show All Lifecycle Statuses</option>
            <option value="generated">GENERATED / UNPRINTED</option>
            <option value="printed">PRINTED / UNBOUND</option>
            <option value="bound">BOUND TO ASSET</option>
          </select>
        </div>

        <div className="border-t border-white/5 pt-3.5 space-y-2">
          <label className="block text-[9px] font-extrabold text-slate-550 uppercase tracking-widest mb-1">
            Paper Sticker Output Matrix Style
          </label>
          <div className="space-y-1.5">
            {[
              { id: "A4_Label_Small", name: "A4 Sheet (4x10 Grid Small labels)" },
              { id: "Badge_Standard", name: "Standard Avery Badge (3x8 Grid)" },
              { id: "Grid_Compact", name: "Ultra-Compact Laboratory (5x12 Strip)" }
            ].map((layout) => (
              <label key={layout.id} className="flex items-center gap-2 p-1.5 bg-black/25 rounded-md hover:bg-black/50 border border-white/5 text-[10.5px] text-slate-300 font-bold select-none cursor-pointer">
                <input
                  type="radio"
                  name="spool_matrix"
                  checked={labelLayout === layout.id}
                  onChange={() => setLabelLayout(layout.id as any)}
                  className="accent-indigo-500"
                />
                {layout.name}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs text-white font-bold">
          <span>QUEUED CARDS</span>
          <span className="font-mono text-indigo-400 bg-indigo-505/10 px-1.5 py-0.5 rounded text-[10px]">
            {selectedIds.length} Selected
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={selectedIds.length === 0 || printLoading}
            onClick={handleTriggerPrint}
            className="flex-1 h-9 bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-800 disabled:opacity-40 text-white font-extrabold uppercase text-[10.5px] rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <Printer className="h-3.5 w-3.5" /> Spool Print Job
          </button>
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadBulkZip}
              className="h-9 w-9 bg-white/5 hover:bg-[#152e50] border border-white/5 rounded-lg flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              title="Download PNG vectors package"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
