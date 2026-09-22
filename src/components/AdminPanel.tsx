import React, { useState } from "react";
import { 
  Users, 
  Truck, 
  FileCheck2, 
  Building2
} from "lucide-react";
import { User, Supplier, NDCRequest, Asset } from "../types";
import UserAdmissionsTab from "./admin/UserAdmissionsTab";
import NdcClearancesTab from "./admin/NdcClearancesTab";
import SupplierLedgerTab from "./admin/SupplierLedgerTab";
import UniversitySectorsTab from "./admin/UniversitySectorsTab";

interface AdminPanelProps {
  users: User[];
  suppliers: Supplier[];
  ndcRequests: NDCRequest[];
  departments: string[];
  assets: Asset[];
  onAddUser: (user: Partial<User>) => Promise<boolean>;
  onDeleteUser?: (id: string) => Promise<boolean>;
  onAddSupplier: (supplier: Partial<Supplier>) => Promise<boolean>;
  onApproveNDC: (requestId: string, status: "Approved" | "Rejected") => Promise<boolean>;
  onDeleteAsset: (assetId: string) => Promise<boolean>;
}

export default function AdminPanel({
  users,
  suppliers,
  ndcRequests,
  departments,
  assets,
  onAddUser,
  onDeleteUser,
  onAddSupplier,
  onApproveNDC,
}: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<"users" | "ndc" | "suppliers" | "departments">("users");

  return (
    <div className="space-y-6">
      {/* Tab select header */}
      <div className="flex border-b border-gray-100 bg-gray-50/50 p-1 rounded-xl selection:bg-indigo-500/10">
        <button
          onClick={() => setActiveSubTab("users")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === "users" ? "bg-white text-indigo-650 shadow-xs" : "text-gray-500 hover:text-gray-950"
          }`}
        >
          <Users className="h-4 w-4" />
          User Admissions
        </button>
        <button
          onClick={() => setActiveSubTab("ndc")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === "ndc" ? "bg-white text-indigo-650 shadow-xs" : "text-gray-500 hover:text-gray-950"
          }`}
        >
          <FileCheck2 className="h-4 w-4" />
          NDC Clearances ({ndcRequests.filter((r) => r.status === "Pending").length})
        </button>
        <button
          onClick={() => setActiveSubTab("suppliers")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === "suppliers" ? "bg-white text-indigo-650 shadow-xs" : "text-gray-500 hover:text-gray-950"
          }`}
        >
          <Truck className="h-4 w-4" />
          Supplier Ledger
        </button>
        <button
          onClick={() => setActiveSubTab("departments")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === "departments" ? "bg-white text-indigo-650 shadow-xs" : "text-gray-500 hover:text-gray-950"
          }`}
        >
          <Building2 className="h-4 w-4" />
          University Sectors
        </button>
      </div>

      {activeSubTab === "users" && (
        <UserAdmissionsTab
          users={users}
          departments={departments}
          onAddUser={onAddUser}
          onDeleteUser={onDeleteUser}
        />
      )}

      {activeSubTab === "ndc" && (
        <NdcClearancesTab
          ndcRequests={ndcRequests}
          assets={assets}
          onApproveNDC={onApproveNDC}
        />
      )}

      {activeSubTab === "suppliers" && (
        <SupplierLedgerTab
          suppliers={suppliers}
          onAddSupplier={onAddSupplier}
        />
      )}

      {activeSubTab === "departments" && (
        <UniversitySectorsTab
          departments={departments}
        />
      )}
    </div>
  );
}
