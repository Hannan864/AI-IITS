# 14. Forensic Audit Logging & Security
**Automated Inventory Issuance and Tracking System (AIITS)**
*International Islamic University Islamabad (IIUI)*

---

## 1. Principles of Forensic Auditability
In a university environment managing tens of millions of PKR in computing infrastructure, administrative accountability is non-negotiable. The AIITS system maintains an **immutable forensic ledger** that cannot be altered or purged through standard operational user interfaces.

### Core Tenets
1. **Zero Silent Edits**: Every status change, checkout, check-in, registration, and clearance decision produces a structured log entry.
2. **Actor Attribution**: Every event logs the exact actor identity, role, timestamp, and target asset tag.
3. **Non-Repudiation**: Neither faculty nor storekeepers can deny equipment handover when signed digitally with ISO timestamps.

---

## 2. Forensic Event Taxonomy

```
LOG EVENT STRUCTURE:
{
  "id": "log-88123",
  "timestamp": "2026-09-09T08:15:00.000Z",
  "actor": "Store Manager Tariq",
  "action": "EQUIPMENT_CHECKOUT",
  "details": "Issued Dell Precision 5570 (IIUI-LAP-2024-001) to Mian M Sohail until 2026-06-15.",
  "type": "issuance",
  "severity": "INFO"
}
```

### Action Severity Classification
- **`INFO`**: Normal operational events (routine check-out, routine check-in in Good condition, QR sticker printed).
- **`WARNING`**: Risk-adjacent events (visiting faculty entering 15-day expiry window, equipment returned in Damaged condition, NDC rejected).
- **`CRITICAL`**: High-liability events (unreturned asset past contract expiration, unauthorized permission attempt, hardware asset marked as Lost/Decommissioned).

---

## 3. Application Security & Hardening Protocols

1. **Defense-in-Depth Authentication**:
   - JWT tokens generated with cryptographically strong secret keys.
   - Route-level middleware validating token authenticity on every private API call.
2. **SQL Injection Immunization**:
   - All database queries use prepared statements with strict parameter binding (e.g., `db.prepare("SELECT * FROM assets WHERE id = ?").get(id)`).
   - Zero raw SQL string concatenation.
3. **Cross-Site Scripting (XSS) Prevention**:
   - All user-submitted text rendered via React JSX, escaping HTML automatically.
   - Helmet middleware mounted on Express to strip unsafe HTTP headers.
4. **API Fallback Isolation**:
   - Explicit `app.all("/api/*")` catch-all returning structured JSON 404s, preventing Vite SPA HTML document leakage into API consumers.
