import React from "react";
import { X, QrCode, Download, ShieldCheck, Tag, Calendar, Building2, User, Cpu, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { Asset, AssetIssuance, User as UserType } from "../../types";

interface AssetQRDetailModalProps {
  asset: Asset | null;
  onClose: () => void;
  issuances?: AssetIssuance[];
  users?: UserType[];
}

export default function AssetQRDetailModal({
  asset,
  onClose,
  issuances = [],
  users = [],
}: AssetQRDetailModalProps) {
  if (!asset) return null;

  const isBound = Boolean(asset.assetTag && !asset.assetTag.includes("TEMP"));
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    asset.assetTag
  )}`;

  // Find active or latest issuance for this asset
  const activeIssuance = issuances.find(
    (i) => i.assetId === asset.id && (i.status === "Active" || i.status === "Overdue")
  );

  let custodianUser: UserType | undefined;
  if (activeIssuance) {
    custodianUser = users.find((u) => u.id === activeIssuance.userId);
  }

  const handleDownloadQR = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = 300;
      canvas.height = 360;

      // White background card
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw QR Image
      ctx.drawImage(img, 25, 20, 250, 250);

      // Header border line
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, 280);
      ctx.lineTo(280, 280);
      ctx.stroke();

      // Asset Tag Text
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 16px monospace";
      ctx.textAlign = "center";
      ctx.fillText(asset.assetTag, canvas.width / 2, 305);

      // Asset Name Text
      ctx.fillStyle = "#475569";
      ctx.font = "12px sans-serif";
      ctx.fillText(asset.assetName.slice(0, 32), canvas.width / 2, 328);

      // Dept Text
      ctx.fillStyle = "#64748b";
      ctx.font = "10px sans-serif";
      ctx.fillText(`IIUI · ${asset.department}`, canvas.width / 2, 345);

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `QR_LABEL_${asset.assetTag}.png`;
      link.click();
    };
    img.src = qrImageUrl;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020512]/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="bg-[#0a0f1d]/95 border border-indigo-500/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative p-5 sm:p-6 text-xs text-slate-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 active:bg-white/20 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 pr-8">
          <div className="h-10 w-10 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              {asset.assetName}
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  isBound
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                    : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                }`}
              >
                {isBound ? "Bound QR Tag" : "Unbound Asset"}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Tag ID: <strong className="text-indigo-300">{asset.assetTag}</strong> | S/N: {asset.serialNumber}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Column: QR Code Display Card */}
          <div className="md:col-span-5 flex flex-col items-center justify-between bg-slate-950/80 p-4 rounded-xl border border-white/10 space-y-3">
            <div className="bg-white p-3 rounded-xl shadow-lg border border-white/20 w-full aspect-square max-w-[200px] flex items-center justify-center my-auto">
              <img
                src={qrImageUrl}
                alt={`QR Code for ${asset.assetTag}`}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="w-full space-y-2 text-center">
              <span className="font-mono text-[11px] font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 block truncate">
                {asset.assetTag}
              </span>

              <button
                type="button"
                onClick={handleDownloadQR}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
              >
                <Download className="h-4 w-4" /> Download QR Label
              </button>
            </div>
          </div>

          {/* Right Column: Complete Related Details */}
          <div className="md:col-span-7 space-y-4">
            {/* Core Specs Grid */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5 text-indigo-400" /> Hardware Specifications
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Category</span>
                  <p className="font-bold text-slate-200">{asset.category}</p>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Department</span>
                  <p className="font-bold text-slate-200">{asset.department}</p>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Condition</span>
                  <p className={`font-bold ${asset.condition === 'New' || asset.condition === 'Good' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {asset.condition}
                  </p>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Current Status</span>
                  <p className={`font-bold ${asset.status === 'Available' ? 'text-emerald-400' : asset.status === 'Issued' ? 'text-indigo-400' : 'text-rose-400'}`}>
                    {asset.status}
                  </p>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 space-y-0.5 col-span-2">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Purchase Date</span>
                  <p className="font-mono text-slate-300">{asset.purchaseDate || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Custody Hold Details */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-emerald-400" /> Custody & Allocation State
              </h4>
              {activeIssuance ? (
                <div className="bg-indigo-950/30 border border-indigo-500/20 p-3 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-indigo-400 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Currently Issued Out
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                      Due: {activeIssuance.returnDate}
                    </span>
                  </div>
                  <div className="space-y-1 pt-1 border-t border-white/5">
                    <p className="text-xs font-bold text-white">
                      {activeIssuance.userName || custodianUser?.name || "Faculty Custodian"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Email: {activeIssuance.userEmail || custodianUser?.email || "N/A"}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Department: {activeIssuance.department || custodianUser?.department || asset.department}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Issued On: {activeIssuance.issuedDate} by {activeIssuance.issuedBy}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/40 border border-white/5 p-3 rounded-xl flex items-center gap-2.5 text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Vacant in Warehouse. Device is available for outbound allocation.</span>
                </div>
              )}
            </div>

            {/* QR Payload Payload Info */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-white/5 space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <FileText className="h-3 w-3 text-slate-400" /> QR Security Payload Data String
              </span>
              <p className="font-mono text-[10px] text-indigo-300 break-all select-all bg-black/40 p-2 rounded border border-white/5">
                {asset.qrCode || `IIUI-ASSET:${asset.assetTag}:${asset.serialNumber}`}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
