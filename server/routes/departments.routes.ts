import { Router } from "express";
import { DepartmentsController } from "../controllers/departments.controller";

const router = Router();

router.get("/api/departments", DepartmentsController.listDepartments);

export default router;
