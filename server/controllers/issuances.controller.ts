import { db } from "../db";
import { logForensicEvent } from "../utils";
import { v4 as uuidv4 } from "uuid";

export const IssuancesController = {
  issue: (req: any, res: any) => {
    const { assetId, userId, issuedDate, returnDate, issuedBy } = req.body;
    const user = req.user;
    if (user.role !== "Admin" && user.role !== "Store Manager") return res.status(403).json({ error: "Access Denied." });
    try {
      const asset = db.prepare("SELECT * FROM assets WHERE id = ?").get(assetId) as any;
      if (!asset || asset.status !== "Available") return res.status(400).json({ error: "Asset unavailable" });
      const issueId = `iss-${Date.now()}`;
      db.prepare("INSERT INTO issuances (id, assetId, userId, issuedDate, returnDate, status, issuedBy) VALUES (?, ?, ?, ?, ?, 'Active', ?)").run(issueId, assetId, userId, issuedDate, returnDate, issuedBy || user.email);
      db.prepare("UPDATE assets SET status = 'Issued' WHERE id = ?").run(assetId);
      db.prepare("UPDATE qr_registry SET status = 'issued' WHERE linkedAssetId = ?").run(assetId);
      db.prepare("UPDATE qr_codes SET status = 'issued' WHERE linkedAssetId = ?").run(assetId);
      
      // Dispatch in-app notification to receiver
      db.prepare(`
        INSERT INTO notifications (id, userId, title, message, read, createdAt)
        VALUES (?, ?, ?, ?, 0, ?)
      `).run(
        uuidv4(), 
        userId, 
        `Asset Issued: ${asset.assetName}`, 
        `University asset ${asset.assetName} [Tag: ${asset.assetTag}] has been allocated to your profile. Scheduled return date: ${returnDate}.`,
        new Date().toISOString()
      );

      logForensicEvent(user.email, user.role, "Asset Issued", "issuances", "INFO", `Asset ${asset.assetTag} issued to ${userId}`);
      res.status(201).json({ message: "Asset issued successfully", issueId });
    } catch(err: any) { 
      res.status(500).json({ error: err.message }); 
    }
  },

  return: (req: any, res: any) => {
    const { assetId, actualReturnDate, condition } = req.body;
    const user = req.user;
    if (user.role !== "Admin" && user.role !== "Store Manager") return res.status(403).json({ error: "Access Denied." });
    try {
      // Find asset by id or assetTag
      const asset = db.prepare("SELECT * FROM assets WHERE id = ? OR assetTag = ?").get(assetId, assetId) as any;
      const targetAssetId = asset ? asset.id : assetId;

      const active = db.prepare(`
        SELECT * FROM issuances 
        WHERE (assetId = ? OR assetId = ?) AND (actualReturnDate IS NULL OR actualReturnDate = '' OR status = 'Active') 
        ORDER BY issuedDate DESC LIMIT 1
      `).get(targetAssetId, assetId) as any;
      
      const finalReturnDate = actualReturnDate || new Date().toISOString();
      const newStatus = condition === "Damaged" ? "Damaged" : "Available";

      if (active) {
        db.prepare("UPDATE issuances SET actualReturnDate = ?, status = 'Returned' WHERE id = ?").run(finalReturnDate, active.id);
      }
      
      if (asset) {
        db.prepare("UPDATE assets SET status = ?, condition = COALESCE(?, condition) WHERE id = ?").run(newStatus, condition || null, asset.id);
        db.prepare("UPDATE qr_registry SET status = 'returned' WHERE linkedAssetId = ? OR linkedAssetId = ?").run(asset.id, asset.assetTag);
        db.prepare("UPDATE qr_codes SET status = 'returned' WHERE linkedAssetId = ? OR linkedAssetId = ?").run(asset.id, asset.assetTag);

        // Dispatch return confirmation notification to the faculty member if active
        if (active?.userId) {
          db.prepare(`
            INSERT INTO notifications (id, userId, title, message, read, createdAt)
            VALUES (?, ?, ?, ?, 0, ?)
          `).run(
            uuidv4(),
            active.userId,
            `Asset Return Complete: ${asset.assetName}`,
            `Equipment ${asset.assetName} [Tag: ${asset.assetTag}] has been successfully checked back into Central Store. Condition verified: ${condition || "Good"}.`,
            new Date().toISOString()
          );
        }
      }

      logForensicEvent(user.email, user.role, "Asset Returned", "issuances", "INFO", `Asset ${asset?.assetTag || assetId} checked in. Condition: ${condition || "Normal"}`);
      res.json({ message: "Asset returned successfully" });
    } catch(err: any) { 
      res.status(500).json({ error: err.message }); 
    }
  },

  history: (req: any, res: any) => {
    try {
      const historyList = db.prepare(`
        SELECT i.*, a.assetName, a.assetTag, u.name as userName, u.email as userEmail, u.department 
        FROM issuances i 
        JOIN assets a ON i.assetId = a.id 
        JOIN users u ON i.userId = u.id
        ORDER BY i.issuedDate DESC
      `).all();
      res.json(historyList);
    } catch(err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};
