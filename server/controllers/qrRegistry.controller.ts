import { QRRegistryService } from "../services/qrRegistry.service";
import { logForensicEvent } from "../utils";
import { db } from "../db";

export const QRRegistryController = {
  list: (req: any, res: any) => {
    try {
      const records = QRRegistryService.listAll();
      res.json(records);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  listAvailable: (req: any, res: any) => {
    try {
      const records = QRRegistryService.getAvailable();
      res.json(records);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  listBatches: (req: any, res: any) => {
    try {
      const records = QRRegistryService.listBatches();
      res.json(records);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  listPrintLogs: (req: any, res: any) => {
    try {
      const records = QRRegistryService.listPrintLogs();
      res.json(records);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  listScanLogs: (req: any, res: any) => {
    try {
      const records = QRRegistryService.listScanLogs();
      res.json(records);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  listBindings: (req: any, res: any) => {
    try {
      const records = QRRegistryService.listBindings();
      res.json(records);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  generate: async (req: any, res: any) => {
    try {
      const { department, category, year } = req.body;
      if (!department || !year) {
        return res.status(400).json({ error: "Department and Year are required." });
      }

      const cleanDept = department.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (cleanDept.length === 0) {
        return res.status(400).json({ error: "Invalid Department abbreviation." });
      }

      const cleanCat = (category || "LAPTOP").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (cleanCat.length === 0) {
        return res.status(400).json({ error: "Invalid Category code." });
      }

      const cleanYear = year.toString().trim();
      if (!/^\d{4}$/.test(cleanYear)) {
        return res.status(400).json({ error: "Year must be a 4-digit number (e.g. 2026)." });
      }

      const record = await QRRegistryService.generateQR(cleanDept, cleanCat, cleanYear, req.user.email);
      logForensicEvent(
        req.user.email,
        req.user.role,
        "Generated Institutional QR Identifier",
        "qr_registry",
        "INFO",
        `Created sequential QR code: ${record.id} for department ${cleanDept} category ${cleanCat}`
      );

      res.status(201).json(record);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  generateBatch: async (req: any, res: any) => {
    try {
      const { department, category, year, count } = req.body;
      if (!department || !year || !count) {
        return res.status(400).json({ error: "Department, Year, and Count are required." });
      }

      const cleanDept = department.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (cleanDept.length === 0) {
        return res.status(400).json({ error: "Invalid Department abbreviation." });
      }

      const cleanCat = (category || "LAPTOP").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (cleanCat.length === 0) {
        return res.status(400).json({ error: "Invalid Category code." });
      }

      const batchCount = parseInt(count, 10);
      if (isNaN(batchCount) || batchCount <= 0 || batchCount > 100) {
        return res.status(400).json({ error: "Count must be a number between 1 and 100." });
      }

      const cleanYear = year.toString().trim();
      if (!/^\d{4}$/.test(cleanYear)) {
        return res.status(400).json({ error: "Year must be a 4-digit number (e.g. 2026)." });
      }

      const records = await QRRegistryService.generateBatch(cleanDept, cleanCat, cleanYear, batchCount, req.user.email);
      logForensicEvent(
        req.user.email,
        req.user.role,
        "Batch Generated Corporate QRs",
        "qr_registry",
        "INFO",
        `Created batch of ${records.length} sequential QRs for department ${cleanDept} (${cleanYear})`
      );

      res.status(201).json(records);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  markPrinted: (req: any, res: any) => {
    try {
      const { ids, layout } = req.body;
      if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ error: "Array of QR ids is required." });
      }

      const selectedLayout = layout || "A4_Label_Small";
      QRRegistryService.updatePrintedBatch(ids, req.user.email, selectedLayout);
      logForensicEvent(
        req.user.email,
        req.user.role,
        "Printed QR Labels",
        "qr_registry",
        "INFO",
        `Set status to printed and recorded print logs for ${ids.length} QR identifiers`
      );
      res.json({ success: true, count: ids.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  bind: (req: any, res: any) => {
    try {
      const { id, assetId } = req.body;
      if (!id || !assetId) {
        return res.status(400).json({ error: "QR Tag id and assetId are required." });
      }

      const query = db.prepare("SELECT * FROM qr_codes WHERE id = ?").get(id) as any;
      if (!query) {
        return res.status(404).json({ error: "QR Code not found in authority registry." });
      }
      if (query.linkedAssetId) {
        return res.status(400).json({ error: "This secure QR has already been bound to another asset." });
      }

      const assetQuery = db.prepare("SELECT * FROM assets WHERE id = ?").get(assetId) as any;
      if (assetQuery && assetQuery.assetTag && !assetQuery.assetTag.includes("TEMP-")) {
        return res.status(400).json({ error: "Target asset is already bound to another secure identifier." });
      }

      QRRegistryService.bindQR(id, assetId, req.user.email);
      
      const qrPayload = query.qrPayload;
      const qrImage = query.qrImage;
      db.prepare("UPDATE assets SET assetTag = ?, qrPayload = ?, qrImage = ? WHERE id = ?").run(id, qrPayload, qrImage, assetId);

      logForensicEvent(
        req.user.email,
        req.user.role,
        "Bound QR Code to Asset",
        "qr_registry",
        "INFO",
        `Bound QR tag ${id} to asset ${assetId}`
      );
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  logScan: (req: any, res: any) => {
    try {
      const { id, scanType, scannedPayload, result } = req.body;
      if (!id) {
        return res.status(400).json({ error: "QR Identifier id is required." });
      }

      const query = db.prepare("SELECT * FROM qr_codes WHERE id = ?").get(id) as any;
      if (!query) {
        return res.status(404).json({ error: "QR Code not found in authority registry during scanning." });
      }

      const finalType = scanType || "lookup";
      const finalPayload = scannedPayload || query.qrPayload;
      const finalResult = result || "Lookup successfully queried";

      QRRegistryService.logScan(id, req.user.email, finalType, finalPayload, finalResult);

      logForensicEvent(
        req.user.email,
        req.user.role,
        "Scanned QR Code Label",
        "qr_registry",
        "INFO",
        `Scanned QR tag ${id} via desk scanner`
      );

      res.json({ success: true, record: query });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  revoke: (req: any, res: any) => {
    try {
      const { assetTag } = req.params;
      QRRegistryService.revokeQR(assetTag);
      logForensicEvent(
        req.user.email,
        req.user.role,
        "Revoked QR Code",
        "qr_registry",
        "WARNING",
        `Revoked QR code and retired any associated asset: ${assetTag}`
      );
      res.json({ success: true, message: `Successfully revoked QR tag: ${assetTag}` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  deleteSingle: (req: any, res: any) => {
    try {
      const { id } = req.params;
      const entry = db.prepare("SELECT * FROM qr_codes WHERE id = ?").get(id) as any;
      if (entry) {
        if (entry.linkedAssetId) {
          db.prepare("UPDATE assets SET assetTag = 'TEMP-' || id, qrPayload = NULL, qrImage = NULL WHERE id = ?").run(entry.linkedAssetId);
        }
        db.prepare("DELETE FROM qr_bindings WHERE qrCodeId = ?").run(id);
        db.prepare("DELETE FROM qr_print_logs WHERE qrCodeId = ?").run(id);
        db.prepare("DELETE FROM qr_scan_logs WHERE qrCodeId = ?").run(id);
        db.prepare("DELETE FROM qr_codes WHERE id = ?").run(id);
      }
      logForensicEvent(
        req.user.email,
        req.user.role,
        "Deleted Single QR Entry",
        "qr_registry",
        "WARNING",
        `Permanently deleted QR register metadata: ${id}`
      );
      res.json({ success: true });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  deleteAll: (req: any, res: any) => {
    try {
      db.prepare("UPDATE assets SET assetTag = 'TEMP-' || id, qrPayload = NULL, qrImage = NULL").run();
      db.prepare("DELETE FROM qr_bindings").run();
      db.prepare("DELETE FROM qr_print_logs").run();
      db.prepare("DELETE FROM qr_scan_logs").run();
      db.prepare("DELETE FROM qr_codes").run();
      db.prepare("DELETE FROM qr_batches").run();

      logForensicEvent(
        req.user.email,
        req.user.role,
        "Cleared QR Ledger Registry",
        "qr_registry",
        "DANGER",
        "Admin purged the entire master barcode identifier ledger indices"
      );
      res.json({ success: true });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
};
