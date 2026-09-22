import React from 'react';
import AdminDashboard from "../pages/AdminDashboard";
import UniversityGovernanceDashboard from "../components/admin/UniversityGovernanceDashboard";
import AssetLifecycleControl from "../components/admin/AssetLifecycleControl";
import FacultyCompliancePanel from "../components/admin/FacultyCompliancePanel";
import AdminRiskPanel from "../components/admin/AdminRiskPanel";
import NDCControlEngine from "../components/admin/NDCControlEngine";
import AdminAuditLogs from "../components/admin/AdminAuditLogs";
import AdminSystemHealth from "../components/admin/AdminSystemHealth";
import AdminDeficiencyClearanceDesk from "../components/admin/AdminDeficiencyClearanceDesk";
import RoleLayout from "../layouts/RoleLayout";

// 7 New QR Management Pages
import QRGeneratorPage from "../pages/qr/QRGeneratorPage";
import QRRegistryPage from "../pages/qr/QRRegistryPage";
import QRPrintCenterPage from "../pages/qr/QRPrintCenterPage";
import AssetBindingCenterPage from "../pages/qr/AssetBindingCenterPage";
import QRScannerDeskPage from "../pages/qr/QRScannerDeskPage";
import ReturnVerificationPage from "../pages/qr/ReturnVerificationPage";
import QRAuditTrailPage from "../pages/qr/QRAuditTrailPage";
import WarehousePage from "../pages/WarehousePage";

export default function AdminRoleRouter({ currentUser, activeTab, setActiveTab, assets, issuances, alerts, users, ndcRequests, updateAsset, deleteAsset, approveNDC, refreshAll, returnAsset, deleteUser }: any) {
  return (
    <>
      {activeTab === "admin-dashboard" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Admin"]}>
          <AdminDashboard assets={assets} issuances={issuances} alerts={alerts} onNavigateToRisk={() => setActiveTab("admin-risk")} />
        </RoleLayout>
      )}
      {activeTab === "admin-governance" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Admin"]}>
          <UniversityGovernanceDashboard assets={assets} users={users} issuances={issuances} ndcRequests={ndcRequests} onRefresh={refreshAll} />
        </RoleLayout>
      )}
      {activeTab === "admin-assets" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Admin"]}>
          <AssetLifecycleControl assets={assets} issuances={issuances} users={users} onUpdateAsset={updateAsset} onDeleteAsset={deleteAsset} />
        </RoleLayout>
      )}
      {activeTab === "admin-compliance" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Admin"]}>
          <FacultyCompliancePanel users={users} issuances={issuances} />
        </RoleLayout>
      )}
      {activeTab === "admin-risk" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Admin"]}>
          <AdminRiskPanel users={users} issuances={issuances} alerts={alerts} />
        </RoleLayout>
      )}
      {activeTab === "admin-ndc" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Admin"]}>
          <NDCControlEngine ndcRequests={ndcRequests} issuances={issuances} users={users} onApproveNDC={approveNDC} currentUser={currentUser} />
        </RoleLayout>
      )}
      {activeTab === "admin-audit" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Admin"]}>
          <AdminAuditLogs assets={assets} issuances={issuances} ndcRequests={ndcRequests} users={users} />
        </RoleLayout>
      )}
      {activeTab === "admin-deficiencies" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Admin"]}>
          <AdminDeficiencyClearanceDesk 
            currentUser={currentUser}
            assets={assets} 
            users={users} 
            returnAsset={returnAsset} 
            onRefresh={refreshAll} 
          />
        </RoleLayout>
      )}
      {activeTab === "admin-health" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Admin"]}>
          <AdminSystemHealth onRefresh={refreshAll} users={users} onDeleteUser={deleteUser} />
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
          <ReturnVerificationPage assets={assets} issuances={issuances} returnAsset={returnAsset} refreshAll={refreshAll} />
        </RoleLayout>
      )}
      {activeTab === "qr-audit-trail" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Admin", "Store Manager"]}>
          <QRAuditTrailPage assets={assets} />
        </RoleLayout>
      )}
      {activeTab === "warehouse" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Admin", "Store Manager"]}>
          <WarehousePage assets={assets} issuances={issuances} />
        </RoleLayout>
      )}
    </>
  );
}
