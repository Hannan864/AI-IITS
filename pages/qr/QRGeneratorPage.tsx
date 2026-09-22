import React, { useState } from "react";
import { QrCode, AlertTriangle, BadgePercent, CheckCircle, Flame, Layers } from "lucide-react";
import ActionButton from "../../components/ActionButton";
import { apiFetch } from "../../lib/api";

interface QRGeneratorPageProps {
  refreshAll: () => void;
  onNavigateToRegistry?: (tagId: string) => void;
}

export default function QRGeneratorPage({ refreshAll, onNavigateToRegistry }: QRGeneratorPageProps) {
  const [selectedDept, setSelectedDept] = useState("CS");
  const [selectedCat, setSelectedCat] = useState("LAPTOP");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [batchCount, setBatchCount] = useState(10);
  const [btnLoading, setBtnLoading] = useState(false);
  const [singleLoading, setSingleLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any[]>([]);
  const [isBatch, setIsBatch] = useState(true);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBatch) {
      setBtnLoading(true);
    } else {
      setSingleLoading(true);
    }

    try {
      const endpoint = isBatch ? "/api/qr-registry/generate-batch" : "/api/qr-registry/generate";
      const payload = isBatch
        ? { department: selectedDept, category: selectedCat, year: selectedYear, count: batchCount }
        : { department: selectedDept, category: selectedCat, year: selectedYear };

      const res = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const finalData = Array.isArray(data) ? data : [data];
        setGeneratedResult(finalData);
        refreshAll();
      } else {
        const err = await res.json();
        alert(`Failed to generate: ${err.error || "Server rejected transaction."}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error creating dynamic QR code identifiers.");
    } finally {
      setBtnLoading(false);
      setSingleLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-1">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Generator Controls */}
        <div className="lg:col-span-6 bg-[#0b1227] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
            <Layers className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">QR GENERATION CONFIGURATION</h3>
              <p className="text-[10px] text-slate-400">Institutional asset tag configuration criteria</p>
            </div>
          </div>

          <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 mb-4">
            <button
              type="button"
              onClick={() => { setIsBatch(true); setGeneratedResult([]); }}
              className={`flex-1 h-8 text-[11px] uppercase font-bold rounded-md transition-all cursor-pointer ${
                isBatch ? "bg-indigo-600 text-white" : "text-slate-450 hover:text-white"
              }`}
            >
              Batch Allocation
            </button>
            <button
              type="button"
              onClick={() => { setIsBatch(false); setGeneratedResult([]); }}
              className={`flex-1 h-8 text-[11px] uppercase font-bold rounded-md transition-all cursor-pointer ${
                !isBatch ? "bg-indigo-600 text-white" : "text-slate-450 hover:text-white"
              }`}
            >
              Single Custom QR
            </button>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Department Sector
              </label>
              <select
                value={selectedDept}
                onChange={(e) => { setSelectedDept(e.target.value); setGeneratedResult([]); }}
                className="w-full h-10 bg-black/40 border border-white/10 rounded-lg text-xs font-bold text-slate-200 px-3 focus:outline-none focus:border-indigo-500 transition-colors"
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

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Asset Category
              </label>
              <select
                value={selectedCat}
                onChange={(e) => { setSelectedCat(e.target.value); setGeneratedResult([]); }}
                className="w-full h-10 bg-black/40 border border-white/10 rounded-lg text-xs font-bold text-slate-200 px-3 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="LAPTOP">LAPTOP (Computing Notebook)</option>
                <option value="PRINTER">PRINTER (Peripherals Output)</option>
                <option value="DESKTOP">DESKTOP (Workstations)</option>
                <option value="SERVER">SERVER (Cloud Infrastructure)</option>
                <option value="ROUTER">ROUTER (Networking Switch)</option>
                <option value="PROJECTOR">PROJECTOR (Lab Presentation)</option>
                <option value="SCANNER">SCANNER (Input Imaging)</option>
                <option value="MONITORS">MONITOR (Displays Panel)</option>
                <option value="FURNITURE">FURNITURE (Lab Fixtures)</option>
                <option value="LABKIT">LABKIT (Specialized Hardware Kits)</option>
                <option value="OTHER">OTHER (Misc Items)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Deployment Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => { setSelectedYear(e.target.value); setGeneratedResult([]); }}
                  className="w-full h-10 bg-black/40 border border-white/10 rounded-lg text-xs font-bold text-slate-200 px-3 focus:outline-none focus:border-indigo-500"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>

              {isBatch && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Batch Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={batchCount}
                    onChange={(e) => { setBatchCount(parseInt(e.target.value) || 1); setGeneratedResult([]); }}
                    className="w-full h-10 bg-black/40 border border-white/10 rounded-lg text-xs font-bold text-slate-200 px-3 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4.5 space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> SECURE SEQUENCE DESIGNATOR
              </span>
              <p className="text-[10.5px] text-slate-300 leading-relaxed font-mono">
                Formula Preview: <br />
                <span className="text-white font-black text-xs">
                  IIUI-{selectedDept}-{selectedCat}-{selectedYear}-######
                </span>
              </p>
              <p className="text-[8.5px] text-slate-500 leading-snug">
                These tags auto-increment separately per department sector pool, ensuring zero colliding identifier blocks across university networks.
              </p>
            </div>

            <ActionButton
              type="submit"
              variant="primary"
              loading={isBatch ? btnLoading : singleLoading}
              className="w-full h-10 flex items-center justify-center gap-1.5 font-bold cursor-pointer text-xs uppercase"
            >
              <QrCode className="h-4 w-4" /> Generate QR Code Batch
            </ActionButton>
          </form>
        </div>

        {/* Live Generation Feed/Results */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0b1227] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl min-h-[420px] flex flex-col">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider pb-2.5 border-b border-white/5">
              NEWLY GENERATED QR BATCH FEED
            </h3>

            {generatedResult.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                <QrCode className="h-12 w-12 text-slate-750 stroke-[1.25]" />
                <div>
                  <p className="text-xs font-bold text-slate-400">Ready to Generate</p>
                  <p className="text-[10px] text-slate-500 max-w-xs mt-1">
                    Select department and category criteria, then click "Generate QR Code Batch" to create official asset tags in real-time.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4" /> QR BATCH GENERATED SUCCESSFULLY
                    </span>
                    <span className="bg-emerald-400/10 px-2 py-0.5 rounded text-[10px] font-mono">
                      +{generatedResult.length} ID Tags
                    </span>
                  </div>

                  <p className="text-[10.5px] text-slate-300 leading-relaxed leading-snug font-sans">
                    These credentials have been registered in the central university database as <b>PENDING PRINTING</b>. Download individual label images or load the print matrix sheet.
                  </p>

                  <div className="space-y-1.5">
                    {generatedResult.slice(0, 5).map((e) => (
                      <div key={e.id} className="flex items-center justify-between bg-black/30 border border-white/5 p-2 rounded-lg font-mono text-[10px]">
                        <div className="flex flex-col">
                          <span className="text-slate-300 font-bold">{e.id}</span>
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider">{e.department} · {e.status}</span>
                        </div>
                        <button
                          onClick={() => onNavigateToRegistry && onNavigateToRegistry(e.id)}
                          className="px-2 py-1 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded text-[10px] uppercase font-bold tracking-wider transition-colors"
                        >
                          View in Registry
                        </button>
                      </div>
                    ))}
                    {generatedResult.length > 5 && (
                      <div className="text-center font-mono text-[9px] text-slate-500 italic pt-1">
                        ... and {generatedResult.length - 5} more secure compliance identifiers.
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-2">
                  <span className="text-[9px] uppercase tracking-widest text-slate-450 font-bold block">
                    Next Recommended Workflow:
                  </span>
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10.5px] text-white font-bold block">Load Sticker Alignment Sheet</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">Push these labels directly to hardware adhesive grids</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="h-4 w-4 text-orange-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
