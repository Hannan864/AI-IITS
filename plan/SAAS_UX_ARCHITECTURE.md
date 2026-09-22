# IIUI AIITS SaaS Dashboard Visual Architecture & Wireframe maps

This document contains the complete layout schemes, component hierarchies, responsive configurations, and visual maps designed by the UX Lead and Senior SaaS UI Engineer to convert the Automated Issuance & Inventory Tracking System (AIITS) into an enterprise platform matching Stripe, Retool, and Linear.

---

## 1. Modular System Layout Grid Design

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Topbar: [Logo] IIUI Asset Core  ║ Search Registry (Ctrl+K)  ║ System Warnings [!] ║ User profile │
├─────────────────────────────────┴───────────────────────────┴─────────────────────┴─────────────┤
│                                                                                                  │
│  Sidebar (Left 20%)  ║ Main Workspace Container (12-Column Grid Area)                            │
│                      ║                                                                           │
│  ► Overview Desktop  ║  ┌──────────────────────────────────────────────────────────────────────┐ │
│  ► Store Catalog     ║  │ Page Header: Asset Inventory Ledger                                  │ │
│  ► Logistics Work    ║  ├──────────────────────────────────────────────────────────────────────┤ │
│  ► Risk Predictors   ║  │ Area grid partition (12 Cols):                                       │ │
│  ► NDC Desk          ║  │                                                                      │ │
│  ► Analytics Reports ║  │ [ Col 1-3: Filters ]     [ Col 4-9: High-Density Table] [Col 10-12]  │ │
│  ► Supplier Logs     ║  │  - Category selector    - paginated list sticky head   - Side Drawer │ │
│                      ║  │  - Condition checks     - multiple checkbox rows       - quick       │ │
│  ⚙ Settings Config   ║  │  - Age slider filters   - Actions dropmenu trigger       info cards  │ │
│                      ║  └──────────────────────────────────────────────────────────────────────┘ │
│                      ║                                                                           │
└──────────────────────┴───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Full Page Layout Schemes & Panel Divisions

### Page 1: Dashboard Control Overview
*   **Grid Specs**: 12-Column Grid, split into KPI row and operational cards.
*   **Visual Layout Map**:
```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [ Executive KPI row: 4 Grid-Span Blocks ]                                                        │
│ ┌────────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐ ┌─────────────┐ │
│ │ Total Capital Asset $  │ │ Active Custody Issues  │ │ Flights Risk Warnings  │ │ Pending NDC │ │
│ │ Value: $142,500.00     │ │ Count: 48 Units        │ │ Count: 9 Profiles [!]  │ │ Requests: 3 │ │
│ └────────────────────────┘ └────────────────────────┘ └────────────────────────┘ └─────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [ Bottom panel splits: col-span-8 and col-span-4 ]                                               │
│                              col-span-8                              │         col-span-4        │
│ ┌──────────────────────────────────────────────────────────────────┐ │ ┌───────────────────────┐ │
│ │ Recent Audit Transgressions (Stripe style ledger)                 │ │ │ Live Terminal Alerts  │ │
│ │ Time     ║ ID        ║ User         ║ Asset          ║ Status    │ │ │ - Tariq NDC Submitted │ │
│ │ 12:40    ║ #AIITS-01 ║ Tariq J.     ║ Lenovo Carbon  ║ Pending   │ │ │ - Sarah Overdue (14d) │ │
│ │ 11:15    ║ #AIITS-02 ║ Sarah A.     ║ Epson Project  ║ Issued    │ │ │ - Sajid Malik Flagged │ │
│ └──────────────────────────────────────────────────────────────────┘ │ └───────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Page 2: Asset Management Workspace
*   **Grid Specs**: Left Column-span-3 (Filters Panel), Central Column-span-6 (Data Table), Right Column-span-3 (Details Side Drawer Panel).
*   **Visual Layout Map**:
```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Left Panel: col-span-3]     │ [Center Table: col-span-6]             │ [Right Panel: col-span-3]│
│ ┌──────────────────────────┐ │ ┌────────────────────────────────────┐ │ ┌──────────────────────┐ │
│ │ Categories               │ │ │ [Search Box Tag: IIU-02         ]  │ │ │ Asset Detail Drawer  │ │
│ │ [x] Computing (14)       │ │ ├────────────────────────────────────┤ │ │ Model: ThinkPad X1   │ │
│ │ [ ] optical lens (3)     │ │ │ ID       ║ Model Name    ║ Status  │ │ │ Tag: IIUI-0941       │ │
│ │                          │ │ │ IIU-0241 ║ Carbon X1 Lpt ║ Available│ │ │ Serial: SN-924-XX    │ │
│ │ Condition Filter         │ │ │ IIU-0942 ║ Epson Proj-M  ║ [Issued]│ │ ├──────────────────────┤ │
│ │ [x] New  [ ] Fair        │ │ │ IIU-0542 ║ Canon Scanner ║ Damaged │ │ │ Primary Action:      │ │
│ │ [ ] Good [ ] Faulty      │ │ └────────────────────────────────────┘ │ │ [ Assign Device ]    │ │
│ └──────────────────────────┘ │                                        │ └──────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Page 3: Step-Based Logistics Issuance System
*   **Grid Specs**: Center Card structure (col-span-6, mx-auto) hosting step-based indicators:
```
┌───────────────────────────────────────────────┐
│ Step Progress Bar: [Step 1: Select Device] -> [Step 2: Assignee Profiles] -> [Step 3: Endorse]
├───────────────────────────────────────────────┤
│ [ Active Step Container Area ]                │
│                                               │
│ Select Target Inventory Asset Tag:            │
│  [ Category drop selector: Computing        ] │
│  [ Asset item selector: Lenovo ThinkPad [!] ] │
│                                               │
├───────────────────────────────────────────────┤
│ Frame control Buttons:   [Back step]                    [Proceed to details step]
└───────────────────────────────────────────────┘
```

---

## 4. Reusable UI Components Hierarchy

```
App-Root-Shell
├── Navigation Sidebar Panel (Left Drawer)
│   ├── Client Branding Logo Token
│   ├── Navigation Link Items (Icon + Label + Active Indicator Bar)
│   └── Configuration Actions (Signout trigger link)
├── Global Application Header
│   ├── Path Breadcrumb indicator (e.g. Analytics / Active logs)
│   ├── Cmd+K / Ctrl+K Command Search Box Trigger
│   ├── Active Notifications Center (Counts Indicator)
│   └── Session User Identity Profile Pill
└── Workspace Interface Grid (12-Column Responsive Container)
    ├── Filter sidebar sheet (Filters, category checkmarks)
    ├── Stripe-Inspired DataTable
    │   ├── Fixed Top Headers Array
    │   ├── Row Items List (Dynamic conditional check, Badge chip)
    │   └── Paginated Navigation bottom actions bar
    └── Slide-out contextual details panel
```

---

## 5. Mobile Layout Maps (PWA Mode)

Mobile screens collapse sidebar configurations into a responsive Top burger drawer, prioritizing scans and checkouts:

```
┌───────────────────────────────────────┐
│ [=] Logo   [Scanner Trigger]   Profile│
├───────────────────────────────────────┤
│ Asset quick tag finder text entry box │
├───────────────────────────────────────┤
│ [ Active holding items checklist ]    │
│  Item 1: X1 Carbon Laptop             │
│  Status: [Overdue]                    │
│                                       │
│  Item 2: Epson LCD Projector          │
│  Status: [Healthy]                    │
├───────────────────────────────────────┤
│ Bottom Dock: [Monitor] [Catalog] [Scan]
└───────────────────────────────────────┘
```

---
*End of visual blueprint.*
