export interface DeficiencyWarning {
  id: string;
  ticketId?: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  serialNumber?: string;
  category?: string;
  userName: string;
  userEmail?: string;
  department?: string;
  reason: string;
  issuedAt: string;
  status: "ACTIVE_NOTICE" | "RESOLVED_CLEARED";
  resolvedAt?: string;
  managerNotes?: string;
  issuedBy?: string;
  clearanceType?: "FINE_PAID" | "PHYSICAL_JUSTIFICATION" | "ACCESSORIES_RETURNED" | "STORE_MANAGER_OVERRIDE";
  amountPaid?: string;
  receiptNumber?: string;
  resolvedBy?: string;
  adminNotes?: string;
}

export const WARNINGS_STORAGE_KEY = "iiui_deficiency_warnings";

// Purge any legacy mock / demo warnings by ID prefix or dummy names
const LEGACY_MOCK_IDS = new Set(["WARN-2026-001", "WARN-2026-002", "WARN-2026-003", "WARN-2026-004"]);

export function getStoredWarnings(): DeficiencyWarning[] {
  try {
    const raw = localStorage.getItem(WARNINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out legacy mock data if present
        const realOnly = parsed.filter(w => !LEGACY_MOCK_IDS.has(w.id));
        if (realOnly.length !== parsed.length) {
          localStorage.setItem(WARNINGS_STORAGE_KEY, JSON.stringify(realOnly));
        }
        return realOnly;
      }
    }
  } catch (e) {
    console.error("Error reading stored deficiency warnings:", e);
  }
  return [];
}

export function saveStoredWarnings(warnings: DeficiencyWarning[]) {
  try {
    localStorage.setItem(WARNINGS_STORAGE_KEY, JSON.stringify(warnings));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("deficiency-warnings-updated"));
  } catch (e) {
    console.error("Error saving stored deficiency warnings:", e);
  }
}

export function addOrUpdateWarning(warning: Partial<DeficiencyWarning> & { assetId: string; assetName: string; assetTag: string; reason: string }): DeficiencyWarning {
  const current = getStoredWarnings();
  const existingIndex = current.findIndex(w => w.assetId === warning.assetId || w.assetTag === warning.assetTag || (warning.id && w.id === warning.id));

  const now = new Date().toISOString().replace("T", " ").substring(0, 16);
  const newRecord: DeficiencyWarning = {
    id: warning.id || `WARN-${Math.floor(1000 + Math.random() * 9000)}`,
    ticketId: warning.ticketId || `RET-${Math.floor(100000 + Math.random() * 900000)}`,
    assetId: warning.assetId,
    assetName: warning.assetName,
    assetTag: warning.assetTag,
    serialNumber: warning.serialNumber || "SN-RECORDED",
    category: warning.category || "Hardware / Equipment",
    userName: warning.userName || "Faculty Custodian",
    userEmail: warning.userEmail || "faculty@iiui.edu.pk",
    department: warning.department || "Academic Department",
    reason: warning.reason,
    issuedAt: warning.issuedAt || now,
    status: warning.status || "ACTIVE_NOTICE",
    managerNotes: warning.managerNotes,
    issuedBy: warning.issuedBy || "Central Warehouse Store Manager"
  };

  let updatedList: DeficiencyWarning[];
  if (existingIndex >= 0) {
    updatedList = [...current];
    updatedList[existingIndex] = { ...current[existingIndex], ...newRecord };
  } else {
    updatedList = [newRecord, ...current];
  }

  saveStoredWarnings(updatedList);
  return newRecord;
}

export function resolveWarning(
  assetIdOrTagOrId: string, 
  managerNotes?: string,
  clearanceDetails?: {
    clearanceType?: "FINE_PAID" | "PHYSICAL_JUSTIFICATION" | "ACCESSORIES_RETURNED" | "STORE_MANAGER_OVERRIDE";
    amountPaid?: string;
    receiptNumber?: string;
    resolvedBy?: string;
    adminNotes?: string;
  }
): boolean {
  const current = getStoredWarnings();
  let modified = false;
  const now = new Date().toISOString().replace("T", " ").substring(0, 16);

  const updatedList = current.map(w => {
    if (
      (w.id === assetIdOrTagOrId || w.assetId === assetIdOrTagOrId || w.assetTag === assetIdOrTagOrId || w.ticketId === assetIdOrTagOrId) &&
      w.status === "ACTIVE_NOTICE"
    ) {
      modified = true;
      return {
        ...w,
        status: "RESOLVED_CLEARED" as const,
        resolvedAt: now,
        managerNotes: managerNotes || w.managerNotes || "Deficiency notice resolved and cleared.",
        clearanceType: clearanceDetails?.clearanceType || w.clearanceType || "STORE_MANAGER_OVERRIDE",
        amountPaid: clearanceDetails?.amountPaid || w.amountPaid,
        receiptNumber: clearanceDetails?.receiptNumber || w.receiptNumber,
        resolvedBy: clearanceDetails?.resolvedBy || w.resolvedBy || "Central Administrator",
        adminNotes: clearanceDetails?.adminNotes || w.adminNotes || managerNotes
      };
    }
    return w;
  });

  if (modified) {
    saveStoredWarnings(updatedList);
  }
  return modified;
}

export function deleteWarning(id: string) {
  const current = getStoredWarnings();
  const updatedList = current.filter(w => w.id !== id && w.ticketId !== id);
  saveStoredWarnings(updatedList);
}
