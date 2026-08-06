import app from "./app.ts";
import { env } from "./config/env.ts";
import logger from "./logger/logger.ts";
import { connectDB, disconnectDB } from "./config/db.ts";
import {
  startExpirySweep,
  stopExpirySweep,
} from "./jobs/expire-bookings.job.ts";

const start = async () => {
  await connectDB();
  startExpirySweep();

  const server = app.listen(env.port, () => {
    logger.info(
      {
        app: env.appName,
        port: env.port,
        pid: process.pid,
      },
      "Server started",
    );
  });

  const SHUTDOWN_TIMEOUT_MS = 10_000;
  let isShuttingDown = false;

  const shutdown = (signal: NodeJS.Signals) => {
    if (isShuttingDown) {
      logger.warn({ signal }, "Shutdown already in progress, ignoring signal");
      return;
    }
    isShuttingDown = true;

    logger.info({ signal }, "Shutdown initiated");

    stopExpirySweep();

    server.close(async (err) => {
      if (err) {
        logger.error({ err }, "Error while closing HTTP server");
        process.exit(1);
      }

      logger.info("HTTP server closed");

      try {
        await disconnectDB();
        logger.info("MongoDB connection closed");
      } catch (dbErr) {
        logger.error({ err: dbErr }, "Error closing MongoDB connection");
      }

      process.exit(0);
    });

    server.closeIdleConnections();

    setTimeout(() => {
      logger.error("Forced shutdown: server did not close in time");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

start().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
