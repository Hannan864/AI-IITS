import React, { useState } from "react";
import { QrCode, FilePlus, RefreshCcw, Package, AlertTriangle, ArrowRightLeft, CheckSquare, User, FileCheck, X } from "lucide-react";
import GlassCard from "../components/GlassCard";
import ActionButton from "../components/ActionButton";
import StatusBadge from "../components/StatusBadge";
import { Asset, AssetIssuance } from "../types";
import ManagerKPICards from "../components/manager/ManagerKPICards";
import ManagerKPICharts from "../components/manager/ManagerKPICharts";
import { apiFetch } from "../lib/api";

interface ManagerDashboardProps {
  assets: Asset[];
  issuances: AssetIssuance[];
  onOpenScanner: () => void;
  onNavigateToRegister: () => void;
  onNavigateToIssue: () => void;
  onRefresh: () => void;
}

export default function ManagerDashboard({
  assets,
  issuances,
  onOpenScanner,
  onNavigateToRegister,
  onNavigateToIssue,
  onRefresh,
}: ManagerDashboardProps) {
  const [selectedSimTag, setSelectedSimTag] = useState("");
  const [simScanResult, setSimScanResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleSimulateScan = async (tag: string) => {
    if (!tag) return;
    setScanLoading(true);
    setScanError("");
    setSimScanResult(null);
    try {
      const asset = assets.find(a => a.assetTag === tag);
      if (!asset) {
          throw new Error("Scanned barcode tag not found on database register.");
      }
      const res = await apiFetch(`/api/qr/scan/${asset.id}`);
      if (!res.ok) {
        throw new Error("Scanned barcode tag not found on database register.");
      }
      const data = await res.json();
      setSimScanResult(data);
    } catch (err: any) {
      setScanError(err.message || "Simulated read mismatch");
    } finally {
      setScanLoading(false);
    }
  };

  const handleQuickReturn = async (assetId: string) => {
    setIsActionLoading(true);
    try {
      const res = await apiFetch("/api/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          actualReturnDate: new Date().toISOString().split("T")[0],
          condition: "Good"
        }),
      });
      if (res.ok) {
        alert("Simulated QR Return sequence finalized! Inventory ledger refreshed.");
        onRefresh();
        handleSimulateScan(selectedSimTag);
      } else {
        alert("Simulated return processing rejected.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual greeting and quick triggers menu */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-slate-100 tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-400" /> Store Manager Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Manage university inventory, issue items to staff, and track equipment returns.
          </p>
        </div>

        <div className="flex items-center gap-2 select-none">
          <ActionButton onClick={onOpenScanner} variant="primary">
            <QrCode className="h-4 w-4" /> Scan QR Code
          </ActionButton>
          <ActionButton onClick={onRefresh} variant="secondary">
            <RefreshCcw className="h-4 w-4" /> Refresh Data
          </ActionButton>
        </div>
      </div>

      <ManagerKPICards assets={assets} />

      <ManagerKPICharts assets={assets} />

      {/* 2. QR SCAN INTEGRATION PANEL */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
          <QrCode className="h-4 w-4 text-indigo-400" /> Barcode & Simulated QR Scan Integration Desk
        </h4>
        <GlassCard className="p-4 sm:p-5 border-l-2 border-indigo-505 bg-[#000511]/50 space-y-4 relative overflow-hidden">
          {/* Subtle glow accent under card */}
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none select-none" />

          <div className="flex flex-col xl:flex-row gap-4 xl:items-end">
            <div className="flex-1 space-y-1.5 min-w-0">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                Target System Registered Barcode / Tag ID
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <select
                  value={selectedSimTag}
                  onChange={(e) => setSelectedSimTag(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-lg p-3 text-xs text-slate-200 flex-1 min-w-0 outline-none hover:border-white/20 focus:border-indigo-500 hover:shadow-lg focus:shadow-indigo-500/5 transition-all"
                >
                  <option value="">-- Choose registered asset to simulate hardware scans --</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.assetTag}>
                      [{a.assetTag}] {a.assetName} - ({a.status})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleSimulateScan(selectedSimTag)}
                  disabled={!selectedSimTag || scanLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs px-6 py-3 cursor-pointer rounded-lg transition-all uppercase tracking-wider whitespace-nowrap active:scale-[0.98] select-none h-auto shrink-0 flex items-center justify-center gap-2"
                >
                  {scanLoading ? (
                    <>
                      <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                      Reading Block...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-3.5 w-3.5" />
                      Simulate Scan
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-2 shrink-0 w-full xl:w-auto xl:justify-end select-none">
              <button
                onClick={onNavigateToRegister}
                className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-950 border border-white/10 text-[11px] text-slate-300 font-bold hover:bg-white/5 active:bg-white/10 hover:text-white hover:border-white/20 transition-all cursor-pointer"
              >
                <FilePlus className="h-3.5 w-3.5 text-indigo-400" /> New Register
              </button>
              <button
                onClick={onNavigateToIssue}
                className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-950 border border-white/10 text-[11px] text-slate-300 font-bold hover:bg-white/5 active:bg-white/10 hover:text-white hover:border-white/20 transition-all cursor-pointer"
              >
                <CheckSquare className="h-3.5 w-3.5 text-emerald-400" /> Allocate Wizard
              </button>
            </div>
          </div>

          {scanError && (
            <div className="p-3 rounded-lg bg-rose-955/20 border border-rose-500/20 text-rose-450 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {scanError}
            </div>
          )}

          {simScanResult && simScanResult.asset && (
            <div className="p-4 bg-slate-950/90 rounded-2xl border border-white/10 flex flex-col sm:flex-row gap-5 text-xs relative overflow-hidden animate-fade-in h-[220px] max-w-3xl w-full mx-auto">
              {/* Close simulated scan result */}
              <button
                type="button"
                onClick={() => setSimScanResult(null)}
                className="absolute top-3 right-3 p-1.5 bg-white/5 hover:bg-white/10 active:bg-white/20 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer z-20"
                aria-label="Dismiss scan details"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Left Side: QR Code Area */}
              <div className="flex flex-col items-center justify-center bg-white p-3.5 rounded-xl shrink-0 w-[140px] h-[140px] my-auto border border-white/10 shadow-lg select-none">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(simScanResult.asset.assetTag)}`}
                  alt="Scanned Asset QR Tag"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Right Side: Scrollable Details Area */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 font-sans text-left self-stretch flex flex-col justify-between py-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="space-y-3 pb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono bg-indigo-500/15 text-indigo-305 font-bold px-2 py-0.5 rounded border border-indigo-500/20">
                      {simScanResult.asset.assetTag}
                    </span>
                    <StatusBadge status={simScanResult.asset.status} />
                    <span className="font-mono text-[9.5px] px-1.5 py-0.5 border rounded border-slate-700 bg-slate-900 text-slate-300">
                      Condition: {simScanResult.asset.condition}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-extrabold text-sm text-slate-100 uppercase tracking-tight leading-snug">
                      {simScanResult.asset.assetName}
                    </h5>
                    <p className="font-mono text-[10px] text-slate-400 mt-0.5 select-all">
                      S/N: {simScanResult.asset.serialNumber}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-3">
                    <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider mb-1">Custodian HOLD Status</p>
                    {simScanResult.owner ? (
                      <div className="space-y-1 font-sans text-xs">
                        <p className="font-bold text-slate-200 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-indigo-400" /> {simScanResult.owner.name}
                        </p>
                        <p className="text-slate-400 text-[11px] font-medium">{simScanResult.owner.email}</p>
                        {simScanResult.issuance && (
                          <p className="text-[9.5px] text-indigo-305 bg-indigo-550/10 border border-indigo-500/20 px-1.5 py-0.5 rounded w-fit mt-1">
                            Deadline: {simScanResult.issuance.returnDate}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-[11px] italic font-medium">
                        Vacant. Device parked securely inside Warehouse storage block.
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 mt-auto">
                  {simScanResult.asset.status === "Issued" ? (
                    <button
                      onClick={() => handleQuickReturn(simScanResult.asset.id)}
                      disabled={isActionLoading}
                      className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all shadow cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      {isActionLoading ? "Returning..." : "Quick Return check-in"}
                    </button>
                  ) : simScanResult.asset.status === "Available" ? (
                    <button
                      onClick={onNavigateToIssue}
                      className="w-full h-9 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FileCheck className="h-3.5 w-3.5" />
                      Proceed to Issue
                    </button>
                  ) : (
                    <div className="text-center p-2 rounded bg-rose-955/20 border border-rose-500/15 text-rose-300 text-[9.5px] font-semibold uppercase tracking-wider">
                      Service Lock active.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </div>

    </div>
  );
}
