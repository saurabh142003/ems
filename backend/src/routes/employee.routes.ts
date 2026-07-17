import { Router } from "express";
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employee.controller";
import { protect, authorize } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate.middleware";
import { createEmployeeSchema } from "../validators/employee.validator";

const router = Router();

// All routes require authentication
router.use(protect);

router.get("/", authorize("Super Admin", "HR Manager"), getEmployees);

router.get("/:id", getEmployeeById); // Auth & Owner check done in controller

router.post(
  "/",
  authorize("Super Admin", "HR Manager"),
  validateRequest(createEmployeeSchema),
  createEmployee,
);

router.put("/:id", updateEmployee); // Auth, Owner, and RBAC checks done in controller

router.delete("/:id", authorize("Super Admin"), deleteEmployee);

export default router;
