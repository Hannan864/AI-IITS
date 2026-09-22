import { Router } from "express";
import { GeminiController } from "../controllers/gemini.controller";
import { verifyToken } from "../middleware";

const router = Router();

router.post("/api/gemini/recovery-plan", verifyToken, GeminiController.recoveryPlan);

export default router;
