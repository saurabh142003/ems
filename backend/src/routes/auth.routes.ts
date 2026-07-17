import { Router } from "express";
import { login, logout, getMe } from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate.middleware";
import { loginSchema } from "../validators/employee.validator";

const router = Router();

router.post("/login", validateRequest(loginSchema), login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;
