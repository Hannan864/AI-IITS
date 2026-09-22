# IIUI AIITS Enterprise UI/UX Design System & Specification Document

This document defines the comprehensive **Enterprise Design Language System (EDLS)**, UX architectures, component standards, layout configurations, and component schemas for the IIUI Automated Issuance & Inventory Tracking System (AIITS). This specification transforms the system from a student-tier portal into an audit-ready, high-trust, commercial SaaS dashboard matching the standards of **Linear**, **Stripe Dashboard**, **Retool**, and **Vercel**.

---

## 1. Complete Design Language Document (A)

The IIUI AIITS Enterprise Design Language System is engineered around the core directive of **Architectural Honesty and Audit Readiness**. It emphasizes structural alignment, deliberate white space, strict data densities, and a curated high-contrast palette to guarantee legibility at rapid operation stations.

### Visual Style Guide: The "Slate-Terminal" Identity
Instead of arbitrary decorative gradients and whimsical colorful cards, the interface utilizes a structured, glassmorphism-enhanced dark system. The visual theme suggests a secure government ledger or military-grade asset controller.

```
       ┌────────────────────────────────────────────────────────┐
       │                 SOLID OUTLINE SYSTEM                   │
       │  All panels framed with sharp 1px borders of white/10  │
       └───────────────────────────┬────────────────────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
┌───────────┐                ┌───────────┐                ┌───────────┐
│   FONTS   │                │  METRICS  │                │ RETICLE   │
│   Inter   │                │ High Data │                │ Indicator │
│ Mono Codes│                │  Density  │                │  Systems  │
└───────────┘                └───────────┘                └───────────┘
```

---

## 2. Design Tokens (F)

To ensure consistency across CSS classes, components, and Tailwind integrations, the following design tokens are strictly mandated.

### A. Color System
| Token Category | Token Name | Hex Code / Config | Premium Purpose |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `sys-bg-base` | `#020617` (Slate 950) | The primary foundation, reflecting depth and focus. |
| **Panel Surface** | `sys-panel-surface` | `rgba(15, 23, 42, 0.45)` | Backdrop-blurred micro-glass container fields. |
| **Elevated Tooltip** | `sys-popover` | `#0b0f19` (Slate 900 base) | High-contrast dropdowns, calendars, and menus. |
| **Accent Primary** | `sys-accent-blue`| `#6366f1` (Indigo 500) | Primary state interactions, cursors, and primary focus actions. |
| **Accent Secondary**| `sys-accent-emerald`| `#10b981` (Emerald 500)| Returned state, active safe clear logs, active approvals. |
| **Accent Destruct** | `sys-accent-rose` | `#f43f5e` (Rose 500) | Late returns, faulty indicators, missing hardware risk blocks. |
| **Border Slate** | `sys-border-dim` | `rgba(255, 255, 255, 0.08)`| Outer container grid separators. |
| **Text Primary** | `sys-text-bright` | `#f8fafc` (Slate 50) | Core metrics, labels, numbers, and display headlines. |
| **Text Secondary**| `sys-text-muted` | `#94a3b8` (Slate 400) | Timestamps, static labels, supporting paragraphs. |

### B. Typography Scale
*   **Aesthetic Pairing**: **Inter** (Proportional Headings and System UI Labels) + **JetBrains Mono** / **Fira Code** (Codes, Serial Numbers, Device Tags, Timestamp Ledger metrics).
*   **Scale Rules**:
    *   `font-display-hero`: `text-2xl (24px) | tracking-tight | font-bold | Inter`
    *   `font-section-head`: `text-lg (18px) | tracking-tight | font-semibold | Inter`
    *   `font-table-header`: `text-[10px] | tracking-widest | font-bold | uppercase | Inter`
    *   `font-body-dense`: `text-xs (12px) | tracking-normal | font-normal | Inter`
    *   `font-mono-tag`: `text-[11px] | tracking-wider | font-mono | font-medium`

### C. Spacing Scale
AIITS operates on a highly strict, ultra-compact mathematical spacing system (Base 4px):
*   `space-xs`: `4px` (Border spacing, tight input padding)
*   `space-sm`: `8px` (Label to input gap, dropdown elements border)
*   `space-md`: `12px` (Card inner margins, table row heights padding)
*   `space-lg`: `16px` (Default panel cell boundaries, gap layouts)
*   `space-xl`: `24px` (Main section boundaries, grid margins)
*   `space-2xl`: `32px` (Outer layout workspace padding)

### D. Glassmorphism & Shadow Rules
*   **Glass Blend Layer**: `backdrop-blur-md bg-slate-900/40 border border-white/10`
*   **Ambient Shadow Glows**:
    *   `shadow-glow-blue`: `0 0 50px -12px rgba(99, 102, 241, 0.12)`
    *   `shadow-glow-emerald`: `0 0 50px -12px rgba(16, 185, 129, 0.08)`
*   **Border Radius Bounds**:
    *   `radius-pill`: `9999px` (Badges, availability pill chips)
    *   `radius-action`: `6px` (Buttons, form fields, drop-boxes)
    *   `radius-container`: `12px` (Modular panels, data drawers, main visual canvases)

---

## 3. Tailwind Theme Structure (G)

The design variables are translated directly into the Tailwind custom theme layer (`tailwind.config.js` or standard post-CSS configurations) using CSS variables:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        sys: {
          bg: '#020617',
          surface: 'rgba(15, 23, 42, 0.45)',
          popover: '#0b0f19',
          border: 'rgba(255, 255, 255, 0.08)',
          primary: '#6366f1',
          success: '#10b981',
          danger: '#f43f5e',
          warning: '#f59e0b',
        },
        text: {
          bright: '#f8fafc',
          muted: '#94a3b8',
          dark: '#64748b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular'],
      },
      borderRadius: {
        action: '6px',
        container: '12px',
      },
      boxShadow: {
        'stripe-depth': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'glow-primary': '0 0 30px -5px rgba(99, 102, 241, 0.15)',
      }
    }
  }
}
```

---

## 4. Layout Hierarchy (D)

To match Retool, Stripe, and Vercel structures, a consistent workspace shell is utilized. All visual interfaces are structured inside an elegant multi-layer composition grid:

```
┌────────────────────────────────────────────────────────────────────────┐
│ [A] GLOBAL SECURITY SWITCHBAR (Role Profiles & Quick Jumps)             │
├────────────────────────────────────────────────────────────────────────┤
│ [B] SAAS WORKSPACE NAV BAR                                             │
│  Logo ║ Registry & Analytics | Workbench | Risk Center | Clearance Desk ║  Exit.│
├────────────────────────────────────────────────────────────────────────┤
│ [C] MAIN CONTAINER SHELL (w-full max-w-7xl mx-auto px-6 py-8)           │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ [C-1] SECTION EXECUTIVE HEADER                                     │ │
│ │ Title + Breadcrumb Path                   Dynamic Global Action Button│ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ ┌───────────────────────────────────┐ ┌──────────────────────────────┐ │
│ │ [C-2] WORKSPACE WORK PANEL        │ │ [C-3] AUXILIARY PANELS       │ │
│ │  Search tables, active inputs,     │ │  Sub-filters, alerts feed,   │ │
│ │  catalogs, checklists layout.     │ │  summary boxes.             │ │
│ └───────────────────────────────────┘ └──────────────────────────────┘ │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│ [D] AUDIT FOOTER (Ledger State Simulation • Node 22 Engine Room Ready) │
└────────────────────────────────────────────────────────────────────────┘
```

### Screen Composition Specifications
*   **The Outer Foundation**: Structured on `min-h-screen bg-sys-bg flex flex-col`.
*   **Inner Division**: Content grids divide on desktop into a robust **12-column template gap-6**.
*   **Scroll Management**: The layout wraps inside `overflow-x-hidden relative`. Individual deep panels (like tables) support responsive scroll boxes while using the hidden scrollbar styles of EDLS.

---

## 5. Screen Inventory & UX Architecture (C & E)

This section maps out every screen user flow, responsive behavior, and visual layout.

### A. Admin Master Console (`components/AdminPanel.tsx`)
*   **Focus**: System overall health diagnostics, system user roles, direct administrative overrides, supplier coordination list tables.
*   **Layout Grid**: Split-pane layout (left: System diagnostics & Stats panels, right: Management table logs).
*   **User Flow**:
    1.  Admin enters, views automated database state and supplier index files.
    2.  Glances at Pending Clearance counts.
    3.  Admin clicks approved clearances or opens supplier detail modal with 1-click.
*   **Responsive Behavior**: Collapses to linear system layout on narrow screens (stacked diagnostics on top of table feeds).

### B. Logistics Workbench (`components/ManagerPanel.tsx`)
*   **Focus**: Multi-tab workspace regulating inventory, assign-outs, and handbacks.
*   **Component Tabs**:
    *   `Inventory Segment`: High density grid displaying registered hardware and a persistent registration form anchor.
    *   `Issuance Form`: Direct fast selector linking target available hardware tags with registered teacher cards, appending a calendar date bounds.
    *   `Returns Ledger`: Database table highlighting current active loans, facilitating immediate health declarations ("Healthy" or "Damaged").
*   **User Flow**:
    1.  Manager opens tab selector, switches to `Inventory`.
    2.  Clones unique tag, assigns unit, endures receipt submission.
*   **Responsive behavior**: Tablet inputs use sliding tabs, table cells display primary tags, moving supporting indices to drawer sub-sheets.

### C. Faculty Clearance Workspace (`components/FacultyPanel.tsx`)
*   **Focus**: Current personal custody catalog, personal alerts block, real-time checklist clearance submission.
*   **Layout Grid**: 2-Column Dashboard (left: Allocated asset list cards + previous NDC Requests logs table, right: System notifications broadcast board).
*   **User Flow**:
    1.  Faculty reviews active holdings. Under normal tenure, lists show green checks.
    2.  If outstanding holdings are zero, the "Submit NDC clearance lock" button triggers.
    3.  Faculty reviews incoming alert warnings, clicking "Mark as Read" immediately.

### D. Smart Risk Prediction Center (`components/AIPredictionAlerts.tsx`)
*   **Focus**: Contract endings mapped against outstanding store issues.
*   **Layout Grid**: 12-Column layout. Left 5-Columns (Identified flights lists with colored indicators), Right 7-Columns (Full-scale Gemini correspondence editor workspace).
*   **User Flow**:
    1.  Engine analyzes dates, logs warnings, sorts list items by severity level.
    2.  Operator selects critical profile.
    3.  System displays asset details and calls the server-side Gemini draft API.
    4.  Operator edits the response and clicks "Transmit Notice Alert", projecting the warning directly onto the target user's panel notifications board.

---

## 6. Component Inventory & Standards (B)

To ensure consistency, developers must build layout sheets using these reusable components:

### A. Text Inputs & Selector Dropdowns
```tsx
// Standard Enterprise Input Recipe
<div className="space-y-1.5">
  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">
    {labelName}
  </label>
  <div className="relative">
    {Icon && <Icon className="absolute left-3 top-3 h-4 w-4 text-slate-500" />}
    <input
      type={type}
      className="w-full bg-slate-950/50 border border-white/10 rounded-action py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-sans font-medium"
      {...props}
    />
  </div>
</div>
```

### B. Dynamic Badge Chips
Used exclusively to convey inventory conditions and availability states:
*   `Available Chip`: `bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider`
*   `Issued Custody Chip`: `bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider`
*   `High Alert Flight Risk`: `bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider`

### C. Handheld QR Terminal HUD Modal (`components/QRScannerModal.tsx`)
*   **Backdrop Layer**: `fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4`
*   **Body Container**: `w-full max-w-md bg-slate-900 border border-white/10 rounded-container overflow-hidden shadow-2xl`
*   **Terminal HUD Screen**:
    *   Simulated lens box overlay utilizing a pulse border: `relative border-2 border-primary/40 rounded-lg aspect-square`
    *   Horizontal laser guide element styled to move down recursively: `absolute left-0 right-0 h-0.5 bg-rose-500 opacity-80 shadow-glow-rose animate-scanner-line`

---

## 7. Data Table Excellence Specification (5)

To construct highly operational lists matching Jira, Stripe, or Retool, standard tables must strictly conform to the following schema structure.

```
┌────────────────────────────────────────────────────────────────────────┐
│  Search Input (Filter Items) ║  Category Select  ║ Direct Status Filter│
├────────────────────────────────────────────────────────────────────────┤
│ ║ Asset Tag ║ Model Name       ║ Category  ║ Condition  ║ Status  ║ Act ║ │
├────────────────────────────────────────────────────────────────────────┤
│ ║ IIUI-0941 ║ Lenovo ThinkPad  ║ Computing ║ Good Pill  ║ [Issued]║ Over║ │
│ ║ IIUI-0742 ║ Epson Projector  ║ Projector ║ New Pill   ║ [Ready ]║ Edit║ │
└────────────────────────────────────────────────────────────────────────┘
```

### Visual Specifications
1.  **Compact Grid density**: Padding of cells explicitly restricted to `py-3 px-3.5`.
2.  **Sticky Title Fields**: The header row `tr` must use `bg-slate-900 sticky top-0 border-b border-white/10 text-[10px] uppercase font-bold tracking-widest text-slate-400`.
3.  **Active Hover States**: Row `tr` items must use transition elements: `hover:bg-white/2 transition-colors cursor-pointer`.
4.  **Font Alignment Principle**: Text descriptions use standard Inter labels. Serial numbers, purchase dates, timestamps, and model tags strictly utilize monospace formatting tags: `font-mono tracking-wide text-xs text-slate-300`.

---

## 8. Mobile Experience Architecture (6)

AIITS transitions seamlessly into mobile displays, optimizing operational efficiency outside desktop terminals:

### A. Touch Action Criteria
*   Press target sizes set to `44px` minimum size limit to protect user thumb taps.
*   Grid templates automatically adjust: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.

### B. Key Mobile Screen Layouts
*   **Interactive QR Verification**: On mobile displays, the scanner overrides standard views, centering a full-screen diagnostic HUD on screen.
*   **Notifications Tray Drawer**: Incorporates touch targets, converting small checklist button icons into full-wide touch labels.
*   **Direct NDC Hand-back Form**: The clearance submission form adapts to single-input steps, showing clean, responsive alerts as indicators.

---

## 9. Empty, Loading & Skeleton States (7)

To ensure application stability and a high-end commercial feel, developers must handle alternative loading states gracefully without blank screens.

### A. Elegant Loading Skeletons
Use shimmer layouts instead of raw spinners:
```tsx
const TableRowSkeleton = () => (
  <div className="animate-pulse flex items-center justify-between py-3.5 px-4 border-b border-white/5">
    <div className="flex items-center gap-3 w-1/3">
      <div className="h-4 w-12 bg-white/10 rounded-action" />
      <div className="h-3 w-24 bg-white/5 rounded-action" />
    </div>
    <div className="h-3 w-16 bg-white/5 rounded-action" />
    <div className="h-5 w-20 bg-white/10 rounded-pill" />
  </div>
);
```

### B. Clean Objective Empty States
Ensure empty states are clear and direct:
```tsx
const EmptyLedgerState = ({ message, title }) => (
  <div className="py-12 text-center max-w-sm mx-auto space-y-3 border border-dashed border-white/10 rounded-container bg-white/2">
    <Inbox className="h-8 w-8 text-slate-500 mx-auto" />
    <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>
    <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
  </div>
);
```

### C. Offline Diagnostic Warning
If loss of network connection is detected, a minimal alert bar appears at the top of the viewport:
*   **Style**: `bg-warning/15 text-warning font-sans font-semibold text-[11px] py-1 text-center border-b border-warning/20 flex items-center justify-center gap-1.5`
*   **Message**: `"Offline Mode. Actions will sync with local memory registers upon reconnection."`

---

## 10. Recommended UI & Visual Libraries (H / I)

To construct this interface without writing custom components from scratch, the system incorporates these enterprise-tier layout packages:

*   **Framer Motion (`motion/react`)**: Regulates route jumps and state animations. Keep timings to `duration: 0.15` and curves to `easeOut` to prevent sluggishness.
*   **Lucide React (`lucide-react`)**: Source of clean, modern, consistent 24px grid system outlines. Do not mix with other icon libraries.
*   **Recharts (`recharts`)**: Powers analytics dashboards, using a single consistent dark palette matching standard theme tokens.

---

### Implementation Instructions for Frontend Developers
Ensure all custom css classes correspond with the tokens defined in Section 2. Never introduce raw hex values (like arbitrary purple shades or background colors) outside the authorized system definitions. Maintain the separation between Inter and JetBrains Mono fonts across data visualization metrics.
