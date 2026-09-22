import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  User,
  Laptop,
  DollarSign,
  FileCheck2,
  Printer,
  Sparkles,
  Send,
  Building2,
  Calendar,
  Tag,
  ArrowRight,
  ShieldCheck,
  Receipt,
  FileText,
  Clock,
  ExternalLink,
  Lock,
  Unlock,
  AlertCircle
} from "lucide-react";
import { 
  DeficiencyWarning, 
  getStoredWarnings, 
  saveStoredWarnings, 
  resolveWarning, 
  deleteWarning 
} from "../../lib/warningRegistry";
import { updateFacultyReturnTicketStatusGlobal } from "../faculty/ActiveReturnVerificationPage";
import Modal from "../Modal";
import { Asset, User as UserType } from "../../types";

interface AdminDeficiencyClearanceDeskProps {
  currentUser?: UserType;
  assets?: Asset[];
  users?: UserType[];
  returnAsset?: (assetId: string, condition: string) => Promise<boolean>;
  onRefresh?: () => void;
}

export default function AdminDeficiencyClearanceDesk({
  currentUser,
  assets = [],
  users = [],
  returnAsset,
  onRefresh
}: AdminDeficiencyClearanceDeskProps) {
  const [warnings, setWarnings] = useState<DeficiencyWarning[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "RESOLVED">("ALL");
  const [selectedDept, setSelectedDept] = useState("ALL");

  // Modal States
  const [clearanceTarget, setClearanceTarget] = useState<DeficiencyWarning | null>(null);
  const [viewDetailTarget, setViewDetailTarget] = useState<DeficiencyWarning | null>(null);
  const [printSlipTarget, setPrintSlipTarget] = useState<DeficiencyWarning | null>(null);
  
  // Clearance Form State
  const [clearanceType, setClearanceType] = useState<"FINE_PAID" | "PHYSICAL_JUSTIFICATION" | "ACCESSORIES_RETURNED">("FINE_PAID");
  const [amountPaid, setAmountPaid] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [paymentMode, setPaymentMode] = useState("University Cashier Deposit");
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const loadWarnings = () => {
    const list = getStoredWarnings();
    setWarnings(list);
  };

  useEffect(() => {
    loadWarnings();

    const handleUpdate = () => loadWarnings();
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("deficiency-warnings-updated", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("deficiency-warnings-updated", handleUpdate);
    };
  }, []);

  // Filtered List
  const departments = Array.from(new Set(warnings.map((w) => w.department || "Academic Dept").filter(Boolean)));

  const filteredWarnings = warnings.filter((w) => {
    const matchesSearch =
      (w.userName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.assetName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.assetTag || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.reason || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.department || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "ACTIVE"
        ? w.status === "ACTIVE_NOTICE"
        : w.status === "RESOLVED_CLEARED";

    const matchesDept = selectedDept === "ALL" || w.department === selectedDept;

    return matchesSearch && matchesStatus && matchesDept;
  });

  const activeCount = warnings.filter((w) => w.status === "ACTIVE_NOTICE").length;
  const resolvedCount = warnings.filter((w) => w.status === "RESOLVED_CLEARED").length;

  // Open Clearance Form with defaults
  const handleOpenClearance = (warning: DeficiencyWarning) => {
    setClearanceTarget(warning);
    setClearanceType("FINE_PAID");
    setAmountPaid("50.00");
    setReceiptNumber(`RCP-${Math.floor(100000 + Math.random() * 900000)}`);
    setPaymentMode("University Cashier Deposit");
    setAdminNotes(`Faculty member settled deficiency compensation for ${warning.assetName}. Name officially cleared from Admin roster.`);
  };

  // Execute Admin Clearance
  const handleConfirmClearance = async () => {
    if (!clearanceTarget) return;
    setIsSubmitting(true);

    try {
      // 1. Mark asset returned in database if returnAsset handler exists
      if (returnAsset) {
        try {
          await returnAsset(clearanceTarget.assetId, "Good");
        } catch (e) {
          console.warn("[AdminClearance] returnAsset fallback:", e);
        }
      }

      // 2. Prepare detailed clearance payload
      const clearanceNotes = adminNotes.trim() || 
        (clearanceType === "FINE_PAID" 
          ? `Settled via Fine Payment of $${amountPaid} (Receipt: ${receiptNumber}, Mode: ${paymentMode})`
          : clearanceType === "PHYSICAL_JUSTIFICATION"
          ? "Approved after in-person physical review & official departmental exemption."
          : "Missing components handed over directly to Admin Office.");

      // 3. Resolve warning in registry
      resolveWarning(clearanceTarget.id, clearanceNotes, {
        clearanceType,
        amountPaid: clearanceType === "FINE_PAID" ? amountPaid : undefined,
        receiptNumber: clearanceType === "FINE_PAID" ? receiptNumber : undefined,
        resolvedBy: currentUser?.name ? `${currentUser.name} (Admin)` : "Central Administrator",
        adminNotes: clearanceNotes
      });

      // Also ensure tag and ticket resolution
      if (clearanceTarget.assetTag) {
        resolveWarning(clearanceTarget.assetTag, clearanceNotes);
        updateFacultyReturnTicketStatusGlobal(clearanceTarget.assetTag, "CHECKED_IN");
      }
      if (clearanceTarget.assetId) {
        resolveWarning(clearanceTarget.assetId, clearanceNotes);
        updateFacultyReturnTicketStatusGlobal(clearanceTarget.assetId, "CHECKED_IN");
      }
      if (clearanceTarget.ticketId) {
        resolveWarning(clearanceTarget.ticketId, clearanceNotes);
        updateFacultyReturnTicketStatusGlobal(clearanceTarget.ticketId, "CHECKED_IN");
      }

      setActionFeedback({
        type: "success",
        msg: `Faculty member "${clearanceTarget.userName}" has been officially cleared of all liability for ${clearanceTarget.assetName}.`
      });

      loadWarnings();
      if (onRefresh) {
        onRefresh();
      }

      const clearedRecord = {
        ...clearanceTarget,
        status: "RESOLVED_CLEARED" as const,
        resolvedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        clearanceType,
        amountPaid,
        receiptNumber,
        resolvedBy: currentUser?.name ? `${currentUser.name} (Admin)` : "Central Administrator",
        adminNotes: clearanceNotes
      };

      setClearanceTarget(null);
      // Auto-prompt to print official clearance slip
      setPrintSlipTarget(clearedRecord);
    } catch (err: any) {
      console.error("[AdminClearance] error:", err);
      setActionFeedback({
        type: "error",
        msg: `Failed to clear deficiency: ${err?.message || "Please check inputs and retry."}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="bg-[#090d1a] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/15 border border-rose-500/30 text-rose-300">
                Administrative Oversight Hub
              </span>
              <span className="text-slate-400 text-xs">• Real-Time Faculty Liability Clearances</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5">
              <ShieldAlert className="h-7 w-7 text-rose-400" />
              Faculty Deficiency Clearance Roster
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Centralized administrative ledger for faculty members blocked due to equipment return deficiencies or missing parts. 
              Admin can clear liabilities upon payment of replacement fines or validated in-person justification.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3">
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-3 text-center min-w-[120px]">
              <span className="text-[10px] font-bold uppercase text-rose-400 block tracking-wider">Active Locked</span>
              <span className="text-2xl font-black text-white font-mono">{activeCount}</span>
              <span className="text-[9px] text-rose-300 block font-medium">Pending Clearance</span>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 text-center min-w-[120px]">
              <span className="text-[10px] font-bold uppercase text-emerald-400 block tracking-wider">Cleared / Settled</span>
              <span className="text-2xl font-black text-white font-mono">{resolvedCount}</span>
              <span className="text-[9px] text-emerald-300 block font-medium">Liabilities Released</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold transition-all shadow-lg ${
            actionFeedback.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/60 border-rose-500/40 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionFeedback.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            )}
            <span>{actionFeedback.msg}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="px-2.5 py-1 rounded bg-black/40 hover:bg-black/60 text-slate-300 text-[10px] font-mono cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="bg-[#0a0f1d] border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search faculty name, department, asset tag, reason, notice ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 border border-white/10 p-1 rounded-xl">
            {(["ALL", "ACTIVE", "RESOLVED"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab === "ALL" && `All Notices (${warnings.length})`}
                {tab === "ACTIVE" && `Active Warnings (${activeCount})`}
                {tab === "RESOLVED" && `Cleared (${resolvedCount})`}
              </button>
            ))}
          </div>

          {/* Department Filter */}
          {departments.length > 0 && (
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-900 border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-[#0a0f1d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Notice ID & Date</th>
                <th className="py-3.5 px-4">Faculty Custodian</th>
                <th className="py-3.5 px-4">Equipment & Tag</th>
                <th className="py-3.5 px-4">Inspection Deficiency Reason</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Clearance Info</th>
                <th className="py-3.5 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredWarnings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShieldCheck className="h-10 w-10 text-emerald-400/60" />
                      <p className="text-sm font-bold text-slate-200">No Deficiency Warnings Found</p>
                      <p className="text-xs text-slate-500">
                        {statusFilter === "ACTIVE"
                          ? "All faculty accounts are currently clear of return deficiencies."
                          : "No records match your filter criteria."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWarnings.map((item) => {
                  const isActive = item.status === "ACTIVE_NOTICE";
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isActive ? "bg-rose-950/10" : ""
                      }`}
                    >
                      {/* Notice ID & Date */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="font-mono font-black text-white text-xs block">
                          {item.id}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                          {item.issuedAt}
                        </span>
                        <span className="text-[9px] text-slate-500 block truncate max-w-[120px]">
                          By: {item.issuedBy || "Store Manager"}
                        </span>
                      </td>

                      {/* Faculty Custodian */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-start gap-2">
                          <div className="h-7 w-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0 font-black text-xs mt-0.5">
                            {item.userName ? item.userName.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <span className="font-bold text-white text-xs block">
                              {item.userName}
                            </span>
                            <span className="text-[10px] text-indigo-300 block font-medium">
                              {item.department || "Academic Department"}
                            </span>
                            {item.userEmail && (
                              <span className="text-[10px] text-slate-400 block font-mono truncate max-w-[140px]">
                                {item.userEmail}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Equipment & Tag */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="font-bold text-slate-200 block text-xs">
                          {item.assetName}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/20">
                            {item.assetTag}
                          </span>
                          {item.serialNumber && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({item.serialNumber})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Inspection Deficiency Reason */}
                      <td className="py-3.5 px-4 align-top max-w-[240px]">
                        <div className="p-2 bg-slate-900/90 border border-rose-500/20 rounded-lg">
                          <p className="text-rose-300 font-medium text-[11px] leading-relaxed line-clamp-3">
                            "{item.reason}"
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        {isActive ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 border border-rose-500/30 text-rose-300 inline-flex items-center gap-1.5 shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
                            Active Lockout
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 inline-flex items-center gap-1.5 shadow-sm">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            Cleared & Settled
                          </span>
                        )}
                      </td>

                      {/* Clearance Info */}
                      <td className="py-3.5 px-4 align-top max-w-[200px]">
                        {item.resolvedAt ? (
                          <div className="space-y-1">
                            <span className="text-[10px] text-emerald-400 font-mono font-bold block">
                              Cleared: {item.resolvedAt}
                            </span>
                            <span className="text-[9.5px] text-slate-300 block line-clamp-2">
                              {item.adminNotes || item.managerNotes || "Cleared by Central Admin"}
                            </span>
                            {item.amountPaid && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[9px] font-mono font-bold border border-emerald-500/30 inline-block">
                                Paid: ${item.amountPaid} ({item.receiptNumber})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-rose-400 italic">
                            Pending physical/fine clearance
                          </span>
                        )}
                      </td>

                      {/* Admin Actions */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isActive ? (
                            <button
                              type="button"
                              onClick={() => handleOpenClearance(item)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md hover:shadow-emerald-500/20"
                            >
                              <Unlock className="h-3.5 w-3.5" />
                              <span>Clear Name</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPrintSlipTarget(item)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 border border-white/10"
                            >
                              <Printer className="h-3.5 w-3.5 text-slate-400" />
                              <span>Receipt</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setViewDetailTarget(item)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all border border-white/10 cursor-pointer"
                            title="View Full Notice Details"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADMIN CLEARANCE FORM (THE COMPLETE CLEARANCE WORKFLOW) */}
      {/* ========================================================================= */}
      {clearanceTarget && (
        <Modal
          isOpen={true}
          onClose={() => setClearanceTarget(null)}
          title={`Administrative Liability Clearance - ${clearanceTarget.userName}`}
        >
          <div className="space-y-4 text-xs select-none">
            {/* Target Summary Header */}
            <div className="p-3.5 bg-slate-900 border border-white/10 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Faculty Borrower Account
                  </span>
                  <p className="font-extrabold text-white text-sm">
                    {clearanceTarget.userName} ({clearanceTarget.department || "Academic Dept"})
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {clearanceTarget.id}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                <span className="text-slate-300">
                  Equipment: <strong>{clearanceTarget.assetName}</strong> ({clearanceTarget.assetTag})
                </span>
                <span className="text-slate-400 font-mono">Issued: {clearanceTarget.issuedAt}</span>
              </div>

              <div className="p-2.5 bg-rose-950/30 border border-rose-500/20 rounded-lg text-rose-300 text-[11px]">
                <strong>Inspection Rejection Reason:</strong> "{clearanceTarget.reason}"
              </div>
            </div>

            {/* Clearance Method Selection Tabs */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                Select Administrative Clearance Method:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setClearanceType("FINE_PAID")}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    clearanceType === "FINE_PAID"
                      ? "bg-emerald-950/50 border-emerald-500 text-white font-bold ring-1 ring-emerald-500/30"
                      : "bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-[11px] mb-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>Fine / Paid</span>
                  </div>
                  <p className="text-[10px] leading-tight">Faculty paid replacement fee or fine.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setClearanceType("PHYSICAL_JUSTIFICATION")}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    clearanceType === "PHYSICAL_JUSTIFICATION"
                      ? "bg-indigo-950/50 border-indigo-500 text-white font-bold ring-1 ring-indigo-500/30"
                      : "bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-indigo-400 font-extrabold text-[11px] mb-1">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>In-Person Reason</span>
                  </div>
                  <p className="text-[10px] leading-tight">Visited Admin with valid justification.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setClearanceType("ACCESSORIES_RETURNED")}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    clearanceType === "ACCESSORIES_RETURNED"
                      ? "bg-amber-950/50 border-amber-500 text-white font-bold ring-1 ring-amber-500/30"
                      : "bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-[11px] mb-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Items Handed In</span>
                  </div>
                  <p className="text-[10px] leading-tight">Missing items delivered to Admin.</p>
                </button>
              </div>
            </div>

            {/* Dynamic Clearance Form Fields */}
            {clearanceType === "FINE_PAID" && (
              <div className="p-3.5 bg-slate-900/90 border border-emerald-500/30 rounded-xl space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-300 block mb-1">
                      Compensation / Fine Amount ($ USD)
                    </label>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="50.00"
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-300 block mb-1">
                      Receipt / Voucher Reference #
                    </label>
                    <input
                      type="text"
                      value={receiptNumber}
                      onChange={(e) => setReceiptNumber(e.target.value)}
                      placeholder="RCP-998214"
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-300 block mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="University Cashier Deposit">University Cashier Deposit (Official Cash Receipt)</option>
                    <option value="Bank Challan Voucher">Bank Challan Voucher (Habib Bank IIUI Branch)</option>
                    <option value="Payroll Salary Deduction">Payroll Salary Deduction Authorization</option>
                    <option value="Online University Portal Transfer">Online University Portal Transfer</option>
                  </select>
                </div>
              </div>
            )}

            {clearanceType === "PHYSICAL_JUSTIFICATION" && (
              <div className="p-3.5 bg-slate-900/90 border border-indigo-500/30 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase text-indigo-300 block">
                  In-Person Justification & Formal Dean/HOD Reference:
                </span>
                <p className="text-[11px] text-slate-300">
                  Record the valid explanation or authorization reference provided by the faculty member during their in-person visit to the Admin department.
                </p>
              </div>
            )}

            {/* Admin Clearance Notes */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                Official Admin Clearance Justification & Signature Remarks
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Enter administrative clearance reasoning and authorization remarks..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {/* Policy Confirmation Note */}
            <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-[11px] text-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span>Administrative Consequence:</span>
              </div>
              <p className="text-slate-300">
                Clearing this name will immediately release the faculty borrower's liability, update their return ticket to <strong>CHECKED_IN</strong>, clear any blocking warning on Store Manager's scanner, and generate an official Clearance Certificate.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setClearanceTarget(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearance}
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs cursor-pointer transition-all shadow-lg hover:shadow-emerald-500/25 inline-flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Processing Clearance...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Clear Faculty Name & Release Liability</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PRINTABLE OFFICIAL ADMINISTRATIVE CLEARANCE RECEIPT / SLIP */}
      {/* ========================================================================= */}
      {printSlipTarget && (
        <Modal
          isOpen={true}
          onClose={() => setPrintSlipTarget(null)}
          title={`Official Administrative Clearance Receipt - ${printSlipTarget.id}`}
        >
          <div className="space-y-4 text-xs select-none">
            {/* Printable Paper Voucher Card */}
            <div
              id="admin-clearance-slip"
              className="p-6 bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 space-y-4"
            >
              {/* University Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-sm">
                    IIUI
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wide text-slate-900">
                      International Islamic University, Islamabad
                    </h3>
                    <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest">
                      Central Asset & Equipment Administrative Directorate
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-300">
                    Deficiency Cleared
                  </span>
                  <p className="text-[10px] font-mono font-bold text-slate-500 mt-1">
                    Voucher: {printSlipTarget.receiptNumber || printSlipTarget.id}
                  </p>
                </div>
              </div>

              {/* Clearance Voucher Title */}
              <div className="text-center py-1">
                <h4 className="font-black text-sm uppercase tracking-wider text-slate-900">
                  Official Administrative Deficiency Clearance Certificate
                </h4>
                <p className="text-[10px] text-slate-500">
                  This document certifies complete settlement and release of equipment liability.
                </p>
              </div>

              {/* Faculty & Equipment Details Grid */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-[11px]">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Borrower Custodian</span>
                  <p className="font-black text-slate-900">{printSlipTarget.userName}</p>
                  <p className="text-[10px] text-slate-600">{printSlipTarget.department || "Academic Dept"}</p>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Equipment Identifier</span>
                  <p className="font-black text-slate-900 truncate">{printSlipTarget.assetName}</p>
                  <p className="text-[10px] font-mono font-bold text-indigo-700">Tag: {printSlipTarget.assetTag}</p>
                </div>
              </div>

              {/* Settlement Method & Amount */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5 text-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span>Settlement Method:</span>
                  <span>
                    {printSlipTarget.clearanceType === "FINE_PAID"
                      ? "Monetary Fine / Compensation Settled"
                      : printSlipTarget.clearanceType === "PHYSICAL_JUSTIFICATION"
                      ? "In-Person Departmental Exemption & Justification"
                      : "Missing Accessories Received"}
                  </span>
                </div>
                {printSlipTarget.amountPaid && (
                  <div className="flex items-center justify-between text-xs font-black text-slate-900 pt-1 border-t border-emerald-200/60 font-mono">
                    <span>Total Amount Paid:</span>
                    <span className="text-sm text-emerald-700">${printSlipTarget.amountPaid} USD</span>
                  </div>
                )}
                <p className="text-[10px] text-slate-600 pt-1">
                  <strong>Clearance Notes:</strong> {printSlipTarget.adminNotes || printSlipTarget.managerNotes || "Administrative clearance approved."}
                </p>
              </div>

              {/* Signatures & Security Seal */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-[10px] text-slate-600">
                <div>
                  <p className="font-mono">Cleared At: {printSlipTarget.resolvedAt || new Date().toISOString().substring(0, 10)}</p>
                  <p className="font-mono">Authorized By: {printSlipTarget.resolvedBy || "Central Administrator"}</p>
                </div>
                <div className="text-right space-y-3">
                  <div className="h-6 border-b border-dashed border-slate-400 w-36 ml-auto" />
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">
                    Director of Administration Signature
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow"
              >
                <Printer className="h-4 w-4" />
                <span>Print Official Certificate</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintSlipTarget(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VIEW COMPLETE NOTICE & INSPECTION AUDIT DETAILS */}
      {/* ========================================================================= */}
      {viewDetailTarget && (
        <Modal
          isOpen={true}
          onClose={() => setViewDetailTarget(null)}
          title={`Inspection Notice Details - ${viewDetailTarget.id}`}
        >
          <div className="space-y-4 text-xs select-none">
            <div className="p-3.5 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">
                  Deficiency Record
                </span>
                <span className="font-mono font-black text-white text-sm">
                  {viewDetailTarget.id}
                </span>
              </div>
              {viewDetailTarget.status === "ACTIVE_NOTICE" ? (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/15 border border-rose-500/30 text-rose-300">
                  Active Lockout
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  Cleared & Settled
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-white/5">
              <div>
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Faculty Member</span>
                <p className="font-extrabold text-white text-xs mt-0.5">{viewDetailTarget.userName}</p>
                <p className="text-[10px] text-indigo-300">{viewDetailTarget.department || "Academic Dept"}</p>
              </div>
              <div>
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Hardware Item</span>
                <p className="font-extrabold text-white text-xs mt-0.5 truncate">{viewDetailTarget.assetName}</p>
                <p className="text-[10px] text-amber-300 font-mono font-bold">{viewDetailTarget.assetTag}</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-950/30 border border-rose-500/30 rounded-xl space-y-1.5">
              <span className="text-[11px] font-extrabold text-rose-400 uppercase tracking-wider block">
                Recorded Rejection Reason:
              </span>
              <p className="text-slate-100 text-xs bg-slate-950/60 p-3 rounded-lg border border-rose-500/20 leading-relaxed whitespace-pre-wrap">
                "{viewDetailTarget.reason}"
              </p>
            </div>

            {viewDetailTarget.resolvedAt && (
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1.5">
                <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider block">
                  Resolution & Clearance Details:
                </span>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-emerald-500/20 space-y-1">
                  <p className="text-slate-200">
                    {viewDetailTarget.adminNotes || viewDetailTarget.managerNotes}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono pt-1 border-t border-white/5">
                    Cleared on: {viewDetailTarget.resolvedAt} by {viewDetailTarget.resolvedBy || "Administrator"}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setViewDetailTarget(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
