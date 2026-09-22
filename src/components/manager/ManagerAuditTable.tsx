import React, { useState } from "react";
import { Search, Tag, AlertTriangle, Wrench, Layers } from "lucide-react";
import GlassCard from "../GlassCard";
import StatusBadge from "../StatusBadge";
import AssetQRDetailModal from "../inventory/AssetQRDetailModal";
import { Asset, AssetIssuance } from "../../types";

interface ManagerAuditTableProps {
  assets: Asset[];
  issuances: AssetIssuance[];
}

export default function ManagerAuditTable({ assets, issuances }: ManagerAuditTableProps) {
  const [filterDept, setFilterDept] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterCond, setFilterCond] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQRAsset, setSelectedQRAsset] = useState<Asset | null>(null);

  const departmentsList = [
    "Computer Science",
    "Electronic Engineering",
    "Mechanical Engineering",
    "Mathematics & Statistics",
    "Administration"
  ];

  const filteredAssets = assets.filter((a) => {
    const matchesDept = filterDept === "ALL" || a.department === filterDept;
    const matchesStatus = filterStatus === "ALL" || a.status === filterStatus;
    const matchesCond = filterCond === "ALL" || a.condition === filterCond;
    const matchesSearch =
      searchQuery === "" ||
      a.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDept && matchesStatus && matchesCond && matchesSearch;
  });

  const currentDate = new Date();
  const getAssetOverdueDetails = (assetId: string) => {
    const activeIssuance = issuances.find(
      (iss) => iss.assetId === assetId && iss.actualReturnDate === null
    );
    if (!activeIssuance) return null;

    const returnDeadline = new Date(activeIssuance.returnDate);
    const isOverdue = returnDeadline < currentDate;
    const daysDiff = Math.ceil(
      (currentDate.getTime() - returnDeadline.getTime()) / (1000 * 3600 * 24)
    );

    return {
      holder: activeIssuance.userName || "Faculty Member",
      holderDept: activeIssuance.department || "General",
      deadline: activeIssuance.returnDate,
      issueDate: activeIssuance.issuedDate,
      isOverdue,
      overdueByDays: daysDiff > 0 ? daysDiff : 0,
    };
  };

  return (
    <div className="space-y-4 text-[11px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-2">
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-indigo-400" /> Physical Warehouse Ledger Registers
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Live comprehensive audit indexes. Use search query, status selectors, or condition indicators.
          </p>
        </div>
        <p className="text-[11px] font-mono text-indigo-400 font-bold bg-indigo-500/10 p-1.5 rounded border border-indigo-550/20">
          Filtered Index: {filteredAssets.length} of {assets.length} devices
        </p>
      </div>

      {/* Dense filter ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/40 p-3 rounded-xl border border-white/5">
        <div className="space-y-1">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Office Department</span>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="w-full bg-[#030712] border border-white/10 rounded-lg p-2 text-xs text-slate-205 font-medium outline-none"
          >
            <option value="ALL">All Departments</option>
            {departmentsList.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Lending Status</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-[#030712] border border-white/10 rounded-lg p-2 text-xs text-slate-205 font-medium outline-none"
          >
            <option value="ALL">All Lending Status</option>
            <option value="Available">Available (Warehouse Storage)</option>
            <option value="Issued">Issued (Active Lending Holds)</option>
            <option value="Damaged">Damaged (Maintenance locks)</option>
            <option value="Retired">Retired (Archived permanently)</option>
          </select>
        </div>

        <div className="space-y-1">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Inspection Condition</span>
          <select
            value={filterCond}
            onChange={(e) => setFilterCond(e.target.value)}
            className="w-full bg-[#030712] border border-white/10 rounded-lg p-2 text-xs text-slate-205 font-medium outline-none"
          >
            <option value="ALL">All Conditions</option>
            <option value="New">New (Factory Sealed)</option>
            <option value="Good">Good (Ready for Deployment)</option>
            <option value="Fair">Fair (Operational Wear)</option>
            <option value="Damaged">Damaged (Faulty Repairing)</option>
            <option value="Repairing">Repairing (Main Block Labs)</option>
          </select>
        </div>

        <div className="space-y-1">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Full Text Search</span>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search tag, name or serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#030712] border border-white/10 rounded-lg text-xs text-slate-205 outline-none focus:border-indigo-501"
            />
          </div>
        </div>
      </div>

      {/* High Desktop Density Audit Table */}
      <GlassCard className="p-0 overflow-x-auto border border-white/5 rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/60 text-slate-400 uppercase text-[9.5px] font-bold tracking-wider border-b border-white/10 select-none">
              <th className="p-3.5 pl-4">Asset Identification</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Department Target</th>
              <th className="p-3.5">Lending Status</th>
              <th className="p-3.5">Evaluation</th>
              <th className="p-3.5">Current Liability Custony</th>
              <th className="p-3.5 pr-4 text-right">Core Risks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-sans text-[11px]">
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => {
                const ovr = getAssetOverdueDetails(asset.id);
                return (
                  <tr key={asset.id} className="hover:bg-white/[0.02] transition-colors duration-100 group">
                    <td className="p-3.5 pl-4 flex items-start gap-2.5">
                      <div className="p-1.5 bg-white/[0.03] border border-white/5 rounded shrink-0">
                        <Tag className="h-4 w-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-100 text-xs tracking-tight">{asset.assetName}</p>
                        <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px]">
                          <button
                            type="button"
                            onClick={() => setSelectedQRAsset(asset)}
                            className="bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 px-1.5 py-0.5 rounded font-bold border border-indigo-500/20 cursor-pointer hover:scale-105 transition-all flex items-center gap-1"
                            title="Click to view full asset & QR details"
                          >
                            <Tag className="h-3 w-3 text-indigo-400 shrink-0" />
                            {asset.assetTag}
                          </button>
                          <span className="text-slate-500">S/N: {asset.serialNumber}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-bold text-slate-400">{asset.category}</td>
                    <td className="p-3.5 text-slate-400 font-semibold">{asset.department}</td>
                    <td className="p-3.5">
                      <StatusBadge
                        status={asset.status}
                        onClick={() => setSelectedQRAsset(asset)}
                        title="Click to view bound QR Code and all related details"
                      />
                    </td>
                    <td className="p-3.5">
                      <span className={`font-bold ${asset.condition === "New" || asset.condition === "Good" ? "text-emerald-400" : "text-amber-400"}`}>
                        {asset.condition}
                      </span>
                    </td>

                    <td className="p-3.5">
                      {ovr ? (
                        <div>
                          <p className="font-bold text-slate-350">{ovr.holder}</p>
                          <p className="text-[10px] text-slate-500 font-medium">Issued: {ovr.issueDate}</p>
                          <p className={`text-[9.5px] font-mono mt-0.5 rounded px-1.5 py-0.5 inline-block font-bold ${
                            ovr.isOverdue ? "bg-rose-505/10 text-rose-450" : "bg-white/5 text-slate-300"
                          }`}>
                            Deadline: {ovr.deadline}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">None (In Storage)</span>
                      )}
                    </td>

                    <td className="p-3.5 pr-4 text-right">
                      {ovr && ovr.isOverdue ? (
                        <span className="inline-flex items-center gap-1 bg-rose-955/40 border border-rose-500/20 text-rose-400 font-bold px-2 py-1 rounded text-[10px]">
                          <AlertTriangle className="h-3 w-3 animate-pulse" /> Overdue {ovr.overdueByDays}d
                        </span>
                      ) : asset.status === "Damaged" ? (
                        <span className="inline-flex items-center gap-1 bg-amber-955/40 border border-amber-500/20 text-amber-400 font-bold px-2 py-1 rounded text-[10px]">
                          <Wrench className="h-3 w-3" /> Repairing lock
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-[10px]">Nominal</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-10 text-center text-slate-500 italic">
                  No registered hardware assets meet specified filter parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassCard>

      <AssetQRDetailModal
        asset={selectedQRAsset}
        onClose={() => setSelectedQRAsset(null)}
        issuances={issuances}
      />
    </div>
  );
}
