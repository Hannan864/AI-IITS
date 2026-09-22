import { db } from "../db";
import { logForensicEvent } from "../utils";
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { QRRegistryService } from "./qrRegistry.service";

function getDeptAbbreviation(dept: string): string {
  if (!dept) return "GEN";
  const normalized = dept.trim().toUpperCase();
  if (/^[A-Z0-9]{2,6}$/.test(normalized)) {
    return normalized;
  }
  const map: Record<string, string> = {
    "COMPUTER SCIENCE": "CS",
    "INFORMATION TECHNOLOGY": "IT",
    "SOFTWARE ENGINEERING": "SE",
    "ELECTRICAL ENGINEERING": "EE",
    "MATHEMATICS": "MATH",
    "PHYSICS": "PHYS",
    "MANAGEMENT SCIENCES": "BBA",
    "ADMINISTRATION": "ADMIN",
    "GENERAL ACADEMY": "GEN"
  };
  if (map[normalized]) return map[normalized];
  
  const matches = normalized.match(/\b([A-Z0-9])/g);
  if (matches && matches.length >= 2) {
    return matches.join("").substring(0, 4);
  }
  return normalized.substring(0, 3);
}

function getCategoryAbbreviation(cat: string): string {
  if (!cat) return "EQP";
  const normalized = cat.trim().toUpperCase();
  if (/^[A-Z0-9]{2,6}$/.test(normalized)) {
    return normalized;
  }
  const map: Record<string, string> = {
    "LAPTOP": "LAPTOP",
    "PRINTER": "PRINTER",
    "DESKTOP": "DESKTOP",
    "SERVER": "SERVER",
    "NETWORKING": "NET",
    "FURNITURE": "FURN",
    "LAB EQUIPMENT": "LAB",
    "SOFTWARE": "SOFT"
  };
  if (map[normalized]) return map[normalized];
  return normalized.substring(0, 5).replace(/[^A-Z]/g, "");
}

export const AssetService = {
  listAll: () => db.prepare("SELECT * FROM assets").all(),
  create: async (data: any, creator: string = "system-auto@iiui.edu") => {
    const newId = uuidv4();
      let assetTag = data.assetTag;
      let qrPayload = "";
      let qrImage = "";
      let isExistingQR = false;

      // 1. If an assetTag is passed and starts with IIUI-, check if it's already in the registry and available
      if (assetTag && assetTag.startsWith("IIUI-")) {
        isExistingQR = true;
        const existingQR = db.prepare("SELECT * FROM qr_codes WHERE id = ?").get(assetTag) as any;
        if (existingQR) {
          if (existingQR.linkedAssetId) {
            throw new Error(`The institutional QR Tag ${assetTag} is already assigned/linked to another asset.`);
          }
          qrPayload = existingQR.qrPayload;
          qrImage = existingQR.qrImage;
        } else {
          isExistingQR = false;
          // Create registry entry on the fly using user provided tag
          const parts = assetTag.split("-");
          const dept = parts[1] || "GEN";
          const cat = parts[2] || "EQP";
          const year = parts[3] || String(new Date().getFullYear());
          const seq = parseInt(parts[4] || "1", 10);
          
          qrPayload = JSON.stringify({
            assetTag,
            department: dept,
            category: cat,
            year,
            timestamp: new Date().toISOString()
          });
          qrImage = await QRCode.toDataURL(qrPayload);
          
          try {
            db.prepare(`
              INSERT INTO qr_codes (id, batchId, department, category, year, sequence, qrPayload, qrImage, generatedBy, createdAt, status, linkedAssetId)
              VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, 'bound', ?)
            `).run(assetTag, dept, cat, year, seq, qrPayload, qrImage, creator, new Date().toISOString(), newId);
          } catch(e) { console.error("Error inserting into qr_codes branch 1:", e); throw e; }
        }
      } else {
        // 2. Generate brand new QR code automatically conforming to sequential IIUI standard
        const year = data.purchaseDate ? new Date(data.purchaseDate).getFullYear().toString() : String(new Date().getFullYear());
        const deptAbbr = getDeptAbbreviation(data.department);
        const catAbbr = getCategoryAbbreviation(data.category);
        
        const sequence = QRRegistryService.getNextSequence(deptAbbr, catAbbr, year);
        const sequenceStr = String(sequence).padStart(6, "0");
        assetTag = `IIUI-${deptAbbr}-${catAbbr}-${year}-${sequenceStr}`;
        
        qrPayload = JSON.stringify({
          assetTag,
          department: deptAbbr,
          category: catAbbr,
          year,
          timestamp: new Date().toISOString()
        });
        qrImage = await QRCode.toDataURL(qrPayload);
        
        try {
          db.prepare(`
            INSERT INTO qr_codes (id, batchId, department, category, year, sequence, qrPayload, qrImage, generatedBy, createdAt, status, linkedAssetId)
            VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, 'bound', ?)
          `).run(assetTag, deptAbbr, catAbbr, year, sequence, qrPayload, qrImage, creator, new Date().toISOString(), newId);
        } catch(e) { console.error("Error inserting into qr_codes branch 2:", e); throw e; }
      }

      const insert = db.prepare(`
          INSERT INTO assets (id, assetTag, assetName, category, serialNumber, purchaseDate, condition, status, department, qrPayload, qrImage, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const createdAt = new Date().toISOString();
      try {
        insert.run(newId, assetTag, data.assetName, data.category, data.serialNumber, data.purchaseDate, data.condition, "Available", data.department, qrPayload, qrImage, createdAt);
      } catch(e) { console.error("Error inserting into assets:", e); throw e; }

      if (isExistingQR) {
        try {
          QRRegistryService.bindQR(assetTag, newId, creator);
        } catch(e) { console.error("Error in bindQR:", e); throw e; }
      }
      
      console.log(`[Diagnostic] Created asset conforming to IIUI standard: ${assetTag} with ID: ${newId}`);
    return { id: newId, assetTag, qrPayload, qrImage, ...data, createdAt };
  },
  update: (id: string, data: any) => {
    const update = db.prepare(`
        UPDATE assets SET
          assetName = COALESCE(?, assetName),
          category = COALESCE(?, category),
          serialNumber = COALESCE(?, serialNumber),
          purchaseDate = COALESCE(?, purchaseDate),
          condition = COALESCE(?, condition),
          status = COALESCE(?, status),
          department = COALESCE(?, department)
        WHERE id = ?
      `);
    update.run(data.assetName || null, data.category || null, data.serialNumber || null, data.purchaseDate || null, data.condition || null, data.status || null, data.department || null, id);
    return db.prepare("SELECT * FROM assets WHERE id = ?").get(id);
  },
  delete: (id: string) => {
    db.prepare("DELETE FROM issuances WHERE assetId = ?").run(id);
    db.prepare("DELETE FROM qr_bindings WHERE assetId = ?").run(id);
    db.prepare("UPDATE qr_codes SET linkedAssetId = NULL, status = 'unbound' WHERE linkedAssetId = ?").run(id);
    return db.prepare("DELETE FROM assets WHERE id = ?").run(id);
  },
  findAssetByAssetId: (assetId: string) => db.prepare("SELECT * FROM assets WHERE id = ?").get(assetId),
  findAssetByTag: (tag: string) => {
    const all = AssetService.listAll();
    const normalizedTag = tag.trim().toLowerCase().replace(/\s/g, '');
    return all.find((asset: any) => asset.assetTag.trim().toLowerCase().replace(/\s/g, '') === normalizedTag);
  }
};
