# 05. Role-Based Access Control (RBAC) Framework
**Automated Inventory Issuance and Tracking System (AIITS)**
*International Islamic University Islamabad (IIUI)*

---

## 1. Governance Hierarchy & Role Definitions

The AIITS security model enforces strict departmental and operational boundaries across four distinct user roles:

1. **Administrator (`Admin`)**:
   - Institutional authority over university assets, compliance indices, and departmental audits.
   - Authorized to view system-wide diagnostics, audit trails, flight-risk analytics, and final NDC approvals.
2. **Store Manager (`Store Manager`)**:
   - Custodian of the physical inventory and logistics desks.
   - Authorized to add/edit assets, bind QR tags, issue equipment to faculty, triage returns, register vendors, and mark preliminary NDC checks.
3. **Permanent Faculty (`Faculty`)**:
   - Regular university teaching staff.
   - Authorized to review their personal custody holdings, inspect return deadlines, file maintenance/return requests, and initiate retirement NDC.
4. **Visiting Faculty (`Visiting Faculty`)**:
   - Contractual teaching staff with a defined `contractEndDate`.
   - Subject to automated 15-day pre-expiry clearance tracking, restricted long-term asset checkout, and prioritized return notifications.

---

## 2. Granular Permissions Matrix

| Functional Capability | Admin | Store Manager | Faculty | Visiting Faculty |
|---|:---:|:---:|:---:|:---:|
| **View System KPI Dashboard** | Full | Operations Only | Personal Only | Personal Only |
| **Register New Hardware Asset** | Yes | Yes | No | No |
| **Edit Asset Specifications** | Yes | Yes | No | No |
| **Delete Asset (Non-Issued)** | Yes | No | No | No |
| **Execute Asset Issuance (Check-Out)** | Yes | Yes | No | No |
| **Triage Asset Return (Check-In)** | Yes | Yes | No | No |
| **Generate Serialized QR Codes** | Yes | Yes | No | No |
| **Batch Print QR Stickers** | Yes | Yes | No | No |
| **Bind QR Code to Physical Asset** | Yes | Yes | No | No |
| **Scan QR Code to Inspect Asset** | Yes | Yes | Yes | Yes |
| **View 15-Day Flight-Risk Alerts** | Yes | Yes | No | No |
| **Dispatch Recovery Notice to Faculty** | Yes | Yes | No | No |
| **Initiate Exit NDC Request** | No | No | Yes | Yes |
| **Approve / Reject NDC Request** | Yes | Yes | No | No |
| **View Forensic Audit Logs** | Yes | Limited | No | No |
| **Message Store Manager** | Yes | Yes | Yes | Yes |
| **Message Faculty Member** | Yes | Yes | No | No |
| **Message Administrator** | Yes | Yes | No | No |

---

## 3. Route Guard & Token Policy Specification

### 3.1 Token Format & Signature
- All authenticated API interactions require a Bearer token:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
- Token payload structure:
  ```json
  {
    "id": "usr-sohail-001",
    "name": "Mian M Sohail",
    "email": "prof.sohail@iiui.edu",
    "role": "Visiting Faculty",
    "department": "Computer Science",
    "exp": 1773088000
  }
  ```

### 3.2 Application Middleware Implementation
- **Authentication Guard (`verifyToken`)**:
  Inspects the `Authorization` header, extracts the token, verifies cryptographic signature, and attaches decoded user claims to `req.user`. Returns `401 Unauthorized` if invalid or expired.
- **Authorization Guard (`requireRole(allowedRoles)`)**:
  Verifies that `req.user.role` is present in the `allowedRoles` array. Returns `403 Forbidden` with a structured JSON message:
  ```json
  { "error": "Access denied. Action requires permissions: Store Manager, Admin" }
  ```

### 3.3 Client-Side Navigation Guards
- In the React frontend, `AppLayout` and role-specific routers (`AdminRoleRouter`, `ManagerRoleRouter`, `FacultyRoleRouter`) dynamically mount views matching the user's role.
- Attempts to manually navigate to unauthorized tabs automatically redirect to the user's designated primary dashboard.
