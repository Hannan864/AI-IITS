import { Router } from "express";
import authRoutes from "./auth.routes";
import assetsRoutes from "./assets.routes";
import issuancesRoutes from "./issuances.routes";
import ndcRoutes from "./ndc.routes";
import alertsRoutes from "./alerts.routes";
import usersRoutes from "./users.routes";
import suppliersRoutes from "./suppliers.routes";
import departmentsRoutes from "./departments.routes";
import snapshotRoutes from "./snapshot.routes";
import qrRegistryRoutes from "./qrRegistry.routes";
import chatRoutes from "./chat.routes";
import geminiRoutes from "./gemini.routes";
import systemRoutes from "./system.routes";

const router = Router();

router.use(authRoutes);
router.use(assetsRoutes);
router.use(issuancesRoutes);
router.use(ndcRoutes);
router.use(alertsRoutes);
router.use(usersRoutes);
router.use(suppliersRoutes);
router.use(departmentsRoutes);
router.use(snapshotRoutes);
router.use(qrRegistryRoutes);
router.use(geminiRoutes);
router.use(systemRoutes);
router.use("/api/chat", chatRoutes);

export default router;
