import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/stats",
  protect,
  authorize("Super Admin", "HR Manager"),
  getDashboardStats,
);

export default router;
