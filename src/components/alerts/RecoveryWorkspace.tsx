import React, { useState, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  Mail, 
  Check, 
  AlertTriangle,
  FileDown
} from "lucide-react";
import { SmartAlert } from "../../types";
import { apiFetch } from "../../lib/api";

interface RecoveryWorkspaceProps {
  activeAlert: SmartAlert | null;
  onTransmitNotification: (userId: string, title: string, message: string) => Promise<boolean>;
}

export default function RecoveryWorkspace({
  activeAlert,
  onTransmitNotification,
}: RecoveryWorkspaceProps) {
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<string>("");
  const [transmissionSuccessMsg, setTransmissionSuccessMsg] = useState<string>("");

  const handleGenerateNoticeDraft = async (alert: SmartAlert) => {
    setLoadingPlan(true);
    setGeneratedDraft("");
    setTransmissionSuccessMsg("");
    try {
      const response = await apiFetch("/api/gemini/recovery-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facultyName: alert.userName,
          department: alert.department,
          daysRemaining: alert.daysRemaining,
          contractDate: alert.contractEndDate,
          assets: alert.outstandingAssets
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get response from server draft engine.");
      }

      const data = await response.json();
      setGeneratedDraft(data.draft || "");
    } catch (err) {
      console.error(err);
      setGeneratedDraft("Error drafting plan. Procedural fallback generated instead.");
    } finally {
      setLoadingPlan(false);
    }
  };

  useEffect(() => {
    if (activeAlert) {
      handleGenerateNoticeDraft(activeAlert);
    }
  }, [activeAlert]);

  const handleTransmitNotice = async () => {
    if (!activeAlert || !generatedDraft) return;
    
    const success = await onTransmitNotification(
      activeAlert.userId, 
      "Urgent Asset Return & NDC Clearance Reminder", 
      `This is an urgent departmental notification compiled by IIUI Admin Store. Please retrieve your full-scale clearance list promptly. Outstanding equipment checklist:\n${activeAlert.outstandingAssets.map(a => `- ${a.assetName} [Tag: ${a.assetTag}]`).join("\n")}`
    );

    if (success) {
      setTransmissionSuccessMsg(`Asset recover notice successfully transmitted to ${activeAlert.userName}'s dashboard notifications.`);
      setTimeout(() => setTransmissionSuccessMsg(""), 5000);
    }
  };

  if (!activeAlert) {
    return (
      <div className="lg:col-span-7 h-full flex items-center justify-center p-12 text-sm text-slate-400 border border-dashed border-white/10 rounded-xl bg-white/2">
        Select a risk outline to preview AI recovery notices.
      </div>
    );
  }

  return (
    <div className="lg:col-span-7">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-2xl space-y-5">
        {/* Visual Bio Header */}
        <div className="flex justify-between items-start border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/10">
              Risk Profile Selected
            </span>
            <h3 className="text-lg font-bold text-white mt-1.5">{activeAlert.userName}</h3>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-indigo-400" /> {activeAlert.userEmail}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Recommended Checklist</span>
            <span className="text-sm font-semibold text-red-400 block">Lock NDC Clearance</span>
          </div>
        </div>

        {/* Algorithmic Decision Warning box */}
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-300 space-y-1">
          <div className="font-bold flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            AIITS Prediction Alert Reasonings:
          </div>
          <p className="leading-relaxed text-slate-200 font-medium">{activeAlert.recommendation}</p>
        </div>

        {/* Overdue assets checklist */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Holding Inventory Asset Checklist</h4>
          <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-black/20">
            {activeAlert.outstandingAssets.map(ast => (
              <div key={ast.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-white/5">
                <div>
                  <p className="font-bold text-white">{ast.assetName}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Tag/ID: {ast.assetTag} • Issued: {ast.issuedDate}</p>
                </div>
                <span className="bg-red-500/15 text-red-400 border border-red-500/20 font-mono font-bold px-2 py-0.5 rounded">
                  Expected: {ast.returnDate}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gemini notice preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Gemini Auto-Drafted Professional Email Notice
            </h4>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full">
              {loadingPlan ? "Drafting..." : "Server-Side Feed"}
            </span>
          </div>

          {loadingPlan ? (
            <div className="rounded-xl border border-white/10 bg-black/20 p-12 text-center space-y-2">
              <div className="h-6 w-6 border-2 border-t-indigo-500 border-r-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400">Gemini is synthesizing asset tags with IIUI return procedure templates...</p>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-black/30 max-h-64 overflow-y-auto p-4 text-xs font-normal text-slate-200 leading-relaxed shadow-inner">
              <p className="whitespace-pre-line font-mono font-medium text-slate-300 text-[11px] selection:bg-indigo-550/50">
                {generatedDraft}
              </p>
            </div>
          )}
        </div>

        {/* Transmit action */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2.5">
            <button
              onClick={handleTransmitNotice}
              disabled={!generatedDraft || loadingPlan}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg py-2.5 text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all border border-indigo-505/30 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              Transmit Notice Alert to Faculty Dashboard
            </button>
            <button
              onClick={() => alert("Printing recovery notice draft to device...")}
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10 cursor-pointer"
              title="Print Draft"
            >
              <FileDown className="h-4 w-4" />
            </button>
          </div>
          
          {transmissionSuccessMsg && (
            <div className="bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/20 text-xs py-2.5 px-3 rounded-lg flex items-center gap-2">
              <Check className="h-4 w-4 bg-emerald-500/30 rounded-full" />
              {transmissionSuccessMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
