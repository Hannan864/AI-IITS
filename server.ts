import express from "express";
import { createServer } from "http";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import fs from "fs";
import { Server } from "socket.io";
import { initDB } from "./server/db";
import apiRoutes from "./server/routes";

const app = express();
app.set("trust proxy", 1);
app.use(helmet({ 
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  frameguard: false
}));
app.use(cors({ 
  origin: (origin, callback) => callback(null, true), 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], 
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: true 
}));
app.use(express.json());

initDB();

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*", methods: ["GET", "POST"] } });

import { setIoAssets } from "./server/controllers/assets.controller";
setIoAssets(io);

app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", version: "1.0.0", system: "AIITS IIUI" });
});

app.use(apiRoutes);

// Blueprints API
app.get("/api/blueprints", (req, res) => {
  try {
    const manager = fs.existsSync(path.join(process.cwd(), "plan", "store_manager_blueprint.md")) ? fs.readFileSync(path.join(process.cwd(), "plan", "store_manager_blueprint.md"), "utf-8") : "";
    const admin = fs.existsSync(path.join(process.cwd(), "plan", "admin_blueprint.md")) ? fs.readFileSync(path.join(process.cwd(), "plan", "admin_blueprint.md"), "utf-8") : "";
    const faculty = fs.existsSync(path.join(process.cwd(), "plan", "faculty_member_blueprint.md")) ? fs.readFileSync(path.join(process.cwd(), "plan", "faculty_member_blueprint.md"), "utf-8") : "";
    res.json({ manager, admin, faculty });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Unmatched API routes return JSON 404, preventing HTML Vite fallback on API endpoints
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.originalUrl} not found` });
});

// Vite / Static setup
import { createServer as createViteServer } from "vite";

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  httpServer.listen(3000, "0.0.0.0", () => {
    console.log("Central Server booted on http://localhost:3000");
  });
}

startServer();
