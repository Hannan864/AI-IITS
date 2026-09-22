# 07. Issuance & Return Workflows
**Automated Inventory Issuance and Tracking System (AIITS)**
*International Islamic University Islamabad (IIUI)*

---

## 1. Asset Check-Out (Issuance) Workflow

### 1.1 Step-by-Step Issuance Procedure
1. **Selection & Availability Check**:
   - The Store Manager accesses the **Logistics Allocator (Checkout)** tab.
   - The system displays only assets currently flagged as `Available`.
   - The manager selects the equipment item or scans its physical QR tag.
2. **Recipient Identification**:
   - The manager selects the recipient faculty member from the verified user directory.
   - The system checks if the recipient is a **Visiting Faculty** member.
     - *Policy Rule*: If the requested return date exceeds the faculty member's `contractEndDate`, the system alerts the manager and restricts issuance until adjusted.
3. **Agreement on Terms & Date Binding**:
   - Expected return date is specified (e.g., end of semester or project milestone).
4. **Execution & Dual-Party Recording**:
   - Store Manager confirms issuance (`POST /api/issue`).
   - The backend performs the following atomic operations:
     - Updates asset status: `Available` $\rightarrow$ `Issued`.
     - Creates new record in `issuances` table with `issuedDate = NOW()`, `actualReturnDate = NULL`.
     - Records storekeeper ID in `issuedBy`.
     - Dispatches an automated in-app notification to the faculty member's portal.
     - Writes an immutable event into `logs`.

```
[Store Manager] -----> [Selects Asset & Faculty] -----> [Sets Return Date]
                                                              |
                                                              v
                                                    [POST /api/issue]
                                                              |
                 +--------------------------------------------+--------------------------------------------+
                 |                                            |                                            |
                 v                                            v                                            v
     [Update Asset: 'Issued']                   [Insert `issuances` Record]                  [Dispatch In-App Notice]
```

---

## 2. Asset Check-In (Return Triage) Workflow

### 2.1 Step-by-Step Return Procedure
1. **Asset Identification**:
   - Faculty member presents the item at the central or departmental store desk.
   - Store Manager scans the asset's QR sticker using the camera scanner or enters the asset tag.
   - The system loads the active issuance agreement and custodian history.
2. **Hardware Inspection & Condition Evaluation**:
   - The storekeeper inspects physical integrity:
     - Chassis condition, display integrity, charger/cable presence, port functionality.
   - The condition is graded: `Good`, `Fair`, or `Damaged`.
3. **Execution & Custody Release**:
   - Store Manager clicks **Confirm Handback Return** (`POST /api/return`).
   - The backend performs the following atomic operations:
     - Sets `actualReturnDate = NOW()` in the `issuances` record.
     - Sets condition in the `issuances` record.
     - Updates asset status:
       - If condition is `Good` or `Fair` $\rightarrow$ status becomes `Available`.
       - If condition is `Damaged` $\rightarrow$ status becomes `Damaged`.
     - Dispatches a return confirmation notification to the faculty member.
     - Writes an immutable audit entry in `logs`.

---

## 3. Damage Assessment & Liability Flagging
If an asset is returned with defects or physical damage:
1. The storekeeper selects `condition = "Damaged"` and enters inspection details.
2. The asset is locked from subsequent issuance.
3. The system generates an internal maintenance ticket.
4. If the faculty member subsequently applies for an NDC exit clearance, the outstanding damage record prevents automatic approval until resolved with departmental administration.
