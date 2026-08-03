import { Router } from "express";
import {
  getCurrentUser,
  googleLogin,
  logout,
  passwordLogin,
  register,
} from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { authRateLimit } from "../middleware/authRateLimit";

const router = Router();

router.post("/register", authRateLimit, register);
router.post("/login", authRateLimit, passwordLogin);
router.post("/google", authRateLimit, googleLogin);
router.get("/me", requireAuth, getCurrentUser);
router.post("/logout", logout);

export default router;
