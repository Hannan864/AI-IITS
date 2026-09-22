# Store Manager Blueprint

## Overview
The Store Manager is responsible for the day-to-day operations of the university's asset repository. Their primary focus is on inventory management, issuance to faculty members, processing returns, tracking non-demand certificates (NDCs), and executing physical audits.

## Features & Capabilities
1. **Dashboard & Metrics**
   - View real-time statistics: Total assets, issued assets, available assets, and damaged/maintenance items.
   - Recent activity feed showing latest issuances and returns.
2. **Inventory Control**
   - Add new assets to the system with detailed specifications (Category, Serial Number, Department, Condition).
   - Update existing asset conditions (e.g., mark as "In Maintenance" or "Damaged").
   - View detailed history for specific items.
3. **QR Code Logistics**
   - Access the QR Generator and Registry to mint asset identifiers.
   - Bind physical tags to newly added inventory (Physical Association Hub).
   - Print queued labels mapping to standard A4/A6 Avery sheets.
   - Utilize the QR Scanner Desk for rapid checkouts and audits.
4. **Issuance & Transfers**
   - Allocate equipment securely to faculty members/departments.
   - Record issuance dates, expected return dates, and capture electronic signatures.
5. **Returns & Verification**
   - Process equipment returns (Return Verification Desk).
   - Update condition schemas immediately upon return inspection.
   - Log any compliance breaches for overdue equipment.
6. **Non-Demand Certificates (NDCs)**
   - Review incoming NDC requests from faculty members ending their contracts.
   - Verify that all issued inventory to the requesting user has been successfully returned and cleared.
   - Approve NDC clearance requests electronically.

## UI Expectations & Architecture
- **Navigation:** Persistent sidebar allowing rapid context switching between Dashboard, Inventory, QR Ops, Issuances, Returns, and NDCs.
- **Top Bar:** Quick access profile settings, quick-scan shortcut, and notification center.
- **Data Tables:** Extensive use of filterable and sortable data tables for inventory and issuance records, incorporating paginated views and quick-action context menus.
- **Forms:** Large input forms (like New Asset or Issuance) presented in modular cards or multi-step modals for cleaner UX.
- **Visuals:** Status indicator chips (Available [Green], Issued [Blue], Maintenance [Yellow]) and modern iconography throughout.
 
## Workflow Sequences
### 1. New Asset Intake & QR Allocation Sequence:
`Receive Physical Asset` -> `Enter Details into New Asset Form` -> `Generate Sequential QR ID (IIUI Standard)` -> `Print QR Tag` -> `Affix Tag` -> `Bind Tag to Database Entry` -> `Asset becomes Available.`

### 2. Standard Equipment Issuance Sequence:
`Faculty Request` -> `Scan Asset QR Tag` -> `Select Target Faculty User` -> `Note Return Deadline` -> `Execute Issuance` -> `Status shifts to Issued.`

### 3. Faculty Clearance (NDC) Sequence:
`Receive NDC Request from Expiry/Leaving Faculty` -> `System automatically queries issued items` -> `If count > 0: Store Manager halts and requests returns` -> `If count == 0: Store Manager marks NDC as Approved` -> `Clearance is finalized in system.`
