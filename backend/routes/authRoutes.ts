import { Router } from "express";
import {
  developmentLogin,
  getCurrentUser,
  googleLogin,
  logout,
} from "../controllers/authController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/google", googleLogin);
router.post("/development", developmentLogin);
router.get("/me", requireAuth, getCurrentUser);
router.post("/logout", logout);

export default router;
