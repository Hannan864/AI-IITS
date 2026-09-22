import React, { useState, useEffect } from "react";
import { 
  QrCode, FileCheck2, Clock, AlertTriangle, ShieldAlert, 
  Search, Laptop, RotateCcw, CheckCircle2, User, Wrench, XCircle,
  FileText, Activity, ArrowRight, Tag, Printer, Bell, ShieldCheck,
  ChevronRight, Filter, Sparkles, Send, Trash2, Check, AlertCircle,
  Copy, Edit3
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import Modal from "../../components/Modal";
import { 
  getAllFacultyReturnTickets, 
  updateFacultyReturnTicketStatusGlobal, 
  ReturnTicket 
} from "../../components/faculty/ActiveReturnVerificationPage";
import { 
  DeficiencyWarning, 
  getStoredWarnings, 
  saveStoredWarnings,
  addOrUpdateWarning, 
  resolveWarning, 
  deleteWarning 
} from "../../lib/warningRegistry";

interface ReturnVerificationPageProps {
  assets: any[];
  issuances: any[];
  users?: any[];
  returnAsset: (assetId: string, condition: string) => Promise<boolean>;
  refreshAll: () => void;
}

export default function ReturnVerificationPage({
  assets = [],
  issuances = [],
  users = [],
  returnAsset,
  refreshAll,
}: ReturnVerificationPageProps) {
  const [selectedTagInput, setSelectedTagInput] = useState("");
  const [activeTab, setActiveTab] = useState<"PASSES" | "LOANS" | "WARNINGS">("PASSES");
  const [selectedCondition, setSelectedCondition] = useState("Good");
  const [managerRemarks, setManagerRemarks] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  
  // Selected / Verified Asset, Issuance, & Faculty Ticket
  const [verifiedAsset, setVerifiedAsset] = useState<any | null>(null);
  const [verifiedIssuance, setVerifiedIssuance] = useState<any | null>(null);
  const [matchingTicket, setMatchingTicket] = useState<(ReturnTicket & { userId?: string }) | null>(null);

  // Faculty Tickets State
  const [facultyTickets, setFacultyTickets] = useState<(ReturnTicket & { userId?: string })[]>([]);

  // Warnings Registry State
  const [warnings, setWarnings] = useState<DeficiencyWarning[]>([]);
  const [warningFilter, setWarningFilter] = useState<"ALL" | "ACTIVE_NOTICE" | "RESOLVED_CLEARED">("ALL");
  const [warningSearchTerm, setWarningSearchTerm] = useState("");
  
  // Warning Slip Modal & View State
  const [selectedSlipWarning, setSelectedSlipWarning] = useState<DeficiencyWarning | null>(null);
  const [selectedReasonWarning, setSelectedReasonWarning] = useState<DeficiencyWarning | null>(null);
  const [reverifyWarningTarget, setReverifyWarningTarget] = useState<DeficiencyWarning | null>(null);

  // Status Banner State
  const [statusBanner, setStatusBanner] = useState<{ type: "success" | "error" | "warning"; msg: string } | null>(null);

  // Deficiency Modal State
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [warningReason, setWarningReason] = useState("");
  const [copiedReason, setCopiedReason] = useState(false);
  const [editingWarningReason, setEditingWarningReason] = useState(false);
  const [newReasonDraft, setNewReasonDraft] = useState("");

  // Filter Active Issuances
  const activeIssuances = issuances.filter((i) => !i.actualReturnDate);
  const getAssetDetails = (assetId: string) => assets.find((a) => a.id === assetId);

  const loadFacultyTickets = () => {
    const all = getAllFacultyReturnTickets();
    const pending = all.filter((t) => t.status === "PENDING_WAREHOUSE_SCAN");
    setFacultyTickets(pending);
  };

  const loadWarnings = () => {
    const loaded = getStoredWarnings();
    
    // Also cross-reference real faculty return tickets in case any were marked REJECTED_DEFICIENCY
    const allTickets = getAllFacultyReturnTickets();
    const rejectedTickets = allTickets.filter((t) => t.status === "REJECTED_DEFICIENCY");
    let addedAny = false;

    rejectedTickets.forEach((t) => {
      const exists = loaded.some(
        (w) => w.ticketId === t.ticketId || w.assetId === t.assetId || w.assetTag === t.assetTag
      );
      if (!exists) {
        const asset = getAssetDetails(t.assetId);
        const borrower = users?.find(
          (u) => u.id === t.userId || u.email === t.userId || u.name === t.userId
        );
        addOrUpdateWarning({
          ticketId: t.ticketId,
          assetId: t.assetId,
          assetName: t.assetName || asset?.assetName || "Equipment",
          assetTag: t.assetTag || asset?.assetTag || "IIUI-TAG",
          serialNumber: asset?.serialNumber || "SN-RECORDED",
          category: asset?.category || "Hardware",
          userName: borrower?.name || t.userId || "Faculty Custodian",
          userEmail: borrower?.email || "faculty@iiui.edu.pk",
          department: borrower?.department || "Academic Department",
          reason: t.rejectionReason || "Missing accessories or damage detected during return inspection.",
          issuedAt: t.rejectedAt || t.createdAt || new Date().toISOString().replace("T", " ").substring(0, 16),
          status: "ACTIVE_NOTICE"
        });
        addedAny = true;
      }
    });

    if (addedAny) {
      setWarnings(getStoredWarnings());
    } else {
      setWarnings(loaded);
    }
  };

  useEffect(() => {
    loadFacultyTickets();
    loadWarnings();

    const handleSync = () => {
      loadFacultyTickets();
      loadWarnings();
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener("faculty-tickets-updated", handleSync);
    window.addEventListener("deficiency-warnings-updated", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("faculty-tickets-updated", handleSync);
      window.removeEventListener("deficiency-warnings-updated", handleSync);
    };
  }, []);

  const isOverdue = (dateStr: string) => {
    if (!dateStr) return false;
    const due = new Date(dateStr);
    const today = new Date();
    return due < today;
  };

  // Select by scanning or searching tag, serial, ticket ID, or asset name
  const handleSelectAssetOrTicket = (query: string) => {
    setStatusBanner(null);
    setSelectedTagInput(query);

    if (!query.trim()) {
      setVerifiedAsset(null);
      setVerifiedIssuance(null);
      setMatchingTicket(null);
      return;
    }

    const cleanQuery = query.trim().toLowerCase();

    // 1. Check if matches a Faculty Return Ticket ID
    const foundTicket = facultyTickets.find(
      (t) =>
        t.ticketId.toLowerCase() === cleanQuery ||
        t.assetTag.toLowerCase() === cleanQuery ||
        t.assetId.toLowerCase() === cleanQuery
    );

    // 2. Find asset by Tag, Serial Number, or Asset ID
    const foundAsset = assets.find(
      (a) =>
        a.assetTag?.toLowerCase() === cleanQuery ||
        a.serialNumber?.toLowerCase() === cleanQuery ||
        a.id?.toLowerCase() === cleanQuery ||
        (foundTicket && (a.id === foundTicket.assetId || a.assetTag === foundTicket.assetTag))
    );

    if (!foundAsset && !foundTicket) {
      setStatusBanner({
        type: "error",
        msg: `No registered equipment or return pass found matching "${query}". Please verify the asset tag or QR code.`
      });
      setVerifiedAsset(null);
      setVerifiedIssuance(null);
      setMatchingTicket(null);
      return;
    }

    const finalAsset = foundAsset || {
      id: foundTicket?.assetId,
      assetName: foundTicket?.assetName,
      assetTag: foundTicket?.assetTag,
      serialNumber: "SN-PENDING",
      status: "Issued",
      condition: foundTicket?.condition,
      category: "Hardware",
      model: "Standard Equipment"
    };

    // Find active checkout
    const activeIssue = activeIssuances.find((i) => i.assetId === finalAsset.id);
    
    // Find matching ticket if not already found
    const ticket = foundTicket || facultyTickets.find(
      (t) => (t.assetId === finalAsset.id || t.assetTag === finalAsset.assetTag)
    );

    setVerifiedAsset(finalAsset);
    setVerifiedIssuance(activeIssue || "no_active_checkout");
    setMatchingTicket(ticket || null);
    
    if (ticket && (ticket.condition === "Fair" || ticket.condition === "Minor Defect" || ticket.condition === "Damaged")) {
      setSelectedCondition(ticket.condition);
    } else {
      setSelectedCondition("Good");
    }
    setManagerRemarks("");
  };

  const handleSelectDirectTicket = (ticket: ReturnTicket & { userId?: string }) => {
    setMatchingTicket(ticket);
    const asset = getAssetDetails(ticket.assetId) || {
      id: ticket.assetId,
      assetName: ticket.assetName,
      assetTag: ticket.assetTag,
      serialNumber: "SN-" + ticket.assetTag,
      status: "Issued",
      condition: ticket.condition,
      category: "Hardware",
      model: "Standard Equipment"
    };
    const activeIssue = activeIssuances.find((i) => i.assetId === ticket.assetId);

    setVerifiedAsset(asset);
    setVerifiedIssuance(activeIssue || "no_active_checkout");
    setSelectedTagInput(ticket.ticketId);
    setSelectedCondition(ticket.condition === "Damaged" || ticket.condition === "Minor Defect" ? ticket.condition : "Good");
    setManagerRemarks("");
    setStatusBanner(null);
  };

  const handleSelectDirectIssuance = (issuance: any) => {
    const asset = getAssetDetails(issuance.assetId);
    if (!asset) return;

    const ticket = facultyTickets.find((t) => t.assetId === asset.id || t.assetTag === asset.assetTag);
    setVerifiedAsset(asset);
    setVerifiedIssuance(issuance);
    setMatchingTicket(ticket || null);
    setSelectedTagInput(asset.assetTag);
    setSelectedCondition(ticket?.condition || "Good");
    setManagerRemarks("");
    setStatusBanner(null);
  };

  const handleCheckInReturn = async () => {
    if (!verifiedAsset) return;
    setBtnLoading(true);
    setStatusBanner(null);

    try {
      const targetAssetId = verifiedAsset.id || matchingTicket?.assetId;
      let success = false;
      try {
        success = await returnAsset(targetAssetId, selectedCondition);
        if (!success && verifiedAsset.assetTag && verifiedAsset.assetTag !== targetAssetId) {
          success = await returnAsset(verifiedAsset.assetTag, selectedCondition);
        }
      } catch (e) {
        console.warn("[handleCheckInReturn] returnAsset fallback:", e);
      }

      // Update Faculty Return Pass status globally
      updateFacultyReturnTicketStatusGlobal(targetAssetId, "CHECKED_IN");
      updateFacultyReturnTicketStatusGlobal(verifiedAsset.assetTag, "CHECKED_IN");
      if (matchingTicket?.ticketId) {
        updateFacultyReturnTicketStatusGlobal(matchingTicket.ticketId, "CHECKED_IN");
      }

      // Resolve any active deficiency warning in registry
      resolveWarning(targetAssetId, managerRemarks || "Verified Physical Handback and released liability.");
      resolveWarning(verifiedAsset.assetTag, managerRemarks || "Verified Physical Handback and released liability.");
      if (matchingTicket?.ticketId) {
        resolveWarning(matchingTicket.ticketId, managerRemarks || "Verified Physical Handback and released liability.");
      }

      // Log scan activity
      try {
        await apiFetch("/api/qr-registry/log-scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: verifiedAsset.assetTag,
            scanType: "return_verification",
            result: `Verified Physical Return. Condition: ${selectedCondition}. Notes: ${managerRemarks || "Physical handback verified and liability released."}`
          })
        });
      } catch (e) {
        // ignore scan logging error
      }

      setStatusBanner({
        type: "success",
        msg: `Physical return of ${verifiedAsset.assetName} (${verifiedAsset.assetTag}) confirmed. Item restored to Available stock & borrower liability released.`
      });

      setVerifiedAsset(null);
      setVerifiedIssuance(null);
      setMatchingTicket(null);
      setSelectedTagInput("");
      setManagerRemarks("");
      loadFacultyTickets();
      loadWarnings();
      if (refreshAll) {
        await refreshAll();
      }
    } catch (err: any) {
      console.error("Return check-in error:", err);
      setStatusBanner({
        type: "error",
        msg: `Check-in issue: ${err?.message || "Please retry."}`
      });
    } finally {
      setBtnLoading(false);
    }
  };

  const handleIssueDeficiencyWarning = () => {
    if (!verifiedAsset) return;
    const targetAssetId = verifiedAsset.id || matchingTicket?.assetId;
    const finalReason = warningReason.trim() || (managerRemarks.trim() ? managerRemarks.trim() : "Missing components or physical damage detected during inspection.");

    // Update faculty ticket status
    updateFacultyReturnTicketStatusGlobal(targetAssetId, "REJECTED_DEFICIENCY", finalReason);
    updateFacultyReturnTicketStatusGlobal(verifiedAsset.assetTag, "REJECTED_DEFICIENCY", finalReason);

    // Find borrower name & department from active issuance or matching ticket and users list
    let borrowerName = "Faculty Custodian";
    let borrowerEmail = "faculty@iiui.edu.pk";
    let borrowerDept = "Faculty of Computing";

    if (verifiedIssuance && verifiedIssuance !== "no_active_checkout") {
      borrowerName = verifiedIssuance.userName || borrowerName;
      borrowerEmail = verifiedIssuance.userEmail || borrowerEmail;
      borrowerDept = verifiedIssuance.department || borrowerDept;
    } else if (matchingTicket?.userId) {
      const u = users?.find(
        (usr) => usr.id === matchingTicket.userId || usr.email === matchingTicket.userId || usr.name === matchingTicket.userId
      );
      if (u) {
        borrowerName = u.name;
        borrowerEmail = u.email;
        borrowerDept = u.department || borrowerDept;
      } else {
        borrowerName = matchingTicket.userId;
      }
    }

    // Add to persistent Warning Registry
    addOrUpdateWarning({
      ticketId: matchingTicket?.ticketId,
      assetId: targetAssetId,
      assetName: verifiedAsset.assetName,
      assetTag: verifiedAsset.assetTag,
      serialNumber: verifiedAsset.serialNumber || "SN-RECORDED",
      category: verifiedAsset.category || "Hardware",
      userName: borrowerName,
      userEmail: borrowerEmail,
      department: borrowerDept,
      reason: finalReason,
      status: "ACTIVE_NOTICE"
    });

    setStatusBanner({
      type: "warning",
      msg: `Deficiency Warning recorded for ${verifiedAsset.assetName} (${verifiedAsset.assetTag}) issued to ${borrowerName}. Handback blocked until resolved.`
    });

    setIsWarningModalOpen(false);
    setWarningReason("");
    setVerifiedAsset(null);
    setVerifiedIssuance(null);
    setMatchingTicket(null);
    setSelectedTagInput("");
    setManagerRemarks("");
    loadFacultyTickets();
    loadWarnings();
    refreshAll();
  };

  const handleUpdateStoredReason = (warningId: string, updatedReason: string) => {
    if (!updatedReason.trim()) return;
    const current = getStoredWarnings();
    const target = current.find((w) => w.id === warningId);
    if (target) {
      const updated = current.map((w) =>
        w.id === warningId ? { ...w, reason: updatedReason.trim() } : w
      );
      saveStoredWarnings(updated);
      updateFacultyReturnTicketStatusGlobal(target.assetId, "REJECTED_DEFICIENCY", updatedReason.trim());
      updateFacultyReturnTicketStatusGlobal(target.assetTag, "REJECTED_DEFICIENCY", updatedReason.trim());
      if (target.ticketId) {
        updateFacultyReturnTicketStatusGlobal(target.ticketId, "REJECTED_DEFICIENCY", updatedReason.trim());
      }
      setSelectedReasonWarning((prev) => prev ? { ...prev, reason: updatedReason.trim() } : null);
      setEditingWarningReason(false);
      loadWarnings();
    }
  };

  const handleResolveWarningDirect = async (warning: DeficiencyWarning) => {
    setBtnLoading(true);
    try {
      // 1. Attempt server check-in using ID or Tag
      try {
        let success = await returnAsset(warning.assetId, "Good");
        if (!success && warning.assetTag && warning.assetTag !== warning.assetId) {
          await returnAsset(warning.assetTag, "Good");
        }
      } catch (err) {
        console.warn("[handleResolveWarningDirect] Server sync fallback:", err);
      }

      // 2. Mark warning as resolved across all identifiers
      const resolutionNote = "Missing accessories received & physical handback approved by Store Manager.";
      resolveWarning(warning.id, resolutionNote);
      if (warning.assetTag) {
        resolveWarning(warning.assetTag, resolutionNote);
      }
      if (warning.assetId) {
        resolveWarning(warning.assetId, resolutionNote);
      }
      if (warning.ticketId) {
        resolveWarning(warning.ticketId, resolutionNote);
        updateFacultyReturnTicketStatusGlobal(warning.ticketId, "CHECKED_IN");
      }

      // 3. Clear faculty return pass status & update global tickets
      updateFacultyReturnTicketStatusGlobal(warning.assetId, "CHECKED_IN");
      if (warning.assetTag) {
        updateFacultyReturnTicketStatusGlobal(warning.assetTag, "CHECKED_IN");
      }

      setStatusBanner({
        type: "success",
        msg: `Deficiency cleared & physical handback completed for ${warning.assetName} [${warning.assetTag}]. Liability released!`
      });

      loadWarnings();
      loadFacultyTickets();
      if (refreshAll) {
        await refreshAll();
      }
    } catch (err: any) {
      console.error("[handleResolveWarningDirect] error:", err);
      setStatusBanner({
        type: "error",
        msg: `Unable to clear deficiency: ${err?.message || "Please retry."}`
      });
    } finally {
      setBtnLoading(false);
      setReverifyWarningTarget(null);
    }
  };

  const handleSendReminderNotice = (warning: DeficiencyWarning) => {
    setStatusBanner({
      type: "success",
      msg: `Automated deficiency reminder transmitted to ${warning.userName} (${warning.userEmail || warning.department}).`
    });
    setTimeout(() => setStatusBanner(null), 4000);
  };

  const handleDeleteWarningRecord = (id: string) => {
    deleteWarning(id);
    loadWarnings();
    setStatusBanner({
      type: "warning",
      msg: "Warning record removed from registry."
    });
    setTimeout(() => setStatusBanner(null), 3000);
  };

  const handleClearSelection = () => {
    setVerifiedAsset(null);
    setVerifiedIssuance(null);
    setMatchingTicket(null);
    setSelectedTagInput("");
    setManagerRemarks("");
    setStatusBanner(null);
  };

  // Filtered tickets
  const filteredTickets = facultyTickets.filter((t) => {
    const q = selectedTagInput.toLowerCase();
    return (
      t.ticketId.toLowerCase().includes(q) ||
      t.assetName.toLowerCase().includes(q) ||
      t.assetTag.toLowerCase().includes(q) ||
      t.notes.toLowerCase().includes(q)
    );
  });

  // Filtered issuances
  const filteredIssuances = activeIssuances.filter((issuance) => {
    const asset = getAssetDetails(issuance.assetId);
    if (!asset) return false;
    const q = selectedTagInput.toLowerCase();
    return (
      asset.assetName.toLowerCase().includes(q) ||
      asset.assetTag.toLowerCase().includes(q) ||
      asset.serialNumber.toLowerCase().includes(q) ||
      issuance.userName.toLowerCase().includes(q)
    );
  });

  // Filtered warnings
  const filteredWarnings = warnings.filter((w) => {
    const q = warningSearchTerm.toLowerCase();
    const matchesQuery =
      w.id.toLowerCase().includes(q) ||
      (w.ticketId && w.ticketId.toLowerCase().includes(q)) ||
      w.userName.toLowerCase().includes(q) ||
      (w.department && w.department.toLowerCase().includes(q)) ||
      w.assetName.toLowerCase().includes(q) ||
      w.assetTag.toLowerCase().includes(q) ||
      w.reason.toLowerCase().includes(q);

    if (warningFilter === "ALL") return matchesQuery;
    return matchesQuery && w.status === warningFilter;
  });

  const activeWarningsCount = warnings.filter(w => w.status === "ACTIVE_NOTICE").length;
  const resolvedWarningsCount = warnings.filter(w => w.status === "RESOLVED_CLEARED").length;
  const uniqueBorrowersCount = new Set(warnings.map(w => w.userName)).size;

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-1 select-none animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <QrCode className="h-5 w-5 text-emerald-400" />
            Return Verification & Warning Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verify equipment physical handbacks, clear borrower liability, or track and manage issued deficiency warnings.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full font-mono flex items-center gap-1.5">
            <QrCode className="h-3.5 w-3.5 text-amber-400" />
            {facultyTickets.length} Passes Awaiting Scan
          </span>
          <span className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold px-3 py-1.5 rounded-full font-mono flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            {activeWarningsCount} Active Warnings
          </span>
          <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-full font-mono">
            {activeIssuances.length} Active Loans
          </span>
        </div>
      </div>

      {/* Notification Banner */}
      {statusBanner && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between shadow-lg ${
            statusBanner.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              : statusBanner.type === "warning"
              ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
              : "bg-rose-500/15 border-rose-500/30 text-rose-300"
          }`}
        >
          <span>{statusBanner.type === "success" ? "✓" : "⚠"} {statusBanner.msg}</span>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="font-bold text-sm cursor-pointer px-1 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Scanner & Quick Select Navigation Bar */}
      <div className="bg-[#0a0f1d]/90 border border-white/10 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Sub-Tabs: Faculty Return Passes vs Active Loans vs Warning List */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10 gap-1 shrink-0 overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab("PASSES");
                handleClearSelection();
              }}
              className={`px-3 py-1.5 rounded-lg font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === "PASSES"
                  ? "bg-emerald-500 text-slate-950 shadow-md font-black"
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
                handleClearSelection();
              }}
              className={`px-3 py-1.5 rounded-lg font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === "LOANS"
                  ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              Active Loans Ledger ({activeIssuances.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("WARNINGS");
                handleClearSelection();
              }}
              className={`px-3 py-1.5 rounded-lg font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === "WARNINGS"
                  ? "bg-rose-500 text-slate-950 shadow-md font-black"
                  : "text-rose-300 hover:text-white bg-rose-500/10 border border-rose-500/20"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              Deficiency Warning Registry ({warnings.length})
              {activeWarningsCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse ml-0.5" />
              )}
            </button>
          </div>

          {/* Search / Scan Input for Passes / Loans */}
          {activeTab !== "WARNINGS" ? (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={activeTab === "PASSES" ? "Scan ticket ID (RET-xxxxxx) or tag..." : "Scan asset tag, serial, or borrower..."}
                value={selectedTagInput}
                onChange={(e) => {
                  setSelectedTagInput(e.target.value);
                  if (e.target.value.length >= 3) {
                    handleSelectAssetOrTicket(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSelectAssetOrTicket(selectedTagInput);
                  }
                }}
                className="w-full h-9 bg-slate-900 border border-white/10 text-white pl-9 pr-8 rounded-xl text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
              {selectedTagInput && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>
          ) : (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search warning by borrower, dept, tag, reason..."
                value={warningSearchTerm}
                onChange={(e) => setWarningSearchTerm(e.target.value)}
                className="w-full h-9 bg-slate-900 border border-white/10 text-white pl-9 pr-8 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:border-rose-500/50"
              />
              {warningSearchTerm && (
                <button
                  type="button"
                  onClick={() => setWarningSearchTerm("")}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {verifiedAsset ? (
        /* Detailed Inspection & Decision Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Equipment & Custodian Dossier */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0a0f1d]/90 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Laptop className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm">{verifiedAsset.assetName}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">SN: {verifiedAsset.serialNumber || "SN-VERIFIED"}</p>
                  </div>
                </div>
                <span className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg font-mono font-extrabold text-xs">
                  {verifiedAsset.assetTag}
                </span>
              </div>

              {/* Hardware Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-white/5">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-extrabold block">Category</span>
                  <p className="font-bold text-white text-xs">{verifiedAsset.category || "Computing / Lab Equipment"}</p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-extrabold block">Hardware Model</span>
                  <p className="font-bold text-white text-xs">{verifiedAsset.model || "Standard"}</p>
                </div>
              </div>

              {/* Faculty Return Declaration (If pass exists) */}
              {matchingTicket && (
                <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <QrCode className="h-3.5 w-3.5" />
                      Faculty Pass: {matchingTicket.ticketId}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Declared: {matchingTicket.condition}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 italic">
                    "{matchingTicket.notes || "Regular equipment handback."}"
                  </p>
                </div>
              )}

              {/* Borrower Ledger Record */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-2 text-xs">
                <span className="text-[9px] text-slate-400 uppercase font-extrabold block">Active Borrower Ledger</span>
                {verifiedIssuance && verifiedIssuance !== "no_active_checkout" ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Faculty Custodian:</span>
                      <span className="font-extrabold text-white">{verifiedIssuance.userName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Department:</span>
                      <span className="font-bold text-indigo-300">{verifiedIssuance.department || "Faculty"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Issued On:</span>
                      <span className="font-mono text-slate-300">{verifiedIssuance.issueDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Due Deadline:</span>
                      <span className={`font-mono font-bold ${isOverdue(verifiedIssuance.returnDate) ? "text-rose-400" : "text-slate-300"}`}>
                        {verifiedIssuance.returnDate}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">
                    No active loan constraint attached in current checkout ledger. Ready for verification.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleClearSelection}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-all border border-white/10 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Scan / Select Another Asset
              </button>
            </div>
          </div>

          {/* Right Column: Store Manager Physical Verification Controls */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#0a0f1d]/90 border border-emerald-500/20 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-sm font-extrabold text-emerald-400 flex items-center gap-2">
                  <FileCheck2 className="h-4.5 w-4.5" />
                  Store Manager Physical Inspection & Decision
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inspect the physical unit and all accessories before releasing borrower accountability.
                </p>
              </div>

              {/* Physical Condition Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  1. Verified Hardware Physical Condition
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(["Good", "Fair", "Minor Defect", "Damaged", "Repairing"] as const).map((cond) => (
                    <button
                      type="button"
                      key={cond}
                      onClick={() => setSelectedCondition(cond)}
                      className={`p-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer text-center ${
                        selectedCondition === cond
                          ? cond === "Damaged" || cond === "Repairing"
                            ? "bg-rose-500/25 border-rose-500 text-rose-300 shadow-md"
                            : "bg-emerald-500/25 border-emerald-500 text-emerald-300 shadow-md"
                          : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      {cond === "Damaged" && <AlertTriangle className="h-3 w-3 inline mr-1 text-rose-400" />}
                      {cond === "Repairing" && <Wrench className="h-3 w-3 inline mr-1 text-amber-400" />}
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inspection Remarks */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  2. Store Manager Inspection & Diagnostic Remarks
                </label>
                <textarea
                  rows={3}
                  value={managerRemarks}
                  onChange={(e) => setManagerRemarks(e.target.value)}
                  placeholder="Record physical verification notes (e.g. Unit complete, power adapter received, slight scratch on bezel)..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/10 space-y-2.5">
                <button
                  type="button"
                  onClick={handleCheckInReturn}
                  disabled={btnLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm Physical Handback & Release Liability
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setWarningReason(managerRemarks.trim() || "");
                    setIsWarningModalOpen(true);
                  }}
                  disabled={btnLoading}
                  className="w-full py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  Reject & Issue Deficiency Warning Notice
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "WARNINGS" ? (
        /* DEFICIENCY WARNING REGISTRY WORKSPACE */
        <div className="space-y-6">
          {/* Warning Analytics KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#0a0f1d]/90 border border-white/10 hover:border-rose-500/30 rounded-2xl space-y-1 relative overflow-hidden shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider block">
                  Total Warnings Issued
                </span>
                <AlertTriangle className="h-4 w-4 text-rose-400/70" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{warnings.length}</p>
              <p className="text-[11px] text-slate-400">Recorded deficiency handback notices</p>
            </div>

            <div className="p-4 bg-[#0a0f1d]/90 border border-white/10 hover:border-amber-500/30 rounded-2xl space-y-1 shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block">
                  Affected Custodians
                </span>
                <User className="h-4 w-4 text-amber-400/70" />
              </div>
              <p className="text-2xl font-black text-amber-300 font-mono">{uniqueBorrowersCount}</p>
              <p className="text-[11px] text-slate-400">Borrowers with active/historical notices</p>
            </div>

            <div className="p-4 bg-[#0a0f1d]/90 border border-rose-500/30 rounded-2xl space-y-1 relative overflow-hidden shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider block">
                  Active Notices (Blocked)
                </span>
                <ShieldAlert className="h-4 w-4 text-rose-400" />
              </div>
              <p className="text-2xl font-black text-rose-400 font-mono flex items-center gap-2">
                {activeWarningsCount}
                {activeWarningsCount > 0 && <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />}
              </p>
              <p className="text-[11px] text-rose-300/80">Pending borrower replacement/resolution</p>
            </div>

            <div className="p-4 bg-[#0a0f1d]/90 border border-emerald-500/30 rounded-2xl space-y-1 shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block font-mono">
                  Cleared & Handed Back
                </span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-300 font-mono">{resolvedWarningsCount}</p>
              <p className="text-[11px] text-slate-400">Deficiencies resolved & liability released</p>
            </div>
          </div>

          {/* Warning List Table Container */}
          <div className="bg-[#0a0f1d]/90 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
            {/* Filter Buttons & Search Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setWarningFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                    warningFilter === "ALL"
                      ? "bg-rose-500 text-slate-950 font-black shadow-lg"
                      : "bg-slate-900 border border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  All Notices ({warnings.length})
                </button>

                <button
                  type="button"
                  onClick={() => setWarningFilter("ACTIVE_NOTICE")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                    warningFilter === "ACTIVE_NOTICE"
                      ? "bg-rose-500 text-slate-950 font-black shadow-lg"
                      : "bg-slate-900 border border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  Active Blocked ({activeWarningsCount})
                </button>

                <button
                  type="button"
                  onClick={() => setWarningFilter("RESOLVED_CLEARED")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                    warningFilter === "RESOLVED_CLEARED"
                      ? "bg-emerald-500 text-slate-950 font-black shadow-lg"
                      : "bg-slate-900 border border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  Cleared ({resolvedWarningsCount})
                </button>
              </div>

              {/* Search Box */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by ID, name, tag, reason..."
                    value={warningSearchTerm}
                    onChange={(e) => setWarningSearchTerm(e.target.value)}
                    className="w-full h-8.5 bg-slate-900 border border-white/10 text-white pl-8.5 pr-7 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:border-rose-500/50"
                  />
                  {warningSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setWarningSearchTerm("")}
                      className="absolute right-2 top-2 text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Warnings Table */}
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/70">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-white/10 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4 w-[130px]">Notice ID</th>
                    <th className="py-3.5 px-3 min-w-[200px]">Borrower Custodian</th>
                    <th className="py-3.5 px-3 min-w-[190px]">Equipment & Tag</th>
                    <th className="py-3.5 px-3 w-[150px] text-center">Deficiency Reason</th>
                    <th className="py-3.5 px-3 w-[140px]">Issued Date</th>
                    <th className="py-3.5 px-3 w-[160px]">Status</th>
                    <th className="py-3.5 px-4 text-right min-w-[170px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {filteredWarnings.length > 0 ? (
                    filteredWarnings.map((warning) => {
                      const hasReason = Boolean(warning.reason && warning.reason.trim().length > 0);

                      return (
                        <tr key={warning.id} className="hover:bg-white/[0.03] transition-colors group">
                          {/* Notice ID & Ticket */}
                          <td className="py-3.5 px-4 align-middle">
                            <div className="space-y-1">
                              <span className="font-mono font-extrabold text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded text-[11px] inline-block shadow-xs">
                                {warning.id}
                              </span>
                              {warning.ticketId && (
                                <span className="font-mono text-[9.5px] text-amber-300/80 block">
                                  Pass: {warning.ticketId}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Custodian / To Whom */}
                          <td className="py-3.5 px-3 align-middle">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-300 font-black text-xs shrink-0 shadow-inner">
                                {warning.userName.charAt(0) || "F"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-extrabold text-white text-xs truncate">{warning.userName}</p>
                                <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[9.5px] font-semibold mt-0.5">
                                  {warning.department || "Academic Dept"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Equipment & Tag */}
                          <td className="py-3.5 px-3 align-middle">
                            <div className="min-w-0">
                              <p className="font-extrabold text-white text-xs truncate">{warning.assetName}</p>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="bg-slate-800 text-amber-300 border border-white/10 px-1.5 py-0.2 rounded font-mono text-[10px] font-bold">
                                  {warning.assetTag}
                                </span>
                                {warning.serialNumber && (
                                  <span className="text-[9.5px] text-slate-400 font-mono">
                                    {warning.serialNumber}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Reason: Button to open reason or No Reason state */}
                          <td className="py-3.5 px-3 align-middle text-center">
                            {hasReason ? (
                              <button
                                type="button"
                                onClick={() => setSelectedReasonWarning(warning)}
                                className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                                title="Click to view complete deficiency reason and inspection notes"
                              >
                                <FileText className="h-3.5 w-3.5 text-rose-400" />
                                <span>View Reason</span>
                              </button>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg text-[10.5px] font-medium text-slate-500 bg-slate-900/80 border border-white/5 inline-flex items-center gap-1">
                                <XCircle className="h-3 w-3 text-slate-600" />
                                No Reason
                              </span>
                            )}
                          </td>

                          {/* Issued Date */}
                          <td className="py-3.5 px-3 align-middle font-mono text-[11px] text-slate-300 whitespace-nowrap">
                            <div>{warning.issuedAt}</div>
                            {warning.resolvedAt && (
                              <span className="inline-block text-[9.5px] text-emerald-400 mt-0.5 font-sans font-semibold">
                                ✓ Cleared: {warning.resolvedAt}
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                            {warning.status === "ACTIVE_NOTICE" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 border border-rose-500/30 text-rose-300 shadow-xs">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
                                Active Blocked
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shadow-xs">
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                Cleared
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {warning.status === "ACTIVE_NOTICE" && (
                                <button
                                  type="button"
                                  onClick={() => setReverifyWarningTarget(warning)}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm active:scale-95"
                                  title="Verify Handback & Clear Deficiency"
                                >
                                  <ShieldCheck className="h-3 w-3" /> Clear
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setSelectedSlipWarning(warning)}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer inline-flex items-center gap-1 active:scale-95"
                                title="Print Official Deficiency Slip"
                              >
                                <Printer className="h-3 w-3 text-slate-400" /> Slip
                              </button>

                              {warning.status === "ACTIVE_NOTICE" && (
                                <button
                                  type="button"
                                  onClick={() => handleSendReminderNotice(warning)}
                                  className="px-2 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer inline-flex items-center gap-1 active:scale-95"
                                  title="Transmit reminder notice to faculty custodian"
                                >
                                  <Send className="h-3 w-3" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteWarningRecord(warning.id)}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-all cursor-pointer active:scale-95"
                                title="Dismiss / Void Notice"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                        <div className="space-y-2 py-2 max-w-sm mx-auto">
                          <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                          <p className="font-extrabold text-white not-italic text-sm">No Deficiency Notices Found</p>
                          <p className="text-xs text-slate-400">
                            {warningSearchTerm ? "No notices match your search query." : "There are currently zero active deficiency warnings on record."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Default Table View: Tabbed Faculty Passes vs Active Loans */
        <div className="bg-[#0a0f1d]/90 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                {activeTab === "PASSES" ? (
                  <>
                    <QrCode className="h-4 w-4 text-amber-400" />
                    Faculty Digital Return Passes Awaiting Warehouse Verification
                  </>
                ) : (
                  <>
                    <Laptop className="h-4 w-4 text-indigo-400" />
                    Active Borrowed Hardware Awaiting Return
                  </>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click on any pass or equipment row to open its physical inspection workspace.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60">
            {activeTab === "PASSES" ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-white/10 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="p-3.5 pl-4">Ticket ID & Hardware</th>
                    <th className="p-3.5">Asset Tag</th>
                    <th className="p-3.5">Faculty Declared Condition</th>
                    <th className="p-3.5">Faculty Remarks</th>
                    <th className="p-3.5 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket) => (
                      <tr
                        key={ticket.ticketId}
                        onClick={() => handleSelectDirectTicket(ticket)}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <td className="p-3.5 pl-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 font-mono text-[10px] font-bold">
                              <QrCode className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-extrabold text-white text-xs">{ticket.assetName}</p>
                              <p className="text-[10px] font-mono text-amber-300 font-bold">{ticket.ticketId}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-lg font-mono font-extrabold text-[11px]">
                            {ticket.assetTag}
                          </span>
                        </td>

                        <td className="p-3.5">
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

                        <td className="p-3.5 text-slate-300 max-w-xs truncate text-[11px]">
                          {ticket.notes || "Regular equipment handback."}
                        </td>

                        <td className="p-3.5 pr-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectDirectTicket(ticket);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md"
                          >
                            <FileCheck2 className="h-3.5 w-3.5" />
                            Inspect & Verify
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                        <div className="space-y-2 py-2 max-w-sm mx-auto">
                          <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                          <p className="font-extrabold text-white not-italic text-sm">No Pending Return Passes</p>
                          <p className="text-xs text-slate-400">
                            {selectedTagInput ? "No passes match search." : "No faculty members have active return passes awaiting physical inspection."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-white/10 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="p-3.5 pl-4">Equipment & Serial Number</th>
                    <th className="p-3.5">Asset Tag</th>
                    <th className="p-3.5">Faculty Borrower</th>
                    <th className="p-3.5">Return Deadline</th>
                    <th className="p-3.5 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {filteredIssuances.length > 0 ? (
                    filteredIssuances.map((issuance) => {
                      const asset = getAssetDetails(issuance.assetId);
                      if (!asset) return null;
                      const overdue = isOverdue(issuance.returnDate);

                      return (
                        <tr
                          key={issuance.id}
                          onClick={() => handleSelectDirectIssuance(issuance)}
                          className="hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <td className="p-3.5 pl-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                <Laptop className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-extrabold text-white text-xs">{asset.assetName}</p>
                                <p className="text-[10px] font-mono text-slate-400">SN: {asset.serialNumber}</p>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-lg font-mono font-extrabold text-[11px]">
                              {asset.assetTag}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-2 text-slate-200 font-medium">
                              <div className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-400 border border-white/10">
                                {issuance.userName?.charAt(0) || "F"}
                              </div>
                              <span>{issuance.userName}</span>
                            </div>
                          </td>

                          <td className="p-3.5 font-mono text-xs">
                            <span className={overdue ? "text-rose-400 font-bold" : "text-slate-300"}>
                              {issuance.returnDate}
                              {overdue && <span className="ml-1.5 px-1.5 py-0.5 bg-rose-500/20 text-rose-300 rounded text-[9px] font-extrabold uppercase">Overdue</span>}
                            </span>
                          </td>

                          <td className="p-3.5 pr-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectDirectIssuance(issuance);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md"
                            >
                              <FileCheck2 className="h-3.5 w-3.5" />
                              Scan & Verify
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                        <div className="space-y-2 py-2 max-w-sm mx-auto">
                          <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                          <p className="font-extrabold text-white not-italic text-sm">All Equipment Checked In</p>
                          <p className="text-xs text-slate-400">
                            There are currently zero active borrowed items awaiting handback.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Store Manager Deficiency Notice */}
      {isWarningModalOpen && verifiedAsset && (
        <Modal
          isOpen={true}
          onClose={() => setIsWarningModalOpen(false)}
          title={`Issue Deficiency Warning - ${verifiedAsset.assetTag}`}
        >
          <div className="space-y-4 text-xs select-none">
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1">
              <span className="font-extrabold text-rose-400 uppercase text-[10px] block">
                Physical Inspection Rejection
              </span>
              <p className="text-slate-200">
                You are rejecting the physical handback of <strong>{verifiedAsset.assetName} ({verifiedAsset.assetTag})</strong>. Please provide the exact deficiency reason.
              </p>
            </div>

            {/* Quick Reason Selector Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Quick Preset Deficiency Tags (Click to Apply)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Missing Power Adapter / 65W Brick",
                  "Broken Screen / Display Damage",
                  "Missing HDMI/USB-C Dongles & Cables",
                  "Chassis / Physical Casing Damage",
                  "Device Not Powering On / HW Failure",
                  "Missing Original Equipment Bag / Case",
                  "Liquid Spill / Sticky Keyboard"
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      if (!warningReason.trim()) {
                        setWarningReason(chip);
                      } else if (!warningReason.includes(chip)) {
                        setWarningReason(`${warningReason.trim()}, ${chip}`);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-[11px] text-slate-300 font-medium transition-all hover:border-rose-500/50 hover:text-rose-300 cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Exact Rejection Reason Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                  Store Manager Rejection Reason (Required)*
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {warningReason.length} characters
                </span>
              </div>
              <textarea
                rows={4}
                value={warningReason}
                onChange={(e) => setWarningReason(e.target.value)}
                placeholder="Enter exact reason for rejection (e.g. Missing 65W USB-C charging brick, damaged laptop hinge, missing power adapter...)"
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 text-xs leading-relaxed resize-none"
              />
            </div>

            <div className="p-3 bg-slate-900 border border-white/5 rounded-xl text-slate-400 text-[11px] space-y-1">
              <p className="font-bold text-amber-300">System Record Consequences:</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                <li>Return ticket status set to <strong>REJECTED: DEFICIENCY WARNING</strong>.</li>
                <li>Equipment loan liability <strong>remains active</strong> on borrower's account.</li>
                <li>Deficiency Notice with this exact reason is logged in the <strong>Deficiency Registry</strong>.</li>
                <li>Faculty borrower is notified with this exact rejection note.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsWarningModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleIssueDeficiencyWarning}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-lg"
              >
                <ShieldAlert className="h-4 w-4" />
                Transmit Deficiency Warning Notice
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Printable Official Deficiency Notice Slip */}
      {selectedSlipWarning && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSlipWarning(null)}
          title={`Official Equipment Deficiency Slip - ${selectedSlipWarning.id}`}
        >
          <div className="space-y-4 text-xs select-none">
            <div className="p-5 bg-slate-950 border-2 border-rose-500/40 rounded-2xl space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="font-extrabold uppercase text-rose-400 text-xs block">
                    IIUI Central Warehouse Deficiency Slip
                  </span>
                  <span className="text-[10px] text-slate-400">Formal Rejection & Non-Compliance Record</span>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  {selectedSlipWarning.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-900 p-3 rounded-xl border border-white/5 font-mono text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Borrower Custodian</span>
                  <span className="text-white font-extrabold">{selectedSlipWarning.userName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Department</span>
                  <span className="text-indigo-300 font-bold">{selectedSlipWarning.department || "Academic Dept"}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Equipment Identity</span>
                  <span className="text-white font-bold">{selectedSlipWarning.assetName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Asset Tag</span>
                  <span className="text-amber-300 font-bold">{selectedSlipWarning.assetTag}</span>
                </div>
              </div>

              <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl space-y-1">
                <span className="text-[10px] text-rose-400 uppercase font-bold block">Reason for Handback Rejection:</span>
                <p className="text-slate-200 font-medium leading-relaxed">
                  "{selectedSlipWarning.reason}"
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10 pt-2 font-mono">
                <span>Issued On: {selectedSlipWarning.issuedAt}</span>
                <span>Authorized by: {selectedSlipWarning.issuedBy || "Central Store Manager"}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" /> Print Notice Slip
              </button>
              <button
                type="button"
                onClick={() => setSelectedSlipWarning(null)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: View Full Deficiency Reason */}
      {selectedReasonWarning && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedReasonWarning(null)}
          title={`Deficiency Notice Reason - ${selectedReasonWarning.id}`}
        >
          <div className="space-y-4 text-xs select-none">
            {/* Header & Status Banner */}
            <div className="flex items-center justify-between p-3.5 bg-slate-900 border border-white/10 rounded-xl">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                  Official Rejection Record
                </span>
                <span className="font-mono font-black text-rose-300 text-sm">
                  {selectedReasonWarning.id}
                </span>
              </div>
              {selectedReasonWarning.status === "ACTIVE_NOTICE" ? (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 border border-rose-500/30 text-rose-300 inline-flex items-center gap-1.5 shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
                  Active Handback Blocked
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 inline-flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Resolved & Liability Cleared
                </span>
              )}
            </div>

            {/* Custodian & Hardware Info Grid */}
            <div className="grid grid-cols-2 gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-white/5">
              <div>
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Borrower Custodian</span>
                <p className="font-extrabold text-white text-xs mt-0.5">{selectedReasonWarning.userName}</p>
                <p className="text-[10px] text-indigo-300 font-medium">{selectedReasonWarning.department || "Academic Dept"}</p>
              </div>

              <div>
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Equipment Name & Tag</span>
                <p className="font-extrabold text-white text-xs mt-0.5 truncate">{selectedReasonWarning.assetName}</p>
                <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[10px]">
                  <span className="text-amber-300 font-bold">{selectedReasonWarning.assetTag}</span>
                  {selectedReasonWarning.serialNumber && (
                    <span className="text-slate-400">({selectedReasonWarning.serialNumber})</span>
                  )}
                </div>
              </div>
            </div>

            {/* The Main Deficiency Reason Box */}
            <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-rose-400 font-extrabold text-[11px] uppercase tracking-wider">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  <span>Store Manager Physical Inspection & Rejection Reason</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedReasonWarning.reason) {
                        navigator.clipboard.writeText(selectedReasonWarning.reason);
                        setCopiedReason(true);
                        setTimeout(() => setCopiedReason(false), 2000);
                      }
                    }}
                    className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[10px] font-bold border border-white/10 inline-flex items-center gap-1 cursor-pointer transition-all"
                  >
                    {copiedReason ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-slate-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {selectedReasonWarning.status === "ACTIVE_NOTICE" && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewReasonDraft(selectedReasonWarning.reason || "");
                        setEditingWarningReason(!editingWarningReason);
                      }}
                      className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[10px] font-bold border border-white/10 inline-flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Edit3 className="h-3 w-3 text-amber-400" />
                      <span>{editingWarningReason ? "Cancel Edit" : "Edit Reason"}</span>
                    </button>
                  )}
                </div>
              </div>

              {editingWarningReason ? (
                <div className="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-amber-500/30">
                  <span className="text-[10px] text-amber-300 font-bold uppercase block">Update Inspection Rejection Reason:</span>
                  <textarea
                    rows={3}
                    value={newReasonDraft}
                    onChange={(e) => setNewReasonDraft(e.target.value)}
                    placeholder="Enter updated deficiency reason..."
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none focus:border-amber-500 resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingWarningReason(false)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStoredReason(selectedReasonWarning.id, newReasonDraft)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Save Updated Reason
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-rose-500/20 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono uppercase font-bold text-rose-300">Recorded Reason:</span>
                    <span>Logged by Central Warehouse Store Manager</span>
                  </div>
                  <p className="text-slate-100 text-xs font-medium leading-relaxed whitespace-pre-wrap">
                    "{selectedReasonWarning.reason || "No explicit reason was recorded for this deficiency notice."}"
                  </p>
                </div>
              )}
            </div>

            {/* Resolution Details If Cleared */}
            {selectedReasonWarning.resolvedAt && (
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-[11px] uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Official Resolution & Clearance</span>
                  </div>
                  {selectedReasonWarning.clearanceType && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase border border-emerald-500/30">
                      {selectedReasonWarning.clearanceType.replace(/_/g, " ")}
                    </span>
                  )}
                </div>

                <div className="text-slate-200 text-xs bg-slate-950/60 p-3 rounded-lg border border-emerald-500/20 space-y-1.5">
                  <p className="text-slate-100 font-medium">
                    {selectedReasonWarning.adminNotes || selectedReasonWarning.managerNotes || "Deficiency resolved upon administrative clearance & physical verification."}
                  </p>
                  
                  {selectedReasonWarning.amountPaid && (
                    <div className="flex items-center gap-3 text-[11px] font-mono text-emerald-300 pt-1 border-t border-white/5">
                      <span>Paid: <strong>${selectedReasonWarning.amountPaid}</strong></span>
                      {selectedReasonWarning.receiptNumber && <span>Receipt: <strong>{selectedReasonWarning.receiptNumber}</strong></span>}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-emerald-400/80 font-mono pt-1 border-t border-white/5">
                    <span>Cleared: {selectedReasonWarning.resolvedAt}</span>
                    <span>By: {selectedReasonWarning.resolvedBy || "Central Administrator"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata Footer */}
            <div className="flex items-center justify-between text-[10.5px] text-slate-400 px-1 font-mono">
              <span>Notice Issued: {selectedReasonWarning.issuedAt}</span>
              <span>By: {selectedReasonWarning.issuedBy || "Central Store Manager"}</span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  const curr = selectedReasonWarning;
                  setSelectedReasonWarning(null);
                  setSelectedSlipWarning(curr);
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5 text-slate-400" />
                Print Notice Slip
              </button>

              <div className="flex items-center gap-2">
                {selectedReasonWarning.status === "ACTIVE_NOTICE" && (
                  <button
                    type="button"
                    onClick={() => {
                      const curr = selectedReasonWarning;
                      setSelectedReasonWarning(null);
                      setReverifyWarningTarget(curr);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Clear & Accept Handback
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedReasonWarning(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Re-verify & Clear Warning */}
      {reverifyWarningTarget && (
        <Modal
          isOpen={true}
          onClose={() => setReverifyWarningTarget(null)}
          title={`Clear Deficiency & Accept Handback - ${reverifyWarningTarget.assetTag}`}
        >
          <div className="space-y-4 text-xs select-none">
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1">
              <span className="font-extrabold text-emerald-400 uppercase text-[10px] block">
                Resolve Deficiency Notice
              </span>
              <p className="text-slate-200">
                Has faculty member <strong>{reverifyWarningTarget.userName}</strong> provided the missing accessories for <strong>{reverifyWarningTarget.assetName}</strong>?
              </p>
            </div>

            <div className="p-3 bg-slate-900 border border-white/5 rounded-xl space-y-1 text-slate-300">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Original Deficiency Reason</span>
              <p className="italic text-rose-300">"{reverifyWarningTarget.reason}"</p>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              Accepting will restore this equipment to <strong>Available</strong> stock, release all financial liability for the borrower, and mark this deficiency notice as <strong>Cleared & Resolved</strong>.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setReverifyWarningTarget(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleResolveWarningDirect(reverifyWarningTarget)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-lg"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm Resolution & Release Liability
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
