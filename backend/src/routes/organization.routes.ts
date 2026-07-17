import { Router } from "express";
import {
  getOrgTree,
  getEmployeeReportees,
  updateReportingManager,
} from "../controllers/organization.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

// All routes here require authentication
router.use(protect);
router.use(authorize("Super Admin", "HR Manager"));

router.get("/tree", getOrgTree);
router.get("/:id/reportees", getEmployeeReportees);
router.patch("/:id/manager", updateReportingManager);

export default router;
