import { Router } from "express";
import { NDCController } from "../controllers/ndc.controller";
import { verifyToken, validateBody } from "../middleware";
import { z } from "zod";

const router = Router();

const ndcRequestSchema = z.object({
  userId: z.string().min(1),
  remarks: z.string().optional()
});

const ndcApproveSchema = z.object({
  requestId: z.string().min(1),
  status: z.enum(["Approved", "Rejected"]),
  approvedBy: z.string().optional()
});

router.post("/api/ndc/request", verifyToken, validateBody(ndcRequestSchema), NDCController.request);
router.post("/api/ndc/approve", verifyToken, validateBody(ndcApproveSchema), NDCController.approve);
router.get("/api/ndc/status", verifyToken, NDCController.getStatus);

export default router;
