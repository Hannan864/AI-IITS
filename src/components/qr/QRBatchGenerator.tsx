import React, { useState } from "react";
import { Layers, AlertTriangle, QrCode, ShieldCheck, Printer } from "lucide-react";
import ActionButton from "../ActionButton";
import { QRRegistryEntry } from "./types";
import { triggerPrintGrid } from "./printer";
import { apiFetch } from "../../lib/api";

interface QRBatchGeneratorProps {
  registry: QRRegistryEntry[];
  fetchRegistry: () => Promise<void>;
  refreshAll: () => void;
  selectedQRs: string[];
  setSelectedQRs: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function QRBatchGenerator({
  registry,
  fetchRegistry,
  refreshAll,
  selectedQRs,
  setSelectedQRs,
}: QRBatchGeneratorProps) {
  const [selectedDept, setSelectedDept] = useState("CS");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [batchCount, setBatchCount] = useState(10);
  const [btnLoading, setBtnLoading] = useState(false);
  const [generatedBatchResult, setGeneratedBatchResult] = useState<QRRegistryEntry[]>([]);

  const handleBatchGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      const res = await apiFetch("/api/qr-registry/generate-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department: selectedDept, year: selectedYear, count: batchCount }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedBatchResult(data);
        await fetchRegistry();
        refreshAll();
      } else {
        const err = await res.json();
        alert(`Failed to batch generate: ${err.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error creating QR batch sticker matrix.");
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0b1227] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Layers className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-sans">IIUI Batch Generator</h3>
            <p className="text-[10px] text-slate-400">Institutional pattern sequence generator</p>
          </div>
        </div>

        <form onSubmit={handleBatchGenerate} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Department Rule Sector
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full h-9 bg-black/40 border border-white/10 rounded-lg text-xs font-bold text-slate-200 px-3 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="CS">Computer Science (CS)</option>
              <option value="IT">Information Technology (IT)</option>
              <option value="SE">Software Engineering (SE)</option>
              <option value="EE">Electrical Engineering (EE)</option>
              <option value="MATH">Mathematics (MATH)</option>
              <option value="PHYS">Physics (PHYS)</option>
              <option value="BBA">Management Sciences (BBA)</option>
              <option value="ADMIN">Administration (ADMIN)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Deployment Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full h-9 bg-black/40 border border-white/10 rounded-lg text-xs font-bold text-slate-200 px-3 focus:outline-none focus:border-indigo-500"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Batch Quantity
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={batchCount}
                onChange={(e) => setBatchCount(parseInt(e.target.value) || 1)}
                className="w-full h-9 bg-black/40 border border-white/10 rounded-lg text-xs font-bold text-slate-200 px-3 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3.5 space-y-1">
            <span className="text-[9px] uppercase tracking-widest font-extrabold text-orange-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> System Sequence Preview
            </span>
            <p className="text-[9.5px] text-slate-300 leading-relaxed font-mono">
              Next tag starts with: <br />
              <span className="text-white font-black">
                IIUI-{selectedDept}-{selectedYear}-...
              </span>
            </p>
            <p className="text-[8px] text-slate-500 leading-snug">
              Auto-increments sequence securely per department pool. Maximum generation limit: 100 stickers per transaction.
            </p>
          </div>

          <ActionButton
            type="submit"
            variant="primary"
            loading={btnLoading}
            className="w-full flex items-center justify-center gap-1.5 font-bold"
          >
            <QrCode className="h-4 w-4" /> Execute Batch Generation
          </ActionButton>
        </form>
      </div>

      {generatedBatchResult.length > 0 && (
        <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Batch {selectedDept} Successful
            </span>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
              +{generatedBatchResult.length} QRs
            </span>
          </div>
          <p className="text-[10px] text-slate-300">
            A corporate sequence matrix has been compiled. Total of {generatedBatchResult.length} compliant QR assets labels are pushed into printable queue status block.
          </p>
          <button
            onClick={() => {
              const ids = generatedBatchResult.map((c) => c.id);
              setSelectedQRs(ids);
              triggerPrintGrid(registry, ids, "A4_Label_Small");
            }}
            className="w-full h-8 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold uppercase text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" /> Direct Print Batch Matrix
          </button>
        </div>
      )}
    </div>
  );
}
