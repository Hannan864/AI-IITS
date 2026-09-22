import { db } from "../db";
import { v4 as uuidv4 } from "uuid";

export const AlertsController = {
  listAlerts: (req: any, res: any) => {
    try {
      // Find all faculty users (Permanent and Visiting)
      const facultyUsers = db.prepare(`
        SELECT id, name, email, role, department, facultyType, contractEndDate
        FROM users
        WHERE role LIKE '%Faculty%'
      `).all() as any[];

      const alerts: any[] = [];
      const now = new Date();

      for (const user of facultyUsers) {
        // Query active issuances linked with asset details
        const activeIssuances = db.prepare(`
          SELECT i.id, i.assetId, a.assetName, a.assetTag, i.issuedDate, i.returnDate
          FROM issuances i
          JOIN assets a ON i.assetId = a.id
          WHERE i.userId = ? AND (i.actualReturnDate IS NULL OR i.status = 'Active')
        `).all(user.id) as any[];

        if (activeIssuances.length === 0) continue;

        let daysRemaining = 999;
        let contractEndDate = user.contractEndDate;

        if (contractEndDate) {
          const endDate = new Date(contractEndDate);
          daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }

        // Check if any specific equipment returnDate has passed
        let hasOverdueAsset = false;
        for (const iss of activeIssuances) {
          if (iss.returnDate && new Date(iss.returnDate) < now) {
            hasOverdueAsset = true;
            break;
          }
        }

        const isVisiting = user.facultyType === "Visiting" || user.role === "Visiting Faculty";
        // Alert trigger conditions based on specification:
        // Visiting faculty: 15-day prior contract expiration alert or already expired
        // Permanent/any faculty: Overdue asset alert or ending contract
        const isExpiringSoon = contractEndDate && daysRemaining <= 15;

        if (isExpiringSoon || hasOverdueAsset || (isVisiting && daysRemaining <= 30)) {
          let status: "Expired" | "Critical" | "Warning" = "Warning";
          let riskLevel: "High" | "Medium" = "Medium";
          let recommendation = "";

          if (contractEndDate && daysRemaining < 0) {
            status = "Expired";
            riskLevel = "High";
            recommendation = `Faculty contract terminated ${Math.abs(daysRemaining)} days ago. Immediate security escalation and physical retrieval mandated.`;
          } else if (contractEndDate && daysRemaining <= 5) {
            status = "Critical";
            riskLevel = "High";
            recommendation = `Critical exit window (${daysRemaining} days left). Freeze university exit clearance (NDC) until physical check-in of all items.`;
          } else if (hasOverdueAsset) {
            status = "Critical";
            riskLevel = "High";
            recommendation = `Assigned assets have crossed expected return timeline. Dispatch immediate recovery reminder.`;
          } else {
            status = "Warning";
            riskLevel = "Medium";
            recommendation = `Contract expiring in ${daysRemaining} days. 15-day smart clearance alert dispatched to initiate voluntary equipment return.`;
          }

          alerts.push({
            id: `alt-${user.id}`,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            department: user.department,
            facultyType: user.facultyType || (isVisiting ? "Visiting" : "Permanent"),
            contractEndDate: contractEndDate || "N/A",
            daysRemaining: contractEndDate ? daysRemaining : 0,
            outstandingCount: activeIssuances.length,
            outstandingAssets: activeIssuances,
            status,
            riskLevel,
            recommendation
          });
        }
      }

      res.json(alerts);
    } catch (err: any) {
      console.error("[AlertsController] Error calculating alerts:", err);
      res.status(500).json({ error: "Failed to calculate predictive clearance alerts", details: err.message });
    }
  },

  sendAlert: (req: any, res: any) => {
    const { userId, title, message } = req.body;
    db.prepare(`
      INSERT INTO notifications (id, userId, title, message, read, createdAt)
      VALUES (?, ?, ?, ?, 0, ?)
    `).run(uuidv4(), userId, title, message, new Date().toISOString());
    res.json({ message: "Alert sent" });
  },

  listNotifications: (req: any, res: any) => {
    const { userId } = req.params;
    const notifications = db.prepare(`
      SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC
    `).all(userId);
    const formatted = notifications.map((n: any) => ({ ...n, read: n.read === 1 }));
    res.json(formatted);
  },

  readNotification: (req: any, res: any) => {
    const { id } = req.params;
    db.prepare(`UPDATE notifications SET read = 1 WHERE id = ?`).run(id);
    res.json({ message: "Notification read" });
  }
};
