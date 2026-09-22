import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { verifyToken } from "../middleware";

const router = Router();

router.use(verifyToken);

router.get("/contacts", ChatController.getContacts);
router.get("/messages/:contactId", ChatController.getMessages);
router.post("/messages", ChatController.sendMessage);

export default router;
