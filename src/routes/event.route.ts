import { Router } from "express";
import {
  createEvent,
  listEvents,
} from "../controllers/event/event.controller.ts";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.ts";

const router = Router();

router.post("/", requireAuth, requireRole("admin"), createEvent);
router.get("/", listEvents);

export default router;
