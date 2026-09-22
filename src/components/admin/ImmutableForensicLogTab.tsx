import React from "react";
import { FileText, Printer } from "lucide-react";

export interface AuditEvent {
  id: string;
  date: string;
  actor: string;
  department: string;
  action: string;
  type: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  details: string;
}

interface ImmutableForensicLogTabProps {
  filteredAuditsList: AuditEvent[];
  selectedDept: string;
  setSelectedDept: (dept: string) => void;
  selectedSeverity: string;
  setSelectedSeverity: (severity: string) => void;
  setAuditSearch: (search: string) => void;
  campusDepts: string[];
  todayStr: string;
  handlePrint: () => void;
}

export default function ImmutableForensicLogTab({
  filteredAuditsList,
  selectedDept,
  setSelectedDept,
  selectedSeverity,
  setSelectedSeverity,
  setAuditSearch,
  campusDepts,
  todayStr,
  handlePrint
}: ImmutableForensicLogTabProps) {
  return (
    <div className="space-y-6" id="immutable-forensic-log-tab">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-950/20 p-4 border border-white/5 rounded-2xl">
        <div className="flex gap-2 items-center">
          <FileText className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">Activity & Audit History Logs</h4>
            <p className="text-[10.5px] text-slate-400 font-sans">Official history recording equipment issuances, returns, clearances, and system changes.</p>
          </div>
        </div>

        {/* Severity, department and live searches */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="flex-1 min-w-[140px]">
            <input 
              type="text" 
              placeholder="Filter by custodian, details..." 
              onChange={(e) => setAuditSearch(e.target.value)}
              className="bg-slate-950/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none w-full placeholder-slate-500 font-sans"
            />
          </div>

          <select 
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none cursor-pointer font-sans"
          >
            <option value="all">Sectors: All</option>
            {campusDepts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select 
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none cursor-pointer font-sans"
          >
            <option value="all">Severity: All</option>
            <option value="INFO">Level: INFO</option>
            <option value="WARNING">Level: WARNING</option>
            <option value="CRITICAL">Level: CRITICAL</option>
          </select>

          {/* PDF style raw print export */}
          <button 
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-lg text-xs font-mono text-white flex items-center gap-1 cursor-pointer shadow-md transition-all shrink-0"
          >
            <Printer className="h-3.5 w-3.5 shrink-0" /> Export System Report
          </button>
        </div>
      </div>

      {/* Export / Printable container */}
      <div className="p-6 bg-slate-950/80 border border-white/5 rounded-3xl space-y-4 print:bg-white print:text-black print:p-0 print:border-none">
        {/* Stamp header for print */}
        <div className="hidden print:block border-b-2 border-black pb-4 mb-4">
          <h1 className="text-xl font-bold tracking-tight">INTERNATIONAL ISLAMIC UNIVERSITY ISLAMABAD (IIUI)</h1>
          <h2 className="text-sm font-semibold tracking-wide text-gray-700">INTELLIGENT COMPLIANCE & ASSET AUDIT SHEET</h2>
          <p className="text-[10px] text-gray-500 font-mono mt-1">Generated: {todayStr} • Authority Ref: IIUI-AIITS-AUDIT-2026-X83</p>
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-widest pb-2 border-b border-white/5 print:text-black print:border-black">
          <span>🖨️ IMMUTABLE DECENTRALIZED PROTOCOL SHEET</span>
          <span>STABILITY INTEGRITY SCORE: 100% EXCELLENT GRADE</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.01] print:bg-gray-100 print:border-black text-[10px] font-black uppercase text-slate-400 print:text-black tracking-wider">
                <th className="px-4 py-3 font-mono">Event Reference ID</th>
                <th className="px-4 py-3">Timestamp Date</th>
                <th className="px-4 py-3">Operation Target Custodian</th>
                <th className="px-4 py-3">Audit Details Description</th>
                <th className="px-4 py-3">Risk Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] print:divide-y print:divide-gray-300">
              {filteredAuditsList.map(item => (
                <tr key={item.id} className="hover:bg-white/[0.01] text-[11px] print:text-black">
                  <td className="px-4 py-3 font-mono text-slate-500 print:text-gray-800 text-[10px] select-all">{item.id}</td>
                  <td className="px-4 py-3 font-mono text-slate-405 print:text-gray-900 leading-normal">{item.date}</td>
                  <td className="px-4 py-3 text-slate-200 print:text-black font-semibold">
                    <div>{item.actor}</div>
                    <span className="text-[9px] text-slate-500 block print:text-gray-650 mt-0.5">{item.department}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 print:text-black font-medium leading-relaxed max-w-[280px]">{item.details}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                      item.severity === "CRITICAL"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : item.severity === "WARNING"
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/15"
                        : "bg-emerald-550/10 text-emerald-450 border-emerald-555/15"
                    }`}>
                      {item.severity}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredAuditsList.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-slate-500 text-xs py-14 font-mono font-bold tracking-widest uppercase">
                    // NO AUDIT ENTRIES FOUND MATCHING SELECTION FILTERS
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Print Sign off Stamp blocks */}
        <div className="hidden print:grid grid-cols-2 gap-10 pt-16 mt-16 text-[10px] text-center border-t border-dashed border-gray-400">
          <div>
            <div className="border-b border-black w-44 mx-auto pb-4 mb-2" />
            <h5 className="font-extrabold uppercase text-gray-800">STORE LOGISTICS MANAGER SIGNATURE</h5>
            <p className="text-gray-500 mt-0.5 font-sans">Verified on {todayStr}</p>
          </div>
          <div>
            <div className="border-b border-black w-44 mx-auto pb-4 mb-2" />
            <h5 className="font-extrabold uppercase text-gray-800">CENTRAL ADMINISTRATIVE VICE CHANCELLOR OFFICE STAMP</h5>
            <p className="text-gray-500 mt-0.5 font-sans">Audit Stamp No: IIUI-GP-92</p>
          </div>
        </div>
      </div>
    </div>
  );
}
