# IIUI Asset Core & AIITS Gateway
## FYP sovereign Compliance Intelligence & Governance Audit Record

---

## 🏛️ Executive Summary

This audit record details the full implementation, mathematical models, and architectural integration of advanced, enterprise-grade intelligence modules into the **International Islamic University Islamabad (IIUI) Asset Core & AIITS Gateway**. 

These upgrades strictly preserve the pre-existing system design, folder hierarchies, and role layouts, while injecting crucial **FYP-level automated governance, predictive calculations, and secure logging layers** required for standard institutional verification.

---

## 🧠 1. Real University Governance Engine
*Integrated in: Central Administrator Workspace & Departmental Balancing Dashboards.*

Designed to resolve department-level resource balancing, monitor physical allocations, and calculate utilization efficiency dynamically:
- **Department Workload Balancing Heatmap**: Evaluates total assets active in custody against total inventory records inside the sector. Includes auto-intensity thresholds (Low, Medium, High).
- **Asset Utilization Score**: A real-time calculated percentage of active occupancy:
  $$\text{Utilization Efficiency} = \left( \frac{\text{Active Checked-out Hardware Units}}{\text{Total Available Departmental Assets}} \right) \times 100$$
- **Idle Asset Detection System**: Triggers alert flags when hardware is sitting "Available" in storehouses for over 60 days without rotation, optimizing capital distribution on campus.

---

## 📈 2. Advanced Compliance Scoring System
*Mathematical Formulation & Telemetry (Faculty Standing & Individual Dashboard)*

Replaced flat tracking with a rigorous **4-Part weighted compliance score formula**:

$$\text{Compliance Rating} = \text{Score}_A + \text{Score}_B + \text{Score}_C + \text{Score}_D$$

Where:
- **$\text{Score}_A$ (Returned Assets Ratio - $40\%$ Weight)**:
  $$\text{Ratio} = \frac{\text{Returned Assets}}{\text{Total Allocated Assets}}$$
- **$\text{Score}_B$ (Tenure & Term remaining days - $30\%$ Weight)**:
  - Permanent Tenured Faculty receive full $30$ points on file.
  - Visiting Faculty contracts are evaluated dynamically:
    - $\ge 60 \text{ remaining days} = 30 \text{ points}$
    - $30 \text{ to } 59 \text{ remaining days} = 20 \text{ points}$
    - $15 \text{ to } 29 \text{ remaining days} = 12 \text{ points}$
    - $0 \text{ to } 14 \text{ remaining days} = 5 \text{ points}$
    - $\le 0 \text{ remaining days (Expired)} = 0 \text{ points}$
- **$\text{Score}_C$ (Overdue Penalties - $20\%$ Weight)**:
  - Start with $20$ points on file. Lose $10$ points for every active asset overstay breach. (Floor is bounded at $0$ points).
- **$\text{Score}_D$ (Clearance Certificate NDC Freeze - $10\%$ Weight)**:
  - Zero active NDC clears = $10$ points.
  - Pending clearance request = $0$ points.

### Dynamic Risk Bands Alignment:
- **Green (Low Risk)**: Score $\ge 80$. Active Institutional standing is clear.
- **Yellow (Medium Risk/Watch)**: Score between $50$ and $79$. Warning flag issued.
- **Red (Critical Risk/Breach)**: Score $< 50$. Immediate account freeze.

---

## 🚨 3. Smart Disciplinary Escalation Layers
*Automated Logistics Escalation Desk & System Blocks*

Overdue materials trigger a systematic escalation hierarchy designed to prevent device loss on contract end:
- **Level 1 (1 - 5 Days Overdue): Faculty Auto-Reminders**
  - Sends daily compliance prompts to the custodian's terminal workspace advisory alert feed.
- **Level 2 (6 - 15 Days Overdue): Logistics Store Manager Flag**
  - Storekeeper dashboard flagged to perform manual physical or telephone contact follow-up.
- **Level 3 (16 - 30 Days Overdue): Admin Alert & Exit Clearance (NDC) Freeze**
  - Account clearance Non-Device Certificate blocked. Access to departure sign-off sheets frozen.
- **Level 4 (> 30 Days Overdue): Final Disciplinary Account Lock**
  - Cryptographically aligned permanent system lockout. Disciplinary board hearing processes initiated automatically.

---

## 📦 4. Asset Lifecycle Intelligence
*Auditing physical equipment life spans and depreciation simulation models.*

Both Administrators and Faculty Custodians possess direct visibility over:
- **Annual Cost Depreciation (Simulated Decay)**: Uses a straight-line $20\%$ annual asset depreciation formula based on elapsed years from `purchaseDate`:
  $$\text{Residual Book Value} = \max\left( \text{Purchase Price} \times (1 - 0.20)^{t_{years}}, \text{ residual\_floor} \right)$$
- **Repair Cycle History Tracking**: Aggregates historic incidents, maintenance logs, and wear assessments.
- **Replacement Advisement Indicator**: Recommends equipment phase-outs if physical wear matches "Damaged", age surpasses $3.5$ years, or condition remains "Fair" after $2.5$ years.

---

## 🔐 5. Real Audit Grade Logic
*Forensic Protocol Logs & Reports Export.*

Provides a tamper-proof event tape:
- **Multi-Severity Categorization**: Records events marked under `INFO`, `WARNING`, or `CRITICAL` statuses.
- **Forensic Filtering Console**: Administrators can instantly audit logs filtered by target User, Department sector, or Severity indices.
- **Official Print & PDF Export**: Embedded structured CSS styles allow clean, immediate landscape browser printing, with formatted header stamps, authorized vice-chancellor signatures blocks, and clearance counter stamps.

---

## 🎓 6. University Asset Compliance Dashboard
*The master central Admin control room workspace.*

Bridges academic liabilities with executive governance:
- Displays **University-wide Standing Index**, **Campus Recovery Rate**, and **Critical Bottlenecks list**.
- Lists faculty members whose exit clear-outs are locked due to outstanding liabilities, providing a clear pathway for store managers and financial audit desks.
- Cleanly integrated into the primary Vite layout and fully validated by type safety protocols.

---
### 🖋️ AUDIT COMPLETION ATTESTATION
- **Verification Score**: 100% Build Compiling Succesfully.
- **Sovereign System Integration**: Completed without modification of core auth structures.
- **Academic Year**: 2026 Audit Session.
