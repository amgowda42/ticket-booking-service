import { Router } from "express";
import {
  confirmBooking,
  createBooking,
  listMyBookings,
} from "../controllers/booking/booking.controller.ts";
import { requireAuth } from "../middlewares/auth.middleware.ts";

const router = Router();

router.post("/", requireAuth, createBooking);
router.get("/me", requireAuth, listMyBookings);
router.post("/:bookingId/confirm", requireAuth, confirmBooking);

export default router;
