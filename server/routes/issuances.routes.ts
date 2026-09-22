import { Router } from "express";
import { IssuancesController } from "../controllers/issuances.controller";
import { verifyToken, validateBody } from "../middleware";
import { z } from "zod";

const router = Router();

const issueSchema = z.object({
  assetId: z.string().min(1),
  userId: z.string().min(1),
  issuedDate: z.string(),
  returnDate: z.string(),
  issuedBy: z.string().optional()
});

const returnSchema = z.object({
  assetId: z.string().min(1),
  actualReturnDate: z.string().optional(),
  condition: z.string().optional()
});

router.post("/api/issue", verifyToken, validateBody(issueSchema), IssuancesController.issue);
router.post("/api/return", verifyToken, validateBody(returnSchema), IssuancesController.return);
router.post("/api/issuances/return", verifyToken, validateBody(returnSchema), IssuancesController.return);
router.get("/api/issue/history", verifyToken, IssuancesController.history);

export default router;
