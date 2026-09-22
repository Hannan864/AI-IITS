import { db, clearDatabaseData, resetDatabaseData } from "../db";
import fs from "fs";
import path from "path";
import { performance } from "perf_hooks";

export const SystemController = {
  getHealth: (req: any, res: any) => {
    try {
      const t0 = performance.now();
      db.prepare("SELECT 1").get();
      const latencyMs = +(performance.now() - t0).toFixed(2);

      // Database file stats
      const dbPath = path.join(process.cwd(), "database.db");
      let dbSizeBytes = 0;
      try {
        dbSizeBytes = fs.statSync(dbPath).size;
      } catch {
        dbSizeBytes = 0;
      }
      const dbSizeFormatted = (dbSizeBytes / (1024 * 1024)).toFixed(2) + " MB";

      // Real live table counts
      const assetCount = (db.prepare("SELECT COUNT(*) as c FROM assets").get() as any).c;
      const issuanceCount = (db.prepare("SELECT COUNT(*) as c FROM issuances").get() as any).c;
      const activeIssuances = (db.prepare("SELECT COUNT(*) as c FROM issuances WHERE actualReturnDate IS NULL").get() as any).c;
      const userCount = (db.prepare("SELECT COUNT(*) as c FROM users").get() as any).c;
      const qrCodeCount = (db.prepare("SELECT COUNT(*) as c FROM qr_codes").get() as any).c;
      const boundQRCount = (db.prepare("SELECT COUNT(*) as c FROM qr_codes WHERE status = 'bound' OR status = 'issued'").get() as any).c;
      const ndcCount = (db.prepare("SELECT COUNT(*) as c FROM ndc_requests").get() as any).c;
      const logCount = (db.prepare("SELECT COUNT(*) as c FROM logs").get() as any).c;

      // Status breakdown
      const availableAssets = (db.prepare("SELECT COUNT(*) as c FROM assets WHERE status = 'Available'").get() as any).c;
      const issuedAssets = (db.prepare("SELECT COUNT(*) as c FROM assets WHERE status = 'Issued'").get() as any).c;
      const damagedAssets = (db.prepare("SELECT COUNT(*) as c FROM assets WHERE status = 'Damaged' OR condition = 'Damaged'").get() as any).c;

      // Memory & uptime
      const mem = process.memoryUsage();
      const memoryMB = +(mem.heapUsed / (1024 * 1024)).toFixed(1);
      const totalMemoryMB = +(mem.heapTotal / (1024 * 1024)).toFixed(1);
      const rssMB = +(mem.rss / (1024 * 1024)).toFixed(1);
      const uptimeSec = Math.floor(process.uptime());

      // Format uptime
      const hrs = Math.floor(uptimeSec / 3600);
      const mins = Math.floor((uptimeSec % 3600) / 60);
      const secs = uptimeSec % 60;
      const uptimeFormatted = `${hrs}h ${mins}m ${secs}s`;

      // Real recent activity events
      const recentLogs = db.prepare("SELECT * FROM logs ORDER BY date DESC LIMIT 10").all();

      res.json({
        status: "OPERATIONAL",
        latencyMs,
        database: {
          status: "ONLINE",
          engine: "SQLite 3 (WAL)",
          dbSizeBytes,
          dbSizeFormatted,
          tables: {
            assets: assetCount,
            issuances: issuanceCount,
            activeIssuances,
            users: userCount,
            qrCodes: qrCodeCount,
            boundQRCodes: boundQRCount,
            ndcRequests: ndcCount,
            logs: logCount
          },
          inventory: {
            available: availableAssets,
            issued: issuedAssets,
            damaged: damagedAssets
          }
        },
        runtime: {
          nodeVersion: process.version,
          platform: process.platform,
          uptimeSec,
          uptimeFormatted,
          memoryMB,
          totalMemoryMB,
          rssMB,
          port: 3000,
          host: "0.0.0.0"
        },
        recentLogs
      });
    } catch (err: any) {
      console.error("[SystemController] Health check failed:", err);
      res.status(500).json({ status: "DEGRADED", error: err.message });
    }
  },

  resetDatabase: async (req: any, res: any) => {
    try {
      const result = await resetDatabaseData();
      res.json(result);
    } catch (err: any) {
      console.error("[SystemController] Reset failed:", err);
      res.status(500).json({ error: err.message || "Failed to reset database" });
    }
  },

  clearDatabase: async (req: any, res: any) => {
    try {
      const result = await clearDatabaseData();
      res.json(result);
    } catch (err: any) {
      console.error("[SystemController] Clear failed:", err);
      res.status(500).json({ error: err.message || "Failed to clear database" });
    }
  }
};
