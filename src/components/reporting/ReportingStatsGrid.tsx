import React from "react";

interface ReportingStatsGridProps {
  totalAssets: number;
  available: number;
  issued: number;
  damaged: number;
}

export default function ReportingStatsGrid({
  totalAssets,
  available,
  issued,
  damaged,
}: ReportingStatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in text-gray-900 selection:bg-indigo-500/10">
      <div className="rounded-xl border border-gray-100 bg-slate-50/50 p-4 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Registered</span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-3xl font-bold tracking-tight text-gray-900">{totalAssets}</span>
          <span className="text-xs font-semibold text-slate-500">Assets</span>
        </div>
      </div>
      <div className="rounded-xl border border-gray-100 bg-emerald-50/30 p-4 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Available Shelf</span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-3xl font-bold tracking-tight text-emerald-600">{available}</span>
          <span className="text-xs font-semibold text-emerald-600">
            {totalAssets > 0 ? Math.round((available / totalAssets) * 100) : 0}%
          </span>
        </div>
      </div>
      <div className="rounded-xl border border-gray-100 bg-blue-50/30 p-4 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Active Issuance</span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-3xl font-bold tracking-tight text-blue-600">{issued}</span>
          <span className="text-xs font-semibold text-blue-600">
            {totalAssets > 0 ? Math.round((issued / totalAssets) * 100) : 0}%
          </span>
        </div>
      </div>
      <div className="rounded-xl border border-gray-100 bg-red-50/30 p-4 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-red-700">Damaged / Retain</span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-3xl font-bold tracking-tight text-red-600">{damaged}</span>
          <span className="text-xs font-semibold text-red-605">
            {totalAssets > 0 ? Math.round((damaged / totalAssets) * 100) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
}
