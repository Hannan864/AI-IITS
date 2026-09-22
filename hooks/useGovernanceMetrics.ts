import { useMemo } from "react";
import { Asset, User, AssetIssuance, NDCRequest } from "../types";
import { DepartmentMetric, IdleAsset, GlobalComplianceMetrics } from "../components/admin/SovereignAnalyticsTab";
import { OverdueEscalation } from "../components/admin/LogisticsEscalationTab";
import { AssetLifecycleRecord } from "../types";
import { AuditEvent } from "../components/admin/ImmutableForensicLogTab";

export function useGovernanceMetrics(
  assets: Asset[],
  users: User[],
  issuances: AssetIssuance[],
  ndcRequests: NDCRequest[],
  todayStr: string,
  selectedDept: string,
  selectedSeverity: string,
  auditSearch: string
) {
  const facultyUsers = useMemo(() => {
    return users.filter((u) => u.role === "Faculty" || u.role === "Visiting Faculty");
  }, [users]);

  const campusDepts = useMemo(() => {
    const list = facultyUsers.map(u => u.department).filter(Boolean);
    return Array.from(new Set(list)) as string[];
  }, [facultyUsers]);

  const getContractDays = (contractEndDate: string | null) => {
    if (!contractEndDate) return null;
    const deadline = new Date(contractEndDate);
    const today = new Date(todayStr);
    const diff = deadline.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const computedFacultyCompliance = useMemo(() => {
    return facultyUsers.map(user => {
      const activeHolds = issuances.filter(i => i.userId === user.id && i.actualReturnDate === null);
      const returnedHolds = issuances.filter(i => i.userId === user.id && i.actualReturnDate !== null);
      const totalAllocated = issuances.filter(i => i.userId === user.id).length;
      const returnRatio = totalAllocated > 0 ? (returnedHolds.length / totalAllocated) : 1.0;
      const returnRatioScore = returnRatio * 40;
      let contractScore = 30;
      const daysLeft = getContractDays(user.contractEndDate);
      if (user.role === "Visiting Faculty" && daysLeft !== null) {
        if (daysLeft >= 60) contractScore = 30;
        else if (daysLeft >= 30) contractScore = 20;
        else if (daysLeft >= 15) contractScore = 12;
        else if (daysLeft >= 0) contractScore = 5;
        else contractScore = 0;
      }
      const overdueCount = activeHolds.filter(i => new Date(i.returnDate).getTime() < new Date(todayStr).getTime()).length;
      const overduePenaltyScore = Math.max(0, 20 - overdueCount * 10);
      const hasPendingNdc = ndcRequests.some(r => r.userId === user.id && r.status === "Pending");
      const ndcScore = hasPendingNdc ? 0 : 10;
      const totalComplianceScore = Math.round(returnRatioScore + contractScore + overduePenaltyScore + ndcScore);
      let band: "Green" | "Yellow" | "Red" = "Green";
      if (totalComplianceScore >= 80) band = "Green";
      else if (totalComplianceScore >= 50) band = "Yellow";
      else band = "Red";

      return {
        user: { id: user.id, name: user.name, email: user.email, department: user.department || "General Academy" },
        score: totalComplianceScore,
        band,
        activeHoldsCount: activeHolds.length,
        returnedCount: returnedHolds.length,
        totalAllocated,
        overdueCount,
        daysLeft,
        hasPendingNdc,
        explanation: `Allocations Returned: ${returnedHolds.length}/${totalAllocated} (${Math.round(returnRatio*100)}%). Tenure Profile: ${user.role} (${daysLeft !== null ? daysLeft+' days remaining' : 'Permanent tenure'}). Overdues logged: ${overdueCount}. NDC clearance application status: ${hasPendingNdc ? 'Hold / Pending' : 'Clear'}.`
      };
    });
  }, [facultyUsers, issuances, ndcRequests]);

  const globalComplianceMetrics = useMemo(() => {
    if (computedFacultyCompliance.length === 0) {
      return { avgScore: 100, greenCount: 0, yellowCount: 0, redCount: 0, recoveryRate: 100, bottlenecks: [] };
    }
    const totalScore = computedFacultyCompliance.reduce((acc, f) => acc + f.score, 0);
    const avgScore = Math.round(totalScore / computedFacultyCompliance.length);
    const green = computedFacultyCompliance.filter(f => f.band === "Green").length;
    const yellow = computedFacultyCompliance.filter(f => f.band === "Yellow").length;
    const red = computedFacultyCompliance.filter(f => f.band === "Red").length;
    const returnedCountAll = issuances.filter(i => i.actualReturnDate !== null).length;
    const totalIssuedAll = issuances.length;
    const recoveryRate = totalIssuedAll > 0 ? Math.round((returnedCountAll / totalIssuedAll) * 100) : 100;
    const bottlenecks = computedFacultyCompliance.filter(f => f.hasPendingNdc && f.activeHoldsCount > 0);
    return { avgScore, greenCount: green, yellowCount: yellow, redCount: red, recoveryRate, bottlenecks } as GlobalComplianceMetrics;
  }, [computedFacultyCompliance, issuances]);

  const overdueEscalations = useMemo(() => {
    const activeIssuances = issuances.filter(i => i.actualReturnDate === null);
    return activeIssuances.map(iss => {
      const deadline = new Date(iss.returnDate);
      const today = new Date(todayStr);
      const diffTime = today.getTime() - deadline.getTime();
      const overdueDays = Math.ceil(diffTime / (1000 * 3600 * 24));
      let level = 0, label = "Compliant", colorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", actionPlan = "No disciplinary level active.";
      if (overdueDays > 0) {
        if (overdueDays <= 5) { level = 1; label = "L1: Faculty Auto-Reminder"; colorClass = "text-sky-400 bg-sky-500/10 border-sky-500/20"; actionPlan = "Pushing daily automated text reminders."; }
        else if (overdueDays <= 15) { level = 2; label = "L2: Store Supervisor Escaped Alert"; colorClass = "text-amber-500 bg-amber-500/10 border-amber-500/20"; actionPlan = "Logistics desk supervisor is flagged."; }
        else if (overdueDays <= 30) { level = 3; label = "L3: Admin Alarm + NDC LOCKED"; colorClass = "text-orange-400 bg-orange-500/10 border-orange-500/25"; actionPlan = "Non-Device Clearance Certificate frozen."; }
        else { level = 4; label = "L4: Disciplinary Lock & Audit Lock"; colorClass = "text-red-400 bg-red-500/15 border-red-500/25 animate-pulse"; actionPlan = "Physical institutional accounts restricted."; }
      }
      return { iss, overdueDays, level, label, colorClass, actionPlan };
    }).filter(e => e.overdueDays > 0).sort((a, b) => b.overdueDays - a.overdueDays) as OverdueEscalation[];
  }, [issuances]);

  const departmentMetrs = useMemo(() => {
    return campusDepts.map(dept => {
      const deptFacultyUids = facultyUsers.filter(u => u.department === dept).map(u => u.id);
      const deptIssued = issuances.filter(i => deptFacultyUids.includes(i.userId));
      const deptActiveIssued = deptIssued.filter(i => i.actualReturnDate === null);
      const totalDeptAssets = assets.filter(a => a.department === dept).length;
      const activeHoldsCount = deptActiveIssued.length;
      let density: "low" | "medium" | "high" = "low";
      if (activeHoldsCount > 8) density = "high"; else if (activeHoldsCount > 3) density = "medium";
      const utilizationScore = totalDeptAssets > 0 ? Math.round((activeHoldsCount / totalDeptAssets) * 100) : 50;
      const overdues = deptActiveIssued.filter(i => new Date(i.returnDate).getTime() < new Date(todayStr).getTime()).length;
      return { department: dept, activeHoldsCount, totalDeptAssets, utilizationScore, overdues, density, facultyCount: deptFacultyUids.length } as DepartmentMetric;
    }).sort((a, b) => b.activeHoldsCount - a.activeHoldsCount);
  }, [campusDepts, facultyUsers, issuances, assets]);

  const idleAssets = useMemo(() => {
    return assets.filter(asset => asset.status === "Available").map(asset => {
      const createdDate = new Date(asset.createdAt || todayStr);
      const today = new Date(todayStr);
      return { id: asset.id, assetName: asset.assetName, category: asset.category, department: asset.department || "General Academy", daysIdle: Math.ceil((today.getTime() - createdDate.getTime()) / (1000 * 3600 * 24)) };
    }).filter(a => a.daysIdle > 60).sort((a, b) => b.daysIdle - a.daysIdle);
  }, [assets, todayStr]);

  const computedLifecycles = useMemo(() => {
    return assets.map(asset => {
      const history = issuances.filter(i => i.assetId === asset.id);
      const buyPrice = asset.category.toLowerCase().includes("computing") ? 1450 : asset.category.toLowerCase().includes("lab") ? 850 : 350;
      const assetDate = asset.purchaseDate || asset.createdAt || todayStr;
      const yearsElapsed = Math.max(0.1, (new Date(todayStr).getTime() - new Date(assetDate).getTime()) / (1000 * 3600 * 24 * 365));
      const currentSimValue = Math.round(Math.max(buyPrice * Math.pow(1 - 0.20, yearsElapsed), buyPrice * 0.15));
      return { id: asset.id, assetName: asset.assetName, category: asset.category, assetTag: asset.assetTag, buyPrice, yearsElapsed: yearsElapsed.toFixed(1), currentSimValue, totalIncidents: asset.condition === "Damaged" ? 3 : 0, demandsReplacement: asset.condition === "Damaged" || yearsElapsed > 3.5, depreciationPercent: Math.round(((buyPrice - currentSimValue) / buyPrice) * 100), usageHistoryCount: history.length, history: history } as AssetLifecycleRecord;
    });
  }, [assets, issuances]);

  const masterAuditEvents = useMemo(() => {
    const events: AuditEvent[] = [];
    issuances.forEach(iss => {
      events.push({ id: `audit-iss-${iss.id}`, date: iss.issuedDate, actor: iss.userName || "Candidate", department: iss.department || "General", action: "Equipment Log Issued", type: "allocation", severity: "INFO", details: `Dispatched ${iss.assetName}.` });
      if (iss.actualReturnDate) events.push({ id: `audit-ret-${iss.id}`, date: iss.actualReturnDate, actor: iss.userName || "Candidate", department: iss.department || "General", action: "Liabilities Handed back", type: "check-in", severity: iss.status === "Damaged" ? "WARNING" : "INFO", details: `Returned ${iss.assetName}.` });
    });
    ndcRequests.forEach(ndc => events.push({ id: `audit-ndc-${ndc.id}`, date: ndc.requestDate, actor: ndc.userName || "Candidate", department: ndc.department || "General", action: `Clearance Exit Filed: ${ndc.status}`, type: "clearance", severity: ndc.status === "Rejected" ? "WARNING" : "INFO", details: `Request: ${ndc.remarks}` }));
    return events.sort((a,b) => b.date.localeCompare(a.date));
  }, [issuances, ndcRequests]);

  const filteredAuditsList = useMemo(() => {
    return masterAuditEvents.filter(evt => {
      const matchesDept = selectedDept === "all" || evt.department === selectedDept;
      const matchesSeverity = selectedSeverity === "all" || evt.severity === selectedSeverity;
      const matchesSearch = auditSearch === "all" || evt.actor.toLowerCase().includes(auditSearch.toLowerCase()) || evt.action.toLowerCase().includes(auditSearch.toLowerCase()) || evt.details.toLowerCase().includes(auditSearch.toLowerCase());
      return matchesDept && matchesSeverity && matchesSearch;
    });
  }, [masterAuditEvents, selectedDept, selectedSeverity, auditSearch]);

  return { facultyUsers, campusDepts, computedFacultyCompliance, globalComplianceMetrics, overdueEscalations, departmentMetrs, idleAssets, computedLifecycles, filteredAuditsList };
}
