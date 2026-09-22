import React, { useState, useEffect } from "react";
import Modal from "../Modal";
import ActionButton from "../ActionButton";
import { ASSET_CONDITIONS } from "../../data/mockData";
import { Asset } from "../../types";

interface EditStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAsset: Asset | null;
  onUpdateStatus: (id: string, status: string, condition: string) => Promise<boolean>;
}

export default function EditStatusModal({
  isOpen,
  onClose,
  selectedAsset,
  onUpdateStatus,
}: EditStatusModalProps) {
  const [newStatus, setNewStatus] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedAsset) {
      setNewStatus(selectedAsset.status);
      setNewCondition(selectedAsset.condition);
    }
  }, [selectedAsset]);

  const handleSaveUpdate = async () => {
    if (!selectedAsset) return;
    setIsSaving(true);
    const ok = await onUpdateStatus(selectedAsset.id, newStatus, newCondition);
    if (ok) {
      onClose();
    }
    setIsSaving(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Ledger Tags & Status">
      <div className="space-y-4">
        <p className="text-[10.5px] text-slate-400 leading-normal">
          Modify the current status logs of <span className="font-bold text-slate-200">"{selectedAsset?.assetName}"</span>. Changing to issued must go through checkout logistics.
        </p>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Asset Status</label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-indigo-505"
          >
            <option value="Available">Available</option>
            <option value="Damaged">Damaged (Faulty/Service Block)</option>
            <option value="Retired">Retired (Out of Commission)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Current Condition</label>
          <select
            value={newCondition}
            onChange={(e) => setNewCondition(e.target.value)}
            className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-indigo-505"
          >
            {ASSET_CONDITIONS.map((cond) => (
              <option key={cond} value={cond}>
                {cond}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <ActionButton onClick={onClose} variant="secondary" className="cursor-pointer">
            Discard
          </ActionButton>
          <ActionButton onClick={handleSaveUpdate} loading={isSaving} variant="primary" className="cursor-pointer">
            Apply Changes
          </ActionButton>
        </div>
      </div>
    </Modal>
  );
}
