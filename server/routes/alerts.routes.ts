import { Router } from "express";
import { AlertsController } from "../controllers/alerts.controller";
import { verifyToken, validateBody } from "../middleware";
import { z } from "zod";

const router = Router();

const notificationSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1)
});

router.get("/api/alerts", verifyToken, AlertsController.listAlerts);
router.post("/api/alerts/send", verifyToken, validateBody(notificationSchema), AlertsController.sendAlert);
router.get("/api/notifications/:userId", verifyToken, AlertsController.listNotifications);
router.post("/api/notifications/read/:id", verifyToken, AlertsController.readNotification);

export default router;
