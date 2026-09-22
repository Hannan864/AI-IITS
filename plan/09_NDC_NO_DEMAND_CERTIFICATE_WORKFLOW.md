# 09. No Demand Certificate (NDC) Workflow
**Automated Inventory Issuance and Tracking System (AIITS)**
*International Islamic University Islamabad (IIUI)*

---

## 1. What is the "No Demand Certificate" (NDC)?
The **No Demand Certificate (NDC)** is the official institutional clearance document required by IIUI before:
- A faculty member's final salary/stipend or gratuity is released.
- Experience certificates and service letters are issued.
- A visiting lecturer's contract is formally closed.
- A retiring or resigning professor is relieved of duties.

Historically, this required visiting 6–8 distinct physical offices across the New Campus and Old Campus, causing weeks of delay. AIITS digitizes this into an instantaneous, auditable clearance workflow.

---

## 2. Digital NDC Lifecycle State Machine

```
              +----------------------------+
              |    Faculty Member Logs In  |
              +--------------+-------------+
                             |
                             v
              +----------------------------+
              |  Accesses Exit NDC Wizard  |
              +--------------+-------------+
                             |
         +-------------------+-------------------+
         |                                       |
(Outstanding Liabilities > 0)          (Active Liabilities == 0)
         |                                       |
         v                                       v
+----------------------------+         +----------------------------+
| Blocked: Displays Unreturned|         | Ready: Enables Submission  |
| Equipment & Return Deadlines|         | With Statement / Remarks   |
+----------------------------+         +--------------+-------------+
                                                      |
                                                      v
                                       +----------------------------+
                                       | POST /api/ndc/request      |
                                       | Status = 'Pending'         |
                                       +--------------+-------------+
                                                      |
                                                      v
                                       +----------------------------+
                                       | Admin / Manager Review Desk|
                                       +--------------+-------------+
                                                      |
                                    +-----------------+-----------------+
                                    |                                   |
                                    v                                   v
                             [ APPROVED ]                        [ REJECTED ]
                                    |                                   |
                                    v                                   v
                       +-------------------------+         +-------------------------+
                       | Generates Cryptographic |         | Transmits Rejection     |
                       | Digital Certificate     |         | Reason & Remedy Notes   |
                       +-------------------------+         +-------------------------+
```

---

## 3. Automated Liability Reconciliation Protocol
When the faculty member opens the NDC Wizard:
1. The system executes an immediate database query:
   ```sql
   SELECT a.assetTag, a.name, a.category, i.issuedDate, i.returnDate 
   FROM issuances i
   JOIN assets a ON i.assetId = a.id
   WHERE i.userId = ? AND i.actualReturnDate IS NULL;
   ```
2. **Liabilities Present**:
   - The wizard renders an Amber/Red notification listing each item with instructions to visit the departmental storekeeper.
   - The user cannot submit an exit clearance until the storekeeper checks the items in.
3. **Zero Liabilities**:
   - The wizard renders a Green badge: **"All Equipment Cleared. 0 Outstanding Custody Holds."**
   - The faculty member enters optional departing remarks and clicks **Submit Digital NDC Request**.

---

## 4. Administrative Verification & Digital Certificate
1. The Administrator or Store Manager receives the pending request on the **Clearance Control Desk**.
2. If verified, the approver clicks **Approve Clearance**:
   - Status transitions to `Approved`.
   - Record updated with `approvalDate` and `approvedBy`.
   - A digital certificate is compiled with:
     - Certificate Serial Number (e.g., `IIUI-NDC-2026-CS-0872`).
     - Faculty Member Name & Department.
     - University Clearance Stamp Seal.
     - Timestamp and Cryptographic Hash.
   - The faculty member can view, verify, and print this certificate immediately from their portal.
