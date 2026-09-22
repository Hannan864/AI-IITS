import React, { useState, useEffect } from "react";
import { Download, RefreshCw, FileSpreadsheet, ShieldCheck, Search, Filter, History, Trash, EyeOff } from "lucide-react";
import { apiFetch } from "../../lib/api";

interface QRAuditTrailPageProps {
  assets: any[];
}

export default function QRAuditTrailPage({ assets = [] }: QRAuditTrailPageProps) {
  const [loading, setLoading] = useState(false);
  const [genericLogs, setGenericLogs] = useState<any[]>([]);
  const [printLogs, setPrintLogs] = useState<any[]>([]);
  const [scanLogs, setScanLogs] = useState<any[]>([]);
  const [bindLogs, setBindLogs] = useState<any[]>([]);

  // Filtering states
  const [searchTerm, setSearchTerm] = useState("");
  const [logTypeFilter, setLogTypeFilter] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // 1. Fetch print logs
      const pRes = await apiFetch("/api/qr-registry/print-logs");
      // 2. Fetch scan logs
      const sRes = await apiFetch("/api/qr-registry/scan-logs");
      // 3. Fetch binding logs
      const bRes = await apiFetch("/api/qr-registry/bindings");

      if (pRes.ok) {
        const data = await pRes.json().catch(() => []);
        setPrintLogs(Array.isArray(data) ? data : []);
      }
      if (sRes.ok) {
        const data = await sRes.json().catch(() => []);
        setScanLogs(Array.isArray(data) ? data : []);
      }
      if (bRes.ok) {
        const data = await bRes.json().catch(() => []);
        setBindLogs(Array.isArray(data) ? data : []);
      }

      // 4. Also load general forensic database logs for 'qr_registry'
      const forensicRes = await apiFetch("/api/snapshot"); // standard diagnostics route
      if (forensicRes.ok) {
        const fullDb = await forensicRes.json().catch(() => ({}));
        // Filter logs where type contains 'qr'
        const rawLogs = fullDb?.logs || [];
        const qrLogs = Array.isArray(rawLogs) ? rawLogs.filter((l: any) => l.type && l.type === "qr_registry") : [];
        setGenericLogs(qrLogs);
      }
    } catch (e) {
      console.warn("Audit logs notice:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Agglomerate all diverse subtable entries into one unified timeline ledger
  const compiledTimeline = [
    ...printLogs.map(p => ({
      timestamp: p.printedAt,
      actor: p.printedBy,
      type: "Printed",
      operation: `Spool Print Sticker: ${p.qrCodeId} via [${p.layout}] layout.`,
      targetId: p.qrCodeId,
      severity: "INFO"
    })),
    ...scanLogs.map(s => ({
      timestamp: s.scannedAt,
      actor: s.scannedBy,
      type: "Scanned",
      operation: `Operational Desk Scan: ${s.qrCodeId} [Type: ${s.scanType}]. Status: ${s.result}`,
      targetId: s.qrCodeId,
      severity: "INFO"
    })),
    ...bindLogs.map(b => ({
      timestamp: b.boundAt,
      actor: b.boundBy,
      type: "Bound",
      operation: `Relational mapping anchor established for tag ${b.qrCodeId} onto asset ID ${b.assetId}`,
      targetId: b.qrCodeId,
      severity: "SUCCESS"
    })),
    ...genericLogs.map(g => ({
      timestamp: g.date,
      actor: g.actor,
      type: g.action.includes("Revoke") ? "Retired" : "Generated",
      operation: g.details,
      targetId: g.details.includes("IIUI-") ? g.details.split(" ").slice(-1)[0] : "IIUI-SYSTEM",
      severity: g.severity
    }))
  ].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Apply Search
  const filteredTimeline = compiledTimeline.filter(log => {
    const matchesSearch = log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.targetId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = logTypeFilter === "all" || log.type === logTypeFilter;
    return matchesSearch && matchesType;
  });

  const exportCSV = () => {
    if (filteredTimeline.length === 0) {
      alert("No matching ledger items to export.");
      return;
    }

    const headers = ["Timestamp", "Actor", "Activity Type", "Precise Operation Details", "Target Identifier", "Severity"];
    const rows = filteredTimeline.map(log => [
      log.timestamp,
      log.actor,
      log.type,
      `"${log.operation.replace(/"/g, '""')}"`,
      log.targetId,
      log.severity
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IIUI_QR_Forensics_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredTimeline, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `IIUI_QR_Forensics_${new Date().toISOString().substring(0,10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-1">
      {/* Search and Filters Layout */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <button
          onClick={exportCSV}
          className="h-9 px-4 bg-[#112423] hover:bg-emerald-600/20 border border-emerald-500/10 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer ml-auto"
        >
          <FileSpreadsheet className="h-4 w-4" /> Export CSV Sheet
        </button>
      </div>

      {/* Searching filters */}
      <div className="bg-[#0b1227] border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Filter logs by actor, operation substring, or QR Tag ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 bg-black/40 border border-white/5 rounded-lg pl-9.5 pr-4 text-xs text-slate-200 outline-none focus:border-indigo-500"
          />
        </div>

        {/* Action Type filter */}
        <div className="flex gap-2">
          {["all", "Generated", "Printed", "Bound", "Scanned", "Retired"].map((type) => (
            <button
              key={type}
              onClick={() => setLogTypeFilter(type)}
              className={`h-8.5 px-3 rounded-lg border text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                logTypeFilter === type
                  ? "bg-indigo-650 border-indigo-500 text-white"
                  : "bg-white/5 border-transparent text-slate-400 hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main ledger audit stream tables representation */}
      <div className="bg-[#0b1227] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[9px] font-extrabold uppercase tracking-widest text-slate-400 bg-black/30">
                <th className="p-4 w-52">Execution Timestamp</th>
                <th className="p-4 w-44">Actor account</th>
                <th className="p-4 w-28">Activity</th>
                <th className="p-4">Regulatory Log Operation</th>
                <th className="p-4 w-52">Entity Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[11px] text-slate-350">
              {filteredTimeline.map((item, idx) => {
                const isWarning = item.severity === "WARNING" || item.type === "Retired";
                return (
                  <tr key={idx} className="hover:bg-white/[0.010] transition-colors">
                    <td className="p-4 font-mono text-slate-450 text-[10px]">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-slate-300 text-[11px] font-sans truncate max-w-[150px]" title={item.actor}>
                      {item.actor}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase inline-block ${
                          item.type === "Generated"
                            ? "bg-slate-500/10 text-slate-400"
                            : item.type === "Printed"
                            ? "bg-blue-500/10 text-blue-400"
                            : item.type === "Bound"
                            ? "bg-indigo-500/10 text-indigo-400"
                            : item.type === "Scanned"
                            ? "bg-emerald-505/10 text-emerald-400"
                            : "bg-rose-500/15 text-rose-450 font-black animate-pulse"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4 leading-normal font-medium text-slate-300">
                      {item.operation}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-400">
                      {item.targetId}
                    </td>
                  </tr>
                );
              })}

              {filteredTimeline.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500 italic">
                    {loading ? "Aligning stream streams..." : "No immutable operational checks captured matching choice parameters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
