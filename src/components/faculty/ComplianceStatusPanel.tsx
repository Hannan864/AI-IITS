import React, { useState } from "react";
import { 
  CheckCircle2, AlertTriangle, AlertCircle, Calendar, ShieldCheck, 
  Scale, Laptop, Tag, QrCode, Search, ChevronRight, Info
} from "lucide-react";
import { User, AssetIssuance, Asset, NDCRequest } from "../../types";
import AssetQRDetailModal from "../inventory/AssetQRDetailModal";
import StatusBadge from "../StatusBadge";

interface ComplianceStatusPanelProps {
  currentUser: User;
  myActiveIssuances: AssetIssuance[];
  todayStr: string;
  allMyIssuances?: AssetIssuance[];
  myNdcRequests?: NDCRequest[];
  assets?: Asset[];
}

export default function ComplianceStatusPanel({
  currentUser,
  myActiveIssuances,
  todayStr,
  allMyIssuances = [],
  myNdcRequests = [],
  assets = [],
}: ComplianceStatusPanelProps) {
  const [selectedQRAsset, setSelectedQRAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const outstandingCount = myActiveIssuances.length;

  const getDaysRemaining = (returnDate: string) => {
    const deadline = new Date(returnDate);
    const today = new Date(todayStr);
    const diff = deadline.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  // Calculate overdue count
  const overdueItems = myActiveIssuances.filter((iss) => getDaysRemaining(iss.returnDate) < 0);
  const overdueCount = overdueItems.length;
  const isCompliant = overdueCount === 0;

  // Filtered list
  const activeItemsList = myActiveIssuances
    .map((iss) => {
      const asset = assets.find((a) => a.id === iss.assetId);
      return asset ? { iss, asset } : null;
    })
    .filter((item): item is { iss: AssetIssuance; asset: Asset } => item !== null)
    .filter(({ asset }) => {
      const q = searchQuery.toLowerCase();
      return (
        !q ||
        asset.assetName.toLowerCase().includes(q) ||
        asset.assetTag.toLowerCase().includes(q) ||
        asset.serialNumber.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* 1. Account Standing Summary Header */}
      <div className={`p-5 sm:p-6 rounded-2xl border bg-[#0a0f1d]/90 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isCompliant ? "border-emerald-500/25" : "border-rose-500/30"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 border ${
            isCompliant
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse"
          }`}>
            {isCompliant ? <ShieldCheck className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Account Status & Compliance Standing
              </h3>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                isCompliant
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/30"
              }`}>
                {isCompliant ? "Fully Compliant" : `${overdueCount} Overdue Item(s)`}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isCompliant
                ? "Your account is clear of overdue equipment liabilities. All borrowing records are up to date."
                : "You have overdue hardware items. Please arrange prompt return with the Store Manager to avoid clearance restrictions."}
            </p>
          </div>
        </div>

        {/* Quick Numbers */}
        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-6 w-full md:w-auto justify-between md:justify-start">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Borrowed</span>
            <span className="text-lg font-extrabold text-white font-mono">{outstandingCount}</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Overdue</span>
            <span className={`text-lg font-extrabold font-mono ${overdueCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {overdueCount}
            </span>
          </div>
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Clearance</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded border block mt-1 ${
              outstandingCount === 0 
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                : "text-rose-400 bg-rose-500/10 border-rose-500/20"
            }`}>
              {outstandingCount === 0 ? "Eligible (0 Dues)" : `Locked (${outstandingCount} Held)`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Structured Item Status Table / List */}
      <div className="bg-[#0a0f1d]/90 border border-indigo-500/20 rounded-2xl p-5 shadow-2xl space-y-4">
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h4 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
              <Laptop className="h-4 w-4 text-indigo-400" />
              Active Hardware Item Status Register
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Clear list of all hardware assigned to your profile with return deadlines and QR inspection triggers.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search equipment or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-white/10 text-white pl-8 pr-3 py-1.5 rounded-lg text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Structured List Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-white/10 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 select-none">
                <th className="p-3 pl-4">Equipment & Serial No</th>
                <th className="p-3">Sequential Tag</th>
                <th className="p-3">Category</th>
                <th className="p-3">Lending Status</th>
                <th className="p-3">Borrowed Date</th>
                <th className="p-3">Return Deadline</th>
                <th className="p-3 pr-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {activeItemsList.length > 0 ? (
                activeItemsList.map(({ iss, asset }) => {
                  const daysLeft = getDaysRemaining(iss.returnDate);
                  const isOverdue = daysLeft < 0;

                  return (
                    <tr
                      key={iss.id}
                      className="hover:bg-indigo-500/5 transition-colors group cursor-pointer"
                      onClick={() => setSelectedQRAsset(asset)}
                    >
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

                      <td className="p-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedQRAsset(asset);
                          }}
                          className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold text-[10.5px] cursor-pointer hover:scale-105 transition-all inline-flex items-center gap-1"
                          title="Click to view full specs & QR Code"
                        >
                          <Tag className="h-3 w-3 text-indigo-400 shrink-0" />
                          {asset.assetTag}
                        </button>
                      </td>

                      <td className="p-3">
                        <span className="font-semibold text-slate-300 bg-white/5 border border-white/5 px-2 py-0.5 rounded text-[10.5px]">
                          {asset.category}
                        </span>
                      </td>

                      <td className="p-3">
                        <StatusBadge
                          status={isOverdue ? "Overdue" : "Issued"}
                          onClick={() => setSelectedQRAsset(asset)}
                          title="Click to inspect status details"
                        />
                      </td>

                      <td className="p-3 font-mono text-slate-300 font-semibold">
                        {iss.issuedDate}
                      </td>

                      <td className="p-3">
                        <div>
                          <p className={`font-mono font-bold ${isOverdue ? "text-rose-400" : "text-slate-200"}`}>
                            {iss.returnDate}
                          </p>
                          <p className={`text-[10px] font-semibold ${
                            isOverdue ? "text-rose-400 animate-pulse" : daysLeft <= 15 ? "text-amber-400" : "text-emerald-400"
                          }`}>
                            {isOverdue
                              ? `${Math.abs(daysLeft)} days overdue`
                              : `${daysLeft} days remaining`}
                          </p>
                        </div>
                      </td>

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
                    {outstandingCount === 0 ? (
                      <div className="space-y-2 py-4">
                        <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                        <p className="font-bold text-white not-italic text-sm">No Active Hardware Liabilities</p>
                        <p className="text-xs text-slate-400">
                          Your account has zero active hardware loans logged. All items have been returned cleanly!
                        </p>
                      </div>
                    ) : (
                      "No items match your search term."
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Helpful Institutional Policy Notes */}
      <div className="bg-[#0a0f1d]/90 border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
        <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <Info className="h-4 w-4 text-indigo-400" /> Key Account & Clearance Guidelines
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 bg-slate-900/80 border border-white/5 rounded-xl space-y-1.5 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                <Laptop className="h-3.5 w-3.5" />
              </div>
              <h5 className="font-bold text-slate-200 text-xs">Hardware Inspection</h5>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              All hardware must be physically presented to the Store Manager for official returns or lending extensions.
            </p>
          </div>

          <div className="p-3.5 bg-slate-900/80 border border-white/5 rounded-xl space-y-1.5 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg">
                <AlertCircle className="h-3.5 w-3.5" />
              </div>
              <h5 className="font-bold text-slate-200 text-xs">Clearance Lockouts</h5>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Holding overdue items will temporarily pause your Exit Clearance (NDC) application until equipment is returned.
            </p>
          </div>

          <div className="p-3.5 bg-slate-900/80 border border-white/5 rounded-xl space-y-1.5 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <h5 className="font-bold text-slate-200 text-xs">Help & Support</h5>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Contact your department logistics officer or visit the Central IT Hardware Warehouse for inquiries.
            </p>
          </div>
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
