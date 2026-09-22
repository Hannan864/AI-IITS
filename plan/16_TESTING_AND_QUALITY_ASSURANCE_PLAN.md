# 16. Testing & Quality Assurance Plan
**Automated Inventory Issuance and Tracking System (AIITS)**
*International Islamic University Islamabad (IIUI)*

---

## 1. Quality Objectives & Acceptance Criteria
To ensure an enterprise-grade, flawless implementation without runtime crashes, AIITS undergoes comprehensive verification across four testing tiers:
1. **Static Analysis & Type Verification**: Zero TypeScript errors (`tsc --noEmit`) and strict ESLint compliance.
2. **Unit & API Testing**: Postman automated test suites validating every REST route and payload boundary.
3. **Integration & Flow Testing**: Multi-role scenarios simulating concurrent store checkout, return, and NDC clearance.
4. **Resilience & Fault Tolerance**: Defensive fallbacks preventing UI crashes when network or database failures occur.

---

## 2. Test Execution Matrix

| Test ID | Test Category | Scenario Description | Expected Outcome | Status |
|---|---|---|---|:---:|
| **TC-AUTH-01** | Auth | Login with valid admin credentials (`admin@iiui.edu`) | Returns JWT token, loads Admin Command HUD. | Pass |
| **TC-AUTH-02** | Auth | Login with incorrect password | Returns 401 with friendly error message. | Pass |
| **TC-AUTH-03** | Auth | Refresh authenticated browser tab | Session restored instantly via `localStorage` and `/api/auth/me`. | Pass |
| **TC-ASSET-01** | Asset | Register new laptop with valid fields | Asset appears in available inventory with generated QR tag. | Pass |
| **TC-ASSET-02** | Asset | Attempt to delete an `Issued` asset | Action blocked with error: "Cannot delete asset currently in custody." | Pass |
| **TC-ISSUE-01** | Issuance | Check out available laptop to Visiting Faculty | Asset status becomes `Issued`, active liabilities increment by 1. | Pass |
| **TC-ISSUE-02** | Issuance | Set return date beyond faculty contract end date | System flags policy warning before checkout confirmation. | Pass |
| **TC-RETURN-01**| Return | Triage return with condition `Good` | Asset status becomes `Available`, active liabilities decrement by 1. | Pass |
| **TC-RETURN-02**| Return | Triage return with condition `Damaged` | Asset status becomes `Damaged`, incident logged in forensic ledger. | Pass |
| **TC-SMART-01** | Smart Prediction | Visiting Faculty with contract $\le 15$ days | System flags user in Amber on flight-risk matrix. | Pass |
| **TC-SMART-02** | Smart Prediction | Visiting Faculty with contract $\le 7$ days | Risk escalates to `CRITICAL` (Red badge), auto-drafts recall notice. | Pass |
| **TC-NDC-01** | Clearance | Faculty with active liabilities attempts NDC submission | Wizard blocks submission and lists unreturned items. | Pass |
| **TC-NDC-02** | Clearance | Faculty with zero liabilities submits NDC | Request created with `Pending` status; Admin receives notification. | Pass |
| **TC-NDC-03** | Clearance | Admin approves verified NDC request | Status becomes `Approved`, digital clearance certificate generated. | Pass |
| **TC-QR-01** | QR Ops | Generate batch of 20 serialized QR stickers | 20 records created in `qr_registry`, printable in 2x4 sheet grid. | Pass |
| **TC-QR-02** | QR Ops | Bind unassigned QR sticker to hardware asset | QR tag permanently paired; camera scan displays verified asset details. | Pass |
| **TC-COMM-01** | Comms | Faculty sends message to Store Manager | Message appears in Store Manager comms drawer in real time. | Pass |
| **TC-FALLBACK-01**| Resilience | Request to unmatched `/api/*` route | Returns JSON 404 `{ error: "..." }` instead of HTML SPA fallback. | Pass |
| **TC-FALLBACK-02**| Resilience | Chat contacts endpoint returns empty or malformed | Client safely defaults to empty array, preventing `contacts.map` error. | Pass |

---

## 3. Regression Prevention Checklist
- **Compile Verification**: Execute `npm run build` or `compile_applet` before deployment.
- **Lint Verification**: Execute `npm run lint` (`tsc --noEmit`) to verify zero type mismatches.
- **Defensive Parsers**: Never invoke `.json()` on HTTP responses without `.catch()` fallback guards.
- **Port Invariant**: Always ensure backend binds to port `3000` and host `0.0.0.0`.
