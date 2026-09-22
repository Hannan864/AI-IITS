import React, { useState } from "react";
import { Laptop, Calendar, Clock, Tag, QrCode, CheckCircle2, AlertTriangle, ShieldCheck, ChevronRight } from "lucide-react";
import { Asset, AssetIssuance } from "../../types";
import AssetQRDetailModal from "../inventory/AssetQRDetailModal";

interface AllocatedAssetsListProps {
  assets: Asset[];
  myActiveIssuances: AssetIssuance[];
}

export default function AllocatedAssetsList({
  assets,
  myActiveIssuances,
}: AllocatedAssetsListProps) {
  const [selectedQRAsset, setSelectedQRAsset] = useState<Asset | null>(null);

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-[#0a0f1d]/90 backdrop-blur-md p-5 sm:p-6 shadow-xl animate-fade-in space-y-4">
      {/* Header with clear explanatory context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
              <Laptop className="h-4 w-4 text-indigo-400" />
              Items Currently Borrowed By You
            </h3>
            <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {myActiveIssuances.length} {myActiveIssuances.length === 1 ? "Item" : "Items"} Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hardware equipment currently issued to your custody. Keep track of return deadlines or download official QR tags.
          </p>
        </div>
      </div>

      {/* Borrowed Items Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myActiveIssuances.map((iss) => {
          const asset = assets.find((a) => a.id === iss.assetId);
          if (!asset) return null;

          // Check if return date is overdue or approaching
          const todayStr = new Date().toISOString().split("T")[0];
          const isOverdue = iss.returnDate ? iss.returnDate < todayStr : false;

          return (
            <div
              key={iss.id}
              id={`asset-card-${iss.id}`}
              className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3.5 shadow-md hover:border-indigo-500/40 transition-all group relative overflow-hidden"
            >
              {/* Top Bar: Status Indicator */}
              <div className="flex items-center justify-between text-[10.5px]">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border ${
                    isOverdue
                      ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  }`}
                >
                  {isOverdue ? (
                    <>
                      <AlertTriangle className="h-3 w-3 text-rose-400 animate-pulse" />
                      Return Overdue
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      Active Loan
                    </>
                  )}
                </span>

                <span className="text-slate-400 font-medium bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  {asset.category}
                </span>
              </div>

              {/* Product Info */}
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-white group-hover:text-indigo-300 transition-colors leading-tight">
                  {asset.assetName}
                </h4>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-bold flex items-center gap-1 text-[11px]">
                    <Tag className="h-3 w-3 text-indigo-400" />
                    {asset.assetTag}
                  </span>
                  <span>SN: {asset.serialNumber}</span>
                </div>
              </div>

              {/* Dates Info Panel */}
              <div className="grid grid-cols-2 gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" /> Borrowed On
                  </span>
                  <p className="font-mono font-bold text-slate-200 mt-0.5">{iss.issuedDate}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Clock className="h-3 w-3 text-indigo-400" /> Return Due By
                  </span>
                  <p
                    className={`font-mono font-bold mt-0.5 ${
                      isOverdue ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {iss.returnDate}
                  </p>
                </div>
              </div>

              {/* Action: Inspect Details Button */}
              <button
                type="button"
                onClick={() => setSelectedQRAsset(asset)}
                className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/40 active:bg-indigo-600/60 border border-indigo-500/30 text-indigo-200 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <QrCode className="h-3.5 w-3.5 text-indigo-400" />
                View Asset Specs & QR Label
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}

        {myActiveIssuances.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-10 bg-slate-900/40 rounded-xl border border-dashed border-white/10 space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">No Active Hardware Loans</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You currently have no borrowed items registered under your account. All equipment returns are up to date!
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal for borrowed item */}
      <AssetQRDetailModal
        asset={selectedQRAsset}
        onClose={() => setSelectedQRAsset(null)}
        issuances={myActiveIssuances}
      />
    </div>
  );
}
