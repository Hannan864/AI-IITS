# IIUI Automated Issuance & Inventory Tracking System (AIITS)
## SaaS System Architecture & Engineering Specification

This document defines the complete production-grade system design, database architecture, multi-role workspace flows, custom component schema, and PWA strategies for the **IIUI Automated Issuance & Inventory Tracking System (AIITS)**. 

All specifications are architected under the strict **300-Line Limit Engineering Mandate** defined in `PROJECT_INSTRUCTIONS.md`.

---

## 1. Complete UI Architecture (Screen Specifications)

The IIUI AIITS interface is a multi-tenant client system providing isolated workspaces, sticky headers, and contextual active drawer states. It replaces monolithic interfaces with a decoupled, high-density dashboard shell.

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│ Global Top Bar: System Status Check (ONLINE) ║ Role Select Tool ║ Current User   │
├─────────────────┬─────────────────────────────────────────────────────────────────┤
│ Sidebar (20%)   │ Enterprise Workspace area (80%)                                 │
│                 │                                                                 │
│ 🔘 Fleet Overview│ ┌─────────────────────────────────────────────────────────────┐ │
│ 📦 Asset Catalog │ │ Screen Title (e.g., Inventory Ledger)                       │ │
│ 🔃 Issuance Flow │ ├─────────────────────────────────────────────────────────────┤ │
│ ⚡ Alerts Engine │ │ [Filters Sidebar: 3 Cols]  [Stripe DataTable Pane: 9 Cols]  │ │
│ 📁 NDC Drawer    │ │  - Status Select            - Sticky Header row             │ │
│ 📊 Analytics     │ │  - Category Radios          - Custom Badge Chips            │ │
│                 │ │  - Condition Checkbox       - Pagination Controls           │ │
│ ⚙ Config Engine │ │                                                             │ │
│                 │ └─────────────────────────────────────────────────────────────┘ │
└─────────────────┴─────────────────────────────────────────────────────────────────┘
```

### Screen Flow Matrix

#### A. Admin Terminal Hub
*   **KPI Indicator Layer**: Displays 4-Column stats grid tracking system status: Active Asset Capital Value ($), Net Allocation Ratio (%), High Flight Alerts count, and Unprocessed NDC Requests.
*   **Audit logs ledger**: Sticky header Stripe-style table mapping absolute system operations with exact UTC timestamps.
*   **NDC Verification Desk**: Multi-step workspace allowing one-click verification of outstanding holdings before signing exit clearances.

#### B. Store Manager Workbench
*   **Asset Catalog Registry**: Interactive inventory card grid paired with a step-based hardware enrollment modal.
*   **Direct Custody Issuance Form**: Sliding modal panel tracking step transitions to select the target asset, select the faculty recipient, and define the return parameters.
*   **Returns Operations Center**: Visual ledger displaying active issues, allowing quick check-ins, condition audits, and instant return clearances.

#### C. Faculty Clearance Panel
*   **Personal Allocation Desk**: High-contrast, read-only listings detailing all assigned equipment, remaining days, and condition tags.
*   **Locked NDC Submission Desk**: Self-locking portal. The "Request Clearance" action is status-disabled if any active custody records remain.
*   **Direct Notices Feed**: Chronological list of formal notifications and alert notices delivered by the alert system.

---

## 2. Modular React Component Structure

To prevent file size bloat and strictly follow the **Max 300 Lines Rule**, visual controls are decoupled into single-responsibility custom components.

```
src/
├── types.ts                     # Single point of truth for models (Max 100 lines)
├── App.tsx                      # Context router shell (Max 150 lines)
├── contexts/
│   ├── AuthContext.tsx          # JWT session handlers (Max 180 lines)
│   └── StateContext.tsx         # Central state store (Max 220 lines)
├── components/
│   ├── ui/
│   │   ├── GlassCard.tsx        # Base panel template wrapper (Max 50 lines)
│   │   ├── DataTable.tsx        # Generic premium paginated list (Max 180 lines)
│   │   ├── StatusBadge.tsx      # State chips manager (Max 50 lines)
│   │   └── ActionButton.tsx     # Custom tactile buttons (Max 50 lines)
│   ├── shared/
│   │   ├── Sidebar.tsx          # Responsive navigation (Max 120 lines)
│   │   └── Topbar.tsx           # Role management, status checks (Max 80 lines)
│   ├── inventory/
│   │   ├── AssetFilters.tsx     # Nested catalog widgets (Max 140 lines)
│   │   └── AssetDetailsDrawer.tsx # Slide-out detail drawer (Max 180 lines)
│   ├── tracking/
│   │   ├── IssuanceModal.tsx    # Step-based hand-out window (Max 210 lines)
│   │   └── ReturnProcessor.tsx  # Damaged checks panel (Max 160 lines)
│   ├── alerts/
│   │   ├── PredictionDesk.tsx   # Contract risk calculators (Max 190 lines)
│   │   └── NoticeComposer.tsx   # Server-side Gemini editor sheet (Max 140 lines)
│   └── ndc/
│       ├── ClearanceLock.tsx    # Faculty security check component (Max 120 lines)
│       └── AdminSignOff.tsx     # Admin ledger approvals (Max 150 lines)
└── hooks/
    ├── useScanner.ts            # Canvas QR decoder controllers (Max 110 lines)
    └── useOfflineSync.ts        # Service Worker buffers controller (Max 150 lines)
```

---

## 3. Tailwind Design System Tokens (Cosmic Slate Theme)

AIITS strictly implements the **Deep Cosmic Slate Theme** across all screens, utilizing custom design utility configurations.

### Color Tokens Map

```css
@theme {
  --color-cosmic-bg: #020617;          /* High-density deep midnight slate */
  --color-cosmic-card: rgba(15, 23, 42, 0.45); /* Glassmorphism transparent core */
  --color-cosmic-border: rgba(255, 255, 255, 0.08); /* Low contrast micro-glowing grid border */
  
  --color-accent-indigo: #6366f1;       /* Operational active actions, buttons, and focuses */
  --color-state-success: #10b981;       /* Active returns, optimized performance, clean clearances */
  --color-state-warning: #f59e0b;       /* Imminent contract expiration limits, fair wear */
  --color-state-danger: #f43f5e;        /* Assets overdue, broken gear, flagged high flight risks */
  
  --color-text-bright: #f8fafc;        /* Readability header strings, names, identifiers */
  --color-text-muted: #94a3b8;         /* Labels, subtext files descriptions, secondary rows */
}
```

### Visual Panel Constraints Implementation
*   **Micro-Glass Panels**: Class utility: `bg-cosmic-card border border-cosmic-border backdrop-blur-md rounded-xl select-none`.
*   **Tactile Hit Targets**: Minimum clickable action constraints: Height parameter `h-11` (44px) on mobile viewports.
*   **Horizontal Scroll Containers**: Scopes: `scrollbar-none overflow-x-auto -webkit-overflow-scrolling: touch`.

---

## 4. PostgreSQL Database Schema Specification

The physical schema is designed for multi-tenant isolation, data audit safety, and performance constraints.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          USERS TABLE (PK)                              │
│  - user_id (id)  - email (uniq)  - role  - faculty_type  - contract_end│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ 1
                                    │
                                    │ *
┌───────────────────────────────────▼────────────────────────────────────┐
│                    ASSET_ISSUANCES (Custody Ledger)                    │
│  - issuance_id (PK)  - user_id (FK)  - asset_id (FK)  - return_date    │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ *
                                    │
                                    │ 1
┌───────────────────────────────────┴────────────────────────────────────┐
│                          ASSETS TABLE (PK)                             │
│  - asset_id (PK)     - asset_tag (uniq)  - category  - condition       │
└────────────────────────────────────────────────────────────────────────┘
```

```sql
-- Core User Identities
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('Admin', 'Store Manager', 'Faculty', 'Visiting Faculty')),
    department VARCHAR(50) NOT NULL,
    faculty_type VARCHAR(25) NOT NULL CHECK (faculty_type IN ('Permanent', 'Visiting', 'N/A')),
    contract_end_date DATE, -- Null matches continuous regular tenure status
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Core Asset Catalog Ledger
CREATE TABLE assets (
    asset_id VARCHAR(50) PRIMARY KEY,
    asset_tag VARCHAR(30) UNIQUE NOT NULL,
    asset_name VARCHAR(120) NOT NULL,
    category VARCHAR(40) NOT NULL CHECK (category IN ('Computing', 'Projectors', 'Lab Equipment', 'Printers', 'Office Furniture')),
    serial_number VARCHAR(80) UNIQUE NOT NULL,
    purchase_date DATE NOT NULL,
    condition VARCHAR(25) NOT NULL CHECK (condition IN ('New', 'Good', 'Fair', 'Damaged')),
    status VARCHAR(25) NOT NULL CHECK (status IN ('Available', 'Issued', 'Damaged', 'Retired')),
    department VARCHAR(50) NOT NULL,
    qr_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Active Custody Allocation Tables
CREATE TABLE asset_issuances (
    issuance_id VARCHAR(50) PRIMARY KEY,
    asset_id VARCHAR(50) NOT NULL REFERENCES assets(asset_id) ON DELETE RESTRICT,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    issued_date DATE NOT NULL,
    return_date DATE NOT NULL,
    actual_return_date DATE, -- Is NULL until check-in execution
    status VARCHAR(25) NOT NULL CHECK (status IN ('Active', 'Returned', 'Overdue', 'Damaged')),
    issued_by VARCHAR(120) NOT NULL
);

-- Clearance Request Documents
CREATE TABLE ndc_requests (
    request_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(25) NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    remarks TEXT,
    approved_by VARCHAR(120)
);

-- Physical Index Filters for Rapid Auditing
CREATE INDEX idx_users_lookup ON users (email, role);
CREATE INDEX idx_assets_catalog ON assets (asset_tag, status);
CREATE INDEX idx_issuances_active ON asset_issuances (user_id) WHERE actual_return_date IS NULL;
CREATE INDEX idx_ndc_user_status ON ndc_requests (user_id, status);
```

---

## 5. System Workflow Diagrams

### A. Asset Lifecycle Workflow
```
    [ Enrollment ]
          │
          ▼
    [ Available ] ◄───────────────────────────┐
          │                                   │ (Return Check-in)
          ├─────────► [ Damaged/Repairs ]     │
          │                                   │
          ▼ (Issuance Hand-out)               │
     [ Issued ] ──────────────────────────────┘
          │
          ▼ (Overdue Check)
     [ Late Alert ]
```

### B. Smart Risk Prediction & Notification Workflow
```
[ Cron Evaluation Trigger ]
            │
            ▼
┌───────────────────────┐
│ Retrieve User Records │
└───────────┬───────────┘
            │
            ▼
┌──────────────────────────────────────────────┐
│ Criteria Match: Visiting & Active Custody?  │
└───────────────────────────┬──────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼ Yes                       ▼ No
┌───────────────────────────┐       ┌────────────┐
│ Check remaining contract  │       │ Terminate  │
└───┬───────────────────┬───┘       └────────────┘
    │                   │
    ▼ (Days <= 15)      ▼ (Days <= 7)
┌───────────────┐   ┌─────────────────┐
│ Status: Warn  │   │ Status: Critical│
│   (Medium)    │   │     (High)      │
└───────┬───────┘   └────────┬────────┘
        │                    │
        ▼                    ▼
┌─────────────────────────────────────────────┐
│ Lock Exit Clearance (NDC Disable)           │
│ Draft Automated Warning notice              │
└─────────────────────────────────────────────┘
```

---

## 6. PWA & Mobile Adaptation Strategy

AIITS targets seamless offline usage on handheld tracking devices:

### A. Core Architecture Specifications
*   **Workbox Cache Engine**: Caches layout bundle items (`index.html`, visual libraries, custom styling files) using an ultra-low latency **Stale-While-Revalidate** strategy.
*   **Local Action Store Queue**: Keeps return check-ins logged offline securely buffered inside browser local memory buckets:
```typescript
interface OfflineAction {
  actionId: string;
  actionType: "RETURN" | "ISSUE";
  payload: any;
  timestamp: string;
}
```
*   **Sync Reconnect Pipeline**: Registers standard online triggers to process queued events back to the primary database when connection is restored.

### B. Adaptive Design Principles
*   **Responsive Bottom Dock**: Collapses the administrative sidebar into highly tactile navigation items on screens below 768px:
```
  [ Dashboard ]  [ View Assets ]  [ Launch Scanner ]  [ Profile Clearance ]
```
*   **Optics Overlay Override**: Launching the scanner on mobile triggers a native hardware scan UI using the camera.

---

## 7. Code Examples (Key Modules)

### A. Smart Risk Evaluation Service Module (Max 140 lines)
```typescript
import { User, AssetIssuance, SmartAlert } from "../types";

/**
 * Calculates exit clearance risks for visiting faculty members.
 * Implements the 15-day warning rule and 7-day critical threshold.
 */
export function calculateAcademicRisk(
  user: User,
  issuances: AssetIssuance[],
  currentDate: Date = new Date()
): SmartAlert | null {
  // Guard clause: Checks if target borrower is subject to flight risk tracking
  if (user.role !== "Visiting Faculty" || !user.contractEndDate) {
    return null;
  }

  // Identifies active, unreturned custody items
  const outstandingIssues = issuances.filter(
    (issue) => issue.userId === user.id && !issue.actualReturnDate
  );

  if (outstandingIssues.length === 0) {
    return null;
  }

  const contractDate = new Date(user.contractEndDate);
  const timeDifferenceMs = contractDate.getTime() - currentDate.getTime();
  const daysRemaining = Math.ceil(timeDifferenceMs / (1000 * 60 * 60 * 24));

  // Skip risk warning calculations if user has safe remaining tenure
  if (daysRemaining > 15) {
    return null;
  }

  const isExpired = daysRemaining < 0;
  const isCritical = daysRemaining <= 7;

  let riskLevel: "High" | "Medium" = "Medium";
  let status: "Expired" | "Critical" | "Warning" = "Warning";
  let recommendation = "Initiate contact to coordinate standard handbacks.";

  if (isExpired) {
    riskLevel = "High";
    status = "Expired";
    recommendation = "CONTRACT EXPIRED. Forward immediately to administrative audit desks.";
  } else if (isCritical) {
    riskLevel = "High";
    status = "Critical";
    recommendation = "Lock NDC clearances and trigger direct return notices.";
  }

  return {
    id: `alert_${user.id}_${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    department: user.department,
    facultyType: user.facultyType,
    contractEndDate: user.contractEndDate,
    daysRemaining,
    outstandingCount: outstandingIssues.length,
    outstandingAssets: outstandingIssues.map((issue) => ({
      id: issue.id,
      assetId: issue.assetId,
      assetName: "Associated Hardware Target", // Enriched dynamically in client
      assetTag: "IIUI-TAG",
      issuedDate: issue.issuedDate,
      returnDate: issue.returnDate,
    })),
    status,
    riskLevel,
    recommendation,
  };
}
```

### B. Unified State Context Management Module (Max 190 lines)
```typescript
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Asset, AssetIssuance } from "../types";

interface AppState {
  users: User[];
  assets: Asset[];
  issuances: AssetIssuance[];
  syncPending: boolean;
  triggerLocalSync: (action: any) => Promise<boolean>;
}

const StateContext = createContext<AppState | undefined>(undefined);

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [issuances, setIssuances] = useState<AssetIssuance[]>([]);
  const [syncPending, setSyncPending] = useState(false);

  // Lazy initialize dataset from persisted storage
  useEffect(() => {
    const rawData = localStorage.getItem("aiits_state_ledger");
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        setUsers(parsed.users || []);
        setAssets(parsed.assets || []);
        setIssuances(parsed.issuances || []);
      } catch (e) {
        console.error("Local state parse error, fallback initiated", e);
      }
    }
  }, []);

  const triggerLocalSync = async (action: any): Promise<boolean> => {
    setSyncPending(true);
    // Simulate non-blocking API transport lag
    return new Promise((resolve) => {
      setTimeout(() => {
        setSyncPending(false);
        resolve(true);
      }, 800);
    });
  };

  return (
    <StateContext.Provider value={{ users, assets, issuances, syncPending, triggerLocalSync }}>
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useAppState must be executed nested inside StateProvider bounds.");
  }
  return context;
};
```

---
*End of IIUI AIITS Engineering Specification Document.*
