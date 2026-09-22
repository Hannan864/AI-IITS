import React, { useState } from "react";
import { PlusCircle, Trash, Edit, AlertTriangle, Loader2, CheckCircle2, X, QrCode, Tag } from "lucide-react";
import GlassCard from "../components/GlassCard";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import ActionButton from "../components/ActionButton";
import { Asset, AssetIssuance, User } from "../types";
import AddAssetModal from "../components/inventory/AddAssetModal";
import EditStatusModal from "../components/inventory/EditStatusModal";
import AssetQRDetailModal from "../components/inventory/AssetQRDetailModal";
import Modal from "../components/Modal";

interface InventoryPageProps {
  assets: Asset[];
  onAddAsset: (payload: Partial<Asset>) => Promise<boolean>;
  onDeleteAsset?: (id: string) => Promise<boolean>;
  onUpdateStatus?: (id: string, status: string, condition: string) => Promise<boolean>;
  isAdmin?: boolean;
  issuances?: AssetIssuance[];
  users?: User[];
}

export default function InventoryPage({
  assets,
  onAddAsset,
  onDeleteAsset,
  onUpdateStatus,
  isAdmin = false,
  issuances = [],
  users = [],
}: InventoryPageProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  // Custom Delete Modal State
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // QR Detail Modal State
  const [selectedQRAsset, setSelectedQRAsset] = useState<Asset | null>(null);

  const startUpdate = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsUpdateOpen(true);
  };

  const confirmDeleteAsset = async () => {
    if (!assetToDelete || !onDeleteAsset) return;
    setIsDeleting(true);
    try {
      const ok = await onDeleteAsset(assetToDelete.id);
      if (ok) {
        setToastMessage(`Hardware "${assetToDelete.assetName}" (${assetToDelete.assetTag}) permanently purged.`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
      setAssetToDelete(null);
    }
  };

  const columns = [
    {
      header: "Hardware Details",
      accessor: (a: Asset) => (
        <div>
          <p className="font-bold text-slate-100 text-xs">{a.assetName}</p>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{a.serialNumber}</span>
        </div>
      ),
    },
    {
      header: "Sequential Tag",
      accessor: (a: Asset) => (
        <button
          type="button"
          onClick={() => setSelectedQRAsset(a)}
          className="text-[10px] font-mono bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded cursor-pointer hover:scale-105 transition-all flex items-center gap-1"
          title="Click to inspect asset specs, custody hold, and QR details"
        >
          <Tag className="h-3 w-3 text-indigo-400 shrink-0" />
          {a.assetTag}
        </button>
      ),
    },
    {
      header: "Category",
      accessor: (a: Asset) => <span className="font-bold text-slate-400">{a.category}</span>,
    },
    {
      header: "Department",
      accessor: (a: Asset) => <span className="text-slate-400 font-medium">{a.department}</span>,
    },
    {
      header: "Status",
      accessor: (a: Asset) => (
        <StatusBadge
          status={a.status}
          onClick={() => setSelectedQRAsset(a)}
          title="Click to inspect asset specs, custody hold, and QR details"
        />
      ),
    },
    {
      header: "QR Security",
      accessor: (a: Asset) => (
        <button
          type="button"
          onClick={() => setSelectedQRAsset(a)}
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:scale-105 transition-all flex items-center gap-1.5 ${
            a.assetTag && !a.assetTag.includes('TEMP')
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30'
              : 'bg-slate-500/20 text-slate-400 border border-slate-500/30 hover:bg-slate-500/30'
          }`}
          title="Click to inspect bound QR Code and detailed product specifications"
        >
          <QrCode className="h-3 w-3" />
          {a.assetTag && !a.assetTag.includes('TEMP') ? 'Bound' : 'Unbound'}
        </button>
      ),
    },
    {
      header: "Condition",
      accessor: (a: Asset) => (
        <span
          className={`font-semibold ${
            a.condition === "New" || a.condition === "Good" ? "text-emerald-400" : "text-amber-400"
          }`}
        >
          {a.condition}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (a: Asset) => (
        <div className="flex items-center gap-1">
          {onUpdateStatus && (
            <button
              onClick={() => startUpdate(a)}
              className="p-1 px-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-slate-300 transition-all flex items-center gap-1 cursor-pointer text-[10.5px]"
            >
              <Edit className="h-3 w-3" /> Status
            </button>
          )}
          {onDeleteAsset && (
            <button
              onClick={() => setAssetToDelete(a)}
              className="p-1 px-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-all cursor-pointer flex items-center gap-1 text-[10.5px]"
              title="Delete Asset"
            >
              <Trash className="h-3 w-3" /> Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {toastMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white p-1">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Asset Registers Ledger</h3>
          <p className="text-xs text-slate-400">Add, track, modify, or archive hardware assets globally.</p>
        </div>
        <ActionButton onClick={() => setIsAddOpen(true)} variant="primary">
          <PlusCircle className="h-4.5 w-4.5" /> Register Asset
        </ActionButton>
      </div>

      <GlassCard>
        <DataTable
          data={assets}
          columns={columns}
          searchPlaceholder="Search by tag, name or serial..."
          searchFilter={(item, query) => {
            const q = query.toLowerCase();
            return (
              item.assetName.toLowerCase().includes(q) ||
              item.assetTag.toLowerCase().includes(q) ||
              item.serialNumber.toLowerCase().includes(q) ||
              item.category.toLowerCase().includes(q) ||
              item.department.toLowerCase().includes(q)
            );
          }}
          pageSize={6}
        />
      </GlassCard>

      <AddAssetModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddAsset={onAddAsset}
      />

      <EditStatusModal
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        selectedAsset={selectedAsset}
        onUpdateStatus={onUpdateStatus || (() => Promise.resolve(false))}
      />

      {/* Custom Delete Confirmation Modal */}
      <Modal
        isOpen={!!assetToDelete}
        onClose={() => !isDeleting && setAssetToDelete(null)}
        title="Purge Hardware Asset"
      >
        {assetToDelete && (
          <div className="space-y-4">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 space-y-1">
                <p className="font-bold text-rose-300">Irreversible System Action</p>
                <p className="text-slate-400 leading-relaxed">
                  Are you sure you want to permanently remove <strong className="text-white">{assetToDelete.assetName}</strong> (<span className="font-mono text-indigo-300">{assetToDelete.assetTag}</span>) from central university ledgers?
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 space-y-1 text-xs">
              <p className="text-slate-400"><strong>Serial Number:</strong> {assetToDelete.serialNumber}</p>
              <p className="text-slate-400"><strong>Department:</strong> {assetToDelete.department}</p>
              <p className="text-slate-400"><strong>Current Status:</strong> {assetToDelete.status}</p>
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
                    Purging Record...
                  </>
                ) : (
                  <>
                    <Trash className="h-3.5 w-3.5" />
                    Confirm Purge
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* QR & Product Details Modal */}
      <AssetQRDetailModal
        asset={selectedQRAsset}
        onClose={() => setSelectedQRAsset(null)}
        issuances={issuances}
        users={users}
      />
    </div>
  );
}

