import React, { useState, useEffect } from "react";
import { Asset, User } from "../../types";
import { 
  QrCode, Search, Clock, CheckCircle2, 
  Printer, XCircle, RotateCcw, Laptop, AlertTriangle, FileText,
  ShieldCheck, ShieldAlert, Sparkles, ChevronRight, Eye
} from "lucide-react";
import Modal from "../Modal";

export interface ReturnTicket {
  ticketId: string;
  issuanceId: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  condition: string;
  notes: string;
  createdAt: string;
  status: "PENDING_WAREHOUSE_SCAN" | "CHECKED_IN" | "REJECTED_DEFICIENCY";
  rejectionReason?: string;
  rejectedAt?: string;
}

interface ActiveReturnVerificationPageProps {
  currentUser: User;
  assets: Asset[];
  onNavigateToReturnPortal?: () => void;
  returnAsset?: (assetId: string, condition: string) => Promise<boolean>;
  refreshAll?: () => void;
}

export const INITIAL_TICKETS_KEY = "iiui_return_tickets";

export function getStoredReturnTickets(userId: string): ReturnTicket[] {
  try {
    const raw = localStorage.getItem(`${INITIAL_TICKETS_KEY}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading stored return tickets:", e);
  }
  return [];
}

export function saveStoredReturnTickets(userId: string, tickets: ReturnTicket[]) {
  try {
    localStorage.setItem(`${INITIAL_TICKETS_KEY}_${userId}`, JSON.stringify(tickets));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("faculty-tickets-updated"));
  } catch (e) {
    console.error("Error saving return tickets:", e);
  }
}

export function getAllFacultyReturnTickets(): (ReturnTicket & { userId?: string })[] {
  const allTickets: (ReturnTicket & { userId?: string })[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${INITIAL_TICKETS_KEY}_`)) {
        const userId = key.replace(`${INITIAL_TICKETS_KEY}_`, "");
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((t) => allTickets.push({ ...t, userId }));
          }
        }
      }
    }
  } catch (e) {
    console.error("Error reading all faculty return tickets:", e);
  }
  return allTickets;
}

export function updateFacultyReturnTicketStatusGlobal(
  assetIdOrTagOrTicket: string,
  status: "CHECKED_IN" | "REJECTED_DEFICIENCY",
  rejectionReason?: string
) {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${INITIAL_TICKETS_KEY}_`)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const tickets: ReturnTicket[] = JSON.parse(raw);
          let modified = false;
          const updated = tickets.map((t) => {
            if (
              t.assetId === assetIdOrTagOrTicket || 
              t.assetTag === assetIdOrTagOrTicket || 
              t.ticketId === assetIdOrTagOrTicket
            ) {
              modified = true;
              return {
                ...t,
                status,
                rejectionReason: rejectionReason !== undefined ? rejectionReason : t.rejectionReason,
                rejectedAt: status === "REJECTED_DEFICIENCY" 
                  ? new Date().toISOString().replace("T", " ").substring(0, 16) 
                  : t.rejectedAt,
              };
            }
            return t;
          });
          if (modified) {
            localStorage.setItem(key, JSON.stringify(updated));
          }
        }
      }
    }
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("faculty-tickets-updated"));
  } catch (e) {
    console.error("Error updating faculty return ticket status globally:", e);
  }
}

export default function ActiveReturnVerificationPage({
  currentUser,
  assets,
  onNavigateToReturnPortal,
  returnAsset,
  refreshAll,
}: ActiveReturnVerificationPageProps) {
  const [tickets, setTickets] = useState<ReturnTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING_WAREHOUSE_SCAN" | "CHECKED_IN" | "REJECTED_DEFICIENCY">("ALL");
  
  // Modals State
  const [activePassTicket, setActivePassTicket] = useState<ReturnTicket | null>(null);
  const [warningModalTicket, setWarningModalTicket] = useState<ReturnTicket | null>(null);
  const [detailsModalTicket, setDetailsModalTicket] = useState<ReturnTicket | null>(null);
  const [receiptTicket, setReceiptTicket] = useState<ReturnTicket | null>(null);

  // Status Action message
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const loadMyTickets = () => {
    const loaded = getStoredReturnTickets(currentUser.id);
    setTickets(loaded);
  };

  useEffect(() => {
    loadMyTickets();
    const handleSync = () => loadMyTickets();
    window.addEventListener("storage", handleSync);
    window.addEventListener("faculty-tickets-updated", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("faculty-tickets-updated", handleSync);
    };
  }, [currentUser.id]);

  const handleCancelTicket = (ticketId: string) => {
    const updated = tickets.filter((t) => t.ticketId !== ticketId);
    setTickets(updated);
    saveStoredReturnTickets(currentUser.id, updated);
  };

  // Immediate tester simulations
  const handleSimulateStoreCheckIn = async (ticket: ReturnTicket) => {
    updateFacultyReturnTicketStatusGlobal(ticket.ticketId, "CHECKED_IN");
    if (returnAsset) {
      await returnAsset(ticket.assetId, ticket.condition || "Good");
    }
    if (refreshAll) {
      refreshAll();
    }
    loadMyTickets();
    setActionFeedback(`Store Manager verification verified for ${ticket.assetName}. Liability released!`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleSimulateDeficiencyWarning = (ticket: ReturnTicket) => {
    updateFacultyReturnTicketStatusGlobal(
      ticket.ticketId,
      "REJECTED_DEFICIENCY",
      "Missing original 65W charging adapter brick and power cable upon physical handback."
    );
    if (refreshAll) {
      refreshAll();
    }
    loadMyTickets();
    setActionFeedback(`Deficiency warning notice issued for ${ticket.assetName}. Liability remains active.`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assetTag.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && t.status === statusFilter;
  });

  const pendingCount = tickets.filter((t) => t.status === "PENDING_WAREHOUSE_SCAN").length;
  const checkedInCount = tickets.filter((t) => t.status === "CHECKED_IN").length;
  const rejectedCount = tickets.filter((t) => t.status === "REJECTED_DEFICIENCY").length;

  return (
    <div className="space-y-6 animate-fade-in select-none max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <QrCode className="h-5 w-5 text-amber-400" />
            Active Return Verification Passes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Central ledger of generated digital return passes ready for Central Store Manager physical check-in and clearance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToReturnPortal && (
            <button
              type="button"
              onClick={onNavigateToReturnPortal}
              className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Return Equipment
            </button>
          )}
          <span className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full font-mono">
            {pendingCount} Pending Store Verification
          </span>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg">
          <span>✓ {actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="cursor-pointer text-sm">×</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#0a0f1d]/90 border border-indigo-500/20 rounded-2xl space-y-1">
          <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block">Total Return Passes</span>
          <p className="text-2xl font-black text-white font-mono">{tickets.length}</p>
          <p className="text-[11px] text-slate-400">All handback passes generated</p>
        </div>

        <div className="p-4 bg-[#0a0f1d]/90 border border-amber-500/30 rounded-2xl space-y-1 relative overflow-hidden">
          <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block">Awaiting Physical Inspection</span>
          <p className="text-2xl font-black text-amber-300 font-mono flex items-center gap-2">
            {pendingCount}
            {pendingCount > 0 && <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />}
          </p>
          <p className="text-[11px] text-amber-300/80">Pending Store Manager warehouse verification</p>
        </div>

        <div className="p-4 bg-[#0a0f1d]/90 border border-emerald-500/20 rounded-2xl space-y-1">
          <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block font-mono">Confirmed & Handed Back</span>
          <p className="text-2xl font-black text-emerald-300 font-mono">{checkedInCount}</p>
          <p className="text-[11px] text-slate-400">Liability cleared by Store Manager</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#0a0f1d]/90 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {(["ALL", "PENDING_WAREHOUSE_SCAN", "CHECKED_IN", "REJECTED_DEFICIENCY"] as const).map((filterKey) => {
              const labels = {
                ALL: "All Passes",
                PENDING_WAREHOUSE_SCAN: "Awaiting Inspection",
                CHECKED_IN: "Confirmed Returns",
                REJECTED_DEFICIENCY: "Deficiency Warnings",
              };
              return (
                <button
                  type="button"
                  key={filterKey}
                  onClick={() => setStatusFilter(filterKey)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === filterKey
                      ? "bg-amber-500 text-slate-950 font-black shadow-lg"
                      : "bg-slate-900 border border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  {labels[filterKey]}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Ticket ID, Asset, Tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 text-white pl-9 pr-3 py-1.5 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* Simplified Table List */}
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-white/10 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="p-3.5 pl-4">Ticket ID</th>
                <th className="p-3.5">Equipment & Tag</th>
                <th className="p-3.5">Declared Condition</th>
                <th className="p-3.5">Return Remarks</th>
                <th className="p-3.5">Created Date</th>
                <th className="p-3.5">Store Inspection Status</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.ticketId}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => setDetailsModalTicket(ticket)}
                  >
                    {/* Ticket ID */}
                    <td className="p-3.5 pl-4">
                      <span className="font-mono font-extrabold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg text-xs">
                        {ticket.ticketId}
                      </span>
                    </td>

                    {/* Equipment & Tag */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                          <Laptop className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-white text-xs">{ticket.assetName}</p>
                          <p className="text-[10px] font-mono text-indigo-300">{ticket.assetTag}</p>
                        </div>
                      </div>
                    </td>

                    {/* Condition */}
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold border ${
                        ticket.condition === "Good"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                          : ticket.condition === "Fair"
                          ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-300"
                      }`}>
                        {ticket.condition}
                      </span>
                    </td>

                    {/* Remarks */}
                    <td className="p-3.5 max-w-xs text-slate-300 italic truncate">
                      {ticket.notes || "Regular handback"}
                    </td>

                    {/* Created Date */}
                    <td className="p-3.5 font-mono text-[11px] text-slate-300">
                      {ticket.createdAt}
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      {ticket.status === "PENDING_WAREHOUSE_SCAN" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-300">
                          <Clock className="h-3 w-3 animate-spin text-amber-400" /> Awaiting Inspection
                        </span>
                      ) : ticket.status === "CHECKED_IN" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Handback Accepted & Cleared
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 border border-rose-500/30 text-rose-400">
                          <AlertTriangle className="h-3 w-3 text-rose-400" /> Deficiency Warning Notice
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {ticket.status === "REJECTED_DEFICIENCY" ? (
                          <button
                            type="button"
                            onClick={() => setWarningModalTicket(ticket)}
                            className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <AlertTriangle className="h-3 w-3 text-rose-400" /> View Warning
                          </button>
                        ) : ticket.status === "CHECKED_IN" ? (
                          <button
                            type="button"
                            onClick={() => setReceiptTicket(ticket)}
                            className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <ShieldCheck className="h-3 w-3 text-emerald-400" /> Clearance Receipt
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setActivePassTicket(ticket)}
                              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <QrCode className="h-3 w-3" /> Show Pass
                            </button>

                            {/* Tester Simulation Quick Button */}
                            <button
                              type="button"
                              onClick={() => handleSimulateStoreCheckIn(ticket)}
                              title="Instant Tester Action: Verify Handback as Store Manager"
                              className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <ShieldCheck className="h-3 w-3" /> Verify
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSimulateDeficiencyWarning(ticket)}
                              title="Instant Tester Action: Issue Deficiency Notice"
                              className="px-2 py-1 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <AlertTriangle className="h-3 w-3" /> Warning
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCancelTicket(ticket.ticketId)}
                              title="Cancel / Void Ticket"
                              className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                    {tickets.length === 0 ? (
                      <div className="space-y-3 py-4 max-w-md mx-auto">
                        <QrCode className="h-10 w-10 text-amber-400 mx-auto" />
                        <div>
                          <p className="font-extrabold text-white not-italic text-sm">No Active Return Passes</p>
                          <p className="text-xs text-slate-400 mt-1">
                            You have no generated return passes on record. Go to Return Equipment to select hardware and issue a return pass.
                          </p>
                        </div>
                        {onNavigateToReturnPortal && (
                          <button
                            type="button"
                            onClick={onNavigateToReturnPortal}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-lg not-italic mt-2"
                          >
                            <RotateCcw className="h-4 w-4" /> Return Equipment
                          </button>
                        )}
                      </div>
                    ) : (
                      "No return passes match your search filter."
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILS DOSSIER MODAL (When clicking any row or item) */}
      {detailsModalTicket && (
        <Modal
          isOpen={true}
          onClose={() => setDetailsModalTicket(null)}
          title={`Return Pass Dossier - ${detailsModalTicket.ticketId}`}
        >
          <div className="space-y-4 text-xs select-none">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h4 className="font-extrabold text-white text-sm">{detailsModalTicket.assetName}</h4>
                <p className="text-[10px] font-mono text-slate-400">Tag: {detailsModalTicket.assetTag}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full font-bold text-[10.5px] uppercase border ${
                detailsModalTicket.status === "CHECKED_IN"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                  : detailsModalTicket.status === "REJECTED_DEFICIENCY"
                  ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                  : "bg-amber-500/15 border-amber-500/30 text-amber-300"
              }`}>
                {detailsModalTicket.status === "CHECKED_IN" ? "Checked In & Cleared" : detailsModalTicket.status === "REJECTED_DEFICIENCY" ? "Deficiency Warning" : "Awaiting Store Verification"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-white/5 font-mono text-[11px]">
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Ticket ID</span>
                <span className="text-amber-300 font-bold">{detailsModalTicket.ticketId}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Declared Condition</span>
                <span className="text-white font-bold">{detailsModalTicket.condition}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Pass Created</span>
                <span className="text-slate-300">{detailsModalTicket.createdAt}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Borrower</span>
                <span className="text-slate-300">{currentUser.name}</span>
              </div>
            </div>

            {detailsModalTicket.notes && (
              <div className="bg-slate-950 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Faculty Handback Remarks</span>
                <p className="text-slate-200 italic">{detailsModalTicket.notes}</p>
              </div>
            )}

            {detailsModalTicket.rejectionReason && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] text-rose-400 uppercase font-extrabold block">Store Manager Deficiency Note</span>
                <p className="text-slate-200 font-bold">{detailsModalTicket.rejectionReason}</p>
              </div>
            )}

            {detailsModalTicket.status === "PENDING_WAREHOUSE_SCAN" && (
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-xl space-y-2">
                <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block">
                  Store Manager Verification Options
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleSimulateStoreCheckIn(detailsModalTicket);
                      setDetailsModalTicket(null);
                    }}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                  >
                    <ShieldCheck className="h-4 w-4" /> Accept & Clear Liability
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSimulateDeficiencyWarning(detailsModalTicket);
                      setDetailsModalTicket(null);
                    }}
                    className="py-2 px-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle className="h-4 w-4 text-rose-400" /> Issue Deficiency Warning
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDetailsModalTicket(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Printable QR Pass Modal */}
      {activePassTicket && (
        <Modal
          isOpen={true}
          onClose={() => setActivePassTicket(null)}
          title={`Return Verification Pass - ${activePassTicket.ticketId}`}
        >
          <div className="space-y-4 text-center select-none">
            <div className="p-5 bg-slate-950 border-2 border-amber-500/40 rounded-2xl space-y-4 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
                <span className="font-bold uppercase tracking-wider text-amber-400">IIUI Equipment Return Pass</span>
                <span className="font-mono text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  {activePassTicket.ticketId}
                </span>
              </div>

              {/* QR Container */}
              <div className="bg-white p-4 rounded-xl w-44 h-44 mx-auto flex flex-col items-center justify-center shadow-inner">
                <QrCode className="h-32 w-32 text-slate-900" />
                <span className="text-[9px] font-mono font-extrabold text-slate-800 mt-1">{activePassTicket.assetTag}</span>
              </div>

              <div className="space-y-1 text-xs">
                <h4 className="font-extrabold text-white text-base">{activePassTicket.assetName}</h4>
                <p className="text-slate-400 font-mono text-xs">Asset Tag: <span className="text-indigo-300 font-bold">{activePassTicket.assetTag}</span></p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left bg-slate-900 p-3 rounded-xl border border-white/5 text-xs font-mono">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Condition Stated</span>
                  <span className="text-white font-bold">{activePassTicket.condition}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Created On</span>
                  <span className="text-slate-300">{activePassTicket.createdAt}</span>
                </div>
              </div>

              {activePassTicket.notes && (
                <div className="text-left bg-slate-900 p-3 rounded-xl border border-white/5 text-xs">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Faculty Remarks</span>
                  <p className="text-slate-300 italic">{activePassTicket.notes}</p>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-snug">
              Present this pass on screen or print it for physical verification by the Central Warehouse Store Manager.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Printer className="h-4 w-4" /> Print Pass
              </button>
              <button
                type="button"
                onClick={() => setActivePassTicket(null)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-lg transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Official Clearance Receipt Modal */}
      {receiptTicket && (
        <Modal
          isOpen={true}
          onClose={() => setReceiptTicket(null)}
          title={`Digital Handback Clearance Receipt - ${receiptTicket.ticketId}`}
        >
          <div className="space-y-4 text-center select-none">
            <div className="p-5 bg-slate-950 border-2 border-emerald-500/40 rounded-2xl space-y-4 shadow-2xl text-left">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                  <ShieldCheck className="h-5 w-5" />
                  Official Equipment Handback Clearance
                </div>
                <span className="font-mono text-emerald-300 font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  CLEARED
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-300">
                <p>This certifies that <strong>{currentUser.name}</strong> has returned the following university asset to the Central Store Warehouse:</p>
                <div className="bg-slate-900 p-3 rounded-xl border border-white/5 space-y-1 font-mono text-[11px] mt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Equipment:</span>
                    <span className="text-white font-bold">{receiptTicket.assetName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">System Tag:</span>
                    <span className="text-indigo-300">{receiptTicket.assetTag}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pass Ticket ID:</span>
                    <span className="text-amber-300">{receiptTicket.ticketId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Verified Condition:</span>
                    <span className="text-emerald-300 font-bold">{receiptTicket.condition}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                All financial and administrative liability for this equipment is fully resolved.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2"
              >
                <Printer className="h-4 w-4" /> Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setReceiptTicket(null)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rejection / Deficiency Warning Modal */}
      {warningModalTicket && (
        <Modal
          isOpen={true}
          onClose={() => setWarningModalTicket(null)}
          title={`Store Manager Deficiency Notice - ${warningModalTicket.ticketId}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm">
                <AlertTriangle className="h-5 w-5" />
                Return Rejected during Manual Physical Inspection
              </div>
              <p className="text-slate-300 leading-relaxed">
                The Store Manager manually inspected hardware item <strong>{warningModalTicket.assetName} ({warningModalTicket.assetTag})</strong> and issued a physical deficiency rejection notice:
              </p>
            </div>

            <div className="p-3 bg-slate-950 border border-white/10 rounded-xl space-y-1 font-mono">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Store Manager Rejection Note</span>
              <p className="text-rose-300 font-bold text-xs">
                "{warningModalTicket.rejectionReason || "Missing original power charging adapter or damaged component detected upon physical handback."}"
              </p>
            </div>

            <p className="text-slate-400 leading-relaxed">
              <strong>Action Required:</strong> Please locate the missing component or visit the Central Store desk to clear this deficiency notice. The equipment liability remains active on your account until resolved.
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setWarningModalTicket(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-lg transition-all cursor-pointer"
              >
                Close Notice
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
