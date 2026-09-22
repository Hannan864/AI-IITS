import React, { useState, useEffect } from "react";
import { Search, RefreshCw, ChevronRight, Trash2 } from "lucide-react";
import { apiFetch } from "../../lib/api";
import QRDetailModal from "../../components/qr/QRDetailModal";

export interface QRCodeEntry {
  id: string;
  batchId: string;
  department: string;
  category: string;
  year: string;
  sequence: number;
  qrPayload: string;
  qrImage: string;
  generatedBy: string;
  createdAt: string;
  status: string;
  linkedAssetId: string | null;
}

interface QRRegistryPageProps {
  assets: any[];
  refreshAll: () => void;
}

export default function QRRegistryPage({ assets = [], refreshAll }: QRRegistryPageProps) {
  const [registry, setRegistry] = useState<QRCodeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null);
  
  // Modal Drawer State
  const [selectedQR, setSelectedQR] = useState<QRCodeEntry | null>(null);

  const fetchRegistry = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/qr-registry");
      if (res.ok) {
        const data = await res.json();
        setRegistry(data);
      }
    } catch (err) {
      console.error("Error fetching QR codes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistry();
  }, []);

  useEffect(() => {
    const handleHighlight = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setSearchTerm(customEvent.detail);
      setHighlightedRow(customEvent.detail);
      
      // Stop highlighting after a short time
      setTimeout(() => {
        setHighlightedRow(null);
      }, 4000);
    };

    window.addEventListener('highlight-qr', handleHighlight);
    return () => window.removeEventListener('highlight-qr', handleHighlight);
  }, []);

  const handleRefresh = async () => {
    await fetchRegistry();
    refreshAll();
  };

  const handleDeleteAll = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/qr-registry/delete-all", { method: "DELETE" });
      if (res.ok) {
        await fetchRegistry();
        refreshAll();
      } else {
        const data = await res.json();
        console.error("Error purging registry: " + (data.error || "Unknown response"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSingle = async (tagId: string) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/qr-registry/delete/${encodeURIComponent(tagId)}`, { method: "DELETE" });
      if (res.ok) {
        await fetchRegistry();
        refreshAll();
      } else {
        const data = await res.json();
        console.error("Error deleting QR entry: " + (data.error || "Unknown response"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique filter elements
  const departments = Array.from(new Set(registry.map(item => item.department)));
  const categories = Array.from(new Set(registry.map(item => item.category)));
  const years = Array.from(new Set(registry.map(item => item.year)));
  const statuses = ["generated", "printed", "bound", "issued", "returned", "retired", "lost"];

  // Perform search and filter
  const filteredRegistry = registry.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.generatedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "all" || item.department === selectedDept;
    const matchesCat = selectedCat === "all" || item.category === selectedCat;
    const matchesYear = selectedYear === "all" || item.year === selectedYear;
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;

    return matchesSearch && matchesDept && matchesCat && matchesYear && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-1">
      {/* Database Filters Bar */}
      <div className="bg-[#0b1227] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Text Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search Tag, Actor Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 bg-black/40 border border-white/10 rounded-lg pl-9 pr-3.5 text-xs text-slate-200 outline-none focus:border-indigo-500 font-sans font-semibold placeholder:text-slate-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full h-10 bg-black/40 border border-white/10 rounded-lg text-xs font-bold text-slate-350 px-3 focus:outline-none"
            >
              <option value="all">Departments (All)</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full h-10 bg-black/40 border border-white/10 rounded-lg text-xs font-bold text-slate-350 px-3 focus:outline-none"
            >
              <option value="all">Categories (All)</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-10 bg-black/40 border border-white/10 rounded-lg text-xs font-bold text-slate-350 px-3 focus:outline-none"
            >
              <option value="all">Lifecycle Status (All)</option>
              {statuses.map(s => (
                <option key={s} value={s}>{s.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Database Table Grid Layout */}
      <div className="bg-[#0b1227] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[9px] font-extrabold uppercase tracking-widest text-slate-400 bg-black/25">
                <th className="p-4">Secure Identifier</th>
                <th className="p-4">Department Pool</th>
                <th className="p-4">Category Sector</th>
                <th className="p-4">Year Group</th>
                <th className="p-4">Lifecycle & Binding State</th>
                <th className="p-4">Asset Association</th>
                <th className="p-4 text-right">Action Log</th>
                <th className="p-4 text-center w-24">
                  <button
                    onClick={handleDeleteAll}
                    title="Purge Entire Registry"
                    className="p-1 px-2 rounded bg-rose-500/10 hover:bg-rose-505 hover:text-white border border-rose-500/20 text-rose-400 text-[9px] font-black tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-1 mx-auto"
                  >
                    <Trash2 className="h-3 w-3" /> Clear All
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {filteredRegistry.map((item) => {
                const linkedAssetObj = assets.find((a) => a.id === item.linkedAssetId || a.assetTag === item.id);
                const isBlinking = highlightedRow === item.id;
                return (
                  <tr key={item.id} className={`transition-colors ${isBlinking ? 'animate-pulse bg-indigo-500/20' : 'hover:bg-white/[0.01]'}`}>
                    <td className="p-4 font-mono font-bold text-slate-200">
                      {item.id}
                    </td>
                    <td className="p-4 font-bold text-slate-300">{item.department}</td>
                    <td className="p-4 font-mono text-[10.5px] text-slate-350 font-bold">{item.category}</td>
                    <td className="p-4 font-mono text-slate-400">{item.year}</td>
                    <td className="p-4">
                      <span
                        className={`px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase rounded ${
                          item.status === "generated"
                            ? "bg-slate-500/10 text-slate-405 border border-slate-500/20"
                            : item.status === "printed"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : item.status === "bound"
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : item.status === "issued"
                            ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                            : item.status === "returned"
                            ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                            : item.status === "retired"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {linkedAssetObj ? (
                        <span className="text-white font-semibold truncate max-w-[150px] inline-block" title={linkedAssetObj.assetName}>
                          {linkedAssetObj.assetName}
                        </span>
                      ) : (
                        <span className="text-slate-550 italic">Preprinted (Available)</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedQR(item)}
                        className="h-7 px-2.5 bg-indigo-650/10 hover:bg-indigo-500 border border-indigo-500/15 text-indigo-450 hover:text-white text-[10px] font-extrabold uppercase rounded transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                      >
                        Trace Specs <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteSingle(item.id)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/15 text-rose-405 rounded transition-all cursor-pointer inline-flex items-center justify-center"
                        title={`Delete ${item.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredRegistry.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500 italic">
                    {loading ? "Searching authority records in db..." : "No matching secure identifier records detected in current registry."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details drawer Overlay Modal */}
      <QRDetailModal
        selectedQR={selectedQR}
        onClose={() => setSelectedQR(null)}
        assets={assets}
      />
    </div>
  );
}
