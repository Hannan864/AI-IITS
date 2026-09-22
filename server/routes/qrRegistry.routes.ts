import { Router } from "express";
import { QRRegistryController } from "../controllers/qrRegistry.controller";
import { verifyToken } from "../middleware";

const router = Router();

router.get("/api/qr-registry", verifyToken, QRRegistryController.list);
router.get("/api/qr-registry/available", verifyToken, QRRegistryController.listAvailable);
router.get("/api/qr-registry/batches", verifyToken, QRRegistryController.listBatches);
router.get("/api/qr-registry/print-logs", verifyToken, QRRegistryController.listPrintLogs);
router.get("/api/qr-registry/scan-logs", verifyToken, QRRegistryController.listScanLogs);
router.get("/api/qr-registry/bindings", verifyToken, QRRegistryController.listBindings);

router.post("/api/qr-registry/generate", verifyToken, QRRegistryController.generate);
router.post("/api/qr-registry/generate-batch", verifyToken, QRRegistryController.generateBatch);
router.post("/api/qr-registry/mark-printed", verifyToken, QRRegistryController.markPrinted);
router.post("/api/qr-registry/bind", verifyToken, QRRegistryController.bind);
router.post("/api/qr-registry/log-scan", verifyToken, QRRegistryController.logScan);

router.delete("/api/qr-registry/revoke/:assetTag", verifyToken, QRRegistryController.revoke);
router.delete("/api/qr-registry/delete-all", verifyToken, QRRegistryController.deleteAll);
router.delete("/api/qr-registry/delete/:id", verifyToken, QRRegistryController.deleteSingle);

export default router;
