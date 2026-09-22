import React, { useState, useEffect } from "react";
import Modal from "../Modal";
import ActionButton from "../ActionButton";
import { ASSET_CATEGORIES, ASSET_CONDITIONS, DEPARTMENTS } from "../../data/mockData";
import { Asset } from "../../types";
import { apiFetch } from "../../lib/api";

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAsset: (payload: Partial<Asset>) => Promise<boolean>;
}

export default function AddAssetModal({
  isOpen,
  onClose,
  onAddAsset,
}: AddAssetModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Computing");
  const [serial, setSerial] = useState("");
  const [purchase, setPurchase] = useState("");
  const [condition, setCondition] = useState("New");
  const [department, setDepartment] = useState("Computer Science");
  const [availableQRs, setAvailableQRs] = useState<any[]>([]);
  const [selectedQR, setSelectedQR] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      apiFetch("/api/qr-registry/available")
        .then((res) => {
          if (res.ok) return res.json();
          return [];
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setAvailableQRs(data);
          }
        })
        .catch((err) => console.error("Error fetching available QRs:", err));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const ok = await onAddAsset({
      assetName: name,
      category,
      serialNumber: serial,
      purchaseDate: purchase || new Date().toISOString().split("T")[0],
      condition: condition as any,
      department,
      assetTag: selectedQR || undefined,
    });
    if (ok) {
      onClose();
      setName("");
      setSerial("");
      setPurchase("");
      setSelectedQR("");
    }
    setIsSaving(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register Brand New Hardware Instance">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Asset Name / Title</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dell Latitude 5420 Laptop"
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 outline-none placeholder-slate-500 focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-indigo-550"
            >
              {ASSET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Serial Card Number</label>
            <input
              type="text"
              required
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="e.g. DL-992837"
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 outline-none placeholder-slate-505 focus:border-indigo-505"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Store Department Location</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-indigo-550"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Initial Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-indigo-550"
            >
              {ASSET_CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* QR Bind Option Dropdown */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Institutional Compliance QR Bind</label>
          <select
            value={selectedQR}
            onChange={(e) => setSelectedQR(e.target.value)}
            className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-indigo-550"
          >
            <option value="">Auto-Generate Next Compliant QR Identifier</option>
            {availableQRs.map((q) => (
              <option key={q.id} value={q.id}>
                Use Pre-Generated: {q.id} ({q.department})
              </option>
            ))}
          </select>
          <p className="text-[9px] text-slate-500 mt-1">
            Choosing "Auto-Generate" evaluates the department initials to sequence matching IIUI standard protocols.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Acquisition Purchase Date</label>
            <input
              type="date"
              required
              value={purchase}
              onChange={(e) => setPurchase(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-slate-250 outline-none focus:border-indigo-550"
            />
          </div>
          <div className="flex items-end">
            <ActionButton type="submit" loading={isSaving} variant="primary" className="w-full cursor-pointer">
              Publish Asset
            </ActionButton>
          </div>
        </div>
      </form>
    </Modal>
  );
}
