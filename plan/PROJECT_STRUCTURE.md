# PROJECT_STRUCTURE.md

## Unified Asset Intelligence & Faculty Clearance Architecture (IIUI-AIITS)
This document provides a comprehensive technical overview and visual directory map of the **IIUI Asset Core & AIITS Gateway**. The workspace is structured as a full-stack, module-separated enterprise dashboard utilizing React, Vite, Tailwind CSS, and lightweight JSON/REST server endpoints (`server.ts` / `db.json`) to persist and manage University hardware stock, faculty liabilities, proactive risk alerts, and Exit Clearance Certificates (Non-Device Clearance / NDC requests).

---

## 📂 Visual Directory Tree

```text
/ (Project Root)
├── .env.example                # Sample environment configuration file
├── .gitignore                  # Visual assets, build, and module skip profiles
├── db.json                     # Ground-truth local database store (assets, issuances, NDCs, logs)
├── index.html                  # Core HTML5 container entry point
├── metadata.json               # Sandbox workspace metadata and requested frame permissions
├── package.json                # Server-side & client-side dependencies and running task commands
├── PROJECT_STRUCTURE.md        # [This File] Master architectural and codebase reference index
├── server.ts                   # Express & Vite Middlewares REST API controller (Port 3000)
├── tsconfig.json               # Type system static compiler configurations
├── vite.config.ts              # Vite asset bundler configuration and plugins setup
│
├── 📂 assets                   # Stationary branding assets, blueprints, and diagrams
│
└── 📂 src                      # Master Application Source Code directory
    ├── App.tsx                 # Core Router-State Orchestrator & Multi-Role Tab Switchboard
    ├── index.css               # Global theme declarations, Tailwind CSS custom layers
    ├── main.tsx                # Client-Side DOM React mounting anchor
    ├── types.ts                # Strong-typed TypeScript interface declarations (Asset, User, NDC)
    │
    ├── 📂 data
    │   └── data.ts             # Initial master database seed datasets
    │
    ├── 📂 hooks
    │   ├── useAssets.ts        # Operations and transaction reducer (Issues, Returns, NDC requests)
    │   └── useAuth.ts          # State system tracking logged-in User authentication sessions
    │
    ├── 📂 layouts
    │   ├── AppLayout.tsx       # Structural layout providing Topbar and Sidebar layout grids
    │   └── RoleLayout.tsx      # Strict JWT-less route protector matching user roles
    │
    ├── 📂 pages
    │   ├── AdminDashboard.tsx  # Sovereign Command Center viewport for high-level statistics
    │   ├── InventoryPage.tsx   # Master registers viewport for hardware, tools, and categories
    │   ├── IssuancePage.tsx    # Equipment allocation check-out interface wizard
    │   ├── Login.tsx           # Secured system gateway gate and registration module
    │   ├── ManagerDashboard.tsx# Store controller operational center with fast scanning sim
    │   ├── NDCPage.tsx         # Unified NDC status indicator
    │   ├── ProfilePage.tsx     # Session user credentials inspection view
    │   ├── ReturnsPage.tsx     # Intake desk return checklists
    │   └── RiskAlertsPage.tsx  # Proactive maintenance forecasting visualizer
    │
    └── 📂 components           # System Component Directory
        ├── GlassCard.tsx       # Translucent design card element wrapper
        ├── ActionButton.tsx    # Standardized system action touch target
        ├── Sidebar.tsx         # Role-aware dynamic left navigation sidebar
        ├── Topbar.tsx          # Current system time, session user tags, and activity banners
        ├── StatusBadge.tsx     # Adaptive lookup color tags (Available, Issued, Overdue, etc.)
        ├── QRScannerModal.tsx  # Simulated web-cam camera and optical barcode hardware laser
        │
        ├── 📂 admin            # Administrative Sovereign Controls
        │   ├── AdminAuditLogs.tsx       # Immutable system event action forensic log stream
        │   ├── AdminKPICards.tsx        # High-level total assets, compliance values, risks indicators
        │   ├── AdminRiskPanel.tsx       # Faculty non-compliance risk metrics dashboard
        │   ├── AdminSystemHealth.tsx    # Server memory, response indicators, diagnostic gauges
        │   ├── AssetLifecycleControl.tsx# Full lifecycle edit, retire, and update control panel
        │   ├── FacultyCompliancePanel.tsx# Heatmap matrix of compliance statuses
        │   ├── NDCControlEngine.tsx     # Certificate approval terminal for exits and clearances
        │   ├── NdcClearancesTab.tsx     # Active department clearance queues helper
        │   ├── SupplierLedgerTab.tsx    # Warehouse supplier and contract registers
        │   ├── UniversitySectorsTab.tsx # Campus zones, labs, and layout maps
        │   └── UserAdmissionsTab.tsx    # Multi-role faculty admissions profile ledger
        │
        └── 📂 faculty          # Academic Faculty Compliance & Self-Service Views
            ├── AllocatedAssetsList.tsx  # Active device custody check logs
            ├── ClearanceLogsPanel.tsx   # Exit clearance certificate logs and active NDCs
            ├── ComplianceStatusPanel.tsx# Real-time accountability score and risk status meters
            ├── FacultyHeader.tsx        # Dynamic banner warning cards for nearing deadlines
            ├── HistoricReturnReceipts.tsx# Signed virtual returns certificates and archive keys
            ├── MyAssetsPanel.tsx        # Individual liability management block
            ├── NdcClearanceDrawer.tsx   # Detailed checkout drawer showing specific checklists
            ├── NdcSteps.tsx             # Interactive wizard timeline showing sign-off stages
            ├── NdcWizardWorkflow.tsx    # Interactive clearout application trigger drawer
            ├── NotificationBoard.tsx    # Inline critical system warnings and reminders
            └── NotificationFeed.tsx     # Alerts history panel sorting unread alerts
```

---

## 🛠️ System Architectures & Role-Based Flow Design

The codebase strictly routes screens and state based on the logged-in User's role (`Admin`, `Store Manager`, or `Faculty` / `Visiting Faculty`):

```text
               +----------------------------------------+
               |               Secured Login            |
               +----------------------------------------+
                                   |
                                   v
             [App.tsx Orchestrator: Switch active roles Tab]
                                   |
         +-------------------------+-------------------------+
         |                         |                         |
         v                         v                         v
  +--------------+          +---------------+          +-----------+
  |  ADMIN ROLE  |          | STORE MANAGER |          |  FACULTY  |
  +--------------+          +---------------+          +-----------+
  | - System HUD |          | - Checkouts   |          | - My NDC  |
  | - Health Mon |          | - Intake Ret  |          | - My Debt |
  | - Clearances |          | - Alerts desk |          | - Alert   |
  | - Audit Log  |          | - Inventory   |          | - History |
  +--------------+          +---------------+          +-----------+
```

### 1. The Sovereign Admin Workspace (`/src/components/admin`)
Designed to oversee complete university operational compliance. 
- **`AdminSystemHealth`**: Visualizes CPU load, memory utilization, API latencies, and microservices readiness using modern analytical gauges.
- **`NDCControlEngine`**: Displays a robust approval queue where administrators can click to verify if a departing/retiring faculty member has turned in all physical devices before auto-generating a secure stamp-approved exit Non-Device Clearance Certificate.
- **`AssetLifecycleControl` & `AdminAuditLogs`**: Provides real-time query engines on every database schema transaction, including additions, returns, status changes, and clearance updates.

### 2. Store Manager Logistics Center (`/src/pages` & `/src/components/manager`)
The logistics backbone of the warehouse.
- **Simulated QR Scan Desk**: Leverages `/api/qr/:tag` endpoints to load asset records, and lets managers trigger rapid "One-Click Returns" or initiate "Allocation Checkouts" with a simulated virtual laser.
- **`ManagerKPICharts`**: Employs `recharts` responsive grids to compute inventory allocations across campus computer science, engineering, and mathematics departments, visualizing data in high-density graphs.

### 3. Professional Faculty Clearance Wizard (`/src/components/faculty`)
The self-service panel designed for professors and visiting staff.
- **`FacultyHeader`**: Computes liability compliance in red/amber alerts depending on how many assigned assets are overdue or nearing contract expiration dates.
- **`NdcWizardWorkflow`**: Guarantees visiting professors can track real-time visual progress of departmental clear-outs, allowing them to instantly file request notes to release their hold when starting an academic migration.

---

## 💾 Core State Management & Data Flow Architecture

- **`useAssets.ts`**: Holds the unified React state and acts as the CRUD proxy. All updates are seamlessly piped to the backing JSON database, triggering immediate data synchronization across the client browser session.
- **`types.ts`**: Standardizes system data structures:
  ```typescript
  export interface Asset {
    id: string;
    assetTag: string;      // Unique Barcode Value
    assetName: string;
    category: string;
    serialNumber: string;
    department: string;
    status: "Available" | "Issued" | "Damaged" | "Retired";
    condition: "New" | "Good" | "Fair" | "Damaged" | "Repairing";
  }
  ```

---

*Compiled by the AIITS Core Engineering Office — June 2026*
