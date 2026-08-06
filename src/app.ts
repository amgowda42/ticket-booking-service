import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import { pinoHttp } from "pino-http";

import logger from "./logger/logger.ts";
import healthRoutes from "./routes/health.route.ts";
import authRoutes from "./routes/auth.route.ts";
import eventRoutes from "./routes/event.route.ts";
import bookingRoutes from "./routes/booking.route.ts";
import metricsRoutes from "./routes/metrics.route.ts";

const app: Express = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(
  pinoHttp({
    logger,
  }),
);

app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/bookings", bookingRoutes);
app.use("/metrics", metricsRoutes);

export default app;
