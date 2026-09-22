# 15. API Specification & Contracts
**Automated Inventory Issuance and Tracking System (AIITS)**
*International Islamic University Islamabad (IIUI)*

---

## 1. Global API Standards
- **Base URL**: `/api`
- **Data Exchange Format**: `application/json`
- **Authentication**: `Authorization: Bearer <TOKEN>` header required for all private endpoints.
- **HTTP Status Codes**:
  - `200 OK`: Successful retrieval or update.
  - `201 Created`: Resource successfully registered.
  - `400 Bad Request`: Validation failure or missing required fields.
  - `401 Unauthorized`: Missing or expired JWT token.
  - `403 Forbidden`: Insufficient role privileges for the requested action.
  - `404 Not Found`: Resource does not exist.
  - `500 Internal Server Error`: Unhandled server exception.

---

## 2. Authentication Endpoints

### `POST /api/auth/login`
- **Public**: Yes
- **Payload**:
  ```json
  { "email": "admin@iiui.edu", "password": "password123" }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "srv-sec-token-usr-admin-1-1773088000",
    "user": {
      "id": "usr-admin-1",
      "name": "Dr. Muhammad Admin",
      "email": "admin@iiui.edu",
      "role": "Admin",
      "department": "Faculty of Computing"
    }
  }
  ```

### `GET /api/auth/me`
- **Public**: No
- **Response (200 OK)**: Current authenticated user profile object.

---

## 3. Inventory & Asset Endpoints

### `GET /api/assets`
- **Public**: No
- **Response (200 OK)**: Array of asset objects.

### `POST /api/assets`
- **Public**: No (Requires Admin or Store Manager)
- **Payload**:
  ```json
  {
    "name": "Lenovo ThinkPad P1 Gen 6",
    "category": "Computing",
    "model": "ThinkPad P1",
    "serialNumber": "SN-LNV-2024-998",
    "purchaseDate": "2024-03-01",
    "warrantyExpiry": "2027-03-01",
    "condition": "New",
    "supplierId": "sup-sys-01"
  }
  ```

### `PUT /api/assets/:id`
- **Public**: No (Requires Admin or Store Manager)
- **Payload**: Partial asset object with updated fields.

### `DELETE /api/assets/:id`
- **Public**: No (Requires Admin)
- **Constraint**: Rejects deletion if asset status is `Issued`.

---

## 4. Issuance & Return Endpoints

### `POST /api/issue`
- **Public**: No (Requires Store Manager or Admin)
- **Payload**:
  ```json
  {
    "assetId": "ast-prec-5570-01",
    "userId": "usr-sohail-001",
    "issuedDate": "2026-03-01",
    "returnDate": "2026-06-15",
    "issuedBy": "usr-mgr-1"
  }
  ```

### `POST /api/return`
- **Public**: No (Requires Store Manager or Admin)
- **Payload**:
  ```json
  {
    "assetId": "ast-prec-5570-01",
    "actualReturnDate": "2026-06-10",
    "condition": "Good"
  }
  ```

### `GET /api/issue/history`
- **Public**: No
- **Response (200 OK)**: Complete historical and active issuance log entries.

---

## 5. Smart Prediction & Alerts Endpoints

### `GET /api/alerts`
- **Public**: No
- **Response (200 OK)**: Array of computed flight-risk objects with `daysRemaining`, `outstandingAssets`, and `riskLevel`.

### `POST /api/alerts/send`
- **Public**: No
- **Payload**:
  ```json
  {
    "userId": "usr-sohail-001",
    "title": "Urgent Clearance Recall",
    "message": "Your contract expires in 6 days. Return all issued equipment."
  }
  ```

---

## 6. No Demand Certificate (NDC) Endpoints

### `GET /api/ndc/status`
- **Public**: No
- **Response (200 OK)**: Array of all clearance requests across the university.

### `POST /api/ndc/request`
- **Public**: No (Faculty)
- **Payload**:
  ```json
  { "userId": "usr-sohail-001", "remarks": "Visiting contract concluding." }
  ```

### `POST /api/ndc/approve`
- **Public**: No (Admin or Store Manager)
- **Payload**:
  ```json
  {
    "requestId": "ndc-req-001",
    "status": "Approved",
    "approvedBy": "usr-admin-1"
  }
  ```

---

## 7. QR Registry & Spooling Endpoints

### `GET /api/qr-registry`
- **Public**: No
- **Response (200 OK)**: List of generated QR records with binding statuses.

### `POST /api/qr-registry/generate-batch`
- **Public**: No
- **Payload**:
  ```json
  { "count": 20, "category": "Computing" }
  ```

### `POST /api/qr-registry/bind`
- **Public**: No
- **Payload**:
  ```json
  { "qrId": "qr-1002", "assetId": "ast-prec-5570-02" }
  ```
