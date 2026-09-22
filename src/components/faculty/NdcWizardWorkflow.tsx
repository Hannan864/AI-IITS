import React, { useState } from "react";
import { 
  ShieldCheck, AlertTriangle, Clock, CheckCircle2, Award, 
  ArrowRight, FileText, Lock, Send, RotateCcw, Building2, Download, RefreshCw, AlertCircle, Laptop, Info
} from "lucide-react";
import { User, Asset, AssetIssuance, NDCRequest } from "../../types";

interface NdcWizardWorkflowProps {
  currentUser: User;
  assets: Asset[];
  myActiveIssuances: AssetIssuance[];
  myNdcRequests: NDCRequest[];
  onRequestNDC: (userId: string, remarks: string) => Promise<boolean>;
  onNavigateToReturnPortal?: () => void;
}

export default function NdcWizardWorkflow({
  currentUser,
  assets,
  myActiveIssuances,
  myNdcRequests,
  onRequestNDC,
  onNavigateToReturnPortal,
}: NdcWizardWorkflowProps) {
  const [remarks, setRemarks] = useState("");
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const pendingNdc = myNdcRequests.find((r) => r.status === "Pending");
  const approvedNdc = myNdcRequests.find((r) => r.status === "Approved");
  const rejectedNdc = myNdcRequests.find((r) => r.status === "Rejected");

  // CRITICAL RULE: An NDC (No Dues Certificate) is strictly for users with 0 active hardware liabilities.
  const hasOutstanding = myActiveIssuances.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasOutstanding) {
      setErrorMsg("You cannot submit an NDC request while holding outstanding hardware items.");
      return;
    }
    if (!remarks.trim()) {
      setErrorMsg("Please enter a brief reason for requesting NDC clearance.");
      return;
    }
    if (!declarationChecked) {
      setErrorMsg("Please check the declaration box to confirm your sign-off.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const success = await onRequestNDC(currentUser.id, remarks.trim());
      if (success) {
        setSuccessMsg("Your No Dues Certificate request has been submitted successfully!");
      } else {
        setErrorMsg("Failed to submit clearance request. Please try again.");
      }
    } catch (err) {
      setErrorMsg("Communication error with server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in select-none max-w-5xl mx-auto">
      {/* Overview Banner */}
      <div className="bg-[#0a0f1d]/90 border border-indigo-500/20 rounded-2xl p-6 shadow-2xl space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-extrabold text-white tracking-tight">
                No Dues Certificate (NDC) Exit Clearance
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              An official digital certificate verifying that you have zero (0) outstanding IT hardware liabilities or unreturned assets. Required prior to faculty departure or semester exit.
            </p>
          </div>

          {/* Current Status Badge */}
          <div className="shrink-0">
            {hasOutstanding ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-500/15 border border-rose-500/30 text-rose-300">
                <Lock className="h-4 w-4 text-rose-400" />
                Clearance Locked ({myActiveIssuances.length} Item{myActiveIssuances.length > 1 ? "s" : ""} Held)
              </span>
            ) : approvedNdc ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                NDC Certificate Issued
              </span>
            ) : pendingNdc ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-500/15 border border-amber-500/30 text-amber-300">
                <Clock className="h-4 w-4 text-amber-400 animate-spin" />
                Under Store Review
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Eligible to Apply (0 Liabilities)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* RULE 1: IF USER HOLDS OUTSTANDING PHYSICAL ASSETS -> ALWAYS SHOW BLOCKED WARNING & ASSET RETURN REMINDER */}
      {hasOutstanding ? (
        <div className="bg-[#0a0f1d]/90 border border-rose-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-start gap-3 border-b border-white/10 pb-5">
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-2xl shrink-0 mt-0.5">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                Clearance Locked: You Currently Hold {myActiveIssuances.length} Assigned Hardware Item{myActiveIssuances.length > 1 ? "s" : ""}
              </h3>
              <p className="text-xs text-rose-200/90 leading-relaxed font-medium">
                A <strong>No Dues Certificate (NDC)</strong> is strictly issued to faculty members who hold <strong>zero (0) active university hardware items</strong>. Because you currently have physical equipment assigned to your account by the Store Manager, your clearance is locked. Please return all items to obtain your certificate.
              </p>
            </div>
          </div>

          {/* List of currently held assets */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Laptop className="h-4 w-4 text-rose-400" /> Hardware Equipment Currently In Your Possession
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {myActiveIssuances.map((issuance) => {
                const asset = assets.find((a) => a.id === issuance.assetId);
                return (
                  <div
                    key={issuance.id}
                    className="p-4 bg-slate-900/90 border border-rose-500/20 rounded-xl space-y-2 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-white">{asset?.assetName || "Hardware Asset"}</span>
                      <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                        Action Required
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-white/5">
                      <span>Tag: <strong className="text-indigo-300">{asset?.assetTag || "N/A"}</strong></span>
                      <span>SN: <strong className="text-slate-200">{asset?.serialNumber || "N/A"}</strong></span>
                    </div>

                    <div className="text-[10.5px] font-mono text-slate-400 pt-1 flex items-center justify-between">
                      <span>Return Due:</span>
                      <strong className="text-amber-300">{issuance.returnDate}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-slate-950 border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Info className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>Visit the <strong>Equipment Return Logistics Portal</strong> to generate your return QR pass for warehouse check-in.</span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onNavigateToReturnPortal) {
                  onNavigateToReturnPortal();
                }
              }}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-xl shrink-0"
            >
              <RotateCcw className="h-4 w-4" /> Go to Equipment Return Portal
            </button>
          </div>

          {approvedNdc && (
            <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl text-[11px] text-slate-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Note: Historical certificate record #{approvedNdc.id} is superseded/voided while active assets remain assigned.</span>
            </div>
          )}
        </div>
      ) : (
        /* RULE 2: USER HOLDS ZERO (0) ASSETS -> ALLOW CERTIFICATE ISSUANCE OR SHOW APPROVED/PENDING CERTIFICATE */
        <>
          {/* STATE 2A: APPROVED CERTIFICATE (0 ASSETS HELD) */}
          {approvedNdc && (
            <div className="bg-[#0a0f1d]/90 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
              <div className="h-16 w-16 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mx-auto shadow-lg">
                <Award className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  Official Verification Approved
                </span>
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  No Dues Clearance Certificate Granted
                </h3>
                <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                  The Central IT Store Manager <strong className="text-white">{approvedNdc.approvedBy || "Administrator"}</strong> has verified your account and certified zero physical asset liabilities.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left bg-slate-900/80 p-4 rounded-xl border border-white/5 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Certificate ID</span>
                  <span className="text-white font-extrabold">{approvedNdc.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Approval Date</span>
                  <span className="text-slate-300">{approvedNdc.requestDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Department Status</span>
                  <span className="text-emerald-400 font-bold">CLEAR & VERIFIED</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-lg"
              >
                <Download className="h-4 w-4" /> Print / Save Official Certificate
              </button>
            </div>
          )}

          {/* STATE 2B: PENDING REVIEW (0 ASSETS HELD) */}
          {pendingNdc && !approvedNdc && (
            <div className="bg-[#0a0f1d]/90 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                  <Clock className="h-5 w-5 animate-spin" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Application Under Manager Review</h3>
                  <p className="text-xs text-slate-400">Request submitted on {pendingNdc.requestDate}. Store Manager is auditing database records.</p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-900/80 border border-emerald-500/30 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Step 1</span>
                  <p className="font-extrabold text-white text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Form Transmitted
                  </p>
                  <p className="text-[11px] text-slate-400">Account verified with zero hardware holdings.</p>
                </div>

                <div className="p-4 bg-slate-900/80 border border-amber-500/40 rounded-xl space-y-1 relative overflow-hidden">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Step 2</span>
                  <p className="font-extrabold text-white text-xs flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-400 animate-spin" /> Store Desk Audit
                  </p>
                  <p className="text-[11px] text-slate-400">Awaiting Manager sign-off on exit register.</p>
                </div>

                <div className="p-4 bg-slate-900/40 border border-white/5 rounded-xl space-y-1 opacity-60">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Step 3</span>
                  <p className="font-extrabold text-slate-300 text-xs">Certificate Release</p>
                  <p className="text-[11px] text-slate-500">Official digital NDC generated upon sign-off.</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 border border-white/5 rounded-xl text-xs font-mono space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Application Remarks</span>
                <p className="text-slate-200">"{pendingNdc.remarks}"</p>
              </div>
            </div>
          )}

          {/* STATE 2C: REJECTED STATE */}
          {rejectedNdc && !pendingNdc && !approvedNdc && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-rose-400" /> Clearance Application Rejected
                </span>
                <span className="font-mono text-[10px] text-slate-400">{rejectedNdc.requestDate}</span>
              </div>
              <p className="text-slate-300">
                Manager Remarks: <strong className="text-white font-mono">"{rejectedNdc.remarks}"</strong>
              </p>
            </div>
          )}

          {/* STATE 2D: READY TO APPLY (0 ASSETS HELD & NO PENDING/APPROVED REQUEST) */}
          {!approvedNdc && !pendingNdc && (
            <div className="bg-[#0a0f1d]/90 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-emerald-300 text-xs uppercase tracking-wider">
                    Eligibility Status: Fully Qualified (0 Liabilities)
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Our central inventory check confirms you hold zero active hardware items. You may now submit your NDC application.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {errorMsg && (
                  <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl font-bold">
                    ⚠ {errorMsg}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                    Reason for Clearance Request <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. End of academic semester / Faculty departure / Department transfer..."
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <label className="flex items-start gap-3 p-3.5 bg-slate-900/60 border border-white/5 rounded-xl cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={declarationChecked}
                    onChange={(e) => setDeclarationChecked(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-white/20 text-indigo-600 focus:ring-0 bg-slate-950 shrink-0"
                  />
                  <span className="text-slate-300 text-xs leading-relaxed">
                    I hereby declare that all university facilities, computing devices, and hardware items assigned to me have been returned, and I request official clearance.
                  </span>
                </label>

                <div className="pt-2 border-t border-white/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer inline-flex items-center gap-2 shadow-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Submit NDC Clearance Application
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
