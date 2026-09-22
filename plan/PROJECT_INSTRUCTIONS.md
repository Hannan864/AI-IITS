# Enterprise System Instructions & Development Rules Manual (System Sentinel)

This document is the absolute **Source of Truth** and the **Law System** for the development of the PC Maintenance, System Telemetry, and Diagnostics platform. All developers, technical leads, and AI coding agents must align their contributions strictly with the mandates, structures, and limits outlined herein.

---

## 1. System Overview

The platform is designed as an ultra-high performance, low-latency administrative and diagnostic workspace (modeled after **System Sentinel**, **Stripe Dashboard**, and **Linear**). It enables real-time device health telemetry monitors, interactive diagnostic checks, role-based workflows, and automated system optimizations.

### Key Capabilities
*   **Role-Based Workspaces**: Distinct dashboards tailored for **Administrators** (global controls, fleet indicators), **Technicians** (active diagnostics, service repair tickets), and **Standard Users** (individual device diagnostics, performance logs).
*   **Real-time & Simulated Diagnostics**: Metric gauges tracking Core Processor temperature, storage write cycles, volatile RAM capacity pressure, and network link metrics.
*   **Local-First Resilience**: Persistent client storage falling back securely to IndexedDB/local storage in sandbox states or offline occurrences.
*   **Automated Health Scoring**: Deterministic, non-AI-hype calculation scoring rules reflecting aggregate core indicators (thermals, disk integrity, software stability).

---

## 2. Architecture Rules

The platform follows a strictly modular, decoupled, and highly performant layered architecture:

```
  ┌────────────────────────────────────────────────────────┐
  │                 CLIENT SIDE ENTRY POINT                 │
  │                  (React + Vite Router)                 │
  └───────────────────────────┬────────────────────────────┘
                              │
         ┌────────────────────┴────────────────────┐
         ▼                                         ▼
┌──────────────────┐                      ┌──────────────────┐
│  WORKSPACE VIEW  │                      │   TELEMETRY HUD  │
│  - Filters Bar   │                      │  - Metric Gauges │
│  - Search Table  │                      │  - Diagnostics   │
│  - Info Drawer   │                      │  - Score Metrics │
└────────┬─────────┘                      └────────┬─────────┘
         │                                         │
         └────────────────────┬────────────────────┘
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │          LOCAL FIRST FALLBACK LAYER (IndexedDB)        │
  └───────────────────────────┬────────────────────────────┘
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │             REST API & CONTROLLER SERVICE              │
  │             (Node + Express / FastAPI Sync)            │
  └────────────────────────────────────────────────────────┘
```

### Constraints & Architectural Separation
1.  **Strict Decoupling**: View logic must never query databases directly. Data access passes through centralized services or persistent controllers.
2.  **No Global State Chaos**: State machines must be component-centric. Large properties are limited to stabilized React context providers.
3.  **Local-First Philosophy**: Diagnostic sweeps must initialize, cache logs inside IndexedDB locally, and sync concurrently to server nodes.

---

## 3. UI/UX Design System Rules

To maintain an administrative, industrial terminal look, the application strictly implements a dark-only, high-contrast theme: the **Deep Cosmic Slate** palette.

### Design Tokens

#### A. Color Palette System
*   **Base Canvas Background**: `#020617` (Slate 950 / Slate-Darkest)
*   **Panel Surface / Glass Cards**: `rgba(15, 23, 42, 0.45)` with `backdrop-blur-md`
*   **Outer Component Borders**: `rgba(255, 255, 255, 0.08)`
*   **Primary Active Accent**: `#6366f1` (Indigo 500)
*   **Indicator - Success**: `#10b981` (Emerald 500) - Healthy, Active, Optimized
*   **Indicator - Warning**: `#f59e0b` (Amber 500) - Overheating, Throttled, Degradation
*   **Indicator - Danger**: `#f43f5e` (Rose 500) - Hardware Fault, Disconnect, Memory Leaks
*   **Text Primary**: `#f8fafc` (Slate 50)
*   **Text Secondary / Muted**: `#94a3b8` (Slate 400)

#### B. Typographic Standards
*   **Proportional Text (Inter)**: Applied across card headlines, form fields, action dropdowns, and layouts.
*   **Monospace Character Sets (JetBrains Mono)**: Applied across diagnostic readouts, memory addresses, model serial metrics, and log list outputs.

#### C. Spacing Scale (4px Mathematical System)
All margins, paddings, and column gap specifications must calculate from the core 4px base:
*   `space-xs`: `4px` (Border offsets, status indicators)
*   `space-sm`: `8px` (Label-to-input gap, elements separation)
*   `space-md`: `12px` (Standard components cell padding)
*   `space-lg`: `16px` (Default panel separations, table cell heights)
*   `space-xl`: `24px` (Main screen outer gutters, section margins)

---

## 4. Folder Structure Rules

Every directory contains unique responsibilities and must never contain circular imports.

```
iiui-aiits/
├── server/                    # Backend API Application Layer
│   ├── routes/                # Strictly routing endpoints maps (no business logic)
│   ├── controllers/           # HTTP Request and Response wrappers
│   ├── services/              # Pure business rules, telemetry aggregators, calculators
│   ├── models/                # Schema rules, raw SQL mapping queries
│   └── utils/                 # Diagnostic log helpers, network diagnostics configs
│
└── src/                       # Frontend SPA Client Layer
    ├── components/            # Visual modular blocks (must not store business states)
    ├── pages/                 # Full dashboard layouts mapped to unique routes
    ├── layouts/               # Primary Shell structures (Sidebar, Topbar)
    ├── services/              # Sync mechanisms, REST fetch abstractions, IndexedDB handlers
    ├── hooks/                 # Modular action blocks (useInterval, useDeviceState)
    ├── utils/                 # Units conversions (MB-to-GB, temperature converters)
    └── styles/                # Entry style modules, typography imports
```

---

## 5. Component Rules

All visual elements must remain clean, modular, and performant:

### A. Core Reusable Visual Elements
*   **`GlassCard`**: Foundation card container utilizing `bg-slate-900/40 border border-white/10 backdrop-blur-md rounded-container p-6 w-full relative overflow-hidden`.
*   **`DataTable`**: High-density table system with sticky headers, custom status badges, and paginated footers.
*   **`StatusBadge`**: Inline state pills reflecting colors matching current hardware risks:
    *   *Healthy*: Blue/Emerald outline.
    *   *Degraded*: Orange/Amber hazard.
    *   *Failed*: Red/Rose fault flag.
*   **`TelemetryGauge`**: Render element indicating current hardware state indexes using stable canvas-rendering packages.

### B. Functional Limitations
*   **No Inline Mutations**: Components must never execute inline data mutations. All events trigger state flow changes.
*   **Dynamic Viewports**: Layout structures, panels, and metrics tables must adapt to desktop grids, collapsing gracefully in standard container widths.

---

## 6. Backend Rules

The Express server acts as a rapid routing pass-through:
*   **Separation of Concerns**: Routes must strictly map incoming hooks, delegating validation to validators, business calculations to services, and queries to repositories.
*   **Secure API Design**: Outgoing response formats are securely typed:
```typescript
interface DiagnosticResponse<T> {
  success: boolean;
  timestamp: string;
  payload: T;
  diagnostics: {
    latencyMs: number;
    engineStatus: "Online" | "Degraded" | "Offline";
  };
}
```
*   **Error Safe Envelopes**: Errors caught by routes are trapped globally via Express Error Handling middleware, returning readable structured diagnostics.

---

## 7. Performance Rules

*   **Render Optimizations**: Components querying real-time diagnostics must leverage React's memo/Callback helpers to isolate state updates.
*   **Dynamic Loading**: Heavy packages (charts, telemetry animations) must load lazily to ensure immediate page delivery.
*   **Event Handling**: Search inputs and terminal filter triggers use debounced state handlers to prevent rapid performance degradation.

---

## 8. Strictly Enforced File Size Rule

> [!CAUTION]
> ### 🚨 THE MAX 300 LINES OF CODE MAPPING RULE
> **NO code file under any circumstance must exceed 300 lines of code.**
> This is a strict operational limit enforced to maintain modularity, readability, and compatibility with AI coding assistants.

*   **Remediation Action Matrix**:
    *   *React Panels*: If a screen requires table list queries, chart render elements, and filter inputs, the modules **must** split out into separate component files.
    *   *Services/Helpers*: Modularize helpers to limit functionality scopes (e.g., separate computer hardware calculators and network speed checkers).
*   **Code Review Criteria**: Any code containing more than 300 lines will be rejected automatically during integration verification tasks.

---

## 9. Final Enforcement Section

This document constitutes the system-wide regulation parameters for AIITS System Sentinel development. Any modification of code directories, database design tables, and front-end interface layout blocks must correspond with the constraints defined in this manual. Let order and clean execution guide your code inputs.

---
*End of Project Instructions Manual.*
