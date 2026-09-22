# 03. Three-Tier System Architecture
**Automated Inventory Issuance and Tracking System (AIITS)**
*International Islamic University Islamabad (IIUI)*

---

## 1. Architectural Overview
The AIITS system strictly adheres to the classical **Three-Tier Architectural Pattern** as mandated by the Senior Design Project specification. This guarantees clean separation of concerns, high maintainability, independent scalability, and rock-solid enterprise security.

```
+-----------------------------------------------------------------------------------+
|                            TIER 1: PRESENTATION LAYER                             |
|                                                                                   |
|   +---------------------------------------+   +-------------------------------+   |
|   |          Desktop Web Portal           |   |       Mobile Client PWA       |   |
|   |  - Admin Governance & Audits HUD      |   |  - Faculty Self-Service       |   |
|   |  - Store Manager Logistics Center     |   |  - Mobile Camera QR Scanner   |   |
|   |  - Printable QR Sticker Spooler       |   |  - Exit Clearance Wizard      |   |
|   +---------------------------------------+   +-------------------------------+   |
|         React 18 • TypeScript • Tailwind CSS • Lucide Icons • Socket.IO Client    |
+-----------------------------------------+-----------------------------------------+
                                          |
                        HTTPS / JSON REST APIs / WebSockets
                                          |
+-----------------------------------------v-----------------------------------------+
|                            TIER 2: APPLICATION LAYER                              |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |                 Express.js REST & Real-time Server (Node.js)              |   |
|   |  - Auth Middleware & RBAC Interceptors (Admin / Manager / Faculty)        |   |
|   |  - Asset Allocation & Handover Validation Pipeline                        |   |
|   |  - Smart Clearance Prediction Engine (15-Day Contract Expiry Countdown)   |   |
|   |  - No Demand Certificate (NDC) Verification & Sign-off State Machine      |   |
|   |  - Serialized QR Code Registry & Print Spooler Service                    |   |
|   |  - Gemini AI Recovery Notice Document Generator Engine                    |   |
|   |  - Internal Comms & Event Notification Dispatcher                         |   |
|   +---------------------------------------------------------------------------+   |
+-----------------------------------------+-----------------------------------------+
                                          |
                   Prepared SQL Queries & Foreign Key Enforcement
                                          |
+-----------------------------------------v-----------------------------------------+
|                              TIER 3: DATA LAYER                                   |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |                  Relational Storage (PostgreSQL / SQLite)                 |   |
|   |  - Table: `users` (Permanent vs. Visiting categorization)                 |   |
|   |  - Table: `assets` (Classification, Condition, QR Payload)                |   |
|   |  - Table: `issuances` (Historical & Active Custody with ISO Timestamps)   |   |
|   |  - Table: `ndc_requests` (Multi-stage Approval Lifecycle)                 |   |
|   |  - Table: `qr_registry` & `qr_batches` (Serialized Tag Master Ledger)     |   |
|   |  - Table: `suppliers` (Vendor procurement channels)                       |   |
|   |  - Table: `notifications` & `chat_messages` (Audit & Comms records)       |   |
|   |  - Table: `logs` (Immutable Forensic Tamper-Evident Ledger)               |   |
|   +---------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Layer-by-Layer Detailed Breakdown

### Tier 1: Presentation Layer
1. **Desktop Web Application**:
   - Engineered in **React 18**, **TypeScript**, and styled with modern, high-contrast **Tailwind CSS**.
   - Role-routed dynamically:
     - **Admin Route Router**: University-wide compliance metrics, flight-risk tables, master asset registers, immutable audit logs, system diagnostics.
     - **Store Manager Route Router**: Inventory intake, QR sticker batch printer, checkout allocation, check-in return triage, supplier registry.
     - **Faculty Route Router**: Personal assigned liabilities, clearance compliance index, step-by-step NDC wizard, alerts, return portal.
2. **Mobile Device Interface (PWA & Responsive Engine)**:
   - Optimized for touch targets ($\ge 44\text{px}$) with camera barcode/QR scanner integration via HTML5 Canvas and MediaDevices API.
   - Enables on-the-go asset verification in laboratories, faculty offices, and store checkposts.
3. **State Management**:
   - Clean custom React hooks (`useAuth`, `useAssets`, `useGovernanceMetrics`) providing fast local updates, optimistic UI states, and continuous background synchronization.

### Tier 2: Application Layer (Node.js & Express)
1. **Routing & Controller Architecture**:
   - Organized into modular controllers:
     - `auth.controller.ts`: Authentication, registration, password hashing, and session validation.
     - `assets.controller.ts`: Asset CRUD, category filters, and availability checks.
     - `issuances.controller.ts`: Issuance checkout, return handback, condition updates, notification triggers.
     - `alerts.controller.ts`: Automated calculation of contract countdowns, generating high-risk flags for visiting faculty $\le 15$ days before expiry.
     - `ndc.controller.ts`: NDC request submission, liability zero-check, multi-stage approval.
     - `qrRegistry.controller.ts`: Cryptographic payload generation, batch allocations, print logs, binding verifications.
     - `gemini.controller.ts`: Automated formulation of formal university asset recovery letters using Google Gen AI.
     - `chat.controller.ts`: Role-delimited messaging and thread storage.
2. **Security & Middleware**:
   - `verifyToken`: Validates Bearer tokens and rejects unauthorized requests with HTTP 401.
   - `requireRole`: Enforces role-based permissions (e.g., only Admin or Store Manager can issue assets).
   - Global JSON 404 handler for `/api/*` ensuring API consumers never receive HTML fallbacks.

### Tier 3: Data Layer (Relational Database)
1. **Relational Integrity**:
   - Enforces referential integrity through foreign keys:
     - `issuances.assetId` $\rightarrow$ `assets.id`
     - `issuances.userId` $\rightarrow$ `users.id`
     - `ndc_requests.userId` $\rightarrow$ `users.id`
     - `qr_registry.assetId` $\rightarrow$ `assets.id`
2. **ACID Compliance**:
   - Database operations use atomic transactions (e.g., executing asset issuance atomically updates asset status to `Issued` AND writes an `issuances` row AND writes a `logs` entry AND inserts a `notifications` record).

---

## 3. Data Flow Scenario: Asset Issuance & Return

```
[Store Manager] -> (Inputs Faculty ID & Asset Tag) -> [Presentation Tier]
                            |
                     POST /api/issue
                            |
                            v
               [Application Tier (Express)]
            1. Verify Store Manager JWT
            2. Validate Asset Status is 'Available'
            3. Begin DB Transaction:
               a. Insert into `issuances` (issuedDate = NOW)
               b. Update `assets` (status = 'Issued')
               c. Insert into `logs` (event = 'ASSET_ISSUED')
               d. Insert into `notifications` (userId = Faculty ID)
            4. Commit DB Transaction
            5. Broadcast WebSocket event: 'state_update'
                            |
                            v
               [Data Tier (SQLite/PostgreSQL)]
```
