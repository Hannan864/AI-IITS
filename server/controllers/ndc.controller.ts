import { db } from "../db";
import { logForensicEvent, sendRealEmail } from "../utils";
import { v4 as uuidv4 } from "uuid";

export const NDCController = {
  request: (req: any, res: any) => {
    const { userId, remarks } = req.body;
    const { user } = req;
    if (user.id !== userId && user.role !== "Admin") return res.status(403).json({ error: "Access Denied" });
    try {
      // Check if user has active assets
      const activeAssets = db.prepare(`
        SELECT count(*) as count FROM issuances WHERE userId = ? AND (actualReturnDate IS NULL OR status = 'Active')
      `).get(userId) as { count: number };

      const nextId = `ndc-${Date.now()}`;
      const requestDate = new Date().toISOString().split("T")[0];
      db.prepare("INSERT INTO ndc_requests (id, userId, requestDate, status, remarks) VALUES (?, ?, ?, 'Pending', ?)").run(
        nextId,
        userId,
        requestDate,
        remarks || (activeAssets.count > 0 ? `Submitted clearance with ${activeAssets.count} assets pending check-in.` : "All assets returned. Requesting final NDC clearance.")
      );

      logForensicEvent(user.email, user.role, "NDC Requested", "ndc", "INFO", `Faculty ${user.name} (${user.email}) requested No Demand Certificate. Outstanding assets: ${activeAssets.count}`);
      res.status(201).json({ message: "NDC request submitted successfully", requestId: nextId });
    } catch(err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  approve: async (req: any, res: any) => {
    const { requestId, status, approvedBy } = req.body;
    const { user } = req;
    if (user.role !== "Admin") return res.status(403).json({ error: "Access Denied. Only Central Administration can approve NDC." });
    try {
      const request = db.prepare("SELECT * FROM ndc_requests WHERE id = ?").get(requestId) as any;
      if (!request) return res.status(404).json({ error: "NDC request not found" });

      const approverEmail = approvedBy || user.email;
      db.prepare("UPDATE ndc_requests SET status = ?, approvedBy = ? WHERE id = ?").run(status, approverEmail, requestId);

      // Create notification for the faculty member
      const notifId = uuidv4();
      const notifTitle = status === "Approved" ? "No Demand Certificate (NDC) Approved" : "No Demand Certificate (NDC) Rejected";
      const notifMessage = status === "Approved" 
        ? `Congratulations! Your No Demand Certificate (NDC) has been approved by ${approverEmail}. Your university clearance is complete.`
        : `Your No Demand Certificate (NDC) request has been rejected by ${approverEmail}. Please verify that all issued university items have been surrendered to the Store.`;

      db.prepare(`
        INSERT INTO notifications (id, userId, title, message, read, createdAt)
        VALUES (?, ?, ?, ?, 0, ?)
      `).run(notifId, request.userId, notifTitle, notifMessage, new Date().toISOString());

      // Log forensic audit
      logForensicEvent(user.email, user.role, `NDC ${status}`, "ndc", status === "Approved" ? "INFO" : "WARNING", `NDC Request ${requestId} marked as ${status} by ${approverEmail}`);

      // Attempt email dispatch
      const faculty = db.prepare("SELECT * FROM users WHERE id = ?").get(request.userId) as any;
      if (faculty && faculty.email) {
        sendRealEmail(faculty.email, notifTitle, notifMessage).catch((e) =>
          console.log("[NDC Notification Dispatch Note]:", e?.message || "Outbox logged")
        );
      }

      res.json({ message: `Request successfully updated to ${status}`, requestId, status });
    } catch(err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  getStatus: (req: any, res: any) => {
    try {
      const list = db.prepare(`
        SELECT n.*, u.name as userName, u.email as userEmail, u.department, u.facultyType 
        FROM ndc_requests n 
        LEFT JOIN users u ON n.userId = u.id 
        ORDER BY n.requestDate DESC
      `).all();
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};
