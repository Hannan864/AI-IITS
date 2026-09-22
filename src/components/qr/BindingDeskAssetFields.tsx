import React from "react";

interface BindingDeskAssetFieldsProps {
  newAssetForm: {
    name: string;
    category: string;
    serial: string;
  };
  setNewAssetForm: React.Dispatch<React.SetStateAction<{
    name: string;
    category: string;
    serial: string;
  }>>;
}

export default function BindingDeskAssetFields({ newAssetForm, setNewAssetForm }: BindingDeskAssetFieldsProps) {
  return (
    <div className="space-y-3 border-l-2 border-indigo-500/20 pl-3 animate-fade-in">
      <div>
        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Asset Name</label>
        <input
          type="text"
          required
          value={newAssetForm.name}
          onChange={(e) => setNewAssetForm({ ...newAssetForm, name: e.target.value })}
          placeholder="e.g. MacBook Pro M3 Max"
          className="w-full h-8 bg-black/40 border border-white/10 rounded-lg text-xs text-slate-200 px-2 outline-none focus:border-indigo-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Category</label>
          <select
            value={newAssetForm.category}
            onChange={(e) => setNewAssetForm({ ...newAssetForm, category: e.target.value })}
            className="w-full h-8 bg-[#0b1227] border border-white/10 rounded-lg text-[10px] text-slate-205 px-2 px-1 focus:outline-none"
          >
            <option value="Computing">Computing</option>
            <option value="Lab Equipment">Lab Equipment</option>
            <option value="Networking">Networking</option>
            <option value="Furniture">Furniture</option>
          </select>
        </div>
        <div>
          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Serial Key</label>
          <input
            type="text"
            required
            value={newAssetForm.serial}
            onChange={(e) => setNewAssetForm({ ...newAssetForm, serial: e.target.value })}
            placeholder="SN-6523"
            className="w-full h-8 bg-black/40 border border-white/10 rounded-lg text-xs text-slate-200 px-2 outline-none focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
