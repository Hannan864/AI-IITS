# 06. Asset Lifecycle & Inventory Management
**Automated Inventory Issuance and Tracking System (AIITS)**
*International Islamic University Islamabad (IIUI)*

---

## 1. Complete Asset Lifecycle State Machine

University equipment undergoes a formal multi-stage lifecycle from initial procurement to eventual decommissioning.

```
       +--------------------+
       |    PROCUREMENT     |
       | (Vendor / Invoice) |
       +---------+----------+
                 |
                 v
       +--------------------+
       |  STOCK ONBOARDING  |
       | (Tagging & QR Bind)|
       +---------+----------+
                 |
                 v
   +--------->[ AVAILABLE ]<---------+
   |             |                    |
   |             | (Checkout)         | (Check-in & Good/Fair)
   |             v                    |
   |         [ ISSUED ]---------------+
   |             |
   |             | (Return with defects / Wear)
   |             v
   |      [ MAINTENANCE ]
   |             |
   +-------------+ (Repaired)
                 |
                 v (Unrepairable)
          [ DAMAGED / SCRAP ]
                 |
                 v
           [ DECOMMISSIONED ]
```

---

## 2. Asset States & Allowed Transitions

| Current State | Permitted Next State | Triggering Action | Actor |
|---|---|---|---|
| **Available** | `Issued` | Execution of checkout issuance to faculty | Store Manager |
| **Available** | `Maintenance` | Preventive service or hardware upgrade | Store Manager |
| **Available** | `Retired` | Asset phase-out or obsolete standard | Admin |
| **Issued** | `Available` | Triage return with condition `Good` or `Fair` | Store Manager |
| **Issued** | `Damaged` | Return with significant defects or broken hardware | Store Manager |
| **Issued** | `Maintenance` | Return requiring technician servicing | Store Manager |
| **Maintenance** | `Available` | Successful service completion & verification | Store Manager |
| **Maintenance** | `Damaged` | Technician confirms repair cost exceeds value | Store Manager |
| **Damaged** | `Retired` | Formal scrap board condemnation | Admin |

---

## 3. Condition Assessment Matrix

When items are received, checked out, and checked in, storekeepers evaluate condition using standard criteria:

- **`New`**: Factory sealed or freshly procured hardware with zero wear.
- **`Good`**: Fully operational equipment with minor cosmetic signs of normal usage. Screen, ports, battery, and peripherals tested 100% functional.
- **`Fair`**: Operational hardware with moderate cosmetic wear, minor scratches, or reduced battery efficiency ($\ge 70\%$). Permitted for ongoing issue.
- **`Damaged`**: Physical fracture, display malfunction, water ingress, burnt components, or non-functional ports. Automatically locks the asset from reissuance and records a damage penalty incident against the returning custodian.

---

## 4. Hardware Categories & Classifications

1. **Computing Assets (`Computing`)**:
   - High-end developer laptops (e.g., Dell Precision, Lenovo ThinkPad P-Series).
   - Desktop workstations, Tower Servers, GPUs, All-in-One PCs.
2. **Laboratory Equipment (`Laboratory`)**:
   - Network routers (Cisco ISR, Catalyst switches), IoT development kits.
   - Oscilloscopes, micro-soldering stations, FPGA boards.
3. **Office & Administrative Fixtures (`Office`)**:
   - Ergonomic executive desks, filing cabinets, multi-drawer credenzas.
4. **Audio-Visual & Multimedia (`Audio-Visual`)**:
   - Ceiling projectors, interactive digital whiteboards, wireless mics, HDMI switchers.

---

## 5. Inventory Verification & Reconciliation Protocol
Store Managers execute scheduled and ad-hoc physical audits using the mobile QR scanner:
1. Scan asset QR sticker in the departmental lab/office.
2. The scanner loads current system records (expected custodian, assigned department).
3. If the asset is found in an unauthorized location or held by an unassigned person, the system flags a **Custody Discrepancy**.
4. The system logs a `RECONCILIATION_SCAN` event with GPS/department coordinates and inspector ID.
