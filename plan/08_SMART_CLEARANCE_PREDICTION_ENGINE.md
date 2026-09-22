# 08. Smart Clearance Prediction Engine
**Flagship Intelligent Feature Specification**
*Automated Inventory Issuance and Tracking System (AIITS)*
*International Islamic University Islamabad (IIUI)*

---

## 1. Problem Context & Rationale
In large educational institutions like IIUI, visiting and contractual faculty are contracted for single semesters (4–6 months). Visiting lecturers are frequently issued high-value laptops, tablets, and test kits to conduct lectures and laboratory sessions.

Under the manual system:
1. Contracts expire quietly without central storekeeper awareness.
2. Visiting faculty leave campus and return to home cities or other universities.
3. Departmental stores realize equipment is missing weeks or months later during annual audits.
4. Recovery efforts become legally and logistically prohibitive.

The **Smart Clearance Prediction Engine** eliminates this failure mode through continuous algorithmic contract monitoring, multi-tiered flight-risk scoring, and automated early interventions.

---

## 2. Mathematical Risk Calculation Model

For every active user in the system where `role = "Visiting Faculty"` or `facultyType = "Visiting"`:

$$\text{Days Remaining} = \left\lceil \frac{\text{ContractEndDate} - \text{CurrentDate}}{86,400,000 \text{ ms}} \right\rceil$$

$$\text{Active Liabilities} = \sum \Big( \text{issuances where } \text{userId} = \text{user.id} \land \text{actualReturnDate is NULL} \Big)$$

### Risk Level Classification Matrix

$$\text{RiskLevel} = 
\begin{cases} 
\text{CRITICAL}, & \text{if } \text{ActiveLiabilities} > 0 \land \text{DaysRemaining} \le 7 \\
\text{HIGH}, & \text{if } \text{ActiveLiabilities} > 0 \land 7 < \text{DaysRemaining} \le 15 \\
\text{MEDIUM}, & \text{if } \text{ActiveLiabilities} > 0 \land 15 < \text{DaysRemaining} \le 30 \\
\text{CLEARED / LOW}, & \text{if } \text{ActiveLiabilities} = 0 \lor \text{DaysRemaining} > 30 
\end{cases}$$

---

## 3. Intervention Triggers & Timeline

```
T-30 Days: Informational Notice
  │  - Low-priority advisory on faculty member's portal dashboard.
  │  - Reminds faculty of upcoming contract milestone and list of issued items.
  │
T-15 Days: Pending Asset Alert (Core FYP Mandate)
  │  - System automatically triggers "Pending Asset Alert" on Admin & Store Manager HUDs.
  │  - Faculty member highlighted in Amber on flight-risk matrix.
  │  - System prepares pre-formatted recovery plan with itemized hardware serial numbers.
  │
T-7 Days: Critical Escalation
  │  - Status escalates to CRITICAL (Red badge).
  │  - Direct urgent notification dispatched to faculty member's mobile client.
  │  - Store Manager receives prompt to contact faculty or departmental head.
  │
T-0 Days: Contract Expiration / Lockout
     - If assets remain unreturned, user status marked as "Clearance Defaulter".
     - System auto-generates formal university recovery dossier for registrar's office.
```

---

## 4. Intelligent Notice Drafting Engine
The prediction engine incorporates an AI document drafter powered by Google Gen AI:
1. Takes parameter payload:
   - Faculty Name, Department, Contract Expiration Date, Remaining Days, List of Outstanding Assets (with serial numbers).
2. Generates formal university asset recall letter citing IIUI regulations.
3. Allows the Store Manager or Admin to review, edit, and dispatch the generated notice with a single click.
