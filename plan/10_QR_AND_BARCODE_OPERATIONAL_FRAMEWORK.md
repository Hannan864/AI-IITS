# 10. QR & Barcode Operational Framework
**Automated Inventory Issuance and Tracking System (AIITS)**
*International Islamic University Islamabad (IIUI)*

---

## 1. QR Payload Specification
To ensure offline verifiability, tamper resistance, and rapid mobile camera detection, every asset QR code contains a structured JSON payload:

```json
{
  "system": "IIUI-AIITS",
  "version": "1.0",
  "id": "ast-prec-5570-01",
  "tag": "IIUI-LAP-2024-001",
  "cat": "Computing",
  "model": "Dell Precision 5570",
  "sn": "SN-DELL-987211",
  "verificationUrl": "https://aiits.iiui.edu.pk/verify/IIUI-LAP-2024-001"
}
```

---

## 2. Operational Lifecycle: From Spooling to Disposal

```
  [1. Genesis]            [2. Printing]            [3. Physical Binding]       [4. Lifecycle Scanning]
Generate QR Batch  --->  Render Sticker Sheet  --->  Attach Sticker to   --->   Scan to Check-out,
In Database Ledger      (Single, 2x4, 3x6)          Laptop / Projector         Triage Return, or Audit
```

### Stage 1: Batch Genesis
- Store Managers can generate serialized QR tags in advance before hardware arrives.
- Tags are assigned sequential human-readable codes (e.g., `IIUI-QR-1001` through `IIUI-QR-1050`).
- Entries are recorded in the `qr_registry` table with `isBound = 0`.

### Stage 2: Print Center & Layout Spooling
- The system renders high-contrast, black-and-white vector QR codes optimized for thermal and laser sticker printers.
- Supported Print Templates:
  1. **Single Industrial Asset Sticker (60mm x 40mm)**: Contains the QR matrix, university logo, human-readable asset tag, category, and ownership warning.
  2. **A4 Sheet Grid (2 x 4 layout, 8 stickers per page)**: Standard office adhesive sheets.
  3. **High-Density Compact Grid (3 x 6 layout, 18 stickers per page)**: For small accessories, chargers, and dongles.
- When printed, the system automatically logs a `qr_print_logs` entry with timestamp and user ID.

### Stage 3: Asset Binding Center
- When physical hardware arrives:
  1. The manager takes a pre-printed sticker and scans it.
  2. The manager selects an unassigned hardware asset from the ledger.
  3. Clicking **Bind QR to Asset** executes `POST /api/qr-registry/bind`.
  4. The record updates: `qr_registry.assetId = asset.id`, `qr_registry.isBound = 1`, and `assets.qrCode = payload`.

### Stage 4: Scanning Desks & Mobile Audits
- **Check-Out Desk**: Scanning an asset auto-populates its details into the issuance form.
- **Check-In Return Desk**: Scanning an asset instantly pulls up the custodian's profile and active issuance record.
- **Field Audits**: Storekeepers walking through labs scan equipment to verify custody without typing serial numbers.

---

## 3. Anti-Counterfeit & Tamper Verification
- The QR payload contains a verification signature linking directly to the secure central database.
- If a duplicate or fraudulent QR code is scanned, the scanner alerts the inspector with an **Invalid / Unregistered Asset Tag** warning.
- Scans are recorded in `qr_scan_logs` with GPS/IP coordinates and user ID to detect anomalous scanning patterns.
