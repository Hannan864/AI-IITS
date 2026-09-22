# 12. Communication & Chat System Specification
**Automated Inventory Issuance and Tracking System (AIITS)**
*International Islamic University Islamabad (IIUI)*

---

## 1. Architectural Objectives & Communication Matrix
In an institutional environment, communication regarding asset allocations must be structured, professional, and strictly role-bounded to prevent unauthorized escalations while ensuring rapid query resolution.

### Allowed Communication Pathways

```
       +---------------------------------------------+
       |             Administrator (Admin)           |
       +----------------------+----------------------+
                              |
                     (Direct Comms Line)
                              |
       +----------------------v----------------------+
       |          Store Manager (Operations)         |
       +----------------------+----------------------+
                              |
                     (Help Desk Channels)
                              |
       +----------------------v----------------------+
       |           Faculty & Visiting Faculty        |
       +---------------------------------------------+
```

1. **Faculty $\leftrightarrow$ Store Manager**:
   - Faculty members reach out to the Store Manager for equipment allocations, repair requests, charger replacements, or return appointment scheduling.
2. **Store Manager $\leftrightarrow$ Administrator**:
   - Store Managers escalate persistent flight-risk defaulters, requisition new inventory stocks, or report damaged equipment write-offs.
3. **Store Manager Multi-Faculty Inbox**:
   - When faculty members message the Store Manager, their names and departments appear in an organized contact list with unread counters.

---

## 2. Real-Time Comms Architecture

### 2.1 Protocol & Endpoints
- **REST Endpoints**:
  - `GET /api/chat/contacts`: Retrieves authorized contacts matching the current user's role.
  - `GET /api/chat/messages/:contactId`: Loads chronological message history for a specific conversation.
  - `POST /api/chat/messages`: Submits a new text message.
- **Real-Time Delivery**:
  - Express server integrates Socket.IO to broadcast message arrival events to connected client sockets.
  - Client implements optimistic message appending with timestamp display.

### 2.2 Schema & Payload Structures
```json
{
  "id": "msg-9921",
  "senderId": "usr-sohail-001",
  "receiverId": "usr-mgr-1",
  "content": "Hello Store Manager, I have prepared my Dell Precision laptop for handback inspection tomorrow at 11 AM.",
  "timestamp": "2026-09-09T08:30:00.000Z"
}
```

---

## 3. UI/UX Drawer Interaction Design
- Accessible via the **Internal Comms** button located in the primary sidebar across all roles.
- Sliding drawer interface (right side of viewport) with backdrop overlay.
- Contact selector view showing:
  - User name, role badge, department name.
- Active conversation thread view:
  - Back button returning to contact list.
  - Message bubbles differentiated by sender (`isMe`: indigo right-aligned bubble; `other`: slate-800 left-aligned bubble).
  - Auto-scroll to bottom upon new message arrival.
  - Input field with keyboard shortcuts (Enter to send) and disabled state when empty.
