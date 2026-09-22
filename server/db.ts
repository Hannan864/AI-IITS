import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

const DATABASE_FILE = path.join(process.cwd(), "database.db");
export const db = new Database(DATABASE_FILE);
db.pragma("foreign_keys = ON");

export async function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      facultyType TEXT NOT NULL,
      contractEndDate TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      assetTag TEXT UNIQUE NOT NULL,
      assetName TEXT NOT NULL,
      category TEXT NOT NULL,
      serialNumber TEXT NOT NULL,
      purchaseDate TEXT NOT NULL,
      condition TEXT NOT NULL,
      status TEXT NOT NULL,
      department TEXT NOT NULL,
      qrPayload TEXT,
      qrImage TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS qr_registry (
      id TEXT PRIMARY KEY,
      department TEXT NOT NULL,
      year TEXT NOT NULL,
      sequence INTEGER NOT NULL,
      qrPayload TEXT NOT NULL,
      qrImage TEXT NOT NULL,
      generatedBy TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'generated',
      linkedAssetId TEXT
    );

    CREATE TABLE IF NOT EXISTS qr_batches (
      id TEXT PRIMARY KEY,
      batchName TEXT NOT NULL,
      department TEXT NOT NULL,
      category TEXT NOT NULL,
      year TEXT NOT NULL,
      count INTEGER NOT NULL,
      generatedBy TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS qr_codes (
      id TEXT PRIMARY KEY,
      batchId TEXT REFERENCES qr_batches(id) ON DELETE CASCADE,
      department TEXT NOT NULL,
      category TEXT NOT NULL,
      year TEXT NOT NULL,
      sequence INTEGER NOT NULL,
      qrPayload TEXT NOT NULL,
      qrImage TEXT NOT NULL,
      generatedBy TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'generated',
      linkedAssetId TEXT
    );

    CREATE TABLE IF NOT EXISTS qr_print_logs (
      id TEXT PRIMARY KEY,
      qrCodeId TEXT REFERENCES qr_codes(id) ON DELETE CASCADE,
      printedBy TEXT NOT NULL,
      printedAt TEXT NOT NULL,
      layout TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS qr_bindings (
      id TEXT PRIMARY KEY,
      qrCodeId TEXT REFERENCES qr_codes(id) ON DELETE CASCADE,
      assetId TEXT REFERENCES assets(id) ON DELETE SET NULL,
      boundBy TEXT NOT NULL,
      boundAt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS qr_scan_logs (
      id TEXT PRIMARY KEY,
      qrCodeId TEXT REFERENCES qr_codes(id) ON DELETE CASCADE,
      scannedBy TEXT NOT NULL,
      scannedAt TEXT NOT NULL,
      scanType TEXT NOT NULL,
      scannedPayload TEXT NOT NULL,
      result TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS issuances (
      id TEXT PRIMARY KEY,
      assetId TEXT REFERENCES assets(id) ON DELETE CASCADE,
      userId TEXT REFERENCES users(id) ON DELETE CASCADE,
      issuedDate TEXT NOT NULL,
      returnDate TEXT NOT NULL,
      actualReturnDate TEXT,
      status TEXT NOT NULL,
      issuedBy TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ndc_requests (
      id TEXT PRIMARY KEY,
      userId TEXT REFERENCES users(id) ON DELETE CASCADE,
      requestDate TEXT NOT NULL,
      status TEXT NOT NULL,
      remarks TEXT NOT NULL,
      approvedBy TEXT
    );

    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      actor TEXT NOT NULL,
      department TEXT NOT NULL,
      action TEXT NOT NULL,
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      details TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      senderId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      receiverId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);

  // Ensure columns exist on assets
  const tableInfo = db.prepare("PRAGMA table_info(assets)").all() as any[];
  const columnNames = tableInfo.map(col => col.name);
  if (!columnNames.includes("qrPayload")) {
    db.exec(`ALTER TABLE assets ADD COLUMN qrPayload TEXT`);
  }
  if (!columnNames.includes("qrImage")) {
    db.exec(`ALTER TABLE assets ADD COLUMN qrImage TEXT`);
  }

  // Seed Default Data
  await seedDefaultData();
}

async function seedDefaultData() {
  const salt = bcrypt.genSaltSync(10);
  const defaultPassHash = bcrypt.hashSync("password123", salt);

  // 1. Seed Essential Users
  const userInsert = db.prepare(`
    INSERT OR REPLACE INTO users (id, name, email, password, role, department, facultyType, contractEndDate, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date();
  // Set visiting contract end dates relative to now:
  // Visiting 1: 10 days from now (Triggers 15-day smart clearance alert)
  const date10Days = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  // Visiting 2: 3 days from now (Triggers Critical exit alert)
  const date3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const defaultUsers = [
    { id: "usr-admin", name: "Administrator", email: "admin@iiui.edu", role: "Admin", department: "Administration", facultyType: "N/A", contract: null },
    { id: "usr-manager", name: "Mian M. Sohail (Store Manager)", email: "manager@iiui.edu", role: "Store Manager", department: "Central Store Operations", facultyType: "N/A", contract: null },
    { id: "usr-faculty-1", name: "Dr. Tariq Mahmood", email: "dr.tariq@iiui.edu", role: "Faculty", department: "Computer Science", facultyType: "Permanent", contract: null },
    { id: "usr-faculty-2", name: "Prof. Mian Sohail", email: "prof.sohail@iiui.edu", role: "Visiting Faculty", department: "Computer Science", facultyType: "Visiting", contract: date10Days },
  ];

  for (const u of defaultUsers) {
    const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(u.id);
    if (!existing) {
      userInsert.run(u.id, u.name, u.email.toLowerCase(), defaultPassHash, u.role, u.department, u.facultyType, u.contract, now.toISOString());
    }
  }

  // 2. Seed Assets, Issuances, Suppliers, NDC, Chat & Logs ONLY on initial fresh database boot (0 users exist prior)
  const countUsersPrior = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (countUsersPrior.count === 0) {
    console.log("[SQLite DB] Seeding default university assets and QR codes...");

    const batchId = uuidv4();
    db.prepare(`
      INSERT OR REPLACE INTO qr_batches (id, batchName, department, category, year, count, generatedBy, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(batchId, "Batch-2026-CS-Primary", "ALL", "CAMPUS", "2026", 12, "admin@iiui.edu", now.toISOString());

    const assetDefs = [
      {
        id: "ast-001",
        tag: "IIUI-CS-LAPTOP-2026-000001",
        name: "Dell Latitude 7420 (Core i7, 16GB, 512GB SSD)",
        category: "Laptop",
        serial: "DL-7420-9942",
        purchaseDate: "2025-08-15",
        condition: "Good",
        status: "Issued",
        dept: "Computer Science"
      },
      {
        id: "ast-002",
        tag: "IIUI-CS-LAPTOP-2026-000002",
        name: "Lenovo ThinkPad X1 Carbon Gen 10",
        category: "Laptop",
        serial: "LP-X1-3310",
        purchaseDate: "2025-09-10",
        condition: "New",
        status: "Issued",
        dept: "Computer Science"
      },
      {
        id: "ast-003",
        tag: "IIUI-EE-LAPTOP-2026-000003",
        name: "HP EliteBook 840 G8 (Core i5, 16GB)",
        category: "Laptop",
        serial: "HP-840-7712",
        purchaseDate: "2025-10-01",
        condition: "Good",
        status: "Issued",
        dept: "Electronic Engineering"
      },
      {
        id: "ast-004",
        tag: "IIUI-CS-LAB-2026-000004",
        name: "Epson EB-L630U Laser Projector (6000 Lumens)",
        category: "Lab Equipment",
        serial: "EP-6000-8812",
        purchaseDate: "2025-11-20",
        condition: "Good",
        status: "Available",
        dept: "Computer Science"
      },
      {
        id: "ast-005",
        tag: "IIUI-CS-LAPTOP-2026-000005",
        name: "Apple MacBook Pro 14\" M2 Pro (AI Research)",
        category: "Laptop",
        serial: "MBP-M2-5501",
        purchaseDate: "2026-01-15",
        condition: "New",
        status: "Available",
        dept: "Computer Science"
      },
      {
        id: "ast-006",
        tag: "IIUI-CS-NET-2026-000006",
        name: "Cisco Catalyst 2960-X 48-Port Switch",
        category: "Networking",
        serial: "CS-2960-104",
        purchaseDate: "2025-06-12",
        condition: "Good",
        status: "Available",
        dept: "Computer Science"
      },
      {
        id: "ast-007",
        tag: "IIUI-ADM-FURN-2026-000007",
        name: "Steelcase High-Back Ergonomic Mesh Chair",
        category: "Furniture",
        serial: "SC-ERG-202",
        purchaseDate: "2025-07-01",
        condition: "Good",
        status: "Issued",
        dept: "Administration"
      },
      {
        id: "ast-008",
        tag: "IIUI-EE-LAB-2026-000008",
        name: "Rigol DS1104Z Plus 100MHz 4-CH Oscilloscope",
        category: "Lab Equipment",
        serial: "RG-DS-9011",
        purchaseDate: "2025-09-25",
        condition: "Good",
        status: "Available",
        dept: "Electronic Engineering"
      }
    ];

    let seq = 1;
    for (const a of assetDefs) {
      const payload = JSON.stringify({
        assetTag: a.tag,
        department: a.dept,
        category: a.category,
        serialNumber: a.serial,
        institution: "IIUI"
      });

      let qrDataUrl = "";
      try {
        qrDataUrl = await QRCode.toDataURL(payload, { width: 256, margin: 1 });
      } catch (err) {
        console.warn("QRCode generation fallback:", err);
      }

      // Insert asset
      db.prepare(`
        INSERT INTO assets (id, assetTag, assetName, category, serialNumber, purchaseDate, condition, status, department, qrPayload, qrImage, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(a.id, a.tag, a.name, a.category, a.serial, a.purchaseDate, a.condition, a.status, a.dept, payload, qrDataUrl, now.toISOString());

      // Insert into qr_codes
      db.prepare(`
        INSERT INTO qr_codes (id, batchId, department, category, year, sequence, qrPayload, qrImage, generatedBy, createdAt, status, linkedAssetId)
        VALUES (?, ?, ?, ?, '2026', ?, ?, ?, 'admin@iiui.edu', ?, ?, ?)
      `).run(a.tag, batchId, a.dept, a.category, seq++, payload, qrDataUrl, now.toISOString(), a.status === 'Issued' ? 'issued' : 'bound', a.id);

      // Insert into qr_bindings
      db.prepare(`
        INSERT INTO qr_bindings (id, qrCodeId, assetId, boundBy, boundAt, status)
        VALUES (?, ?, ?, 'manager@iiui.edu', ?, 'active')
      `).run(`bind-${a.id}`, a.tag, a.id, now.toISOString());
    }

    // Also seed 3 unbound QR codes ready to be scanned/bound in the Binding Office
    const unboundTags = [
      { tag: "IIUI-CS-LAPTOP-2026-000009", cat: "Laptop", dept: "Computer Science" },
      { tag: "IIUI-EE-LAB-2026-000010", cat: "Lab Equipment", dept: "Electronic Engineering" },
      { tag: "IIUI-GEN-EQP-2026-000011", cat: "General Equipment", dept: "Administration" }
    ];

    for (const u of unboundTags) {
      const payload = JSON.stringify({ assetTag: u.tag, department: u.dept, category: u.cat, institution: "IIUI" });
      const qrDataUrl = await QRCode.toDataURL(payload, { width: 256, margin: 1 });
      db.prepare(`
        INSERT INTO qr_codes (id, batchId, department, category, year, sequence, qrPayload, qrImage, generatedBy, createdAt, status, linkedAssetId)
        VALUES (?, ?, ?, ?, '2026', ?, ?, ?, 'manager@iiui.edu', ?, 'generated', NULL)
      `).run(u.tag, batchId, u.dept, u.cat, seq++, payload, qrDataUrl, now.toISOString());
    }
  }

  // 3. Seed Issuances if empty
  const countIssuances = db.prepare("SELECT COUNT(*) as count FROM issuances").get() as { count: number };
  if (countIssuances.count === 0) {
    const checkAsset = db.prepare("SELECT id FROM assets WHERE id = ?");
    const checkUser = db.prepare("SELECT id FROM users WHERE id = ?");
    const issuanceStmt = db.prepare(`
      INSERT INTO issuances (id, assetId, userId, issuedDate, returnDate, actualReturnDate, status, issuedBy)
      VALUES (?, ?, ?, ?, ?, NULL, 'Active', 'manager@iiui.edu')
    `);

    const candidateIssuances = [
      ["iss-001", "ast-001", "usr-faculty-2", "2026-01-20", date10Days],
      ["iss-002", "ast-002", "usr-faculty-1", "2026-02-01", "2026-12-31"],
      ["iss-003", "ast-003", "usr-faculty-1", "2026-01-10", "2026-12-31"],
      ["iss-004", "ast-007", "usr-faculty-1", "2026-01-12", "2026-12-31"],
    ];

    for (const [issId, astId, usrId, issuedDate, retDate] of candidateIssuances) {
      if (checkAsset.get(astId) && checkUser.get(usrId)) {
        try {
          issuanceStmt.run(issId, astId, usrId, issuedDate, retDate);
        } catch (err) {
          console.warn("[DB Seed] Skipped seeding issuance:", issId, err);
        }
      }
    }
  }

  // 4. Seed Suppliers if empty
  const countSuppliers = db.prepare("SELECT COUNT(*) as count FROM suppliers").get() as { count: number };
  if (countSuppliers.count === 0) {
    const supStmt = db.prepare(`INSERT INTO suppliers (id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)`);
    supStmt.run("sup-001", "MegaTech Hardware Solutions Ltd", "sales@megatech.pk", "+92-51-2289410", "Plot 14-B, Blue Area, Islamabad");
    supStmt.run("sup-002", "Pak Office & Lab Furniture Hub", "contact@pakfurniture.pk", "+92-51-4432190", "I-9 Industrial Area, Islamabad");
    supStmt.run("sup-003", "Apex Networking & Telecom Gear", "support@apextelecom.pk", "+92-51-8894120", "G-10 Markaz, Islamabad");
  }

  // 5. Seed NDC Requests if empty
  const countNdc = db.prepare("SELECT COUNT(*) as count FROM ndc_requests").get() as { count: number };
  if (countNdc.count === 0) {
    const checkUser = db.prepare("SELECT id FROM users WHERE id = ?");
    const ndcStmt = db.prepare(`INSERT INTO ndc_requests (id, userId, requestDate, status, remarks, approvedBy) VALUES (?, ?, ?, ?, ?, ?)`);
    if (checkUser.get("usr-faculty-2")) {
      ndcStmt.run("ndc-001", "usr-faculty-2", "2026-09-08", "Pending", "Visiting contract concluding at the end of the academic term. Requesting asset return verification and clearance.", null);
    }
    if (checkUser.get("usr-faculty-1")) {
      ndcStmt.run("ndc-002", "usr-faculty-1", "2026-08-15", "Approved", "Post-doctoral sabbatical research leave clearance. Prior inventory reconciled.", "admin@iiui.edu");
    }
  }

  // 6. Seed Chat Messages if empty
  const countChat = db.prepare("SELECT COUNT(*) as count FROM chat_messages").get() as { count: number };
  if (countChat.count === 0) {
    const chatStmt = db.prepare(`INSERT INTO chat_messages (id, senderId, receiverId, content, timestamp) VALUES (?, ?, ?, ?, ?)`);
    chatStmt.run(uuidv4(), "usr-manager", "usr-admin", "Assalamu Alaikum Administrator, the Q3 asset verification and QR batch audit is ready for your review.", new Date(now.getTime() - 3600000).toISOString());
    chatStmt.run(uuidv4(), "usr-admin", "usr-manager", "Walaikum Assalam Sohail. Please make sure all visiting faculty clearance alerts are flagged in the Smart Clearance module.", new Date(now.getTime() - 1800000).toISOString());
    chatStmt.run(uuidv4(), "usr-faculty-2", "usr-manager", "Hello Store Manager, my visiting contract concludes in 10 days. When may I bring the Dell Latitude in for physical condition grading?", new Date(now.getTime() - 7200000).toISOString());
    chatStmt.run(uuidv4(), "usr-manager", "usr-faculty-2", "Hello Prof. Sohail! You may visit the Central Store desk any working day between 9 AM and 2 PM. We will verify the QR code and update your clearance records.", new Date(now.getTime() - 5400000).toISOString());
  }

  // 7. Seed In-App Notifications if empty
  const countNotifs = db.prepare("SELECT COUNT(*) as count FROM notifications").get() as { count: number };
  if (countNotifs.count === 0) {
    const notifStmt = db.prepare(`INSERT INTO notifications (id, userId, title, message, read, createdAt) VALUES (?, ?, ?, ?, ?, ?)`);
    notifStmt.run(uuidv4(), "usr-faculty-2", "Smart Clearance Alert: Contract Concluding in 10 Days", "Your visiting faculty contract is expiring on " + date10Days + ". Please coordinate with Central Store to return Dell Latitude 7420.", 0, now.toISOString());
    notifStmt.run(uuidv4(), "usr-admin", "Clearance Alert Triggered", "1 visiting faculty member has an upcoming contract date with outstanding assets.", 0, now.toISOString());
    notifStmt.run(uuidv4(), "usr-faculty-1", "Asset Allocated: Steelcase Chair", "Steelcase Ergonomic Chair has been registered to your faculty profile.", 1, new Date(now.getTime() - 86400000).toISOString());
  }

  // 8. Seed Forensic Logs if empty
  const countLogs = db.prepare("SELECT COUNT(*) as count FROM logs").get() as { count: number };
  if (countLogs.count === 0) {
    const logStmt = db.prepare(`INSERT INTO logs (id, date, actor, department, action, type, severity, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    logStmt.run(uuidv4(), now.toISOString(), "admin@iiui.edu", "Administration", "QR Batch Generation", "qr_batch", "INFO", "Generated Batch-2026-CS-Primary with 12 sequential tags.");
    logStmt.run(uuidv4(), now.toISOString(), "manager@iiui.edu", "Central Store", "Asset QR Tag Association", "qr_bind", "INFO", "Bound tag IIUI-CS-LAPTOP-2026-000001 to Dell Latitude 7420.");
    logStmt.run(uuidv4(), now.toISOString(), "manager@iiui.edu", "Central Store", "Asset Issued", "issuances", "INFO", "Issued Dell Latitude 7420 to Prof. Mian Sohail [Visiting Faculty].");
    logStmt.run(uuidv4(), now.toISOString(), "prof.sohail@iiui.edu", "Computer Science", "NDC Requested", "ndc", "INFO", "Prof. Mian Sohail initiated No Demand Certificate clearance process.");
  }
}

export async function clearDatabaseData() {
  // Purge all inventory, transaction, suppliers, and non-default user accounts
  db.exec(`
    DELETE FROM qr_scan_logs;
    DELETE FROM qr_bindings;
    DELETE FROM qr_print_logs;
    DELETE FROM qr_codes;
    DELETE FROM qr_batches;
    DELETE FROM qr_registry;
    DELETE FROM issuances;
    DELETE FROM ndc_requests;
    DELETE FROM notifications;
    DELETE FROM chat_messages;
    DELETE FROM logs;
    DELETE FROM assets;
    DELETE FROM suppliers;
    DELETE FROM users WHERE email NOT IN ('admin@iiui.edu', 'manager@iiui.edu', 'dr.tariq@iiui.edu', 'prof.sohail@iiui.edu');
  `);

  // Log clean state
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO logs (id, date, actor, department, action, type, severity, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), now, "admin@iiui.edu", "Administration", "System Data Cleared", "system", "WARN", "Database data cleared. Preserved quick login accounts (Admin, Store Manager, Faculty) with clean zero data state.");

  return { success: true, message: "Database cleared! Quick login accounts preserved with zero item holdings." };
}

export async function resetDatabaseData() {
  // Purge all and re-seed clean benchmark data
  await clearDatabaseData();
  await seedDefaultData();
  return { success: true, message: "Database reset to benchmark testing state successfully." };
}
