import React, { useState } from "react";
import { ShieldAlert, Sparkles, Send, RefreshCw, FileText } from "lucide-react";
import GlassCard from "../components/GlassCard";
import ActionButton from "../components/ActionButton";
import StatusBadge from "../components/StatusBadge";
import { SmartAlert } from "../types";
import { apiFetch } from "../lib/api";

interface RiskAlertsPageProps {
  alerts: SmartAlert[];
  onTransmitNotification: (userId: string, title: string, message: string) => Promise<boolean>;
  onRefresh: () => void;
}

export default function RiskAlertsPage({ alerts, onTransmitNotification, onRefresh }: RiskAlertsPageProps) {
  const [selectedAlert, setSelectedAlert] = useState<SmartAlert | null>(null);
  const [draftText, setDraftText] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);

  // Trigger Gemini-powered notice drafter
  const handleDraftNotice = async (alertObj: SmartAlert) => {
    setSelectedAlert(alertObj);
    setIsDrafting(true);
    setDraftText("");
    try {
      const res = await apiFetch("/api/gemini/recovery-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facultyName: alertObj.userName,
          department: alertObj.department,
          daysRemaining: alertObj.daysRemaining,
          contractDate: alertObj.contractEndDate,
          assets: alertObj.outstandingAssets,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDraftText(data.draft || "");
      }
    } catch (err) {
      console.error(err);
      setDraftText("Unable to reach AI document engine. Refresh connection to try again.");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleTransmit = async () => {
    if (!selectedAlert) return;
    setIsTransmitting(true);
    
    // Create notification body
    const title = "Urgent: Complete Outstanding Asset Clearance Checks";
    const cleanNoticeMessage = `${selectedAlert.userName}, your visiting contract expires on ${selectedAlert.contractEndDate} (${selectedAlert.daysRemaining} days left). Please return outstanding hardware immediately.`;

    const ok = await onTransmitNotification(selectedAlert.userId, title, cleanNoticeMessage);
    if (ok) {
      alert(`Asset warning notice successfully transmitted to ${selectedAlert.userName}'s Faculty Portal!`);
      setSelectedAlert(null);
      setDraftText("");
    } else {
      alert("Transmission failed.");
    }
    setIsTransmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="h-4.5 w-4.5 text-rose-400" /> Contract Expiry Alerts
          </h3>
          <p className="text-xs text-slate-400">Shows visiting faculty members whose contracts are expiring soon while holding university items.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Risk Targets lists */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Risk Profiles</h4>
          <div className="space-y-4">
            {alerts.map((alr) => (
              <GlassCard
                key={alr.id}
                className={`transition-all duration-300 border-l-4 ${
                  alr.daysRemaining <= 3 ? "border-l-rose-500 bg-rose-500/[0.01]" : "border-l-amber-500 bg-amber-500/[0.01]"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">{alr.userName}</h4>
                      <p className="text-[10.5px] text-slate-450 mt-0.5">{alr.department} • ({alr.facultyType})</p>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                      alr.daysRemaining <= 3 
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {alr.daysRemaining <= 0 ? "Term Expired" : `${alr.daysRemaining} days remaining`}
                    </span>
                  </div>

                  {/* Highlights outstanding items */}
                  <div className="space-y-1.5 bg-slate-950/45 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[9.5px] uppercase font-bold text-slate-500 block mb-1">Unreturned Inventory Items:</span>
                    {alr.outstandingAssets.map((asset) => (
                      <div key={asset.assetId} className="flex justify-between items-center text-[10.5px] text-slate-350">
                        <span>{asset.assetName}</span>
                        <span className="font-mono text-slate-500 text-[10px]">{asset.assetTag}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <span className="text-[10px] text-slate-400 font-semibold italic">Risk Index: {alr.riskLevel}</span>
                    <button
                      onClick={() => handleDraftNotice(alr)}
                      disabled={isDrafting}
                      className="px-3 h-8 rounded bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Draft Return Notice
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}

            {alerts.length === 0 && (
              <div className="p-10 text-center rounded-xl bg-white/[0.01] border border-dashed border-white/5">
                <p className="text-xs text-slate-500 font-medium">All visiting contracts clear of device liabilities.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Gemini Draft Notice preview */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-indigo-400" /> AI Document Gen-draft Workbench
          </h4>

          <GlassCard className="min-h-72 flex flex-col justify-between">
            {selectedAlert ? (
              <div className="space-y-4 h-full flex flex-col justify-between">
                <div className="p-3.5 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex justify-between items-center select-none">
                  <div>
                    <span className="text-[10px] uppercase text-indigo-400 font-bold block">Drafting notice for:</span>
                    <span className="text-xs font-bold text-slate-200">{selectedAlert.userName}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Model: Gemini 2.5 Flash</span>
                </div>

                <div className="flex-1 max-h-80 overflow-y-auto p-4 rounded-xl bg-[#030712] border border-white/5 scrollbar-thin">
                  {isDrafting ? (
                    <div className="h-28 flex flex-col items-center justify-center text-slate-500 text-xs space-y-2 select-none">
                      <span className="h-5 w-5 border-2 border-t-transparent border-indigo-455 rounded-full animate-spin" />
                      <span>Synthesizing legal Notice layout via Gemini...</span>
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none text-[10.5px] leading-relaxed text-slate-300 font-mono whitespace-pre-wrap">
                      {draftText}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      setSelectedAlert(null);
                      setDraftText("");
                    }}
                    className="px-3 h-9 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold uppercase transition-all cursor-pointer border border-white/5"
                  >
                    Discard Draft
                  </button>
                  <ActionButton onClick={handleTransmit} loading={isTransmitting} variant="primary" className="h-9">
                    <Send className="h-3.5 w-3.5" /> Transmit to Faculty
                  </ActionButton>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500 text-center space-y-2 select-none h-full">
                <Sparkles className="h-8 w-8 text-indigo-554 opacity-30 animate-pulse" />
                <h5 className="text-xs font-bold text-slate-400">Notice Drafting Area</h5>
                <p className="text-[10px] text-slate-500 leading-normal max-w-xs">
                  Select key visiting profiles on the left matrix to launch official audit draft notices generated instantly by Gemini.
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
