import React from "react";
import { KeyRound, Search, UserCheck, CalendarDays, AlertTriangle, FileText, FileCheck2, PenTool, BookmarkCheck } from "lucide-react";
import { Asset, User } from "../../types";

// STEP 1: Select Hardware view
interface Step1Props {
  assetCategoryFilter: string;
  setAssetCategoryFilter: (c: string) => void;
  assetSearchQuery: string;
  setAssetSearchQuery: (q: string) => void;
  filteredAvailableAssets: Asset[];
  selectedAssetId: string;
  setSelectedAssetId: (id: string) => void;
  chosenAsset?: Asset;
}
export function StepSelectHardware({
  assetCategoryFilter,
  setAssetCategoryFilter,
  assetSearchQuery,
  setAssetSearchQuery,
  filteredAvailableAssets,
  selectedAssetId,
  setSelectedAssetId,
  chosenAsset,
}: Step1Props) {
  return (
    <div className="space-y-4 animate-fade-in text-[11px]">
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1">
          <KeyRound className="h-3.5 w-3.5 text-indigo-400" /> Step 1: Select Warehouse Equipment
        </h4>
        <p className="text-[11px] text-slate-400 leading-normal">
          Filter and select cleared department hardware from available custody registers.
        </p>
      </div>

      <div className="flex gap-2.5">
        <select
          value={assetCategoryFilter}
          onChange={(e) => setAssetCategoryFilter(e.target.value)}
          className="bg-slate-950 border border-white/10 rounded-lg p-2 text-xs text-slate-300 outline-none shrink-0"
        >
          <option value="ALL">All Categories</option>
          <option value="Computing">Computing</option>
          <option value="Projectors">Projectors</option>
          <option value="Lab Equipment">Lab Equipment</option>
          <option value="Office Furniture">Office Furniture</option>
        </select>

        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search assets by tag, name or serial..."
            value={assetSearchQuery}
            onChange={(e) => setAssetSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#030712] border border-white/10 rounded-lg text-xs text-slate-202 outline-none"
          />
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto divide-y divide-white/5 border border-white/5 rounded-xl bg-slate-950/20 font-sans">
        {filteredAvailableAssets.length > 0 ? (
          filteredAvailableAssets.map((asset) => {
            const isSelected = selectedAssetId === asset.id;
            return (
              <button
                key={asset.id}
                type="button"
                onClick={() => setSelectedAssetId(asset.id)}
                className={`w-full text-left p-3 flex items-center justify-between transition-colors cursor-pointer focus:outline-none ${
                  isSelected ? "bg-indigo-600/10 border-l-2 border-l-indigo-505" : "hover:bg-white/[0.01]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${isSelected ? "bg-indigo-400" : "bg-slate-600"}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-100">{asset.assetName}</p>
                    <p className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">
                      Tag: {asset.assetTag} | Serial: {asset.serialNumber} | Dept: {asset.department}
                    </p>
                  </div>
                </div>
                <span className="text-[10.5px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 border border-white/10 rounded">
                  {asset.category}
                </span>
              </button>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-500 italic">
            No available cleared equipment meets search query parameters.
          </div>
        )}
      </div>

      {selectedAssetId && chosenAsset && (
        <div className="p-3.5 rounded-xl bg-indigo-550/10 border border-indigo-550/20 flex gap-2.5 items-center">
          <span className="h-2 w-2 rounded-full bg-indigo-400" />
          <div className="text-[11.5px] font-medium text-indigo-300">
            Selected Allocation: <strong>{chosenAsset.assetName}</strong> [Tag: {chosenAsset.assetTag}] for delivery
          </div>
        </div>
      )}
    </div>
  );
}

// STEP 2: Select Recipient view
interface Step2Props {
  facultySearchQuery: string;
  setFacultySearchQuery: (q: string) => void;
  filteredFaculty: User[];
  selectedUserId: string;
  setSelectedUserId: (v: string) => void;
  chosenFaculty?: User;
}
export function StepSelectFaculty({
  facultySearchQuery,
  setFacultySearchQuery,
  filteredFaculty,
  selectedUserId,
  setSelectedUserId,
  chosenFaculty,
}: Step2Props) {
  return (
    <div className="space-y-4 animate-fade-in text-[11px]">
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1">
          <UserCheck className="h-3.5 w-3.5 text-emerald-450" /> Step 2: Recipient
        </h4>
        <p className="text-[11px] text-slate-400 leading-normal">
          Assign custody hold to a registered campus academic faculty member or visiting staff.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search staff by full name, departmental office, email..."
          value={facultySearchQuery}
          onChange={(e) => setFacultySearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 bg-[#030712] border border-white/10 rounded-lg text-xs text-slate-205 outline-none"
        />
      </div>

      <div className="max-h-60 overflow-y-auto divide-y divide-white/5 border border-white/5 rounded-xl bg-slate-950/20 font-sans">
        {filteredFaculty.length > 0 ? (
          filteredFaculty.map((user) => {
            const isSelected = selectedUserId === user.id;
            const isVisiting = user.role.includes("Visiting") || user.facultyType === "Visiting";
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => setSelectedUserId(user.id)}
                className={`w-full text-left p-3 flex items-center justify-between transition-colors cursor-pointer focus:outline-none ${
                  isSelected ? "bg-indigo-600/10 border-l-2 border-l-emerald-500" : "hover:bg-white/[0.01]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${isSelected ? "bg-emerald-400" : "bg-slate-600"}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-100">{user.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{user.email} | Dept: {user.department}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[9.5px] uppercase font-bold px-2 py-0.5 rounded ${
                    isVisiting ? "bg-amber-950/45 border border-amber-500/20 text-amber-400" : "bg-white/5 border border-white/10 text-slate-300"
                  }`}>
                    {user.role}
                  </span>
                  {user.contractEndDate && (
                    <p className="text-[8.5px] text-amber-450 font-bold mt-1">Contract limit: {user.contractEndDate}</p>
                  )}
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-500 italic">
            No registered active academic or visiting faculty members meet search filters.
          </div>
        )}
      </div>

      {selectedUserId && chosenFaculty && (
        <div className="p-3.5 rounded-xl bg-emerald-550/10 border border-emerald-555/20 flex gap-2.5 items-center">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <div className="text-[11.5px] font-medium text-emerald-300">
            Target Custodian: <strong>{chosenFaculty.name}</strong> ({chosenFaculty.department}) - hold logs synchronized.
          </div>
        </div>
      )}
    </div>
  );
}

// STEP 3: Temporal Limits view
interface Step3Props {
  durationPreset: string;
  onDurationPresetChange: (preset: string) => void;
  returnDate: string;
  setReturnDate: (d: string) => void;
  setDurationPreset: (preset: string) => void;
  chosenFaculty?: User;
}
export function StepSetLimits({
  durationPreset,
  onDurationPresetChange,
  returnDate,
  setReturnDate,
  setDurationPreset,
  chosenFaculty,
}: Step3Props) {
  return (
    <div className="space-y-4 animate-fade-in text-[11px]">
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5 text-amber-400" /> Step 3: Lending Duration & Automatic Calculated Return Date
        </h4>
        <p className="text-[11px] text-slate-400 leading-normal">
          Determine clearance limits on target assets, aligning with departmental contracts.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          "Course Short hold (15 days)",
          "Semester End (120 days)",
          "Academic Year lease (365 days)"
        ].map((preset) => {
          const isSelected = durationPreset === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onDurationPresetChange(preset)}
              className={`p-3 border rounded-xl font-bold text-xs text-center cursor-pointer flex flex-col justify-center items-center gap-1.5 transition-all ${
                isSelected
                  ? "bg-slate-950 border-amber-500 text-amber-400"
                  : "bg-slate-950/20 border-white/5 text-slate-400 hover:border-white/10"
              }`}
            >
              <span>{preset.split(" (")[0]}</span>
              <span className="text-[9.5px] text-slate-500 font-mono tracking-wider">{preset.split(" (")[1]?.replace(")", "") || ""}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-1 pt-1">
        <label className="block text-[10px] uppercase font-bold text-slate-400">Speculative Calendar Deadline Date</label>
        <input
          type="date"
          required
          value={returnDate}
          onChange={(e) => {
            setReturnDate(e.target.value);
            setDurationPreset("Custom Date Choice");
          }}
          className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-xs text-slate-205 outline-none focus:border-amber-500 font-mono font-bold"
        />
      </div>

      {chosenFaculty && chosenFaculty.contractEndDate && (
        <div className={`p-4 rounded-xl border flex gap-3 text-[11px] leading-relaxed select-none ${
          returnDate && new Date(returnDate) > new Date(chosenFaculty.contractEndDate)
            ? "bg-rose-955/20 border-rose-500/25 text-rose-405"
            : "bg-amber-955/10 border-amber-505/15 text-amber-300"
        }`}>
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          <div>
            <p className="font-bold uppercase text-[9px] tracking-wide">Visiting Contract Cross-Boundary Check</p>
            <p className="mt-0.5">
              {chosenFaculty.name}'s employment contract is scheduled to expire on <strong>{chosenFaculty.contractEndDate}</strong>.
              {returnDate && new Date(returnDate) > new Date(chosenFaculty.contractEndDate) ? (
                <strong className="text-rose-400 block mt-1 font-black">
                  Alert: Chosen asset lending return date extends beyond contract term expiration!
                </strong>
              ) : (
                <span className="block mt-0.5">Asset return limits are safely aligned with contract parameters.</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// STEP 4: Authorization specs view
interface Step4Props {
  chosenAsset: Asset;
  chosenFaculty: User;
  returnDate: string;
  currentUser: User;
  digitalSignature: string;
  setDigitalSignature: (v: string) => void;
}
export function StepAuthorisationManifest({
  chosenAsset,
  chosenFaculty,
  returnDate,
  currentUser,
  digitalSignature,
  setDigitalSignature,
}: Step4Props) {
  return (
    <div className="space-y-4 animate-fade-in font-sans text-[11px]">
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1">
          <FileText className="h-3.5 w-3.5 text-indigo-400" /> Step 4: System Authorization Manifest Review
        </h4>
        <p className="text-[11px] text-slate-400 leading-normal">
          Provide clearance endorsement signature below to process checkout sequence keys.
        </p>
      </div>

      {/* Invoice visual */}
      <div className="bg-[#030612] p-4 rounded-xl border border-white/5 space-y-3 font-mono text-[10.5px] leading-relaxed text-slate-400 select-none">
        <p className="text-indigo-400 font-bold text-xs uppercase tracking-wide border-b border-white/5 pb-1 flex items-center gap-1.5">
          <FileCheck2 className="h-4 w-4" /> IIUI AIITS HOLD ENDORSEMENT STATEMENT
        </p>
        <div className="grid grid-cols-2 gap-y-1 pt-1 font-semibold">
          <p>LIABILITY DESK:</p> <p className="text-slate-200 font-bold">CS / SE STORE BLOCK 01</p>
          <p>EQUIPMENT NAME:</p> <p className="text-slate-202">{chosenAsset.assetName}</p>
          <p>HARDWARE TAG ID:</p> <p className="text-indigo-305 font-bold">{chosenAsset.assetTag}</p>
          <p>CUSTODIAN NAME:</p> <p className="text-slate-205 font-bold">{chosenFaculty.name}</p>
          <p>OFFICE DEPT:</p> <p className="text-slate-202">{chosenFaculty.department}</p>
          <p>HOLD DEADLINE:</p> <p className="text-amber-350 font-bold">{returnDate}</p>
          <p>ISSUING OFFICER:</p> <p className="text-slate-202 truncate">{currentUser.name}</p>
        </div>
      </div>

      {/* Signature Input */}
      <div className="space-y-1.5">
        <label className="block text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
          <PenTool className="h-3.5 w-3.5 text-indigo-450" /> digital Authorization Endorsement Signature
        </label>
        <input
          type="text"
          required
          placeholder="Type your full name of authorization credentials (e.g. Sajid Mahmood)"
          value={digitalSignature}
          onChange={(e) => setDigitalSignature(e.target.value)}
          className="w-full bg-[#030611] border border-white/10 rounded-lg p-3 text-xs text-slate-202 outline-none focus:border-indigo-505"
        />
      </div>
    </div>
  );
}

// STEP 5: Success view
interface Step5Props {
  chosenAsset: Asset;
  chosenFaculty: User;
  returnDate: string;
  resetWizardState: () => void;
}
export function StepCheckoutCompleted({ chosenAsset, chosenFaculty, returnDate, resetWizardState }: Step5Props) {
  return (
    <div className="p-6 text-center space-y-4 animate-fade-in text-xs font-sans">
      <div className="h-14 w-14 bg-emerald-550/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 text-3xl">
        ✓
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5 leading-none">
          <BookmarkCheck className="h-4.5 w-4.5" /> Hardware Checkout Successfully Finalized
        </h4>
        <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-normal">
          Physical equipment <strong>{chosenAsset.assetName}</strong> has been transferred into custody hold ledger under <strong>{chosenFaculty.name}</strong>.
        </p>
      </div>

      <div className="p-3.5 rounded-xl border border-white/5 bg-slate-950/40 text-[10.5px] font-mono leading-relaxed max-w-sm mx-auto text-slate-450 space-y-1">
        <p>Holding Barcode: <span className="text-indigo-400 font-bold">{chosenAsset.assetTag}</span></p>
        <p>Automatic Return Limit: <span className="text-amber-400 font-bold">{returnDate}</span></p>
      </div>

      <button
        onClick={resetWizardState}
        className="mt-2 bg-indigo-600 hover:bg-indigo-700 hover:border-indigo-500 border border-indigo-505/20 text-white font-bold px-6 py-2 rounded-xl text-xs uppercase tracking-wide cursor-pointer transition-all shadow shadow-indigo-650/10 gap-1"
      >
        Issue Next Equipment
      </button>
    </div>
  );
}
