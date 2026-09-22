import { Router } from "express";
import { UsersController } from "../controllers/users.controller";
import { verifyToken } from "../middleware";

const router = Router();

router.get("/api/users", verifyToken, UsersController.listUsers);
router.post("/api/users", verifyToken, UsersController.createUser);
router.put("/api/users/:id", verifyToken, UsersController.updateUser);
router.delete("/api/users/:id", verifyToken, UsersController.deleteUser);

export default router;

