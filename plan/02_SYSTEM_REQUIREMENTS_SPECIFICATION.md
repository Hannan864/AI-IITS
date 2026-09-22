# 02. System Requirements Specification (SRS)
**Automated Inventory Issuance and Tracking System (AIITS)**
*Standard IEEE 830-1998 Aligned Specification*

---

## 1. Introduction & Purpose
This document provides a formal and granular specification of functional and non-functional requirements for the AIITS platform. It serves as the authoritative blueprint for development, verification, testing, and acceptance for Senior Design Project-1 (CS-414).

---

## 2. User Classes and Characteristics

1. **University Administrator (Admin)**:
   - Senior oversight official, Dean of Faculty, or Registrar representative.
   - Requires macro-level visibility into institutional assets, department compliance indexes, flight-risk analytics, audit logs, and ultimate NDC clearance approvals.
2. **Store Manager (Storekeeper)**:
   - Operational manager of central and departmental equipment stores.
   - Conducts stock entries, supplier logging, QR label generation/printing, asset binding, physical check-out to faculty, and return triage inspection.
3. **Permanent Faculty Member**:
   - Tenured or regular faculty member with open-ended or long-term employment.
   - Holds university assets, views assigned liabilities, files maintenance requests, and initiates exit NDC when resigning or retiring.
4. **Visiting / Contractual Faculty Member**:
   - Fixed-term lecturer or visiting professor with an explicit `contractEndDate`.
   - Subject to strict 15-day pre-expiry predictive clearance alerts and prioritized asset recovery protocols.

---

## 3. Functional Requirements (FR)

### Module A: Authentication & User Management
- **FR-AUTH-01 (Session Management)**: The system shall provide secure JWT-based authentication. Authenticated sessions must persist across client refreshes and support rapid profile switching for testing.
- **FR-AUTH-02 (Role Segregation)**: The system shall enforce Role-Based Access Control (RBAC) across four distinct roles: `Admin`, `Store Manager`, `Faculty`, and `Visiting Faculty`.
- **FR-AUTH-03 (Contract Tracking)**: When creating or updating a user profile with the role `Visiting Faculty`, the system shall enforce mandatory input of `contractEndDate` (ISO format `YYYY-MM-DD`).

### Module B: Inventory & Asset Management
- **FR-ASSET-01 (Asset Registration)**: Store managers shall be able to register assets with unique asset tag identifiers, item names, categories, models, serial numbers, purchase dates, warranty expiry dates, initial condition (`New`, `Used`, `Fair`, `Damaged`), and initial status (`Available`).
- **FR-ASSET-02 (Supplier Relationship)**: Assets shall be linked to a registered vendor/supplier profile containing contact person, email, phone, and address details.
- **FR-ASSET-03 (Status Transition Lifecycle)**: The system shall update asset status according to strict state rules: `Available` $\rightarrow$ `Issued` $\rightarrow$ `Available` (or `Damaged` / `Under Maintenance` / `Retired`).
- **FR-ASSET-04 (Asset Deletion Guard)**: The system shall prevent hard deletion of any asset that is currently marked as `Issued` to an active faculty member.

### Module C: Issuance & Return Engine
- **FR-ISSUE-01 (Check-Out Protocol)**: Store managers shall execute equipment issuance by selecting an `Available` asset, an active faculty member, specifying the required return date, and recording the dispatching storekeeper ID.
- **FR-ISSUE-02 (Dual-Party Audit)**: Upon issuance, the asset status shall immediately transition to `Issued`, an issuance record shall be created with an ISO timestamp, and an automated in-app notification shall be dispatched to the recipient faculty member.
- **FR-ISSUE-03 (Return Triage & Inspection)**: Store managers shall process asset returns, record the actual return date, assess condition (`Good`, `Fair`, `Damaged`), and release the faculty member's active liability.
- **FR-ISSUE-04 (Damage Logging)**: If an asset is returned in `Damaged` condition, the system shall mark the asset as `Damaged`, log the incident in forensic records, and flag the faculty member's profile for assessment.

### Module D: QR Code & Barcode Integration
- **FR-QR-01 (Unique QR Generation)**: The system shall generate serialized, high-density cryptographic QR codes containing secure JSON payloads: `{"id": "...", "assetTag": "...", "category": "...", "institution": "IIUI"}`.
- **FR-QR-02 (Batch Generation & Print Spooling)**: The system shall support batch generation of up to 50 sequential QR stickers and render printable sheet layouts (Single sticker, Grid 2x4, High-Density 3x6).
- **FR-QR-03 (Physical Asset Binding)**: Store managers shall bind unassigned QR labels to physical asset records via live camera scanning or manual identifier pairing.
- **FR-QR-04 (Mobile QR Scanner)**: Faculty and storekeepers shall scan QR codes via device cameras to immediately load asset specifications, current custodian, and warranty information.

### Module E: Smart Clearance Prediction (Intelligent Feature)
- **FR-SMART-01 (Continuous Contract Expiry Monitoring)**: The system shall execute automated calculation of remaining contract days for all Visiting Faculty members ($\text{Days Remaining} = \text{ContractEndDate} - \text{CurrentDate}$).
- **FR-SMART-02 (15-Day Threshold Alert)**: When visiting faculty members with outstanding issued assets reach $\le 15$ days remaining, the system shall trigger a **Pending Asset Alert** on the Admin and Store Manager dashboards.
- **FR-SMART-03 (Critical 7-Day Escalation)**: When remaining days reach $\le 7$ days, the system shall elevate the risk level to `CRITICAL`, generating high-priority alerts and highlighting the faculty member in red.
- **FR-SMART-04 (Automated Notice Drafter)**: The system shall integrate an AI document generation engine to produce professional, customized asset recall letters referencing specific serial numbers and deadlines.

### Module F: No Demand Certificate (NDC) Clearance
- **FR-NDC-01 (Digital NDC Submission)**: Faculty members shall initiate exit clearance requests through a dedicated step-by-step wizard.
- **FR-NDC-02 (Automated Balance Verification)**: The system shall automatically evaluate whether the requesting faculty member has any unreturned (`actualReturnDate === null`) assets. If liabilities exist, the wizard shall display the outstanding items.
- **FR-NDC-03 (Approval Workflow)**: Administrators and Store Managers shall review pending NDC requests, view clearance justification, and issue an `Approved` or `Rejected` decision.
- **FR-NDC-04 (Clearance Certificate)**: Upon approval, the system shall generate a digital No Demand Certificate containing university seal metadata, verification hash, and approval timestamp.

### Module G: Communication & Comms Drawer
- **FR-COMM-01 (Role-Delimited Messaging)**: Faculty can message Store Managers; Store Managers can message Faculty and Administrators; Administrators can message Store Managers.
- **FR-COMM-02 (Contact Directory)**: The comms drawer shall display accessible contacts categorized by role and department.
- **FR-COMM-03 (Notification Hub)**: The top navigation bar shall feature a real-time notification bell displaying unread activity alerts with click-to-read capability.

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Performance & Responsiveness
- **NFR-PERF-01**: Dashboard pages and data tables shall load in $< 300\text{ ms}$ under local execution.
- **NFR-PERF-02**: QR code generation and live canvas rendering shall complete within $< 100\text{ ms}$.
- **NFR-PERF-03**: The mobile-responsive interface must adapt dynamically across screen resolutions from $360\text{px}$ (mobile) to $4\text{K}$ monitors.

### 4.2 Security & Integrity
- **NFR-SEC-01**: Passwords must be hashed using industry-standard hashing algorithms (bcrypt/argon2).
- **NFR-SEC-02**: All private API endpoints shall be guarded by Bearer token authorization middleware.
- **NFR-SEC-03**: The database shall enforce referential integrity with foreign key constraints on all relational joins.

### 4.3 Reliability & Availability
- **NFR-REL-01**: The system must persist all state in a durable database (SQLite / PostgreSQL) ensuring zero data loss across server restarts.
- **NFR-REL-02**: The frontend shall implement defensive array and error fallback handling to prevent unhandled runtime exceptions.

### 4.4 Auditability & Compliance
- **NFR-AUD-01**: Every insert, update, check-out, check-in, and clearance event shall be recorded in the `logs` table with timestamp, actor ID, action type, and JSON metadata.
