import { Router } from "express";
import { SystemController } from "../controllers/system.controller";
import { verifyToken } from "../middleware";

const router = Router();

// Public / verified diagnostics
router.get("/api/system/health", SystemController.getHealth);

// Admin-level testing & audit utilities
router.post("/api/system/reset-db", verifyToken, SystemController.resetDatabase);
router.post("/api/system/clear-db", verifyToken, SystemController.clearDatabase);

export default router;
