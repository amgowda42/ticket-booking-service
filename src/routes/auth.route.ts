import { Router } from "express";
import {
  exchangeGoogleOAuthCode,
  handleGoogleOAuthCallback,
  login,
  logout,
  register,
  startGoogleOAuth,
} from "../controllers/auth/auth.controller.ts";
import { requireAuth } from "../middlewares/auth.middleware.ts";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", requireAuth, logout);
router.get("/oauth/google", startGoogleOAuth);
router.get("/oauth/google/callback", handleGoogleOAuthCallback);
router.post("/oauth/google/exchange", exchangeGoogleOAuthCode);

export default router;
