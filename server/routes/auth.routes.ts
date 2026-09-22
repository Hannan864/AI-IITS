import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateBody, verifyToken } from "../middleware";
import { z } from "zod";
import { RegistrationSchema } from "../../src/lib/validation";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

router.post("/api/auth/login", validateBody(loginSchema), AuthController.login);
router.post("/api/auth/register", validateBody(RegistrationSchema), AuthController.register);
router.get("/api/auth/me", verifyToken, AuthController.me);
router.post("/api/auth/update-password", verifyToken, AuthController.updatePassword);

export default router;
