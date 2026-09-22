import React, { useState, useEffect } from "react";
import { Asset, AssetIssuance } from "../../types";
import { 
  RotateCcw, Search, Filter, CheckCircle2, AlertTriangle, Clock,
  Wrench, Activity, QrCode, ClipboardCheck, ShieldAlert, FileText, User
} from "lucide-react";
import GlassCard from "../GlassCard";
import ActionButton from "../ActionButton";
import { 
  getAllFacultyReturnTickets, 
  updateFacultyReturnTicketStatusGlobal, 
  ReturnTicket 
} from "../faculty/ActiveReturnVerificationPage";
import { addOrUpdateWarning, resolveWarning } from "../../lib/warningRegistry";

interface ReturnTriageDeskProps {
  assets: Asset[];
  issuances: AssetIssuance[];
  onReturnAsset: (assetId: string, condition: string) => Promise<boolean>;
}

export default function ReturnTriageDesk({ assets, issuances, onReturnAsset }: ReturnTriageDeskProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"PASSES" | "LOANS">("PASSES");
  
  // Selection
  const [selectedIssuance, setSelectedIssuance] = useState<AssetIssuance | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<(ReturnTicket & { userId?: string }) | null>(null);

  // Form State
  const [condition, setCondition] = useState("Good");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "warning" | "error"; text: string } | null>(null);

  // Faculty Tickets state
  const [facultyTickets, setFacultyTickets] = useState<(ReturnTicket & { userId?: string })[]>([]);

  const loadFacultyTickets = () => {
    const all = getAllFacultyReturnTickets();
    const pending = all.filter((t) => t.status === "PENDING_WAREHOUSE_SCAN");
    setFacultyTickets(pending);
  };

  useEffect(() => {
    loadFacultyTickets();
    const handleStorageChange = () => loadFacultyTickets();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("faculty-tickets-updated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("faculty-tickets-updated", handleStorageChange);
    };
  }, []);

  // Active issuances
  const activeIssues = issuances.filter(i => i.actualReturnDate === null);
  const getAsset = (id: string) => assets.find(a => a.id === id);

  const filteredTickets = facultyTickets.filter(t => {
    const q = searchTerm.toLowerCase();
    return (
      t.ticketId.toLowerCase().includes(q) ||
      t.assetName.toLowerCase().includes(q) ||
      t.assetTag.toLowerCase().includes(q) ||
      t.notes.toLowerCase().includes(q)
    );
  });

  const filteredIssues = activeIssues.filter(i => {
    const asset = getAsset(i.assetId);
    if (!asset) return false;
    const term = searchTerm.toLowerCase();
    return (
      i.userName.toLowerCase().includes(term) ||
      asset.assetName.toLowerCase().includes(term) ||
      asset.assetTag.toLowerCase().includes(term)
    );
  });

  const isOverdue = (dateStr: string) => {
    const deadline = new Date(dateStr);
    const today = new Date();
    return deadline < today;
  };

  const handleSelectTicket = (ticket: ReturnTicket & { userId?: string }) => {
    setSelectedTicket(ticket);
    // Find matching active issuance if available
    const matchIssue = activeIssues.find((i) => i.assetId === ticket.assetId);
    setSelectedIssuance(matchIssue || null);
    setCondition(ticket.condition === "Minor Defect" || ticket.condition === "Damaged" ? ticket.condition : "Good");
    setNotes("");
  };

  const handleSelectIssuance = (issue: AssetIssuance) => {
    setSelectedIssuance(issue);
    // Find matching ticket if exists
    const matchTicket = facultyTickets.find((t) => t.assetId === issue.assetId);
    setSelectedTicket(matchTicket || null);
    setCondition("Good");
    setNotes("");
  };

  const handleReturn = async () => {
    const targetAssetId = selectedTicket ? selectedTicket.assetId : selectedIssuance?.assetId;
    if (!targetAssetId) return;

    setProcessing(true);
    setStatusMessage(null);
    const success = await onReturnAsset(targetAssetId, condition);
    if (success) {
      updateFacultyReturnTicketStatusGlobal(targetAssetId, "CHECKED_IN");
      resolveWarning(targetAssetId, notes || "Physical return confirmed at inspection desk.");
      const asset = getAsset(targetAssetId);
      if (asset) {
        resolveWarning(asset.assetTag, notes || "Physical return confirmed at inspection desk.");
      }
      setStatusMessage({
        type: "success",
        text: `Physical return confirmed for ${asset?.assetName || targetAssetId}. Liability released & asset restored to Available stock.`
      });
      setSelectedIssuance(null);
      setSelectedTicket(null);
      setCondition("Good");
      setNotes("");
      loadFacultyTickets();
    } else {
      setStatusMessage({
        type: "error",
        text: "System Error: Failed to process return check-in. Please verify asset state."
      });
    }
    setProcessing(false);
  };

  const handleRejectDeficiency = () => {
    const targetAssetId = selectedTicket ? selectedTicket.assetId : selectedIssuance?.assetId;
    if (!targetAssetId) return;

    const asset = getAsset(targetAssetId);
    const reason = notes || "Missing required accessories or components at physical handback.";
    updateFacultyReturnTicketStatusGlobal(targetAssetId, "REJECTED_DEFICIENCY", reason);

    if (asset) {
      addOrUpdateWarning({
        ticketId: selectedTicket?.ticketId,
        assetId: targetAssetId,
        assetName: asset.assetName,
        assetTag: asset.assetTag,
        serialNumber: asset.serialNumber,
        category: asset.category,
        userName: selectedIssuance?.userName || selectedTicket?.userId || "Faculty Custodian",
        department: selectedIssuance?.department || "Academic Department",
        reason: reason,
        status: "ACTIVE_NOTICE"
      });
    }
    
    setStatusMessage({
      type: "warning",
      text: `Handback rejected for ${asset?.assetName || targetAssetId}. Deficiency warning recorded and issued to faculty borrower.`
    });
    
    setSelectedIssuance(null);
    setSelectedTicket(null);
    setNotes("");
    loadFacultyTickets();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto py-1 select-none">
      {statusMessage && (
        <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between shadow-lg ${
          statusMessage.type === "success"
            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
            : statusMessage.type === "warning"
            ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
            : "bg-rose-500/15 border-rose-500/30 text-rose-300"
        }`}>
          <span>{statusMessage.type === "success" ? "✓" : "⚠"} {statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="font-bold text-sm cursor-pointer px-1">×</button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <RotateCcw className="h-6 w-6 text-amber-400" />
            Item Return & Inspection Desk
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Process returned items, inspect equipment condition, log any damage, and clear user loans.
          </p>
        </div>
        
        <div className="flex bg-[#0b1227] border border-white/5 rounded-xl p-1 gap-1 self-start shrink-0">
          <div className="px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold flex items-center gap-2">
            <Activity className="h-3.5 w-3.5" />
            {activeIssues.length} Active Holds
          </div>
          <div className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            {activeIssues.filter(i => isOverdue(i.returnDate)).length} Overdue
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <GlassCard className="xl:col-span-2 p-0 overflow-hidden flex flex-col h-[700px]">
          {/* Header Controls & Sub-Tabs */}
          <div className="p-4 border-b border-white/5 bg-slate-900/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Tab Selector */}
              <div className="flex bg-[#0a0f1d] p-1 rounded-xl border border-white/10 gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("PASSES");
                    setSelectedIssuance(null);
                    setSelectedTicket(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === "PASSES"
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <QrCode className="h-3.5 w-3.5" />
                  Faculty Return Passes ({facultyTickets.length})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("LOANS");
                    setSelectedIssuance(null);
                    setSelectedTicket(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === "LOANS"
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Activity className="h-3.5 w-3.5" />
                  Active Loans Ledger ({activeIssues.length})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder={activeTab === "PASSES" ? "Search by Ticket ID, tag, equipment..." : "Search by custodian name, tag..."}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto">
            {activeTab === "PASSES" ? (
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="text-[10px] uppercase tracking-wider text-slate-400 bg-[#0a0f1d]/90 sticky top-0 z-10 shadow-md font-extrabold">
                  <tr>
                    <th className="px-5 py-3.5">Ticket ID & Hardware</th>
                    <th className="px-5 py-3.5">Faculty Declared State</th>
                    <th className="px-5 py-3.5">Faculty Remarks</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket) => {
                      const isSelected = selectedTicket?.ticketId === ticket.ticketId;
                      return (
                        <tr
                          key={ticket.ticketId}
                          onClick={() => handleSelectTicket(ticket)}
                          className={`hover:bg-white/[0.04] transition-colors cursor-pointer ${
                            isSelected ? "bg-amber-500/10 border-l-2 border-l-amber-500" : ""
                          }`}
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 font-mono text-[10px] font-bold">
                                <QrCode className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-extrabold text-white text-xs">{ticket.assetName}</p>
                                <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 mt-0.5">
                                  <span className="text-amber-300 font-bold">{ticket.ticketId}</span>
                                  <span>•</span>
                                  <span className="text-indigo-300">{ticket.assetTag}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase border inline-block ${
                              ticket.condition === "Good"
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                                : ticket.condition === "Fair"
                                ? "bg-sky-500/15 border-sky-500/30 text-sky-300"
                                : "bg-rose-500/15 border-rose-500/30 text-rose-300"
                            }`}>
                              Declared: {ticket.condition}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-slate-300 max-w-xs truncate text-[11px]">
                            {ticket.notes || "Regular equipment handback."}
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <button
                              type="button"
                              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all border ${
                                isSelected
                                  ? "bg-amber-500 border-amber-400 text-slate-950 shadow-md"
                                  : "bg-[#0a0f1d] border-white/10 text-amber-400 hover:bg-amber-500/10"
                              }`}
                            >
                              Inspect & Verify
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                        {searchTerm ? "No return passes matching search." : "No pending Faculty Return Passes awaiting inspection."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="text-[10px] uppercase tracking-wider text-slate-400 bg-[#0a0f1d]/90 sticky top-0 z-10 shadow-md font-extrabold">
                  <tr>
                    <th className="px-5 py-3.5">Asset Identity</th>
                    <th className="px-5 py-3.5">Custodian</th>
                    <th className="px-5 py-3.5">Issuance Ledger</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {filteredIssues.length > 0 ? (
                    filteredIssues.map(issue => {
                      const asset = getAsset(issue.assetId);
                      if (!asset) return null;
                      const overdue = isOverdue(issue.returnDate);
                      const isSelected = selectedIssuance?.id === issue.id && !selectedTicket;
                      
                      return (
                        <tr 
                          key={issue.id} 
                          onClick={() => handleSelectIssuance(issue)}
                          className={`hover:bg-white/[0.04] transition-colors cursor-pointer ${
                            isSelected ? "bg-amber-500/10 border-l-2 border-l-amber-500" : ""
                          }`}
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center border ${
                                overdue ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                              }`}>
                                <QrCode className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-extrabold text-white text-xs">{asset.assetName}</p>
                                <p className="text-[10px] text-indigo-300 font-mono mt-0.5">{asset.assetTag}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2 text-slate-300">
                              <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-white/10 shrink-0">
                                {issue.userName.charAt(0)}
                              </div>
                              <span className="font-medium truncate max-w-[120px] text-xs">{issue.userName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex flex-col gap-0.5 text-[11px]">
                              <span className="text-slate-400">Issued: {issue.issuedDate}</span>
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className="text-slate-300">Due: {issue.returnDate}</span>
                                {overdue && <span className="px-1.5 py-0.5 bg-rose-500/15 text-rose-400 rounded text-[9px] font-bold uppercase tracking-wider">Overdue</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button 
                              type="button"
                              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                                isSelected
                                  ? "bg-amber-500 border-amber-400 text-slate-950 shadow-md"
                                  : "bg-[#0a0f1d] border-white/10 text-amber-400 hover:bg-amber-500/10"
                              }`}
                            >
                              Triage
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                        {searchTerm ? "No assets matching search query" : "No active issuances to triage"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </GlassCard>

        {/* Action / Inspection Panel */}
        <div className="h-[700px] flex flex-col">
          {(selectedTicket || selectedIssuance) ? (
            <GlassCard className="flex-1 p-0 flex flex-col overflow-hidden border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)]">
              <div className="p-4 border-b border-amber-500/10 bg-amber-500/5">
                <h3 className="font-extrabold text-sm text-amber-400 flex items-center gap-2">
                  <ClipboardCheck className="h-4.5 w-4.5" />
                  Store Manager Physical Inspection
                </h3>
                <p className="text-[11px] text-amber-400/70 mt-0.5">
                  Inspect physical hardware condition before confirming liability release.
                </p>
              </div>

              <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
                {/* Faculty Return Declaration Card (If ticket present) */}
                {selectedTicket && (
                  <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" /> Faculty Return Declaration
                      </span>
                      <span className="font-mono text-[10px] text-indigo-300 font-bold">{selectedTicket.ticketId}</span>
                    </div>

                    <div className="space-y-1 text-slate-300 text-[11px]">
                      <p className="flex justify-between">
                        <span className="text-slate-400">Equipment:</span>
                        <strong className="text-white">{selectedTicket.assetName} ({selectedTicket.assetTag})</strong>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400">Faculty Reported Condition:</span>
                        <span className="font-extrabold text-amber-300">{selectedTicket.condition}</span>
                      </p>
                      <div className="pt-1.5 border-t border-indigo-500/20 text-slate-300 italic">
                        "{selectedTicket.notes}"
                      </div>
                    </div>
                  </div>
                )}

                {/* Hardware Context */}
                {selectedIssuance && (
                  <div className="bg-[#0a0f1d] border border-white/10 rounded-xl p-3 space-y-1.5 text-[11px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Hardware Manifest Context</span>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Borrower:</span>
                      <strong className="text-white">{selectedIssuance.userName}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300 font-mono">
                      <span className="text-slate-500">Return Deadline:</span>
                      <span className="text-amber-300 font-bold">{selectedIssuance.returnDate}</span>
                    </div>
                  </div>
                )}

                {/* Physical Inspection Condition Controls */}
                <div className="space-y-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-indigo-400" /> Verified Physical Condition
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Good', 'Fair', 'Minor Defect', 'Damaged', 'Repairing'] as const).map(cond => (
                        <button
                          type="button"
                          key={cond}
                          onClick={() => setCondition(cond)}
                          className={`p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            condition === cond 
                              ? cond === 'Damaged' || cond === 'Repairing' 
                                ? 'bg-rose-500/30 border-rose-500 text-rose-200' 
                                : 'bg-emerald-500/30 border-emerald-500 text-emerald-200'
                              : 'bg-[#0a0f1d] border-white/10 text-slate-400 hover:border-white/20'
                          } ${cond === 'Repairing' ? 'col-span-2' : ''}`}
                        >
                          {cond === 'Damaged' && <AlertTriangle className="h-3 w-3 inline mr-1 text-rose-400" />}
                          {cond === 'Repairing' && <Wrench className="h-3 w-3 inline mr-1 text-amber-400" />}
                          {cond}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Store Manager Physical Inspection Remarks
                    </label>
                    <textarea 
                      rows={3}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Note physical wear, missing charger/cables, or required maintenance procedures..."
                      className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 placeholder:text-slate-600 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-white/10 bg-slate-900/80 space-y-2">
                <ActionButton 
                  onClick={handleReturn} 
                  loading={processing}
                  className="w-full font-extrabold text-xs py-2.5 shadow-lg"
                  variant={condition === 'Damaged' || condition === 'Repairing' ? 'danger' : 'success'}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Accept Physical Return & Clear Liability
                </ActionButton>

                <button
                  type="button"
                  onClick={handleRejectDeficiency}
                  disabled={processing}
                  className="w-full py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                  Reject & Issue Deficiency Warning Notice
                </button>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="flex-1 flex flex-col items-center justify-center p-8 text-center border-dashed border-white/10 bg-white/[0.01]">
              <div className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center mb-3 text-slate-500">
                <RotateCcw className="h-7 w-7" />
              </div>
              <h3 className="text-base font-extrabold text-white mb-1">No Item or Return Pass Selected</h3>
              <p className="text-xs text-slate-400 max-w-[240px]">
                Select a Faculty Return Pass or Active Loan from the table to run physical inspection & release liability.
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
