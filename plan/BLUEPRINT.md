# IIUI Automated Issuance & Inventory Tracking System (AIITS) Blueprint

This document outlines the architectural blueprints, UX design principles, database models, smart notification logic, and structural layout of the **Automated Issuance & Inventory Tracking System (AIITS)** built for the International Islamic University Islamabad (IIUI) Campus.

---

## 1. System Overview & Tech Stack

AIITS is a full-stack, responsive web application engineered to regulate university property management, streamline faculty check-outs, model clearance risks via contract dates, and speed up the issuance/return workflow utilizing simulated hardware QR terminal inputs.

```
       ┌────────────────────────────────────────────────────────┐
       │                SECURE ENTERPRISE AUTH GATE             │
       │       (Strict Password Validation & Session Token)     │
       └───────────────────────────┬────────────────────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
┌───────────┐                ┌───────────┐                ┌───────────┐
│   ADMIN   │                │   STORE   │                │  FACULTY  │
│ DASHBOARD │                │  MANAGER  │                │ DASHBOARD │
└─────┬─────┘                └─────┬─────┘                └─────┬─────┘
      │                            │                            │
      ├────────────────────────────┴────────────────────────────┤
      ▼
┌───────────────────────────────────────────────────────────────┐
│                 CENTRAL DATA LEDGER STATE                    │
│   - Users      - Assets      - Issuances      - Alerts        │
│   - Suppliers  - NDC Forms   - Logs           - Notices       │
└──────────────────────────────┬────────────────────────────────┘
                               ▼
┌───────────────────────────────────────────────────────────────┐
│               SMART CRITICAL RISK PREDICTORS                  │
│       Rule-based engines scanning (Tenure Days Left <= 15)    │
│                              │                                │
│                              ▼                                │
│          [Server-Side Google GenAI Integration]               │
│          Generates customized professional notices            │
│                 utilizing real-world context                  │
└───────────────────────────────────────────────────────────────┘
```

### Full-Stack Architecture
*   **Frontend SPA**: React 19 with Vite 6. Built entirely using type-safe functional modular components.
*   **Backend Server**: Express custom server (`server.ts`) running Node.js 22 runtime environment serving compiled production static bundles cleanly.
*   **Module Compilation**: Production assets compiled to `dist/` with automated `esbuild` server compilation to CommonJS (`dist/server.cjs`) to ensure lightning-fast container startups and robust module path resolution.

---

## 2. Cosmic Slate Design Language

The application departs from standard gray layout cards, instead implementing a high-contrast futuristic **Cosmic Slate Theme** tailored for continuous administrative auditing terminals.

### Core Aesthetic Pillars
1.  **Immersive Background**: Grounded on a deep night dark tone (`#020617` / slate-955) combined with glassy blurred gradient glowing orbs (Blue and Emerald) drifting floatingly in the canvas container.
2.  **Backdrop Filter Panels (Glassmorphism)**: Content blocks utilize `bg-white/5` with a subtle blur `backdrop-blur-md` and safe high-contrast border limits (`border-white/10`) creating floating optical dimension sheets.
3.  **Refined Scrolling UI**: Heavy visual scroll trackbars are suppressed, replaced by thin glowing translucent sliders that vanish or light up during scroll activity.
4.  **Literal & Objective System Metrics**: Rejects technical telemetry clutter in margins. Visual elements remain clean, incorporating premium displays using high-quality SVG vector outlines from `lucide-react`.

---

## 3. Data Entities & State Interface (`/src/types.ts`)

The database architecture focuses on structured schema objects ensuring strict consistency during runtime mutations.

### User Contract
Identifies distinct permanent instructors, coordinators, store clerks, or visiting scientists.
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Hashed/stored secure password credential
  role: "Admin" | "Store Manager" | "Faculty" | "Visiting Faculty";
  department: string;
  facultyType: "Permanent" | "Visiting" | "N/A";
  contractEndDate: string | null; // Null indicates continuous regular tenure
  createdAt: string;
}
```

### Asset Record
Maintains critical tracking tag numbers, physical category, brand models, serial bounds, serial indices, and operational status.
```typescript
export interface Asset {
  id: string;
  assetTag: string;
  assetName: string;
  category: "Computing" | "Projectors" | "Lab Equipment" | "Printers" | "Office Furniture";
  serialNumber: string;
  purchaseDate: string;
  condition: "New" | "Good" | "Fair" | "Damaged" | "Repairing";
  status: "Available" | "Issued" | "Damaged" | "Retired";
  department: string;
  qrCode: string;
  createdAt: string;
}
```

### Allocation & Hand-back Ledger (Asset Issuance)
Ties physical catalog metrics against active borrowers representing signed custody agreements.
```typescript
export interface AssetIssuance {
  id: string;
  assetId: string;
  userId: string;
  issuedDate: string;
  returnDate: string;
  actualReturnDate: string | null;
  status: "Active" | "Returned" | "Overdue" | "Damaged";
  issuedBy: string;
}
```

### No Dues Certificate Clearance Request (NDC)
Triggers multi-step store manager reviews prior to faculty staff exit-interviews.
```typescript
export interface NDCRequest {
  id: string;
  userId: string;
  requestDate: string;
  status: "Pending" | "Approved" | "Rejected";
  remarks: string;
  approvedBy: string | null;
}
```

### Smart Flight Risk (Predictive Risk Entity)
Evaluated dynamically by cross-referencing expiring visiting agreements against pending unreturned custody hardware.
```typescript
export interface SmartAlert {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  department: string;
  facultyType: string;
  contractEndDate: string;
  daysRemaining: number;
  outstandingCount: number;
  outstandingAssets: Array<{
    id: string;
    assetId: string;
    assetName: string;
    assetTag: string;
    issuedDate: string;
    returnDate: string;
  }>;
  status: "Expired" | "Critical" | "Warning";
  riskLevel: "High" | "Medium";
  recommendation: string;
}
```

---

## 4. Operational Spaces & Workspaces

The system separates workflows according to specific user capabilities while offering a central review dashboard for immediate administrative oversight.

```
                  ┌──────────────────────────────┐
                  │      SECURITY PROFILES       │
                  └──────────────┬───────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   ADMIN ROLE     │    │   MANAGER ROLE   │    │   FACULTY ROLE   │
├──────────────────┤    ├──────────────────┤    ├──────────────────┤
│ - System Health  │    │ - Register Units │    │ - Holding Lists  │
│ - Global Audits  │    │ - Allocate Assets│    │ - Write NDC Req  │
│ - NDC Approve    │    │ - Returns Log    │    │ - Clearance Logs │
│ - Supplier Info  │    │ - QR Handheld Sim│    │ - System Notices │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

### A. The Logistics Workbench (`components/ManagerPanel.tsx`)
This workspace serves as the store's operations center, managing hardware enrollment and signed custodian handovers:
*   **Register Inventory Units**: Capture model, category, serial tags, purchase history, specific campus departments, and condition limits.
*   **Custody Handovers**: Interactive selector binds ready equipment with target faculty files, computing prescribed return deadlines.
*   **Logistics Return Sheets**: Clean table panels permit rapid returns or flagging damaged returns, returning hardware to available store inventory immediately.

### B. Smart Clearance Risk Core (`components/AIPredictionAlerts.tsx`)
Calculates contract dates against logistics spreadsheets, exposing risk scenarios:
*   **Automatic Risk Detection**: Labels accounts as "High" or "Medium" risk if contracts expire (within 15 days) while holding unreturned devices.
*   **Server-Side Gemini Integration**: Translates physical inventory and outstanding metrics into a customized, professional formal notification draft outlining precise return instructions.
*   **Transmission Queue**: Directly routes urgent return messages to the respective faculty member's notifications drawer.

### C. Handheld QR Terminal Scanner (`components/QRScannerModal.tsx`)
Implements a virtual diagnostic system simulating mobile hardware scans:
*   **Scan Box HUD Overlay**: Frame animations and guide laser bars simulate quick optical scans.
*   **Hardware Parsing Decoders**: Dynamic serial tag parameters parsing immediately extracts active owners, outstanding deadlines, physical conditions, and history.

### D. Faculty Compliance & NDC Intelligence Portal (`/src/pages/FacultyDashboard.tsx`)
Converts the basic clearance page into an enterprise-scale institutional accountability cockpit:
*   **Personal Asset Liability Panel**: High-contrast, interactive tables grouping custody laptop weights, classroom project equipment, and utilities with full-cycle horizontal timelines (Issuance checkpoints, return paths, and overdue flags).
*   **Compliance Status Engine**: Aggregates account standings into "CLEAR" (🟢), "WARNING" (🟡), and "NON-COMPLIANT" (🔴) states with dynamic risk score indexes, penalty breakdowns, and visual gauge trackers.
*   **Smart NDC Wizard workflow**: Facilitates a safe 5-step exit procedure:
    *   *Step 1: Automated Compliance Check* (validates liabilities)
    *   *Step 2: Verification Checklist* (inventory balances review)
    *   *Step 3: Administrative Declaration* (electronic legal sign-off signature)
    *   *Step 4: Transmit Record* (unlocked upon compliance, dispatches request to ledger)
    *   *Step 5: Administrative Settle Check Tracker* (tracks pending, approved, or rejected states)
*   **Digital Certificate Sovereign Print**: Verified clearances display a high-fidelity certified PDF docket complete with gold-themed styling, official watermarks, and registrar Sajid Mahmood's signature ready for local printing.
*   **Intel Notifications Hub**: Aggregates database messages and real-time custom deadline notices categorized into INFO, WARNING, and CRITICAL severity stripes.

### E. Analytics & Executive Reports (`components/ReportingModule.tsx`)
Enables quick audits of system distribution states:
*   **Distribution Matrix**: Provides visual overviews generated with `recharts` mapping category statistics.
*   **Audit Metrics Grid**: Highlights total campus acquisitions, active loans, faulty units, and pending clearances.

---

## 5. Security, Authentication & Build Workflows

### Secure Enterprise Authentication Model
To prevent unauthorized access, the custom Express engine strictly mandates authenticating user instances.
1. **Zero Silent Restore / No Saved Local Auto-Login**: Prevents automatic session restores or offline auto-login bypasses on browser session refresh. Users must provide valid email and password fields explicitly.
2. **Explicit User Registry & Password Hashing**: The `/api/auth/register` controller stores password credentials on registration. When storing and authenticating records, plain-text comparisons are disabled, and exact credential pairing is fetched directly from the database memory state.
3. **Strict DB-Sourced Role Mapping**: The system strictly maps standard credentials to their corresponding profiles. Once registered or signed in, the client state obtains the roles directly from DB records, preventing user-modified frontend role parameter attacks.
4. **Isolated Workspaces & Dashboards**: Dashboards enforce secure role filters. Admins see the general audits, managers work in logistics sheets, and teachers inspect assets. There are no UI bypass buttons, and direct URL routes enforce security boundaries.

### Secure Environment Declarations (`.env.example`)
All API keys must remain strictly hidden in backend context:
```env
# Server-side secrets
GEMINI_API_KEY=your_gemini_api_key_goes_here
```

### Automated Multi-Platform Production Build Script
```bash
# Clean previous build directories
npm run clean

# Package compile: Frontend Static Bundle -> dist/ && Backend Service TS -> dist/server.cjs
npm run build

# Start optimized Node launcher
npm run start
```
By bundling paths into a self-contained CJS bundle, the application is ready for secure hosting in production and development containers, maintaining structural integrity across the entire workspace.
