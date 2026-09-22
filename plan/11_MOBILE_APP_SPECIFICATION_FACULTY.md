# 11. Mobile Application Specification (Faculty & Staff)
**Automated Inventory Issuance and Tracking System (AIITS)**
*International Islamic University Islamabad (IIUI)*

---

## 1. Executive Purpose & Target Audience
As specified in the FYP charter, the **Mobile Application** is designed specifically for **Faculty and Staff members** (both Permanent and Visiting). It provides immediate, pocket-accessible self-service to eliminate visits to physical store offices for routine inquiries.

### Key Capabilities
1. **Personal Custody Holdings**: Real-time view of all laptops, office equipment, and peripherals issued to the user.
2. **Return Deadlines & Timelines**: Clear countdown indicators showing days remaining until equipment return or contract expiry.
3. **Integrated Camera QR Scanner**: Allows the faculty member to scan their equipment's QR tag to verify serial numbers, specifications, and warranty status.
4. **Push Notifications & Intel Alerts**: Instant alerts regarding pending returns, clearance updates, or storekeeper messages.
5. **Digital Exit Clearance (NDC) Wizard**: Enables one-touch exit clearance initiation from a smartphone.

---

## 2. Technology Stack & Multi-Platform Strategy

| Layer | Primary Architecture | Alternative Cross-Platform |
|---|---|---|
| **Framework** | **Responsive Mobile PWA / Web Client** (React 18 + Tailwind) | **React Native** / **Flutter** |
| **Styling** | Mobile-First Tailwind CSS (Viewport constrained, touch targets $\ge 44\text{px}$) | Native StyleSheet / Cupertino |
| **Camera Access** | MediaDevices API / HTML5 Video Stream Canvas Scanner | `react-native-camera` / `camera` plugin |
| **Networking** | Fetch API with Bearer Token Storage in Secure Storage | Axios with SecureStore / Keychain |
| **Real-time Comms**| Socket.IO Client + Web Notifications API | Firebase Cloud Messaging (FCM) |

---

## 3. Screen-by-Screen UI/UX Hierarchy

### Screen 1: Mobile Authentication
- Clean university credentials entry (`@iiui.edu` email + secure password).
- 1-Click fast role switcher for demonstration and supervisor review.
- Secure biometric/token caching for instant subsequent launches.

### Screen 2: My Assigned Liabilities (Home Screen)
- Prominent KPI card: **"Active Assets in Custody: X Units"**.
- Card list of issued equipment:
  - Equipment thumbnail, Item Name, Serial Number, Category Badge.
  - Issued Date and Expected Return Date.
  - Countdown tag: Green ($> 15$ days), Amber ($\le 15$ days), Red ($\le 7$ days or Overdue).

### Screen 3: Mobile QR Scanner
- Full-screen or modal camera viewfinder with targeting reticle.
- Optical feedback upon QR detection (haptic buzz + green border highlight).
- Modal sheet detailing scanned asset specs, condition grade, and verified storekeeper stamp.

### Screen 4: Exit Clearance (NDC) Wizard
- Step 1: Automated liability zero-balance check.
- Step 2: Declaration of departure reason / remarks.
- Step 3: Confirmation and live status tracker (`Pending` $\rightarrow$ `Approved`).
- Step 4: Digital certificate viewer with high-resolution university seal.

### Screen 5: Comms Drawer & Help Desk
- Direct chat thread with Departmental Store Manager.
- Instant query submission (e.g., "Requesting charger replacement for Dell Precision").
