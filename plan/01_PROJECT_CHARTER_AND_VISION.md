# 01. Project Charter & Academic Vision
**Automated Inventory Issuance and Tracking System (AIITS)**
*International Islamic University Islamabad (IIUI)*
*Faculty of Computing / Department of Computer Science (DCS)*
*Senior Design Project-1 (CS-414)*

---

## 1. Academic & Administrative Metadata
- **Project Title**: Automated Inventory Issuance and Tracking System
- **Subject**: Senior Design Project-1 (SDP-1)
- **Subject Code**: CS-414
- **Student Researcher / Lead**: Mian M Sohail (Reg. No: 872-FOC/BSIT/F22)
- **Department**: Department of Computer Science (DCS) / Faculty of Computing (FOC)
- **Institution**: International Islamic University, Islamabad (IIUI), Pakistan
- **Degree Program**: Bachelor of Science in Information Technology (BS IT)

---

## 2. Executive Summary
International Islamic University Islamabad (IIUI) maintains extensive physical asset inventories across diverse faculties, administrative directorates, and academic blocks. Currently, asset allocations—such as laptops, scientific workstations, laboratory equipment, multimedia projectors, and office fixtures—are tracked through manual paper registers and fragmented departmental records. 

This manual paradigm creates severe administrative vulnerabilities:
1. **Asset Leakage & Disappearance**: Visiting faculty and contractual staff frequently complete their appointments and depart without returning valuable university electronics.
2. **Clearance Bottlenecks**: The official **No Demand Certificate (NDC)** process requires faculty members to physically carry paper clearance slips across multiple decentralized offices (central store, departmental store, library, finance), leading to weeks of administrative gridlock.
3. **Inaccurate Auditing**: Annual audits suffer from missing ledgers, unrecorded equipment transfers between faculty members, and zero real-time inventory visibility.

The **Automated Inventory Issuance and Tracking System (AIITS)** replaces physical paper registers with an enterprise three-tier web and mobile architecture featuring **QR code binding**, **digital timestamping**, **centralized lifecycle tracking**, and a flagship **Smart Clearance Prediction Engine**.

---

## 3. Core Problems Solved

| Problem in Legacy Manual System | AIITS Engineered Solution |
|---|---|
| **Difficulty in Asset Recovery**: Visiting faculty leave upon contract expiration without asset retrieval. | **Smart Clearance Prediction**: Automated 15-day pre-expiry predictive alerts dispatched to administrators and store managers to initiate proactive recovery before contract termination. |
| **Inaccurate Record Keeping**: Manual paper logs are prone to ink damage, misplaced folios, and human transcription errors. | **Centralized PostgreSQL/Relational Ledger**: Single source of truth with foreign-key constraints, audit histories, and digital timestamps for every state change. |
| **Delayed Clearance Process (NDC)**: Manual physical signing rounds cause delays and frustration. | **Automated Digital NDC Engine**: One-click liability reconciliation with automated sign-off workflow and cryptographically verifiable digital clearance certificates. |
| **Zero Real-Time Visibility**: Storekeepers cannot ascertain current stock status (Available vs. Issued vs. Under Maintenance vs. Damaged). | **Real-Time Interactive Command HUD**: Live dashboards tracking asset counts, equipment status breakdown, warranty indicators, and departmental allocations. |
| **Identity & Item Ambiguity**: Equipment labels tear off or lack unambiguous serial verification. | **Cryptographic QR Code Binding**: Tamper-evident serialized QR tags linking physical hardware to digital database records with scanning verification. |

---

## 4. Strategic Project Objectives
1. **Develop Centralized Digital Repository**: Consolidate every asset procured by or transferred to IIUI with serial numbers, model specifications, purchase dates, condition tags, and supplier origins.
2. **Faculty Segmentation & Liability Profiling**: Categorize academic staff into **Permanent Faculty** and **Visiting Faculty**, enforcing distinct custody rules and automated contract expiration monitors.
3. **End-to-End Issuance & Return Automation**: Record all checkout handovers and check-in triage handbacks with digital timestamps, condition grades (New, Good, Fair, Damaged), and storekeeper authorizations.
4. **Intelligent Pre-Clearance Alerting**: Continuously monitor visiting faculty contract timelines to predict clearance flight-risks, auto-generating recovery plans 15 days prior to contract termination.
5. **Frictionless Digital NDC Pipeline**: Automate the exit verification workflow, calculating outstanding liabilities instantaneously and providing clearance confirmation without manual paper rounds.
6. **Multi-Role Collaborative Communication**: Provide dedicated, role-bounded comms channels between faculty, storekeepers, and central administrators for rapid asset inquiries and maintenance requests.

---

## 5. Scope & Boundary Matrix

### In-Scope Functional Capabilities
- Centralized asset cataloging and category classification (Computing, Lab, Office, Audio-Visual).
- Cryptographic QR code generation, batch generation, and printable sticker layout generation.
- Dynamic physical asset binding to generated QR identifiers via live web/mobile scanner.
- Segregated roles: **Admin** (University Governance & Audits), **Store Manager** (Operations & Logistics), **Faculty / Visiting Faculty** (Self-Service & Clearances).
- Automated "Pending Asset Alert" dispatched 15 days prior to visiting faculty contract expiration.
- Digital NDC request initiation, automated balance check, administrative sign-off, and certificate generation.
- Real-time in-app notification pipeline and multi-role messaging channels.
- Comprehensive forensic audit logs tracking all checkouts, returns, edits, and deletions.

### Out-of-Scope / Exclusions
- Financial accounting depreciation schedules tied to banking ledgers (tax accounting).
- Direct integration with university payroll deduction engines (handled via external finance export).
- Physical GPS tracking chips inside hardware (system utilizes serialized QR scanning checkpoints).

---

## 6. Success Metrics & Key Performance Indicators (KPIs)
- **100% Asset Accountability**: Zero untracked equipment allocations across participating departments.
- **95% Reduction in Recovery Delays**: Visiting faculty equipment retrieved before last working day via the 15-day predictive engine.
- **80% Acceleration of NDC Clearance**: Reduction of clearance processing time from 10–14 working days down to under 2 hours.
- **Zero Loss of Historical Records**: Complete immutable digital audit trail with ISO timestamps for every transaction.
