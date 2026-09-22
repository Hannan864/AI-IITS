import React, { useState, useEffect } from "react";
import { RefreshCw, FileText, Download, CheckSquare, Square } from "lucide-react";
import { apiFetch } from "../../lib/api";
import QRPrintSpoolAdjuster from "../../components/qr/QRPrintSpoolAdjuster";

interface QRPrintCenterPageProps {
  assets: any[];
  refreshAll: () => void;
}

export default function QRPrintCenterPage({ assets = [], refreshAll }: QRPrintCenterPageProps) {
  const [registry, setRegistry] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Selection of Tag IDs for printing
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Filtering states
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedStatusOnly, setSelectedStatusOnly] = useState("all");

  // Layout selection
  const [labelLayout, setLabelLayout] = useState<"A4_Label_Small" | "Badge_Standard" | "Grid_Compact">("A4_Label_Small");

  const [printLoading, setPrintLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const regRes = await apiFetch("/api/qr-registry");
      const batchRes = await apiFetch("/api/qr-registry/batches");
      
      if (regRes.ok) {
        const data = await regRes.json();
        setRegistry(data);
      }
      if (batchRes.ok) {
        const data = await batchRes.json();
        setBatches(data);
      }
    } catch (err) {
      console.error("Error loading print center indexes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Unique list extractions
  const departments = Array.from(new Set(registry.map(item => item.department as string))) as string[];
  const categories = Array.from(new Set(registry.map(item => item.category as string))) as string[];
  const years = Array.from(new Set(registry.map(item => item.year as string))) as string[];

  // Perform filtration
  const filteredQRs = registry.filter(item => {
    const matchesDept = selectedDept === "all" || item.department === selectedDept;
    const matchesCat = selectedCat === "all" || item.category === selectedCat;
    const matchesYear = selectedYear === "all" || item.year === selectedYear;
    const matchesBatch = selectedBatch === "all" || item.batchId === selectedBatch;
    const matchesStatus = selectedStatusOnly === "all" || item.status === selectedStatusOnly;
    return matchesDept && matchesCat && matchesYear && matchesBatch && matchesStatus;
  });

  const handleSelectAll = () => {
    const freshFilteredIds = filteredQRs.map(item => item.id);
    const allSelectedAlready = freshFilteredIds.every(id => selectedIds.includes(id));
    
    if (allSelectedAlready) {
      setSelectedIds(prev => prev.filter(id => !freshFilteredIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...freshFilteredIds])));
    }
  };

  const handleToggleSingle = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleTriggerPrint = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one QR sticker label to execute print job.");
      return;
    }
    
    setPrintLoading(true);
    try {
      const res = await apiFetch("/api/qr-registry/mark-printed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          layout: labelLayout
        })
      });

      if (res.ok) {
        alert(`Successfully dispatched print spool job!\nRegistered print logs for ${selectedIds.length} stickers.`);
        setSelectedIds([]);
        await fetchData();
        refreshAll();
        
        // Simulating printing by launching dynamic window container
        const printableQRs = registry.filter(item => selectedIds.includes(item.id));
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>IIUI Micro Alignment Sheets - Spool</title>
                <style>
                  body { font-family: monospace; padding: 20px; text-align: center; background: #fff; color: #000; }
                  .grid { display: grid; grid-template-columns: repeat(${labelLayout === "Grid_Compact" ? 5 : labelLayout === "Badge_Standard" ? 3 : 4}, 1fr); gap: 15px; }
                  .label-card { border: 1px dashed #444; padding: 10px; border-radius: 6px; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; }
                  .logo { font-size: 8px; font-weight: bold; margin-bottom: 2px; }
                  .id-tag { font-size: 9px; font-weight: bold; margin-top: 4px; }
                  .barcode { width: 90px; height: 90px; }
                </style>
              </head>
              <body>
                <h2>IIUI SYSTEM - BULK PRINT SHEET</h2>
                <div class="grid">
                  ${printableQRs.map(qr => `
                    <div class="label-card">
                      <div class="logo">IIUI ADMIN CONTROL</div>
                      <img class="barcode" src="${qr.qrImage}" />
                      <div class="id-tag">${qr.id}</div>
                    </div>
                  `).join('')}
                </div>
                <script>window.onload = function() { window.print(); }</script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      } else {
        alert("Failed to update printed registry log.");
      }
    } catch (e) {
      console.error(e);
      alert("Error sending print signal.");
    } finally {
      setPrintLoading(false);
    }
  };

  const handleDownloadBulkZip = () => {
    alert("Preparing PNG bulk vector package. Downloading archive folder containing " + selectedIds.length + " tags.");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-1">
      {/* Sheet Tuning Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls / Filter Options */}
        <div className="lg:col-span-4">
          <QRPrintSpoolAdjuster
            selectedDept={selectedDept}
            setSelectedDept={setSelectedDept}
            selectedCat={selectedCat}
            setSelectedCat={setSelectedCat}
            selectedBatch={selectedBatch}
            setSelectedBatch={setSelectedBatch}
            selectedStatusOnly={selectedStatusOnly}
            setSelectedStatusOnly={setSelectedStatusOnly}
            labelLayout={labelLayout}
            setLabelLayout={setLabelLayout}
            departments={departments}
            categories={categories}
            batches={batches}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            printLoading={printLoading}
            handleTriggerPrint={handleTriggerPrint}
            handleDownloadBulkZip={handleDownloadBulkZip}
          />
        </div>

        {/* Sticker sheet Grid View representation */}
        <div className="lg:col-span-8 bg-[#0b1227] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-white/5">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">
                STICKER SELECTION AND LIVE MATRIX PANORAMA
              </h3>
              <p className="text-[10px] text-slate-450 mt-0.5">
                Displays {filteredQRs.length} matching code blueprints from total library
              </p>
            </div>
            {filteredQRs.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="h-7.5 px-3 bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-slate-300 font-extrabold uppercase rounded-lg transition-colors cursor-pointer"
              >
                {filteredQRs.every(item => selectedIds.includes(item.id)) ? "Deselect Filtered" : "Toggle Select Page"}
              </button>
            )}
          </div>

          {filteredQRs.length === 0 ? (
            <div className="py-24 text-center text-slate-500 italic text-xs flex flex-col items-center justify-center gap-2">
              <FileText className="h-10 w-10 text-slate-750" />
              There are no available matching QR tag labels listed under current criteria selection.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-2">
              {filteredQRs.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleSingle(item.id)}
                    className={`relative border rounded-xl p-3 flex flex-col items-center justify-between gap-2 text-center select-none cursor-pointer group transition-all duration-100 ${
                      isSelected
                        ? "bg-indigo-600/10 border-indigo-500 shadow-lg ring-1 ring-indigo-550/20"
                        : "bg-black/20 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="absolute top-2 right-2">
                      {isSelected ? (
                        <CheckSquare className="h-3.5 w-3.5 text-indigo-400" />
                      ) : (
                        <Square className="h-3.5 w-3.5 text-slate-650 hover:text-slate-450" />
                      )}
                    </div>
                    
                    <div className="bg-white p-2 text-center rounded-lg mt-2 shadow-sm border border-slate-200 w-[100px] flex flex-col items-center">
                      <img
                        src={item.qrImage}
                        alt="QR Image code"
                        className="h-16 w-16 object-contain mb-1"
                      />
                      <span className="text-[7px] text-black font-bold tracking-tighter whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        {item.id}
                      </span>
                    </div>

                    <div className="min-w-0 w-full">
                      <p className="font-mono text-[9px] font-black text-slate-200 truncate select-all">
                        {item.id}
                      </p>
                      <div className="flex items-center justify-center gap-1.5 mt-1">
                        <span className="text-[8px] px-1 bg-black/40 text-slate-400 font-semibold uppercase">
                          {item.department}
                        </span>
                        <span className={`text-[8px] font-bold ${
                          item.status === 'printed' ? "text-blue-400" : item.status === 'bound' ? "text-indigo-400" : "text-amber-450"
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
