import { Router } from "express";
import { SnapshotController } from "../controllers/snapshot.controller";
import { verifyToken } from "../middleware";

const router = Router();

router.get("/api/snapshot", verifyToken, SnapshotController.getSnapshot);

export default router;
