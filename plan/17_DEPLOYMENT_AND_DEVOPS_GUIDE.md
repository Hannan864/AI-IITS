# 17. Deployment & DevOps Guide
**Automated Inventory Issuance and Tracking System (AIITS)**
*International Islamic University Islamabad (IIUI)*

---

## 1. Hosting Architecture & Container Runtime

The AIITS application is engineered to deploy seamlessly on Dockerized containers, Google Cloud Run, university on-premises servers (Ubuntu/Debian Linux), or standard VPS environments.

```
       [ Client Browser / Mobile PWA ]
                      │
                      ▼ HTTPS
         [ Nginx Reverse Proxy ] (Port 80/443 -> Port 3000)
                      │
                      ▼
    [ Docker Container: Node.js 20 LTS ]
    ├── Express HTTP Server (Port 3000, 0.0.0.0)
    │   ├── API Routes (/api/*)
    │   ├── WebSocket Engine (Socket.IO)
    │   └── Static Assets & SPA Fallback (dist/)
    └── Relational Database (better-sqlite3 / PostgreSQL)
```

---

## 2. Environment Variables Configuration

Declare all required variables in `.env` (derived from `.env.example`):

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Security & Authentication
JWT_SECRET=super-secure-institutional-key-iiui-2026

# Database Engine (sqlite or postgres)
DB_DIALECT=sqlite
DATABASE_URL=./inventory.db

# Optional AI Document Generator
GEMINI_API_KEY=AIzaSy...your-gemini-key
```

---

## 3. Production Build & Execution Commands

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Build Frontend & Backend Bundles
```bash
npm run build
```
*Build Pipeline Details*:
- Runs `vite build` to compile the React client into static HTML, CSS, and JS bundles inside `dist/`.
- Runs `esbuild server.ts` to package the backend TypeScript server into a self-contained CommonJS artifact `dist/server.cjs`.

### Step 3: Launch Production Server
```bash
npm start
```
*Executes `node dist/server.cjs`*, binding to port `3000` and `0.0.0.0`.

---

## 4. Database Migration: SQLite to PostgreSQL
While the application includes a pre-configured `better-sqlite3` embedded engine for instant zero-dependency execution, enterprise university production can point to PostgreSQL by updating database credentials in `server/db.ts`:
1. Provision PostgreSQL 15+ database: `createdb iiui_aiits`.
2. Apply the DDL schema defined in `plan/04_DATABASE_SCHEMA_AND_DATA_DICTIONARY.md`.
3. Set `DATABASE_URL=postgres://user:password@localhost:5432/iiui_aiits`.
4. Run database seed scripts to populate initial departments, roles, and administrative accounts.

---

## 5. Backup & Disaster Recovery Schedule
- **Automated Daily Snapshots**: Cron job executing SQL dump at 02:00 UTC.
- **Offsite Redundancy**: Compressed archives mirrored to secure offsite university backup storage.
- **Rollback Protocol**: Instant restoration by loading the latest verified database snapshot file into the data directory.
