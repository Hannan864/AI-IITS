import React, { useState } from "react";
import { Layers } from "lucide-react";
import { Asset, User, AssetIssuance, NDCRequest } from "../../types";
import SovereignAnalyticsTab from "./SovereignAnalyticsTab";
import LogisticsEscalationTab from "./LogisticsEscalationTab";
import AssetLifecycleIntelTab from "./AssetLifecycleIntelTab";
import ImmutableForensicLogTab from "./ImmutableForensicLogTab";
import { useGovernanceMetrics } from "../../hooks/useGovernanceMetrics";

interface UniversityGovernanceDashboardProps {
  assets: Asset[];
  users: User[];
  issuances: AssetIssuance[];
  ndcRequests: NDCRequest[];
  onRefresh?: () => void;
}

export default function UniversityGovernanceDashboard({
  assets,
  users,
  issuances,
  ndcRequests,
  onRefresh
}: UniversityGovernanceDashboardProps) {
  const [governanceTab, setGovernanceTab] = useState<"intel" | "escalations" | "lifecycle" | "audits">("intel");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [auditSearch, setAuditSearch] = useState<string>("all");
  const todayStr = new Date().toISOString().split("T")[0];

  const {
    campusDepts,
    globalComplianceMetrics,
    overdueEscalations,
    departmentMetrs,
    idleAssets,
    computedLifecycles,
    filteredAuditsList
  } = useGovernanceMetrics(assets, users, issuances, ndcRequests, todayStr, selectedDept, selectedSeverity, auditSearch);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-900/35 border border-white/5 p-4 rounded-2xl">
        <div className="flex gap-3 items-center">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Layers className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded px-1.5 py-0.2 uppercase tracking-wide font-extrabold">Department Reports</span>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider mt-0.5">Department Analytics & Reports</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-white/5 w-full xl:w-auto">
          {[
            { id: "intel", label: "Overview & Charts" },
            { id: "escalations", label: "Overdue Items" },
            { id: "lifecycle", label: "Item Condition & Age" },
            { id: "audits", label: "Activity Logs" }
          ].map(tab => (
            <button key={tab.id} type="button" onClick={() => setGovernanceTab(tab.id as any)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${governanceTab === tab.id ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {governanceTab === "intel" && <SovereignAnalyticsTab globalComplianceMetrics={globalComplianceMetrics} departmentMetrs={departmentMetrs} idleAssets={idleAssets} />}
      {governanceTab === "escalations" && <LogisticsEscalationTab overdueEscalations={overdueEscalations} />}
      {governanceTab === "lifecycle" && <AssetLifecycleIntelTab computedLifecycles={computedLifecycles} onRefresh={onRefresh} />}
      {governanceTab === "audits" && (
        <ImmutableForensicLogTab 
          filteredAuditsList={filteredAuditsList}
          selectedDept={selectedDept}
          setSelectedDept={setSelectedDept}
          selectedSeverity={selectedSeverity}
          setSelectedSeverity={setSelectedSeverity}
          setAuditSearch={setAuditSearch}
          campusDepts={campusDepts}
          todayStr={todayStr}
          handlePrint={handlePrint}
        />
      )}
    </div>
  );
}
