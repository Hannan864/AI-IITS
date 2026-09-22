import { Router } from "express";
import { AssetsController } from "../controllers/assets.controller";
import { verifyToken, validateBody } from "../middleware";
import { z } from "zod";

const router = Router();

const assetSchema = z.object({
  assetName: z.string().min(2),
  category: z.string().min(2),
  serialNumber: z.string().min(2),
  purchaseDate: z.string(),
  condition: z.enum(["New", "Good", "Fair", "Damaged", "Repairing"]).default("New"),
  department: z.string().default("General Academy"),
  assetTag: z.string().optional()
});

const updateAssetSchema = z.object({
  assetName: z.string().optional(),
  category: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  condition: z.enum(["New", "Good", "Fair", "Damaged", "Repairing"]).optional(),
  status: z.enum(["Available", "Issued", "Damaged", "Retired"]).optional(),
  department: z.string().optional(),
  assetTag: z.string().optional()
});

router.get("/api/assets", verifyToken, AssetsController.list);
router.post("/api/assets", verifyToken, validateBody(assetSchema), AssetsController.create);
router.put("/api/assets/:id", verifyToken, validateBody(updateAssetSchema), AssetsController.update);
router.delete("/api/assets/:id", verifyToken, AssetsController.delete);
router.get("/api/qr/:tag", verifyToken, AssetsController.scan);
router.get("/api/qr/scan/:assetId", verifyToken, AssetsController.scanByAssetId);
router.get("/api/qr/image/:assetId", verifyToken, AssetsController.qrImage);
router.post("/api/qr/scan", verifyToken, AssetsController.scanPost);

export default router;
