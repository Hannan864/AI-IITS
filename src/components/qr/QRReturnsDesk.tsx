import React, { useState } from "react";
import { CheckCircle, Clock, BadgeAlert, Check } from "lucide-react";
import { QRRegistryEntry } from "./types";
import { apiFetch } from "../../lib/api";

interface QRReturnsDeskProps {
  assets: any[];
  registry: QRRegistryEntry[];
  activeIssuancesList: any[];
  fetchRegistry: () => Promise<void>;
  fetchActiveIssuances: () => Promise<void>;
  refreshAll: () => void;
}

export default function QRReturnsDesk({
  assets,
  registry,
  activeIssuancesList,
  fetchRegistry,
  fetchActiveIssuances,
  refreshAll,
}: QRReturnsDeskProps) {
  const [scannedReturnQR, setScannedReturnQR] = useState("");
  const [activeIssuance, setActiveIssuance] = useState<any | null>(null);
  const [verificationError, setVerificationError] = useState("");
  const [returnSuccessMessage, setReturnSuccessMessage] = useState("");
  const [simulatedScannerActive, setSimulatedScannerActive] = useState(false);

  const handleVerifyReturn = (tagStr: string) => {
    setVerificationError("");
    setReturnSuccessMessage("");
    
    const entry = registry.find((r) => r.id.toLowerCase() === tagStr.trim().toLowerCase());
    const boundAssetId = entry?.linkedAssetId;

    if (!boundAssetId) {
      const assetMatch = assets.find((a) => a.assetTag.toLowerCase() === tagStr.trim().toLowerCase());
      if (!assetMatch) {
         setVerificationError("NO_RECORD: This QR label does not belong to any institutional asset in our system registry.");
         setActiveIssuance(null);
         return;
      }
    }

    const assetId = boundAssetId || assets.find((a) => a.assetTag.toLowerCase() === tagStr.trim().toLowerCase())?.id;
    const activeIss = activeIssuancesList.find((i) => i.assetId === assetId);
    
    if (!activeIss) {
      setVerificationError("VALIDATED_AVAILABLE: Asset is currently in 'Available' state. No return check-in required.");
      setActiveIssuance(null);
    } else {
      setActiveIssuance(activeIss);
    }
  };

  const triggerSimulateScan = (tag: string) => {
    setSimulatedScannerActive(true);
    setTimeout(() => {
      setSimulatedScannerActive(false);
      setScannedReturnQR(tag);
      handleVerifyReturn(tag);
    }, 1000);
  };

  const handleConfirmReturnInScanner = async () => {
    if (!activeIssuance) return;
    try {
      const res = await apiFetch("/api/issuances/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: activeIssuance.assetId,
          actualReturnDate: new Date().toISOString(),
          condition: "New",
        }),
      });

      if (res.ok) {
        setReturnSuccessMessage(`Successfully returned asset ${activeIssuance.assetTag} assigned to ${activeIssuance.userName}. Ledger is fully updated.`);
        setActiveIssuance(null);
        setScannedReturnQR("");
        await fetchRegistry();
        await fetchActiveIssuances();
        refreshAll();
      } else {
        const err = await res.json();
        alert(`Check-in returned error: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const todayParsed = new Date().getTime();
  const overdueIssuances = activeIssuancesList.filter((iss) => {
    const dueTime = new Date(iss.returnDate).getTime();
    return dueTime < todayParsed;
  });

  const getDaysOverdueCount = (dueDateStr: string) => {
    const dueTime = new Date(dueDateStr).getTime();
    const diff = todayParsed - dueTime;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* Verification returns section */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-[#0b1227] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <CheckCircle className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-sans">Returns Security Verification Desk</h3>
              <p className="text-[10px] text-slate-400">Optical label evaluation ensures returned inventory matches checkouts</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Scan or select QR of incoming hardware
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Scan sticker ID (e.g. IIUI-CS-2026-000001)"
                  value={scannedReturnQR}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setScannedReturnQR(val);
                    if (val.trim()) {
                      handleVerifyReturn(val);
                    }
                  }}
                  className="flex-1 h-9 bg-black/40 border border-white/10 rounded-lg text-xs font-mono font-bold text-slate-200 px-3 outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleVerifyReturn(scannedReturnQR)}
                  className="h-9 px-4 bg-[#1a233d] hover:bg-indigo-600 font-extrabold uppercase text-[10px] text-indigo-350 hover:text-white rounded-lg transition-colors border border-white/5 cursor-pointer"
                >
                  Lookup QR
                </button>
              </div>

              {activeIssuancesList.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[9px] text-slate-500">Quick Simulators:</span>
                  {activeIssuancesList.slice(0, 3).map((iss) => (
                    <button
                      key={iss.id}
                      type="button"
                      onClick={() => triggerSimulateScan(iss.assetTag || iss.id)}
                      className="h-6 px-2 bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-400 text-[9px] font-bold font-mono rounded transition-all cursor-pointer"
                    >
                      Simulate: {iss.assetTag || "TEMP"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {simulatedScannerActive && (
              <div className="h-10 flex items-center justify-center gap-2 bg-indigo-500/5 rounded-lg border border-indigo-500/10 text-[10px] font-mono text-indigo-400 animate-pulse">
                <span>ANALYZING PRE-PRINTED EMULATION CARRIER...</span>
              </div>
            )}

            {verificationError && !simulatedScannerActive && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold p-3 rounded-lg leading-relaxed">
                ❌ {verificationError}
              </div>
            )}

            {returnSuccessMessage && !simulatedScannerActive && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold p-3 rounded-lg leading-relaxed">
                ✔ {returnSuccessMessage}
              </div>
            )}

            {activeIssuance && !simulatedScannerActive && (
              <div className="bg-indigo-650/10 border border-indigo-500/35 rounded-xl p-4.5 space-y-3.5">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 bg-emerald-400/10 rounded-full p-0.5" />
                  <span className="text-xs text-white font-extrabold uppercase">VALID CHECKOUT VERIFICATION LOGGED</span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 text-xs text-slate-350 font-semibold bg-black/30 p-3 rounded-lg border border-white/5">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block tracking-wider mb-0.5">Assigned Asset</span>
                    <span className="text-white font-bold">{activeIssuance.assetName}</span>
                    <span className="text-[9px] text-indigo-300 font-mono block mt-0.5">{activeIssuance.assetTag}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block tracking-wider mb-0.5">Faculty Recipient</span>
                    <span className="text-white font-bold">{activeIssuance.userName}</span>
                  </div>
                  <div className="col-span-2 border-t border-white/5 pt-2 mt-1">
                    <span className="text-[10px] text-slate-500 uppercase block tracking-wider mb-0.5">Due Date Limit</span>
                    <span className="text-white font-black flex items-center gap-1 font-mono">
                      <Clock className="h-3.5 w-3.5 text-yellow-500" />
                      {new Date(activeIssuance.returnDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmReturnInScanner}
                  className="w-full h-9 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Confirm Intake Verification
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overdue alarms detector column */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-[#0b1227] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <BadgeAlert className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Un-Intaked / Overdue Tracker</h3>
                <p className="text-[10px] text-slate-400">Assets whose physical labels have not been scanned within the authorized timeframe</p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded animate-pulse font-black">
              {overdueIssuances.length} ALERTS
            </span>
          </div>

          <div className="space-y-2.5">
            {overdueIssuances.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-white/10 rounded-xl font-mono">
                Nice! All checked-out hardware complies completely with return guidelines.
              </div>
            ) : (
              overdueIssuances.map((iss) => {
                const daysCount = getDaysOverdueCount(iss.returnDate);
                return (
                  <div key={iss.id} className="bg-rose-950/20 border border-rose-500/25 rounded-xl p-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">{iss.assetName}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 text-[8px] font-black rounded font-mono">
                          OVERDUE {daysCount} DAYS
                        </span>
                        <span className="text-[9px] text-slate-400 truncate max-w-[140px]">
                          Recipient: {iss.userName}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => triggerSimulateScan(iss.assetTag || iss.id)}
                      className="h-7 px-3 bg-rose-500 hover:bg-rose-600 text-black font-extrabold text-[9px] uppercase rounded transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Force Scan Return
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
