import React, { useState, useEffect } from "react";
import { Asset, AssetIssuance, User } from "../../types";
import { 
  RotateCcw, Search, CheckCircle2, QrCode, 
  Laptop, Printer, AlertTriangle, FileText
} from "lucide-react";
import Modal from "../Modal";
import { 
  getStoredReturnTickets, saveStoredReturnTickets, ReturnTicket 
} from "./ActiveReturnVerificationPage";

interface FacultyReturnPortalProps {
  currentUser: User;
  assets: Asset[];
  myActiveIssuances: AssetIssuance[];
  onNavigateToActivePasses?: () => void;
}

export default function FacultyReturnPortal({
  currentUser,
  assets,
  myActiveIssuances,
  onNavigateToActivePasses,
}: FacultyReturnPortalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIssuance, setSelectedIssuance] = useState<AssetIssuance | null>(null);
  const [returnTickets, setReturnTickets] = useState<ReturnTicket[]>([]);
  const [activeReceiptTicket, setActiveReceiptTicket] = useState<ReturnTicket | null>(null);

  useEffect(() => {
    const loaded = getStoredReturnTickets(currentUser.id);
    setReturnTickets(loaded);
  }, [currentUser.id]);

  // Return Form State
  const [returnCondition, setReturnCondition] = useState<"Good" | "Fair" | "Minor Defect" | "Damaged">("Good");
  const [returnNotes, setReturnNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const getAssetDetails = (assetId: string) => assets.find((a) => a.id === assetId);

  const filteredIssuances = myActiveIssuances.filter((i) => {
    const asset = getAssetDetails(i.assetId);
    if (!asset) return false;
    const q = searchTerm.toLowerCase();
    return (
      asset.assetName.toLowerCase().includes(q) ||
      asset.assetTag.toLowerCase().includes(q) ||
      asset.serialNumber.toLowerCase().includes(q)
    );
  });

  const handleOpenReturnModal = (issuance: AssetIssuance) => {
    setSelectedIssuance(issuance);
    setReturnCondition("Good");
    setReturnNotes("");
  };

  const handleGenerateReturnTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssuance) return;

    const asset = getAssetDetails(selectedIssuance.assetId);
    if (!asset) return;

    setIsGenerating(true);

    setTimeout(() => {
      const ticket: ReturnTicket = {
        ticketId: `RET-${Math.floor(100000 + Math.random() * 900000)}`,
        issuanceId: selectedIssuance.id,
        assetId: asset.id,
        assetName: asset.assetName,
        assetTag: asset.assetTag,
        condition: returnCondition,
        notes: returnNotes || "Regular equipment return.",
        createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        status: "PENDING_WAREHOUSE_SCAN",
      };

      setReturnTickets((prev) => {
        const updated = [ticket, ...prev];
        saveStoredReturnTickets(currentUser.id, updated);
        return updated;
      });
      setIsGenerating(false);
      setSelectedIssuance(null);
      setActiveReceiptTicket(ticket);
    }, 400);
  };

  const selectedAsset = selectedIssuance ? getAssetDetails(selectedIssuance.assetId) : null;
  const activePassesCount = returnTickets.filter((t) => t.status === "PENDING_WAREHOUSE_SCAN").length;

  return (
    <div className="space-y-6 animate-fade-in select-none max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-rose-400" />
            Equipment Return Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Initiate physical return passes for assigned university equipment before delivering hardware to the Store Manager.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToActivePasses && (
            <button
              type="button"
              onClick={onNavigateToActivePasses}
              className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md"
            >
              <QrCode className="h-3.5 w-3.5" /> View Active Return Passes ({activePassesCount})
            </button>
          )}
          <span className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold px-3 py-1.5 rounded-full font-mono">
            {myActiveIssuances.length} Active Borrowed Items
          </span>
        </div>
      </div>

      {/* Main Borrowed Assets Table Container */}
      <div className="bg-[#0a0f1d]/90 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
              <Laptop className="h-4 w-4 text-indigo-400" />
              Assigned Equipment Eligible for Handback
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select an asset below to issue its return pass for Store Manager physical inspection.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search equipment, tag, or serial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 text-white pl-9 pr-3 py-1.5 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:border-rose-500/50"
            />
          </div>
        </div>

        {/* Equipment Return Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-white/10 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="p-3.5 pl-4">Equipment & Serial Number</th>
                <th className="p-3.5">Asset Tag</th>
                <th className="p-3.5">Return Deadline</th>
                <th className="p-3.5">Return Pass Status</th>
                <th className="p-3.5 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredIssuances.length > 0 ? (
                filteredIssuances.map((issuance) => {
                  const asset = getAssetDetails(issuance.assetId);
                  if (!asset) return null;

                  const existingTicket = returnTickets.find(
                    (t) => t.issuanceId === issuance.id && t.status === "PENDING_WAREHOUSE_SCAN"
                  );
                  const rejectedTicket = returnTickets.find(
                    (t) => t.issuanceId === issuance.id && t.status === "REJECTED_DEFICIENCY"
                  );

                  return (
                    <tr key={issuance.id} className="hover:bg-white/5 transition-colors">
                      {/* Asset Name & Serial */}
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                            <Laptop className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-extrabold text-white text-xs">{asset.assetName}</p>
                            <p className="text-[10px] font-mono text-slate-400">SN: {asset.serialNumber}</p>
                          </div>
                        </div>
                      </td>

                      {/* Tag */}
                      <td className="p-3.5">
                        <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-lg font-mono font-extrabold text-[11px]">
                          {asset.assetTag}
                        </span>
                      </td>

                      {/* Deadline */}
                      <td className="p-3.5 font-mono text-xs font-semibold text-slate-300">
                        {issuance.returnDate}
                      </td>

                      {/* Pass Status */}
                      <td className="p-3.5">
                        {existingTicket ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-300 animate-pulse">
                            <QrCode className="h-3 w-3" /> Pass Active ({existingTicket.ticketId})
                          </span>
                        ) : rejectedTicket ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/15 border border-rose-500/30 text-rose-400">
                            <AlertTriangle className="h-3 w-3" /> Handback Warning / Rejected
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium italic">
                            No pass generated
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="p-3.5 pr-4 text-right">
                        {existingTicket ? (
                          <button
                            type="button"
                            onClick={() => setActiveReceiptTicket(existingTicket)}
                            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl font-extrabold text-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                            View QR Pass
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenReturnModal(issuance)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Initiate Return
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                    {myActiveIssuances.length === 0 ? (
                      <div className="space-y-2 py-4 max-w-sm mx-auto">
                        <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                        <p className="font-extrabold text-white not-italic text-sm">No Active Hardware Assigned</p>
                        <p className="text-xs text-slate-400">
                          Your account currently holds zero physical equipment liabilities.
                        </p>
                      </div>
                    ) : (
                      "No assigned equipment matches your search."
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Initiate Return Form */}
      {selectedIssuance && selectedAsset && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedIssuance(null)}
          title={`Initiate Physical Handback - ${selectedAsset.assetTag}`}
        >
          <form onSubmit={handleGenerateReturnTicket} className="space-y-4 text-xs">
            {/* Asset Summary */}
            <div className="p-3.5 bg-slate-900/80 border border-indigo-500/30 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Equipment Selected</span>
              <p className="font-extrabold text-white text-sm">{selectedAsset.assetName}</p>
              <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400 mt-1">
                <span className="text-indigo-300 font-bold">Tag: {selectedAsset.assetTag}</span>
                <span>•</span>
                <span>SN: {selectedAsset.serialNumber}</span>
              </div>
            </div>

            {/* Condition Selection */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                Physical Condition at Handback
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["Good", "Fair", "Minor Defect", "Damaged"] as const).map((cond) => (
                  <button
                    type="button"
                    key={cond}
                    onClick={() => setReturnCondition(cond)}
                    className={`p-2.5 rounded-lg border text-left font-bold transition-all cursor-pointer ${
                      returnCondition === cond
                        ? "bg-indigo-600/30 border-indigo-500 text-white"
                        : "bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason / Handback Notes */}
            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                Reason for Return / Handback Remarks
              </label>
              <textarea
                rows={2}
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="e.g. Semester finished, project completed, submitting for routine store check..."
                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            {/* Notice */}
            <div className="p-3 bg-slate-900 border border-amber-500/20 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
              <FileText className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Store Manager Physical Inspection Rule:</strong> Generating this pass creates a check-in ticket. The Store Manager will manually inspect the physical hardware, charger, and components before confirming handback.
              </span>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedIssuance(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <QrCode className="h-4 w-4" />
                {isGenerating ? "Generating Pass..." : "Generate Return QR Pass"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Printable Return QR Verification Pass */}
      {activeReceiptTicket && (
        <Modal
          isOpen={true}
          onClose={() => setActiveReceiptTicket(null)}
          title={`Return Verification Pass - ${activeReceiptTicket.ticketId}`}
        >
          <div className="space-y-4 text-center">
            {/* Pass Graphic Card */}
            <div className="p-5 bg-slate-950 border-2 border-indigo-500/40 rounded-2xl space-y-4 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
                <span className="font-bold uppercase tracking-wider text-indigo-400">IIUI Equipment Return Pass</span>
                <span className="font-mono text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  {activeReceiptTicket.ticketId}
                </span>
              </div>

              {/* QR Container */}
              <div className="bg-white p-4 rounded-xl w-44 h-44 mx-auto flex flex-col items-center justify-center shadow-inner">
                <QrCode className="h-32 w-32 text-slate-900" />
                <span className="text-[9px] font-mono font-extrabold text-slate-800 mt-1">{activeReceiptTicket.assetTag}</span>
              </div>

              <div className="space-y-1 text-xs">
                <h4 className="font-extrabold text-white text-base">{activeReceiptTicket.assetName}</h4>
                <p className="text-slate-400 font-mono text-xs">Asset Tag: <span className="text-indigo-300 font-bold">{activeReceiptTicket.assetTag}</span></p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left bg-slate-900 p-3 rounded-xl border border-white/5 text-xs font-mono">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Condition Stated</span>
                  <span className="text-white font-bold">{activeReceiptTicket.condition}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Issued Date</span>
                  <span className="text-slate-300">{activeReceiptTicket.createdAt}</span>
                </div>
              </div>

              {activeReceiptTicket.notes && (
                <div className="text-left bg-slate-900 p-3 rounded-xl border border-white/5 text-xs">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Faculty Remarks</span>
                  <p className="text-slate-300 italic">{activeReceiptTicket.notes}</p>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-snug">
              Present this pass at the Central Store desk. The Store Manager will manually inspect the hardware before accepting the return.
            </p>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print Pass
              </button>
              <button
                type="button"
                onClick={() => setActiveReceiptTicket(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-lg transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
