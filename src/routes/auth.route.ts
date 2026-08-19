import { Router } from "express";
import { register, login, logout } from "../controllers/auth/auth.controller.ts";
import { requireAuth } from "../middlewares/auth.middleware.ts";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", requireAuth, logout);

export default router;
