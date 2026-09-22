import React from 'react';
import FacultyHeader from "../components/faculty/FacultyHeader";
import MyAssetsPanel from "../components/faculty/MyAssetsPanel";
import ComplianceStatusPanel from "../components/faculty/ComplianceStatusPanel";
import NdcWizardWorkflow from "../components/faculty/NdcWizardWorkflow";
import NotificationFeed from "../components/faculty/NotificationFeed";
import ClearanceLogsPanel from "../components/faculty/ClearanceLogsPanel";
import FacultyReturnPortal from "../components/faculty/FacultyReturnPortal";
import ActiveReturnVerificationPage from "../components/faculty/ActiveReturnVerificationPage";
import RoleLayout from "../layouts/RoleLayout";

export default function FacultyRoleRouter({ currentUser, activeTab, setActiveTab, assets, issuances, ndcRequests, notifications, requestNDC, markNotificationRead, returnAsset, refreshAll }: any) {
  const todayStr = new Date().toISOString().split("T")[0];
  return (
    <>
      {activeTab === "faculty-liabilities" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Faculty", "Visiting Faculty"]}>
          <div className="space-y-6">
            <FacultyHeader currentUser={currentUser} issuances={issuances} ndcRequests={ndcRequests} />
            <MyAssetsPanel assets={assets} myActiveIssuances={issuances.filter((i: any) => i.userId === currentUser.id && i.actualReturnDate === null)} todayStr={todayStr} />
          </div>
        </RoleLayout>
      )}
      {activeTab === "faculty-compliance" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Faculty", "Visiting Faculty"]}>
          <div className="space-y-6">
            <FacultyHeader currentUser={currentUser} issuances={issuances} ndcRequests={ndcRequests} />
            <ComplianceStatusPanel currentUser={currentUser} assets={assets} myActiveIssuances={issuances.filter((i: any) => i.userId === currentUser.id && i.actualReturnDate === null)} todayStr={todayStr} allMyIssuances={issuances.filter((i: any) => i.userId === currentUser.id)} myNdcRequests={ndcRequests.filter((r: any) => r.userId === currentUser.id)} />
          </div>
        </RoleLayout>
      )}
      {activeTab === "faculty-return-portal" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Faculty", "Visiting Faculty"]}>
          <div className="space-y-6">
            <FacultyHeader currentUser={currentUser} issuances={issuances} ndcRequests={ndcRequests} />
            <FacultyReturnPortal currentUser={currentUser} assets={assets} myActiveIssuances={issuances.filter((i: any) => i.userId === currentUser.id && i.actualReturnDate === null)} onNavigateToActivePasses={() => setActiveTab("faculty-active-returns")} />
          </div>
        </RoleLayout>
      )}
      {activeTab === "faculty-active-returns" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Faculty", "Visiting Faculty"]}>
          <div className="space-y-6">
            <FacultyHeader currentUser={currentUser} issuances={issuances} ndcRequests={ndcRequests} />
            <ActiveReturnVerificationPage currentUser={currentUser} assets={assets} onNavigateToReturnPortal={() => setActiveTab("faculty-return-portal")} returnAsset={returnAsset} refreshAll={refreshAll} />
          </div>
        </RoleLayout>
      )}
      {activeTab === "faculty-ndc" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Faculty", "Visiting Faculty"]}>
          <div className="space-y-6">
            <FacultyHeader currentUser={currentUser} issuances={issuances} ndcRequests={ndcRequests} />
            <NdcWizardWorkflow currentUser={currentUser} assets={assets} myActiveIssuances={issuances.filter((i: any) => i.userId === currentUser.id && i.actualReturnDate === null)} myNdcRequests={ndcRequests.filter((r: any) => r.userId === currentUser.id)} onRequestNDC={requestNDC} onNavigateToReturnPortal={() => setActiveTab("faculty-return-portal")} />
          </div>
        </RoleLayout>
      )}
      {activeTab === "faculty-notifications" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Faculty", "Visiting Faculty"]}>
          <div className="space-y-6">
            <FacultyHeader currentUser={currentUser} issuances={issuances} ndcRequests={ndcRequests} />
            <NotificationFeed myNotifications={notifications.filter((n: any) => n.userId === currentUser.id)} myActiveIssuances={issuances.filter((i: any) => i.userId === currentUser.id && i.actualReturnDate === null)} assets={assets} todayStr={todayStr} onMarkNotificationRead={markNotificationRead} />
          </div>
        </RoleLayout>
      )}
      {activeTab === "faculty-history" && (
        <RoleLayout currentUser={currentUser} allowedRoles={["Faculty", "Visiting Faculty"]}>
          <div className="space-y-6">
            <FacultyHeader currentUser={currentUser} issuances={issuances} ndcRequests={ndcRequests} />
            <ClearanceLogsPanel currentUser={currentUser} myNdcRequests={ndcRequests.filter((r: any) => r.userId === currentUser.id)} />
          </div>
        </RoleLayout>
      )}
    </>
  );
}
