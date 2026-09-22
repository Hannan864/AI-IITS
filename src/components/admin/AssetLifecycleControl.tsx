import React, { useState } from "react";
import { Laptop, ClipboardList, PenTool, Flame, RefreshCcw, Search, Filter, Trash, AlertTriangle, Loader2, QrCode, Tag } from "lucide-react";
import { Asset, AssetIssuance, User } from "../../types";
import GlassCard from "../GlassCard";
import Modal from "../Modal";
import StatusBadge from "../StatusBadge";
import AssetQRDetailModal from "../inventory/AssetQRDetailModal";

interface AssetLifecycleControlProps {
  assets: Asset[];
  issuances: AssetIssuance[];
  users: User[];
  onUpdateAsset: (id: string, payload: Partial<Asset>) => Promise<boolean>;
  onDeleteAsset?: (id: string) => Promise<boolean>;
}

export default function AssetLifecycleControl({
  assets,
  issuances,
  users,
  onUpdateAsset,
  onDeleteAsset,
}: AssetLifecycleControlProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [activeTab, setActiveTabTab] = useState<"all" | "Damaged" | "Available" | "Issued">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // QR Detail Modal State
  const [selectedQRAsset, setSelectedQRAsset] = useState<Asset | null>(null);

  // Deletion modal state
  const [assetToDelete, setAssetToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteAsset = async () => {
    if (!assetToDelete || !onDeleteAsset) return;
    setIsDeleting(true);
    try {
      const ok = await onDeleteAsset(assetToDelete.id);
      if (ok && selectedAsset?.id === assetToDelete.id) {
        setSelectedAsset(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
      setAssetToDelete(null);
    }
  };

  const handleConditionChange = async (id: string, nextCondition: any) => {
    setUpdatingId(id);
    let nextStatus = "Available";
    if (nextCondition === "Damaged") {
      nextStatus = "Damaged";
    }
    try {
      await onUpdateAsset(id, { condition: nextCondition, status: nextStatus as any });
      // Update local state copy to render properly
      if (selectedAsset && selectedAsset.id === id) {
        setSelectedAsset({ ...selectedAsset, condition: nextCondition, status: nextStatus as any });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAssets = assets
    .filter((a) => {
      const matchesSearch =
        a.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "Damaged" && (a.condition === "Damaged" || a.status === "Damaged")) ||
        (activeTab === "Available" && a.status === "Available") ||
        (activeTab === "Issued" && a.status === "Issued");
      return matchesSearch && matchesTab;
    });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
      {/* List on Left */}
      <div className="xl:col-span-7 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900/35 border border-white/5 p-4 rounded-2xl">
          <div className="flex gap-2 items-center">
            <ClipboardList className="h-5 w-5 text-indigo-400" />
            <div>
              <h2 className="text-xs font-bold text-slate-100 uppercase tracking-widest">Asset Lifecycle & Registry</h2>
              <p className="text-[10.5px] text-slate-400 font-medium">Verify hardware procurement states, depreciation conditions, and custody maps</p>
            </div>
          </div>

          <div className="relative w-full sm:w-48">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search tag/serial/model"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/70 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>
        </div>

        {/* Categories selector tab */}
        <div className="flex gap-2.5 border-b border-white/5 pb-2.5">
          {(["all", "Available", "Issued", "Damaged"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTabTab(tab)}
              className={`text-[10.5px] font-bold uppercase tracking-wider pb-1 transition-all border-b-2 cursor-pointer ${
                activeTab === tab 
                  ? "border-indigo-500 text-indigo-400 font-black" 
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              {tab} ({tab === "all" ? assets.length : assets.filter((a) => {
                if (tab === "Damaged") return a.condition === "Damaged" || a.status === "Damaged";
                return a.status === tab;
              }).length})
            </button>
          ))}
        </div>

        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-2">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center ${
                selectedAsset?.id === asset.id
                  ? "bg-indigo-650/10 border-indigo-500/40 shadow-inner"
                  : "bg-slate-900/10 border-white/5 hover:border-white/10"
              }`}
            >
              <div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedQRAsset(asset);
                  }}
                  className="text-[10px] font-mono bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded cursor-pointer hover:scale-105 transition-all inline-flex items-center gap-1 mb-1"
                  title="Click to inspect asset specs, custody hold, and QR details"
                >
                  <Tag className="h-3 w-3 text-indigo-400 shrink-0" />
                  {asset.assetTag}
                </button>
                <h4 className="text-xs font-bold text-slate-200">{asset.assetName}</h4>
                <div className="flex items-center gap-2 mt-2 text-[10px]">
                  <span className="text-indigo-400 font-medium">{asset.category}</span>
                  <span className="text-slate-600 font-mono">•</span>
                  <span className="text-slate-500 font-mono">SN: {asset.serialNumber}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                {/* Condition updates dropdown */}
                <select
                  disabled={updatingId === asset.id}
                  value={asset.condition}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleConditionChange(asset.id, e.target.value)}
                  className="bg-slate-950/70 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-300 outline-none"
                >
                  <option value="New">Condition: New</option>
                  <option value="Good">Condition: Good</option>
                  <option value="Fair">Condition: Fair</option>
                  <option value="Damaged">Condition: Damaged</option>
                  <option value="Repairing">Condition: Repairing</option>
                </select>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedQRAsset(asset);
                  }}
                  className={`px-2 py-1 rounded text-[8.5px] font-bold uppercase tracking-wider cursor-pointer hover:scale-105 transition-all flex items-center gap-1 ${
                    asset.assetTag && !asset.assetTag.includes('TEMP')
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30'
                      : 'bg-slate-500/20 text-slate-400 border border-slate-500/30 hover:bg-slate-500/30'
                  }`}
                  title="Click to view bound QR Code and all related details"
                >
                  <QrCode className="h-3 w-3" />
                  {asset.assetTag && !asset.assetTag.includes('TEMP') ? 'Bound' : 'Unbound'}
                </button>

                <StatusBadge
                  status={asset.status}
                  onClick={() => setSelectedQRAsset(asset)}
                  title="Click to view bound QR Code and all related details"
                />

                {onDeleteAsset && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAssetToDelete({ id: asset.id, name: asset.assetName });
                    }}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                    title="Delete Asset"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Drawer (Right Column) */}
      <div className="xl:col-span-5">
        {selectedAsset ? (
          <GlassCard className="p-6 space-y-5 sticky top-20 border border-indigo-500/15">
            <div className="border-b border-white/5 pb-3.5 flex justify-between items-start gap-2">
              <div>
                <span className="text-[9.5px] font-mono text-indigo-400 font-bold block">{selectedAsset.assetTag}</span>
                <h3 className="text-sm font-black text-white mt-1">{selectedAsset.assetName}</h3>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Procured On: {selectedAsset.purchaseDate}</p>
              </div>
              {onDeleteAsset && (
                <button
                  type="button"
                  onClick={() => setAssetToDelete({ id: selectedAsset.id, name: selectedAsset.assetName })}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                >
                  <Trash className="h-3.5 w-3.5" /> Delete Asset
                </button>
              )}
            </div>

            {/* Asset QR Trace ID */}
            <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Active Barcode / QR Signature</span>
              <code className="text-[10.5px] font-mono text-emerald-400 block break-words">{selectedAsset.qrCode}</code>
            </div>

            {/* Custodian History timeline */}
            <div className="space-y-3.5">
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <RefreshCcw className="h-3.5 w-3.5 text-indigo-400" /> Custody Handover Logs
              </h4>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                {issuances
                  .filter((i) => i.assetId === selectedAsset.id)
                  .map((history) => (
                    <div key={history.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-[10.5px]">
                      <div className="flex justify-between font-bold text-slate-300">
                        <span>{history.userName || users.find((u) => u.id === history.userId)?.name || "Academic Member"}</span>
                        <span className={history.actualReturnDate ? "text-emerald-400" : "text-amber-400"}>
                          {history.actualReturnDate ? "Returned" : "Active Custody"}
                        </span>
                      </div>
                      <div className="text-[9.5px] text-slate-500 mt-1 font-mono">
                        Issued: {history.issuedDate} | Due: {history.returnDate}
                      </div>
                      {history.actualReturnDate && (
                        <div className="text-[9px] text-emerald-400/80 mt-1 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/5 w-fit">
                          Checked-in: {history.actualReturnDate}
                        </div>
                      )}
                    </div>
                  ))}

                {issuances.filter((i) => i.assetId === selectedAsset.id).length === 0 && (
                  <p className="text-[10.5px] text-slate-500 italic py-2 text-center">
                    This item has no historical checkout cycles. Currently on buffer stores.
                  </p>
                )}
              </div>
            </div>
          </GlassCard>
        ) : (
          <div className="h-full flex items-center justify-center p-8 border border-dashed border-white/10 rounded-2xl">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider text-center">
              Select an asset on the left to inspect its complete custody history and QR signatures
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!assetToDelete}
        onClose={() => !isDeleting && setAssetToDelete(null)}
        title="Purge Asset Record"
      >
        {assetToDelete && (
          <div className="space-y-4">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 space-y-1">
                <p className="font-bold text-rose-300">Irreversible Action</p>
                <p className="text-slate-400 leading-relaxed">
                  Are you sure you want to permanently delete asset <strong className="text-white">{assetToDelete.name}</strong> from university records?
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setAssetToDelete(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteAsset}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Purging...
                  </>
                ) : (
                  <>
                    <Trash className="h-3.5 w-3.5" />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <AssetQRDetailModal
        asset={selectedQRAsset}
        onClose={() => setSelectedQRAsset(null)}
        issuances={issuances}
        users={users}
      />
    </div>
  );
}
