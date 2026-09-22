import React, { useState } from "react";
import { 
  Laptop, Calendar, Clock, Tag, QrCode, CheckCircle2, 
  AlertTriangle, ShieldCheck, ChevronRight, Search, Filter, Cpu
} from "lucide-react";
import { Asset, AssetIssuance } from "../../types";
import AssetQRDetailModal from "../inventory/AssetQRDetailModal";
import StatusBadge from "../StatusBadge";

interface MyAssetsPanelProps {
  assets: Asset[];
  myActiveIssuances: AssetIssuance[];
  todayStr: string;
}

export default function MyAssetsPanel({
  assets,
  myActiveIssuances,
  todayStr,
}: MyAssetsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedQRAsset, setSelectedQRAsset] = useState<Asset | null>(null);

  // Match assets to user issuances
  const myItems = myActiveIssuances
    .map((iss) => {
      const asset = assets.find((a) => a.id === iss.assetId);
      return asset ? { iss, asset } : null;
    })
    .filter((item): item is { iss: AssetIssuance; asset: Asset } => item !== null);

  // Date utility
  const getDaysRemaining = (returnDate: string) => {
    const deadline = new Date(returnDate);
    const today = new Date(todayStr);
    const diff = deadline.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  // Metrics
  const totalCount = myItems.length;
  const overdueCount = myItems.filter(({ iss }) => {
    const daysLeft = getDaysRemaining(iss.returnDate);
    return daysLeft < 0;
  }).length;
  const compliantCount = totalCount - overdueCount;

  // Filtered items
  const filteredItems = myItems.filter(({ asset, iss }) => {
    const daysLeft = getDaysRemaining(iss.returnDate);
    const isOverdue = daysLeft < 0;

    const matchesStatus =
      filterStatus === "ALL" ||
      (filterStatus === "OVERDUE" && isOverdue) ||
      (filterStatus === "ACTIVE" && !isOverdue);

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      asset.assetName.toLowerCase().includes(q) ||
      asset.assetTag.toLowerCase().includes(q) ||
      asset.serialNumber.toLowerCase().includes(q) ||
      asset.category.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. Header & Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#0a0f1d]/90 border border-white/10 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Borrowed Items</p>
            <p className="text-xl font-extrabold text-white mt-0.5">{totalCount}</p>
          </div>
          <div className="h-10 w-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-bold">
            <Laptop className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-[#0a0f1d]/90 border border-white/10 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Compliant Loans</p>
            <p className="text-xl font-extrabold text-emerald-400 mt-0.5">{compliantCount}</p>
          </div>
          <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-bold">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-[#0a0f1d]/90 border border-white/10 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overdue Returns</p>
            <p className={`text-xl font-extrabold mt-0.5 ${overdueCount > 0 ? "text-rose-400" : "text-slate-300"}`}>
              {overdueCount}
            </p>
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold border ${
            overdueCount > 0 ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-slate-500/10 border-white/5 text-slate-400"
          }`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 2. Main List Panel */}
      <div className="bg-[#0a0f1d]/90 border border-indigo-500/20 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
              <Laptop className="h-4 w-4 text-indigo-400" /> My Borrowed Hardware List
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any item tag or status to view full specifications, custody details, or download QR labels.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search items, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 text-white pl-8 pr-3 py-1.5 rounded-lg text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900/80 border border-white/10 text-slate-200 py-1.5 px-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Loans</option>
              <option value="OVERDUE">Overdue Only</option>
            </select>
          </div>
        </div>

        {/* Structured List / Table View */}
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-white/10 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 select-none">
                <th className="p-3 pl-4">Equipment & Serial</th>
                <th className="p-3">Sequential Tag</th>
                <th className="p-3">Category</th>
                <th className="p-3">Lending Status</th>
                <th className="p-3">Condition</th>
                <th className="p-3">Return Deadline</th>
                <th className="p-3 pr-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredItems.length > 0 ? (
                filteredItems.map(({ iss, asset }) => {
                  const daysLeft = getDaysRemaining(iss.returnDate);
                  const isOverdue = daysLeft < 0;

                  return (
                    <tr
                      key={iss.id}
                      id={`asset-card-${iss.id}`}
                      className="hover:bg-indigo-500/5 transition-colors group cursor-pointer"
                      onClick={() => setSelectedQRAsset(asset)}
                    >
                      {/* Name & Serial */}
                      <td className="p-3 pl-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                            <Laptop className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                              {asset.assetName}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400">
                              SN: {asset.serialNumber}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Tag */}
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedQRAsset(asset);
                          }}
                          className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold text-[10.5px] cursor-pointer hover:scale-105 transition-all inline-flex items-center gap-1"
                          title="Click to view QR label"
                        >
                          <Tag className="h-3 w-3 text-indigo-400 shrink-0" />
                          {asset.assetTag}
                        </button>
                      </td>

                      {/* Category */}
                      <td className="p-3">
                        <span className="font-semibold text-slate-300 bg-white/5 border border-white/5 px-2 py-0.5 rounded text-[10.5px]">
                          {asset.category}
                        </span>
                      </td>

                      {/* Lending Status */}
                      <td className="p-3">
                        <StatusBadge
                          status={isOverdue ? "Overdue" : "Issued"}
                          onClick={() => setSelectedQRAsset(asset)}
                          title="Click to inspect status details"
                        />
                      </td>

                      {/* Condition */}
                      <td className="p-3">
                        <span className={`font-bold ${
                          asset.condition === "New" || asset.condition === "Good" 
                            ? "text-emerald-400" 
                            : "text-amber-400"
                        }`}>
                          {asset.condition}
                        </span>
                      </td>

                      {/* Return Deadline */}
                      <td className="p-3">
                        <div>
                          <p className={`font-mono font-bold ${isOverdue ? "text-rose-400" : "text-slate-200"}`}>
                            {iss.returnDate}
                          </p>
                          <p className={`text-[10px] font-semibold ${
                            isOverdue ? "text-rose-400 animate-pulse" : daysLeft <= 15 ? "text-amber-400" : "text-slate-400"
                          }`}>
                            {isOverdue 
                              ? `${Math.abs(daysLeft)} days overdue` 
                              : `${daysLeft} days remaining`}
                          </p>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="p-3 pr-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedQRAsset(asset);
                          }}
                          className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/30 rounded-lg font-bold text-[10.5px] transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <QrCode className="h-3 w-3 text-indigo-400" />
                          Specs & QR
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400 italic">
                    {totalCount === 0 ? (
                      <div className="space-y-2 py-4">
                        <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                        <p className="font-bold text-white not-italic text-sm">No Borrowed Items Active</p>
                        <p className="text-xs text-slate-400">
                          You currently have no hardware items assigned to your account.
                        </p>
                      </div>
                    ) : (
                      "No borrowed items match the current search or filter criteria."
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal for inspect/QR download */}
      <AssetQRDetailModal
        asset={selectedQRAsset}
        onClose={() => setSelectedQRAsset(null)}
        issuances={myActiveIssuances}
      />
    </div>
  );
}
