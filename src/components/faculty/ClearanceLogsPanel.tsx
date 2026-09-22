import React, { useState } from "react";
import { History, ShieldCheck, Download, ExternalLink, Printer, Award, FileCheck2, HelpCircle, X, CheckSquare, Search } from "lucide-react";
import { NDCRequest, User } from "../../types";
import StatusBadge from "../StatusBadge";

interface ClearanceLogsPanelProps {
  myNdcRequests: NDCRequest[];
  currentUser: User;
}

export default function ClearanceLogsPanel({
  myNdcRequests,
  currentUser,
}: ClearanceLogsPanelProps) {
  const [selectedCertificate, setSelectedCertificate] = useState<NDCRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRequests = myNdcRequests.filter((req) => 
    req.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.approvedBy && req.approvedBy.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <History className="h-4.5 w-4.5 text-emerald-450" /> Exit Clearance Registers & Receipts
          </h4>
          <p className="text-[11px] text-slate-400 mt-1">
            Browse previous No Dues database entries and claim signed digital clearance certificates.
          </p>
        </div>

        {/* Dense Search Input */}
        <div className="relative max-w-xs w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Search className="h-3.5 w-3.5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search records database..."
            className="w-full bg-slate-950/40 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:ring-1 focus:ring-indigo-550 text-white placeholder-slate-600 outline-none font-semibold font-mono"
          />
        </div>
      </div>

      {/* Database registers table */}
      <div className="rounded-xl border border-white/10 bg-white/[0.01] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-slate-450 uppercase text-[9px] font-bold">
                <th className="px-5 py-3.5">Logged Date</th>
                <th className="px-5 py-3.5">Verification Docket Reference</th>
                <th className="px-5 py-3.5">Administrative Remarks</th>
                <th className="px-5 py-3.5">Authorized Signee</th>
                <th className="px-5 py-3.5">Status Badge</th>
                <th className="px-5 py-3.5 text-right">Certificate Ledger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03] text-slate-350">
              {filteredRequests.map((req) => (
                <tr key={req.id} id={`log-row-${req.id}`} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 font-mono text-slate-300">{req.requestDate}</td>
                  <td className="px-5 py-4 font-semibold text-white">IIUI-NDC-{req.id.slice(0, 6).toUpperCase()}</td>
                  <td className="px-5 py-4 text-slate-400 leading-normal max-w-xs truncate" title={req.remarks}>{req.remarks}</td>
                  <td className="px-5 py-4 text-slate-405 font-bold font-sans">{req.approvedBy || "Under Settle-Check Enqueue"}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    {req.status === "Approved" ? (
                      <button
                        onClick={() => setSelectedCertificate(req)}
                        className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25 px-2.5 py-1 rounded font-bold text-[9px] uppercase tracking-wider font-sans transition-all cursor-pointer"
                      >
                        <Award className="h-3.5 w-3.5" /> Claim Seal
                      </button>
                    ) : (
                      <span className="text-[9px] text-slate-600 uppercase font-black select-none font-sans mr-2">Locked</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[10.5px] text-slate-500 font-sans font-medium">
                    No historical exit clearance logs discovered matching current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIGITAL CLEARANCE CERTIFICATE MODAL */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0b1329] border-2 border-emerald-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            
            {/* Visual watermarks background elements */}
            <div className="absolute inset-0 z-0 opacity-5 pointer-events-none select-none flex items-center justify-center">
              <ShieldCheck className="h-96 w-96 text-emerald-500" />
            </div>

            {/* Modal Head Controls */}
            <div className="flex justify-between items-center z-10 relative border-b border-white/5 pb-3">
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase font-black">
                Authorized Central Registry Receipts Verified
              </span>
              <button 
                onClick={() => setSelectedCertificate(null)}
                className="text-slate-450 hover:text-white p-1 rounded hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* HIGH-FIDELITY CERTIFICATE SHEET */}
            <div className="bg-amber-50/5 text-slate-100 border border-amber-500/20 rounded-xl p-8 space-y-8 relative font-serif mx-2 z-10 shadow-inner">
              
              {/* Institutional Crest representation */}
              <div className="text-center space-y-1">
                <FileCheck2 className="h-9 w-9 text-emerald-400 mx-auto" />
                <h2 className="text-sm font-black font-sans uppercase tracking-widest text-[#d5af54]">International Islamic University Islamabad</h2>
                <h3 className="text-[10px] font-sans uppercase text-slate-300 font-bold tracking-wider">OFFICE OF THE REGISTRAR & CAMPUS STORE LEDGER</h3>
              </div>

              {/* Certificate Main Statement */}
              <div className="space-y-4 text-center font-sans">
                <h1 className="text-lg font-black tracking-widest uppercase text-white font-serif border-y border-amber-500/10 py-1 max-w-xs mx-auto">NO DUES CERTIFICATE</h1>
                <p className="text-xs text-slate-300 leading-relaxed font-serif text-justify px-4">
                  This document serves to certify that all hardware tag assignments, university properties, computer laptop assets, and classroom equipment borrowings issued in favor of:
                </p>
                <div className="py-2 border-b border-dashed border-white/10 max-w-sm mx-auto">
                  <h4 className="text-sm font-black tracking-wide text-white font-sans uppercase">{currentUser.name}</h4>
                  <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">MEMBER ID: {currentUser.id} • DEPT: {currentUser.department}</p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-serif text-justify px-4">
                  have been physically reclaimed, verified, barcode-scanned, and fully accounted for in the central university registry database. There exist zero outstanding liabilities or dues.
                </p>
              </div>

              {/* Timestamp & Signature Area */}
              <div className="grid grid-cols-2 gap-8 text-center pt-4 font-sans border-t border-white/5">
                <div className="space-y-1.5 text-left pl-4">
                  <span className="text-[9.5px] text-slate-500 uppercase font-mono block">Certificate Status: Verified</span>
                  <div className="text-[9.5px] text-emerald-400 font-mono font-bold flex items-center gap-1 uppercase bg-emerald-500/10 border border-emerald-500/20 py-0.5 px-2 rounded w-fit">
                    <ShieldCheck className="h-3 w-3" /> SECURE SEAL PROVED
                  </div>
                  <span className="text-[9.5px] text-slate-400 font-mono block">SIGNED ON: {selectedCertificate.requestDate}</span>
                </div>

                <div className="space-y-1 text-right pr-4">
                  <span className="text-[10.5px] font-black text-slate-205 block font-serif uppercase tracking-wide">Sajid Mahmood</span>
                  <span className="text-[9px] text-[#d5af54] font-semibold block uppercase">AUTHORIZED STORE REGISTRAR</span>
                  <span className="text-[8.5px] text-slate-500 font-mono block">IIUI CAMPUS SECURE DOCKETS</span>
                </div>
              </div>
            </div>

            {/* Action controls */}
            <div className="flex gap-3 justify-end z-10 relative pt-2 border-t border-white/5">
              <button
                onClick={handlePrint}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-2 px-4 rounded-lg text-xs tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Printer className="h-3.5 w-3.5" /> Local Print
              </button>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-xs tracking-wider uppercase flex items-center gap-1 transition-all cursor-pointer shadow-lg shadow-indigo-650/15"
              >
                Close Receipt Sheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
