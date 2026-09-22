# CURRENT CODEBASE AUDIT
## IIUI Asset Core & AIITS Gateway

This report is a direct and fully verified audit of the active codebase workspace in the development and preview container context, as requested.

---

## 🏛️ 1. Directory Scan & Component Profiling

### 📂 Components: `/src/components/admin`

| Filename | Line Count | Exported Component Name(s) | Role & Governance Purpose |
| :--- | :--- | :--- | :--- |
| `AdminAuditLogs.tsx` | 164 | `AdminAuditLogs` (Default) | Immutable Forensic Log Stream & security filtering control desk |
| `AdminKPICards.tsx` | 154 | `AdminKPICards` (Default) | Core university inventory, checkout ratio, and risk KPI tracking widgets |
| `AdminRiskPanel.tsx` | 170 | `AdminRiskPanel` (Default) | Predictor index dashboard assessing custody breach probabilities |
| `AdminSystemHealth.tsx` | 116 | `AdminSystemHealth` (Default) | Live microservice monitor, reverse-proxy ingress status, and QR/database heartbeat trackers |
| `AssetLifecycleControl.tsx` | 219 | `AssetLifecycleControl` (Default) | Physical wear assessments, replacement advisory logs, and direct status toggles |
| `FacultyCompliancePanel.tsx` | 198 | `FacultyCompliancePanel` (Default) | Detailed list of faculty-wise holdings, risk-weights, and outstanding balances |
| `NDCControlEngine.tsx` | 187 | `NDCControlEngine` (Default) | Dynamic approval framework for No-Dues Exit Clearance certificates |
| `NdcClearancesTab.tsx` | 103 | `NdcClearancesTab` (Default) | Admin tabular NDC request clearance queue & compliance audit checker |
| `SupplierLedgerTab.tsx` | 150 | `SupplierLedgerTab` (Default) | Vendor ledger tracking hardware procurement streams and warranty origins |
| `UniversityGovernanceDashboard.tsx` | 864 | `UniversityGovernanceDashboard` (Default) | Executive balancing panel, department workload heatmaps, and total utilization scores |
| `UniversitySectorsTab.tsx` | 35 | `UniversitySectorsTab` (Default) | Visual registry log of active university divisions and administrative blocks |
| `UserAdmissionsTab.tsx` | 265 | `UserAdmissionsTab` (Default) | Secure credential manager and role enrollment workbench for newly registered users |

---

### 📂 Components: `/src/components/faculty`

| Filename | Line Count | Exported Component Name(s) | Role & Academic Standing Purpose |
| :--- | :--- | :--- | :--- |
| `AllocatedAssetsList.tsx` | 63 | `AllocatedAssetsList` (Default) | Personal computing device ledger card displaying active custody streams |
| `ClearanceLogsPanel.tsx` | 192 | `ClearanceLogsPanel` (Default) | Official printable clearance certificate viewer with custom V-C signature blocks |
| `ComplianceStatusPanel.tsx` | 314 | `ComplianceStatusPanel` (Default) | Comprehensive 4-Part weighted compliance score computation and standing card |
| `FacultyHeader.tsx` | 85 | `FacultyHeader` (Default) | Compact dashboard header for personnel reporting active liabilities & NDC standing |
| `HistoricReturnReceipts.tsx` | 58 | `HistoricReturnReceipts` (Default) | Historic ledger record of verified machine handbacks and formal receipts |
| `MyAssetsPanel.tsx` | 265 | `MyAssetsPanel` (Default) | Custody tracker segmented by category, complete with asset lifecycle decay drawers |
| `NdcClearanceDrawer.tsx` | 117 | `NdcClearanceDrawer` (Default) | Exit petition trigger interface displaying active compliance blockers |
| `NdcSteps.tsx` | 272 | `StepComplianceCheck`, `StepVerificationCheck`, `StepDeclaration`, `StepTransmit`, `StepAuditState` (Named) | Multi-stage modal workflow sections powering the exit clearance wizard |
| `NdcWizardWorkflow.tsx` | 206 | `NdcWizardWorkflow` (Default) | Multi-step interactive exit clearance petition workflow manager |
| `NotificationBoard.tsx` | 80 | `NotificationBoard` (Default) | Quick unread notification list and inline status check widgets |
| `NotificationFeed.tsx` | 204 | `NotificationFeed` (Default) | Full-screen compliance escalation notification stream with read state triggers |

---

### 📂 Components: `/src/components/manager`

| Filename | Line Count | Exported Component Name(s) | Role & Inventory Control Purpose |
| :--- | :--- | :--- | :--- |
| `AssignAssetTab.tsx` | 116 | `AssignAssetTab` (Default) | Interactive logistics allocator panel to issue equipment to specific faculty |
| `HardwareCatalogTab.tsx` | 291 | `HardwareCatalogTab` (Default) | Real-time asset register with dynamic search, addition form, and quick checkout triggers |
| `ManagerAuditTable.tsx` | 229 | `ManagerAuditTable` (Default) | Master search engine for custody tracking, filtered by condition and department |
| `ManagerKPICards.tsx` | 78 | `ManagerKPICards` (Default) | Quick counting dashboards tracking total, available, out-on-issue, and damaged stock |
| `ManagerKPICharts.tsx` | 127 | `ManagerKPICharts` (Default) | Multi-series bar chart visualizer representing device allocations across departments |
| `ReceiveHandbackTab.tsx` | 90 | `ReceiveHandbackTab` (Default) | Quick returned asset check-in processor for general store intake |

---

### 📂 Pages: `/src/pages`

| Filename | Line Count | Exported Component Name(s) | Primary Interface Responsibility |
| :--- | :--- | :--- | :--- |
| `AdminDashboard.tsx` | 161 | `AdminDashboard` (Default) | Global corporate asset standing view, critical risk trackers, and audit shortcuts |
| `InventoryPage.tsx` | 156 | `InventoryPage` (Default) | System catalog view hosting quick search and catalog modification modals |
| `IssuancePage.tsx` | 253 | `IssuancePage` (Default) | Linear logistics checkout workflow with contract limitations and auto-durations |
| `Login.tsx` | 143 | `Login` (Default) | High-contrast entry portal covering student/faculty role login & registration |
| `ManagerDashboard.tsx` | 244 | `ManagerDashboard` (Default) | Handback intakes, QR scanning launcher, and department allocation trends |
| `NDCPage.tsx` | 137 | `NDCPage` (Default) | Tabular registry of clearance requests displaying live status tags and check sheets |
| `ProfilePage.tsx` | 260 | `ProfilePage` (Default) | Personal parameter monitor and credential locker |
| `ReturnsPage.tsx` | 241 | `ReturnsPage` (Default) | Asset intake form recording check-in condition changes and compliance overrides |
| `RiskAlertsPage.tsx` | 203 | `RiskAlertsPage` (Default) | Sovereign list of forecast warnings and emergency manual warning transmitters |

---

## 🔢 2. Module Count Metrics

* **TOTAL ADMIN MODULES**: `12`
* **TOTAL FACULTY MODULES**: `11`
* **TOTAL MANAGER MODULES**: `6`

---

## 🗺️ 3. App Routing Registry (`App.tsx`)

The system routes user context navigation dynamically via `activeTab` states. Below is the registration of all **19 active routes** currently mapped inside `/src/App.tsx`:

### 👑 Admin Workspace Views
1. `admin-dashboard`
   * *Label/Title*: `Sovereign Asset Control HUD`
   * *Linked Component*: `<AdminDashboard />`
2. `admin-governance`
   * *Label/Title*: `University Governance & Compliance Desk`
   * *Linked Component*: `<UniversityGovernanceDashboard />`
3. `admin-assets`
   * *Label/Title*: `Oracle Lifecycle Register`
   * *Linked Component*: `<AssetLifecycleControl />`
4. `admin-compliance`
   * *Label/Title*: `Faculty Accountability Desk`
   * *Linked Component*: `<FacultyCompliancePanel />`
5. `admin-risk`
   * *Label/Title*: `Risk Predictor Index Engine`
   * *Linked Component*: `<AdminRiskPanel />`
6. `admin-ndc`
   * *Label/Title*: `Clearance Control Desk`
   * *Linked Component*: `<NDCControlEngine />`
7. `admin-audit`
   * *Label/Title*: `Immutable Forensic Log Stream`
   * *Linked Component*: `<AdminAuditLogs />`
8. `admin-health`
   * *Label/Title*: `System Diagnostic Monitor`
   * *Linked Component*: `<AdminSystemHealth />`

### 📦 Store Manager Workspace Views
9. `manager-dashboard`
   * *Label/Title*: `Store Command Hub`
   * *Linked Component*: `<ManagerDashboard />`
10. `manager-inventory`
    * *Label/Title*: `Asset Placement Ledger`
    * *Linked Component*: `<InventoryPage />`
11. `manager-checkout`
    * *Label/Title*: `Logistics Allocator`
    * *Linked Component*: `<IssuancePage />`
12. `manager-returns`
    * *Label/Title*: `Returns Intake Desk`
    * *Linked Component*: `<ReturnsPage />`
13. `manager-alerts`
    * *Label/Title*: `Risk Forecasting Predictor`
    * *Linked Component*: `<RiskAlertsPage />`

### 🎓 Academic Faculty Workspace Views
14. `faculty-liabilities`
    * *Label/Title*: `Assigned Liabilities Control`
    * *Linked Component*: `<MyAssetsPanel />`
15. `faculty-compliance`
    * *Label/Title*: `Clearance Compliance Index`
    * *Linked Component*: `<ComplianceStatusPanel />`
16. `faculty-ndc`
    * *Label/Title*: `Exit Request Wizard`
    * *Linked Component*: `<NdcWizardWorkflow />`
17. `faculty-notifications`
    * *Label/Title*: `Intel Advisory Alerts`
    * *Linked Component*: `<NotificationFeed />`
18. `faculty-history`
    * *Label/Title*: `Clearance Logs Certifications`
    * *Linked Component*: `<ClearanceLogsPanel />`

### 👤 Profile View (All Roles)
19. `profile`
    * *Label/Title*: `Secured Credentials Locker`
    * *Linked Component*: `<ProfilePage />`

---
*Report fully authenticated and synchronized with the workspace file system.*
