# 04. Database Schema & Data Dictionary
**Automated Inventory Issuance and Tracking System (AIITS)**
*International Islamic University Islamabad (IIUI)*

---

## 1. Schema Overview & Relational ER Diagram

```
+------------------+          +-----------------------+          +-------------------+
|      users       | 1      * |       issuances       | *      1 |      assets       |
|------------------|<---------|-----------------------|--------->|-------------------|
| id (PK)          |          | id (PK)               |          | id (PK)           |
| name             |          | assetId (FK -> assets)|          | assetTag (UNIQUE) |
| email (UNIQUE)   |          | userId (FK -> users)  |          | name              |
| password         |          | issuedDate            |          | category          |
| role             |          | returnDate            |          | model             |
| department       |          | actualReturnDate      |          | serialNumber      |
| facultyType      |          | condition             |          | purchaseDate      |
| contractEndDate  |          | issuedBy              |          | warrantyExpiry    |
| status           |          +-----------------------+          | status            |
+------------------+                                             | condition         |
      | 1                                                        | supplierId (FK)   |
      |                                                          | qrCode            |
      | *                                                        +-------------------+
+------------------+                                                       | 1
|   ndc_requests   |                                                       |
|------------------|                                                       | 1
| id (PK)          |                                             +-------------------+
| userId (FK)      |                                             |    qr_registry    |
| requestDate      |                                             |-------------------|
| status           |                                             | id (PK)           |
| remarks          |                                             | assetTag (UNIQUE) |
| approvedBy       |                                             | payload           |
| approvalDate     |                                             | assetId (FK)      |
+------------------+                                             | isBound           |
                                                                 | isPrinted         |
                                                                 +-------------------+
```

---

## 2. Comprehensive Data Dictionary

### Table: `users`
Represents all university personnel, administrators, store managers, and faculty members.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(64)` | PRIMARY KEY | Unique UUID or deterministic identifier (e.g., `usr-admin-1`). |
| `name` | `VARCHAR(128)` | NOT NULL | Full name of the faculty or staff member. |
| `email` | `VARCHAR(128)` | UNIQUE, NOT NULL | Official university email (`@iiui.edu`). |
| `password` | `VARCHAR(255)` | NOT NULL | Secure salted password hash. |
| `role` | `VARCHAR(32)` | NOT NULL | `Admin`, `Store Manager`, `Faculty`, `Visiting Faculty`. |
| `department` | `VARCHAR(64)` | NOT NULL | Department name (e.g., `Computer Science`, `Software Engineering`). |
| `facultyType` | `VARCHAR(32)` | DEFAULT 'Permanent' | `Permanent`, `Visiting`, `N/A`. |
| `contractEndDate`| `VARCHAR(32)` | NULLABLE | Mandatory for `Visiting Faculty` (`YYYY-MM-DD`). |
| `status` | `VARCHAR(32)` | DEFAULT 'Active' | `Active`, `On Leave`, `Clearance Requested`, `Cleared`, `Terminated`. |
| `createdAt` | `DATETIME` | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp. |

### Table: `assets`
Contains every hardware unit, office fixture, laboratory equipment, and electronics item.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(64)` | PRIMARY KEY | Unique system asset identifier. |
| `assetTag` | `VARCHAR(64)` | UNIQUE, NOT NULL | Human-readable tag (e.g., `IIUI-LAP-2024-001`). |
| `name` | `VARCHAR(128)` | NOT NULL | Friendly item name (e.g., `Dell Precision 5570 Mobile Workstation`). |
| `category` | `VARCHAR(64)` | NOT NULL | `Computing`, `Office`, `Laboratory`, `Audio-Visual`, `Furniture`. |
| `model` | `VARCHAR(128)` | NOT NULL | Manufacturer model number. |
| `serialNumber` | `VARCHAR(128)` | NOT NULL | Hardware chassis serial number. |
| `purchaseDate` | `VARCHAR(32)` | NOT NULL | Date of acquisition (`YYYY-MM-DD`). |
| `warrantyExpiry`| `VARCHAR(32)` | NOT NULL | Manufacturer warranty end date. |
| `status` | `VARCHAR(32)` | NOT NULL | `Available`, `Issued`, `Maintenance`, `Damaged`, `Retired`. |
| `condition` | `VARCHAR(32)` | NOT NULL | `New`, `Good`, `Fair`, `Damaged`. |
| `supplierId` | `VARCHAR(64)` | NULLABLE, FK -> `suppliers.id` | Procuring vendor. |
| `qrCode` | `TEXT` | NOT NULL | Encoded cryptographic payload string. |
| `createdAt` | `DATETIME` | DEFAULT CURRENT_TIMESTAMP | Registration timestamp. |

### Table: `issuances`
Tracks the chronological chain of custody for every physical item.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(64)` | PRIMARY KEY | Unique issuance transaction identifier. |
| `assetId` | `VARCHAR(64)` | NOT NULL, FK -> `assets.id` | Target asset being checked out. |
| `userId` | `VARCHAR(64)` | NOT NULL, FK -> `users.id` | Recipient faculty member. |
| `issuedDate` | `VARCHAR(32)` | NOT NULL | Handover date (`YYYY-MM-DD`). |
| `returnDate` | `VARCHAR(32)` | NOT NULL | Expected return date agreed at checkout. |
| `actualReturnDate`| `VARCHAR(32)`| NULLABLE | Actual date returned (NULL while active). |
| `condition` | `VARCHAR(32)` | DEFAULT 'Good' | Condition evaluated upon return. |
| `issuedBy` | `VARCHAR(64)` | NOT NULL | Storekeeper ID who authorized checkout. |
| `createdAt` | `DATETIME` | DEFAULT CURRENT_TIMESTAMP | Audit timestamp. |

### Table: `ndc_requests`
Maintains the institutional exit clearance requests and approval outcomes.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(64)` | PRIMARY KEY | Unique clearance request identifier. |
| `userId` | `VARCHAR(64)` | NOT NULL, FK -> `users.id` | Departing faculty member. |
| `requestDate` | `VARCHAR(32)` | NOT NULL | Submission date (`YYYY-MM-DD`). |
| `status` | `VARCHAR(32)` | DEFAULT 'Pending' | `Pending`, `Approved`, `Rejected`. |
| `remarks` | `TEXT` | NOT NULL | Clearance justification / notes. |
| `approvedBy` | `VARCHAR(64)` | NULLABLE | Approver user ID. |
| `approvalDate` | `VARCHAR(32)` | NULLABLE | Approval/rejection date. |

### Table: `qr_registry` & `qr_batches`
Manages the inventory of pre-generated and bound serialized QR codes.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(64)` | PRIMARY KEY | QR record identifier. |
| `assetTag` | `VARCHAR(64)` | UNIQUE, NOT NULL | Human-readable tag formatted `IIUI-QR-XXXX`. |
| `payload` | `TEXT` | NOT NULL | Cryptographic JSON representation. |
| `batchId` | `VARCHAR(64)` | NULLABLE | Batch generation identifier. |
| `isBound` | `INTEGER` | DEFAULT 0 | 1 if attached to an asset, 0 if spare. |
| `assetId` | `VARCHAR(64)` | NULLABLE, FK -> `assets.id` | Linked hardware asset ID. |
| `isPrinted` | `INTEGER` | DEFAULT 0 | 1 if printed via print center. |
| `createdAt` | `DATETIME` | DEFAULT CURRENT_TIMESTAMP | Generation timestamp. |

### Table: `notifications`
Direct in-app alerts and notifications.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(64)` | PRIMARY KEY | Notification identifier. |
| `userId` | `VARCHAR(64)` | NOT NULL, FK -> `users.id` | Target recipient. |
| `title` | `VARCHAR(255)` | NOT NULL | Notification headline. |
| `message` | `TEXT` | NOT NULL | Notification body. |
| `read` | `INTEGER` | DEFAULT 0 | 1 if read, 0 if unread. |
| `createdAt` | `DATETIME` | DEFAULT CURRENT_TIMESTAMP | Generation timestamp. |

### Table: `chat_messages`
Internal role-bounded communication messages.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(64)` | PRIMARY KEY | Message identifier. |
| `senderId` | `VARCHAR(64)` | NOT NULL, FK -> `users.id` | Sender ID. |
| `receiverId` | `VARCHAR(64)` | NOT NULL, FK -> `users.id` | Recipient ID. |
| `content` | `TEXT` | NOT NULL | Message payload. |
| `timestamp` | `DATETIME` | DEFAULT CURRENT_TIMESTAMP | Transmission timestamp. |

### Table: `logs`
Immutable forensic audit ledger.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(64)` | PRIMARY KEY | Log identifier. |
| `timestamp` | `DATETIME` | DEFAULT CURRENT_TIMESTAMP | Exact event timestamp. |
| `actor` | `VARCHAR(128)` | NOT NULL | Full name of user who initiated action. |
| `action` | `VARCHAR(64)` | NOT NULL | Action code (e.g., `ASSET_CHECKOUT`, `NDC_APPROVED`). |
| `details` | `TEXT` | NOT NULL | Granular description and asset parameters. |
| `type` | `VARCHAR(32)` | NOT NULL | Category (e.g., `issuance`, `audit`, `qr_registry`). |
| `severity` | `VARCHAR(16)` | DEFAULT 'INFO' | `INFO`, `WARNING`, `CRITICAL`. |
