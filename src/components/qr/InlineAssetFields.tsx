import React from "react";

interface InlineAssetFieldsProps {
  assetName: string;
  setAssetName: (val: string) => void;
  assetCategory: string;
  setAssetCategory: (val: string) => void;
  serialNumber: string;
  setSerialNumber: (val: string) => void;
  department: string;
  setDepartment: (val: string) => void;
  condition: string;
  setCondition: (val: string) => void;
}

export default function InlineAssetFields({
  assetName,
  setAssetName,
  assetCategory,
  setAssetCategory,
  serialNumber,
  setSerialNumber,
  department,
  setDepartment,
  condition,
  setCondition,
}: InlineAssetFieldsProps) {
  return (
    <div className="bg-black/25 border border-white/5 p-4.5 rounded-xl grid grid-cols-2 gap-3.5 animate-fade-in">
      <span className="col-span-2 text-[9px] uppercase tracking-widest text-slate-500 font-extrabold">
        INLINE DEVICE SPECIFICATIONS FORM
      </span>

      <div className="col-span-2">
        <label className="text-[8.5px] uppercase tracking-wider text-slate-500 block mb-1">Asset Name</label>
        <input
          type="text"
          placeholder="e.g. Dell Latitude 5440"
          value={assetName}
          onChange={(e) => setAssetName(e.target.value)}
          className="w-full h-8.5 bg-black/40 border border-white/10 rounded-lg text-xs text-slate-200 px-3 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-[8.5px] uppercase tracking-wider text-slate-505 block mb-1">Category Type</label>
        <select
          value={assetCategory}
          onChange={(e) => setAssetCategory(e.target.value)}
          className="w-full h-8.5 bg-[#0a1021] border border-white/10 rounded-lg text-xs text-slate-300 px-2 focus:outline-none"
        >
          <option value="Laptop">Laptop</option>
          <option value="Printer">Printer</option>
          <option value="Desktop">Desktop</option>
          <option value="Server">Server</option>
          <option value="Networking">Networking</option>
          <option value="Furniture">Furniture</option>
          <option value="Lab Equipment">Lab Equipment</option>
        </select>
      </div>

      <div>
        <label className="text-[8.5px] uppercase tracking-wider text-slate-500 block mb-1">Serial Number</label>
        <input
          type="text"
          placeholder="e.g. SN-89241X"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          className="w-full h-8.5 bg-black/40 border border-white/10 rounded-lg text-xs text-slate-200 px-3 focus:outline-none font-mono"
        />
      </div>

      <div>
        <label className="text-[8.5px] uppercase tracking-wider text-slate-500 block mb-1">Department</label>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-full h-8.5 bg-[#0a1021] border border-white/10 rounded-lg text-xs text-slate-300 px-2 focus:outline-none"
        >
          <option value="Administration">Administration</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Software Engineering">Software Engineering</option>
          <option value="Electrical Engineering">Electrical Engineering</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
          <option value="Management Sciences">Management Sciences</option>
        </select>
      </div>

      <div>
        <label className="text-[8.5px] uppercase tracking-wider text-slate-500 block mb-1">State Condition</label>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="w-full h-8.5 bg-[#0a1021] border border-white/10 rounded-lg text-xs text-slate-300 px-2 focus:outline-none"
        >
          <option value="New">New (Untransmitting)</option>
          <option value="Good">Good (Satisfied)</option>
          <option value="Fair">Fair (Operational)</option>
          <option value="Damaged">Damaged (Faulty)</option>
        </select>
      </div>
    </div>
  );
}
