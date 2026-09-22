import React from 'react';
import ManagerDashboard from "../pages/ManagerDashboard";
import InventoryPage from "../pages/InventoryPage";
import IssuancePage from "../pages/IssuancePage";
import ReturnTriageDesk from "../components/manager/ReturnTriageDesk";
import RiskAlertsPage from "../pages/RiskAlertsPage";
import RoleLayout from "../layouts/RoleLayout";

// The 7 QR Management Sub-Pages
import QRGeneratorPage from "../pages/qr/QRGeneratorPage";
import QRRegistryPage from "../pages/qr/QRRegistryPage";
import QRPrintCenterPage from "../pages/qr/QRPrintCenterPage";
import AssetBindingCenterPage from "../pages/qr/AssetBindingCenterPage";
import QRScannerDeskPage from "../pages/qr/QRScannerDeskPage";
import ReturnVerificationPage from "../pages/qr/ReturnVerificationPage";
import QRAuditTrailPage from "../pages/qr/QRAuditTrailPage";
import WarehousePage from "../pages/WarehousePage";

export default function ManagerRoleRouter({ currentUser, activeTab, setActiveTab, assets, issuances, alerts, users, setIsScannerOpen, addAsset, updateAsset, deleteAsset, issueAsset, returnAsset, transmitNotification, refreshAll }: any) {
  return (
    <>
      {activeTab === "manager-dashboard" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Store Manager"]}>
          <ManagerDashboard assets={assets} issuances={issuances} onOpenScanner={() => setIsScannerOpen(true)} onNavigateToRegister={() => setActiveTab("manager-inventory")} onNavigateToIssue={() => setActiveTab("manager-checkout")} onRefresh={refreshAll} />
        </RoleLayout>
      )}
      {activeTab === "manager-inventory" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Store Manager"]}>
          <InventoryPage
            assets={assets}
            issuances={issuances}
            users={users}
            onAddAsset={addAsset}
            onUpdateStatus={(id, s, c) => updateAsset(id, { status: s as any, condition: c as any })}
            onDeleteAsset={deleteAsset}
            isAdmin={false}
          />
        </RoleLayout>
      )}
      {activeTab === "manager-checkout" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Store Manager"]}>
          <IssuancePage assets={assets} users={users.filter((u: any) => u.role === "Faculty" || u.role === "Visiting Faculty")} onIssueAsset={issueAsset} currentUser={currentUser} />
        </RoleLayout>
      )}
      {activeTab === "warehouse" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Store Manager"]}>
          <WarehousePage assets={assets} issuances={issuances} />
        </RoleLayout>
      )}
      {activeTab === "manager-returns" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Store Manager"]}>
          <ReturnTriageDesk assets={assets} issuances={issuances} onReturnAsset={returnAsset} />
        </RoleLayout>
      )}
      {activeTab === "manager-alerts" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Store Manager"]}>
          <RiskAlertsPage alerts={alerts} onTransmitNotification={transmitNotification} onRefresh={refreshAll} />
        </RoleLayout>
      )}

      {/* QR Management Mappings */}
      {activeTab === "qr-generator" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Admin", "Store Manager"]}>
          <QRGeneratorPage refreshAll={refreshAll} onNavigateToRegistry={(tag) => { setActiveTab("qr-registry"); setTimeout(() => window.dispatchEvent(new CustomEvent('highlight-qr', { detail: tag })), 100); }} />
        </RoleLayout>
      )}
      {activeTab === "qr-registry" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Admin", "Store Manager"]}>
          <QRRegistryPage assets={assets} refreshAll={refreshAll} />
        </RoleLayout>
      )}
      {activeTab === "qr-print-center" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Admin", "Store Manager"]}>
          <QRPrintCenterPage assets={assets} refreshAll={refreshAll} />
        </RoleLayout>
      )}
      {activeTab === "asset-binding-center" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Admin", "Store Manager"]}>
          <AssetBindingCenterPage assets={assets} refreshAll={refreshAll} />
        </RoleLayout>
      )}
      {activeTab === "qr-scanner-desk" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Admin", "Store Manager"]}>
          <QRScannerDeskPage assets={assets} refreshAll={refreshAll} />
        </RoleLayout>
      )}
      {activeTab === "return-verification" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Admin", "Store Manager"]}>
          <ReturnVerificationPage assets={assets} issuances={issuances} users={users} returnAsset={returnAsset} refreshAll={refreshAll} />
        </RoleLayout>
      )}
      {activeTab === "qr-audit-trail" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Admin", "Store Manager"]}>
          <QRAuditTrailPage assets={assets} />
        </RoleLayout>
      )}
    </>
  );
}
