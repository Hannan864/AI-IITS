import { db } from "../db";

export const SnapshotController = {
  getSnapshot: (req: any, res: any) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const snapshot: any = {
        exportedAt: new Date().toISOString(),
        userProfile: user,
      };

      if (user.role === "Admin") {
        snapshot.users = db.prepare("SELECT * FROM users").all();
        snapshot.assets = db.prepare("SELECT * FROM assets").all();
        snapshot.issuances = db.prepare("SELECT * FROM issuances").all();
        snapshot.ndcRequests = db.prepare("SELECT * FROM ndc_requests").all();
        snapshot.logs = db.prepare("SELECT * FROM logs").all();
        snapshot.notifications = db.prepare("SELECT * FROM notifications").all();
      } else if (user.role === "Store Manager") {
        snapshot.assets = db.prepare("SELECT * FROM assets").all();
        snapshot.issuances = db.prepare("SELECT * FROM issuances").all();
        snapshot.ndcRequests = db.prepare("SELECT * FROM ndc_requests").all();
        snapshot.logs = db.prepare("SELECT * FROM logs").all();
      } else if (user.role === "Faculty") {
        snapshot.assets = db.prepare("SELECT * FROM assets WHERE department = ?").all(user.department);
        snapshot.issuances = db.prepare("SELECT * FROM issuances WHERE userId = ?").all(user.id);
        snapshot.ndcStatus = db.prepare("SELECT * FROM ndc_requests WHERE userId = ?").all(user.id);
        snapshot.notifications = db.prepare("SELECT * FROM notifications WHERE userId = ?").all(user.id);
      }

      res.json(snapshot);
    } catch (err: any) {
      console.error("[Snapshot] Failed:", err);
      res.status(500).json({ error: "Failed to generate snapshot" });
    }
  }
};
