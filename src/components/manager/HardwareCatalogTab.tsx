import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Asset } from "../../types";

interface HardwareCatalogTabProps {
  assets: Asset[];
  departments: string[];
  onAddAsset: (asset: Partial<Asset>) => Promise<boolean>;
  onUpdateAssetStatus: (assetId: string, status: string, condition: string) => Promise<boolean>;
  onSelectAssetForIssuance: (assetId: string) => void;
}

export default function HardwareCatalogTab({
  assets,
  departments,
  onAddAsset,
  onUpdateAssetStatus,
  onSelectAssetForIssuance,
}: HardwareCatalogTabProps) {
  // Add Asset States
  const [assetName, setAssetName] = useState("");
  const [assetCategory, setAssetCategory] = useState("Computing");
  const [assetSerial, setAssetSerial] = useState("");
  const [assetPurchaseDate, setAssetPurchaseDate] = useState("");
  const [assetCondition, setAssetCondition] = useState<any>("New");
  const [assetDept, setAssetDept] = useState("Computer Science");
  const [regMsg, setRegMsg] = useState("");

  // Search and Filter States
  const [inventorySearch, setInventorySearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const handleRegisterAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName || !assetSerial || !assetPurchaseDate) return;

    const payload = {
      assetName,
      category: assetCategory,
      serialNumber: assetSerial,
      purchaseDate: assetPurchaseDate,
      condition: assetCondition,
      department: assetDept,
    };

    const success = await onAddAsset(payload);
    if (success) {
      setRegMsg("Asset registered to store successfully!");
      setAssetName("");
      setAssetSerial("");
      setAssetPurchaseDate("");
      setTimeout(() => setRegMsg(""), 3000);
    } else {
      setRegMsg("Error registering asset.");
      setTimeout(() => setRegMsg(""), 3000);
    }
  };

  const filteredAssets = assets.filter((ast) => {
    const matchesSearch =
      ast.assetName.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      ast.assetTag.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      ast.serialNumber.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchesCat = categoryFilter === "All" || ast.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      {/* Add Asset left */}
      <div className="lg:col-span-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-lg h-fit">
        <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-3 mb-4 flex items-center gap-1.5">
          <Plus className="h-4.5 w-4.5 text-indigo-400" />
          Register Store Inventory Unit
        </h3>
        <form onSubmit={handleRegisterAsset} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Brand Model Name</label>
            <input
              type="text"
              required
              placeholder="e.g. ThinkPad T14 AMD Gen 3"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className="mt-1 w-full bg-slate-950/50 border border-white/10 rounded-lg py-1.5 px-3 text-xs focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-500 outline-none font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Category</label>
              <select
                value={assetCategory}
                onChange={(e) => setAssetCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 py-1.5 px-2.5 text-xs focus:ring-1 focus:ring-indigo-500 text-slate-100 font-bold bg-slate-900 outline-none"
              >
                <option value="Computing" className="bg-slate-950">Computing</option>
                <option value="Projectors" className="bg-slate-950">Projector / Optical</option>
                <option value="Lab Equipment" className="bg-slate-950">Lab Equipment</option>
                <option value="Printers" className="bg-slate-950">Printers / Scanners</option>
                <option value="Office Furniture" className="bg-slate-950">Office Furniture</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Serial Number</label>
              <input
                type="text"
                required
                placeholder="SN-XXXXXX"
                value={assetSerial}
                onChange={(e) => setAssetSerial(e.target.value)}
                className="mt-1 w-full bg-slate-950/50 border border-white/10 rounded-lg py-1.5 px-3 text-xs focus:ring-1 focus:ring-indigo-500 text-white font-mono placeholder-slate-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Purchase Date</label>
              <input
                type="date"
                required
                value={assetPurchaseDate}
                onChange={(e) => setAssetPurchaseDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 py-1.5 px-3 text-xs focus:ring-1 focus:ring-indigo-500 bg-slate-900 text-slate-100 font-semibold outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Shelf Department</label>
              <select
                value={assetDept}
                onChange={(e) => setAssetDept(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 py-1.5 px-2.5 text-xs focus:ring-1 focus:ring-indigo-500 text-slate-100 font-bold bg-slate-900 outline-none"
              >
                {departments.map((d) => (
                  <option key={d} value={d} className="bg-slate-950">
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Acquisition Condition</label>
            <select
              value={assetCondition}
              onChange={(e) => setAssetCondition(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 py-1.5 px-3 text-xs focus:ring-1 focus:ring-indigo-500 text-slate-100 font-bold bg-slate-900 outline-none"
            >
              <option value="New" className="bg-slate-950">Brand New Box</option>
              <option value="Good" className="bg-slate-950">Refurbished Good</option>
              <option value="Fair" className="bg-slate-950">Fair Wear & Tear</option>
              <option value="Damaged" className="bg-slate-950">Damaged (Not for Issuance)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-505/20"
          >
            <Plus className="h-4 w-4" />
            Commit to Inventory
          </button>
          {regMsg && (
            <p className="text-xs text-center text-emerald-350 font-bold bg-emerald-500/10 py-1.5 rounded-lg border border-emerald-500/20">
              {regMsg}
            </p>
          )}
        </form>
      </div>

      {/* Catalog Audit Ledger right */}
      <div className="lg:col-span-8 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-4">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Departmental Hardware Store Catalog</h3>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Tag, Model, SN..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 pl-8 pr-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-500 font-medium font-mono"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-white/10 px-2.5 py-1 bg-slate-900 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 font-bold outline-none"
            >
              <option value="All" className="bg-slate-900">All Categories</option>
              <option value="Computing" className="bg-slate-900">Computing</option>
              <option value="Projectors" className="bg-slate-900">Projector</option>
              <option value="Lab Equipment" className="bg-slate-900">Lab Equipment</option>
              <option value="Printers" className="bg-slate-900">Printers</option>
              <option value="Office Furniture" className="bg-slate-900">Office Furniture</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5 text-left text-xs">
            <thead>
              <tr className="bg-white/2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10">
                <th className="px-3 py-3">Asset Tag</th>
                <th className="px-3 py-3">Description</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Serial No</th>
                <th className="px-3 py-3">Wear Index</th>
                <th className="px-3 py-3">Availability</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredAssets.map((ast) => (
                <tr key={ast.id} className="hover:bg-white/2">
                  <td className="px-3 py-4 font-mono font-bold text-slate-400">{ast.assetTag}</td>
                  <td className="px-3 py-4">
                    <div className="font-bold text-white">{ast.assetName}</div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {ast.department} • Bought {ast.purchaseDate}
                    </div>
                  </td>
                  <td className="px-3 py-4 font-semibold text-slate-400">{ast.category}</td>
                  <td className="px-3 py-4 font-mono font-medium text-slate-400">{ast.serialNumber}</td>
                  <td className="px-3 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        ast.condition === "New"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                          : ast.condition === "Good"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                          : ast.condition === "Fair"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-505/20"
                          : "bg-red-500/20 text-red-300 border border-red-500/20"
                      }`}
                    >
                      {ast.condition}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                        ast.status === "Available"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/25"
                          : ast.status === "Issued"
                          ? "bg-indigo-500/20 text-indigo-300 border-indigo-530/25"
                          : "bg-red-500/20 text-red-300 border-red-500/25"
                      }`}
                    >
                      ● {ast.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right space-x-1 whitespace-nowrap text-[11px]">
                    {ast.status === "Available" && (
                      <button
                        onClick={() => onSelectAssetForIssuance(ast.id)}
                        className="bg-indigo-505/20 hover:bg-indigo-550/35 border border-indigo-505/25 text-indigo-300 font-bold px-2 py-1 rounded text-[10px] transition-all outline-none cursor-pointer"
                      >
                        Assign Out
                      </button>
                    )}
                    <button
                      onClick={() => onUpdateAssetStatus(ast.id, "Damaged", "Damaged")}
                      className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold px-2 py-1 rounded text-[10px] transition-all outline-none cursor-pointer"
                      title="Flag Damaged"
                    >
                      Flag Faulty
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                    No hardware registered matches search parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
