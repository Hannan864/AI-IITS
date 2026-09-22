# 13. Notifications & Alerting Pipeline
**Automated Inventory Issuance and Tracking System (AIITS)**
*International Islamic University Islamabad (IIUI)*

---

## 1. Event-Driven Notification Architecture
The notification pipeline ensures that every state transition in the asset lifecycle triggers immediate awareness for affected parties without requiring manual email drafting.

```
       [ Core Event Trigger ]
   (Issuance / Return / NDC / Alert)
                 │
                 ▼
       [ Express Controller ]
  (Executes Action & Builds Payload)
                 │
                 ▼
       [ Insert into `notifications` ]
  (userId, title, message, read = 0)
                 │
                 ▼
    [ Real-time Broadcast via Socket.IO ]
  (socket.broadcast.emit('state_update'))
                 │
                 ▼
       [ Topbar Bell Icon in UI ]
  (Pulsing Red Badge + Dropdown Feed)
```

---

## 2. Notification Trigger Inventory

| Event Code | Trigger Condition | Recipient | Title Template | Body Template |
|---|---|---|---|---|
| `EVT_ISSUE_DISPATCH` | Store Manager checks out asset | Faculty Member | Asset Handover Assigned | "A {category} ({name}) has been issued to you. Expected return date: {returnDate}." |
| `EVT_RETURN_CONFIRM` | Store Manager processes return | Faculty Member | Asset Return Receipt Verified | "Handback of {name} confirmed in {condition} condition. Custody liability released." |
| `EVT_PREDICT_15_DAYS` | Visiting faculty contract $\le 15$ days | Store Manager & Admin | Urgent: 15-Day Clearance Notice | "Visiting Faculty {name}'s contract expires in {days} days with {count} outstanding items." |
| `EVT_PREDICT_7_DAYS` | Visiting faculty contract $\le 7$ days | Faculty Member | Final Recall: Return Hardware | "Urgent: Contract terminates on {date}. Return all university assets to avoid NDC hold." |
| `EVT_NDC_SUBMIT` | Faculty files exit clearance | Store Manager & Admin | New Exit NDC Request Filed | "{name} ({department}) has submitted a No Demand Certificate clearance request." |
| `EVT_NDC_DECISION` | Admin/Manager acts on NDC | Faculty Member | NDC Clearance Status: {Status} | "Your clearance request has been {Status}. Approver remarks: {remarks}." |

---

## 3. UI Component Behavior (Topbar Notification Bell)
1. **Unread Counter Badge**:
   - Computes `notifications.filter(n => !n.read).length`.
   - If count $> 0$, displays an animated pulsing red indicator.
2. **Interactive Dropdown Drawer**:
   - Clicking the bell opens a compact, high-contrast list of notifications.
   - Shows notification title, message excerpt, and timestamp.
   - Unread items are highlighted with a subtle indigo border.
3. **Click-to-Read Action**:
   - Clicking any notification triggers `POST /api/notifications/read/:id`, marking it as read and decrementing the unread badge counter in real time.
