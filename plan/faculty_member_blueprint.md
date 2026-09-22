# Faculty Member Blueprint

## Overview
The Faculty Member is the main consumer profile of the application. They are the recipients of university equipment. Their primary goals involve tracking what is currently assigned to them, viewing their transaction history, and managing clearance via the Non-Demand Certificate (NDC) protocol.

## Features & Capabilities
1. **Personal Dashboard**
   - High-level view showing total active equipment in their possession.
   - Immediate visibility of impending due dates for short-term issuances.
2. **My Equipment List**
   - Read-only table of hardware currently checked out to their profile (Laptops, Projectors, Vehicles, Keys).
   - Specifications include Asset Name, Tag ID, Condition Given, and expected return dates.
3. **Transaction / Return History**
   - Historical ledger of everything ever signed out and returned, proving their accountability.
4. **Non-Demand Certificate (NDC) Hub**
   - Interface to submit a formal NDC Clearance Request when transitioning out of the university or renewing contracts.
   - Track approval status (Pending Returns, In Review, Approved, Rejected).
5. **Profile & Security**
   - Update passwords, view contact information, and review contract status and assigned department.

## UI Expectations & Architecture
- **Navigation:** Highly simplified, minimal sidebar or top-nav containing strictly: Dashboard, My Equipment, History, and NDC Portal.
- **Views:** Consumer-friendly, card-based layouts. Instead of dense administrative tables, assets are shown as distinct digital cards indicating possession.
- **Visuals:** Relaxed, uncluttered UI. Use of progress bars or visual step-indicators for the NDC clearance process to keep the user informed.
- **Forms:** Minimal interaction forms, mostly focused on initiating requests (like clicking "Request NDC Clearance") or modifying personal security settings.

## Workflow Sequences
### 1. Equipment Accountability Sequence:
`Receive alert about new issuance` -> `Log in` -> `View Dashboard` -> `Confirm "My Equipment" list aligns with reality.` -> `Maintain hardware status.`

### 2. Standard Clearance (NDC) Sequence:
`Contract nears end` -> `Navigate to NDC Hub` -> `Click "Initiate Clearance Request"` -> `Status becomes Pending` -> `Faculty physically returns laptop and projector to Store Manager` -> `System updates equipment count to 0` -> `Store Manager Approves` -> `Faculty sees "Cleared" status.`
