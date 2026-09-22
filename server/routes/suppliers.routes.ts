import { Router } from "express";
import { SuppliersController } from "../controllers/suppliers.controller";
import { verifyToken } from "../middleware";

const router = Router();

router.get("/api/suppliers", verifyToken, SuppliersController.listSuppliers);

export default router;
