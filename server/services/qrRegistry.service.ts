import { db } from "../db";
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export interface QRBatchEntry {
  id: string;
  batchName: string;
  department: string;
  category: string;
  year: string;
  count: number;
  generatedBy: string;
  createdAt: string;
}

export interface QRCodeEntry {
  id: string; // The assetTag (e.g. "IIUI-CS-LAPTOP-2026-000001")
  batchId: string;
  department: string;
  category: string;
  year: string;
  sequence: number;
  qrPayload: string;
  qrImage: string;
  generatedBy: string;
  createdAt: string;
  status: string; // 'generated' | 'printed' | 'bound' | 'issued' | 'returned' | 'retired' | 'lost'
  linkedAssetId: string | null;
}

export interface QRPrintLog {
  id: string;
  qrCodeId: string;
  printedBy: string;
  printedAt: string;
  layout: string;
}

export interface QRBindingLog {
  id: string;
  qrCodeId: string;
  assetId: string | null;
  boundBy: string;
  boundAt: string;
  status: string;
}

export interface QRScanLog {
  id: string;
  qrCodeId: string;
  scannedBy: string;
  scannedAt: string;
  scanType: string;
  scannedPayload: string;
  result: string;
}

export const QRRegistryService = {
  listAll: (): QRCodeEntry[] => {
    return db.prepare("SELECT * FROM qr_codes ORDER BY createdAt DESC").all() as QRCodeEntry[];
  },

  listBatches: (): QRBatchEntry[] => {
    return db.prepare("SELECT * FROM qr_batches ORDER BY createdAt DESC").all() as QRBatchEntry[];
  },

  listPrintLogs: (): any[] => {
    return db.prepare(`
      SELECT p.*, q.department, q.category, q.year
      FROM qr_print_logs p
      LEFT JOIN qr_codes q ON p.qrCodeId = q.id
      ORDER BY p.printedAt DESC
    `).all();
  },

  listScanLogs: (): QRScanLog[] => {
    return db.prepare("SELECT * FROM qr_scan_logs ORDER BY scannedAt DESC").all() as QRScanLog[];
  },

  listBindings: (): any[] => {
    return db.prepare(`
      SELECT b.*, a.assetName, a.serialNumber, q.department, q.category
      FROM qr_bindings b
      LEFT JOIN qr_codes q ON b.qrCodeId = q.id
      LEFT JOIN assets a ON b.assetId = a.id
      ORDER BY b.boundAt DESC
    `).all();
  },

  getAvailable: (): QRCodeEntry[] => {
    return db.prepare("SELECT * FROM qr_codes WHERE linkedAssetId IS NULL ORDER BY id ASC").all() as QRCodeEntry[];
  },

  getNextSequence: (dept: string, category: string, year: string): number => {
    const cleanDept = dept.trim().toUpperCase();
    const cleanCat = category.trim().toUpperCase();
    
    // Check in new qr_codes table
    const maxRegistry = db.prepare(
      "SELECT MAX(sequence) as maxSeq FROM qr_codes WHERE LOWER(department) = LOWER(?) AND LOWER(category) = LOWER(?) AND year = ?"
    ).get(cleanDept, cleanCat, year) as { maxSeq: number | null };

    // Also check legacy assets for compatibility
    const prefix = `IIUI-${cleanDept}-${cleanCat}-${year}-`;
    const assets = db.prepare("SELECT assetTag FROM assets WHERE assetTag LIKE ?").all(prefix + "%") as { assetTag: string }[];
    
    let maxAssetSeq = 0;
    for (const asset of assets) {
      const parts = asset.assetTag.split("-");
      if (parts.length === 5) {
        const seqNum = parseInt(parts[4], 10);
        if (!isNaN(seqNum) && seqNum > maxAssetSeq) {
          maxAssetSeq = seqNum;
        }
      }
    }

    const regSeq = maxRegistry?.maxSeq || 0;
    return Math.max(regSeq, maxAssetSeq) + 1;
  },

  generateQR: async (dept: string, category: string, year: string, generatedBy: string): Promise<QRCodeEntry> => {
    const cleanDept = dept.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    const cleanCat = category.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    const cleanYear = year.trim();

    const batchId = uuidv4();
    const batchName = `Single Gen - ${cleanDept}-${cleanCat}-${cleanYear}`;
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO qr_batches (id, batchName, department, category, year, count, generatedBy, createdAt)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    `).run(batchId, batchName, cleanDept, cleanCat, cleanYear, generatedBy, createdAt);

    const sequence = QRRegistryService.getNextSequence(cleanDept, cleanCat, cleanYear);
    const sequenceStr = String(sequence).padStart(6, "0");
    const assetTag = `IIUI-${cleanDept}-${cleanCat}-${cleanYear}-${sequenceStr}`;

    const existing = db.prepare("SELECT id FROM qr_codes WHERE id = ?").get(assetTag);
    if (existing) {
      throw new Error(`Duplicate prevention: Asset tag ${assetTag} already exists.`);
    }

    const qrPayload = JSON.stringify({
      assetTag,
      department: cleanDept,
      category: cleanCat,
      year: cleanYear,
      timestamp: createdAt
    });

    const qrImage = await QRCode.toDataURL(qrPayload);

    db.prepare(`
      INSERT INTO qr_codes (id, batchId, department, category, year, sequence, qrPayload, qrImage, generatedBy, createdAt, status, linkedAssetId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'generated', NULL)
    `).run(assetTag, batchId, cleanDept, cleanCat, cleanYear, sequence, qrPayload, qrImage, generatedBy, createdAt);

    return {
      id: assetTag,
      batchId,
      department: cleanDept,
      category: cleanCat,
      year: cleanYear,
      sequence,
      qrPayload,
      qrImage,
      generatedBy,
      createdAt,
      status: 'generated',
      linkedAssetId: null
    };
  },

  generateBatch: async (dept: string, category: string, year: string, count: number, generatedBy: string): Promise<QRCodeEntry[]> => {
    const cleanDept = dept.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    const cleanCat = category.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    const cleanYear = year.trim();
    const createdAt = new Date().toISOString();

    const batchId = uuidv4();
    const batchName = `Batch-${cleanDept}-${cleanCat}-${cleanYear}`;
    db.prepare(`
      INSERT INTO qr_batches (id, batchName, department, category, year, count, generatedBy, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(batchId, batchName, cleanDept, cleanCat, cleanYear, count, generatedBy, createdAt);

    let seqStart = QRRegistryService.getNextSequence(cleanDept, cleanCat, cleanYear);
    const results: QRCodeEntry[] = [];

    for (let i = 0; i < count; i++) {
      const sequence = seqStart + i;
      const sequenceStr = String(sequence).padStart(6, "0");
      const assetTag = `IIUI-${cleanDept}-${cleanCat}-${cleanYear}-${sequenceStr}`;

      const existing = db.prepare("SELECT id FROM qr_codes WHERE id = ?").get(assetTag);
      if (existing) {
        continue;
      }

      const qrPayload = JSON.stringify({
        assetTag,
        department: cleanDept,
        category: cleanCat,
        year: cleanYear,
        timestamp: createdAt
      });

      const qrImage = await QRCode.toDataURL(qrPayload);

      db.prepare(`
        INSERT INTO qr_codes (id, batchId, department, category, year, sequence, qrPayload, qrImage, generatedBy, createdAt, status, linkedAssetId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'generated', NULL)
      `).run(assetTag, batchId, cleanDept, cleanCat, cleanYear, sequence, qrPayload, qrImage, generatedBy, createdAt);

      results.push({
        id: assetTag,
        batchId,
        department: cleanDept,
        category: cleanCat,
        year: cleanYear,
        sequence,
        qrPayload,
        qrImage,
        generatedBy,
        createdAt,
        status: 'generated',
        linkedAssetId: null
      });
    }

    return results;
  },

  logPrint: (qrCodeId: string, printedBy: string, layout: string) => {
    const id = uuidv4();
    const printedAt = new Date().toISOString();
    db.prepare(`
      INSERT INTO qr_print_logs (id, qrCodeId, printedBy, printedAt, layout)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, qrCodeId, printedBy, printedAt, layout);

    db.prepare("UPDATE qr_codes SET status = 'printed' WHERE id = ? AND status = 'generated'").run(qrCodeId);
  },

  logScan: (qrCodeId: string, scannedBy: string, scanType: string, scannedPayload: string, result: string) => {
    const id = uuidv4();
    const scannedAt = new Date().toISOString();
    db.prepare(`
      INSERT INTO qr_scan_logs (id, qrCodeId, scannedBy, scannedAt, scanType, scannedPayload, result)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, qrCodeId, scannedBy, scannedAt, scanType, scannedPayload, result);
  },

  bindQR: (assetTag: string, assetId: string, boundBy: string) => {
    const boundAt = new Date().toISOString();
    const existing = db.prepare("SELECT * FROM qr_bindings WHERE qrCodeId = ? AND status = 'active'").get(assetTag);
    if (existing) {
      throw new Error(`QR tag ${assetTag} is already actively bound.`);
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO qr_bindings (id, qrCodeId, assetId, boundBy, boundAt, status)
      VALUES (?, ?, ?, ?, ?, 'active')
    `).run(id, assetTag, assetId, boundBy, boundAt);

    db.prepare("UPDATE qr_codes SET linkedAssetId = ?, status = 'bound' WHERE id = ?").run(assetId, assetTag);
    db.prepare("UPDATE assets SET assetTag = ? WHERE id = ?").run(assetTag, assetId);
  },

  updateStatus: (id: string, status: string) => {
    db.prepare("UPDATE qr_codes SET status = ? WHERE id = ?").run(status, id);
  },

  updatePrintedBatch: (ids: string[], printedBy: string, layout: string) => {
    for (const id of ids) {
      QRRegistryService.logPrint(id, printedBy, layout);
    }
  },

  revokeQR: (assetTag: string) => {
    const entry = db.prepare("SELECT * FROM qr_codes WHERE id = ?").get(assetTag) as QRCodeEntry;
    if (entry && entry.linkedAssetId) {
      db.prepare("UPDATE assets SET status = 'Retired', assetTag = 'TEMP-' || id WHERE id = ?").run(entry.linkedAssetId);
    }
    db.prepare("UPDATE qr_bindings SET status = 'unbound' WHERE qrCodeId = ?").run(assetTag);
    db.prepare("DELETE FROM qr_codes WHERE id = ?").run(assetTag);
  }
};
