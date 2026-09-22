import React from "react";
import ManagerAuditTable from "../components/manager/ManagerAuditTable";

export default function WarehousePage({ assets, issuances }: any) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto py-1 animate-fade-in">
      <ManagerAuditTable assets={assets} issuances={issuances} />
    </div>
  );
}
