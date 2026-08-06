import { expirePendingBookings } from "../services/booking-expiry.service.ts";
import logger from "../logger/logger.ts";

const SWEEP_INTERVAL_MS = 60_000;

let intervalHandle: NodeJS.Timeout | null = null;
let isSweeping = false;

const runSweep = () => {
  if (isSweeping) return;
  isSweeping = true;

  expirePendingBookings()
    .catch((err) => logger.error({ err }, "Expiry sweep failed"))
    .finally(() => {
      isSweeping = false;
    });
};

export const startExpirySweep = (): void => {
  intervalHandle = setInterval(runSweep, SWEEP_INTERVAL_MS);
};

export const stopExpirySweep = (): void => {
  if (intervalHandle) clearInterval(intervalHandle);
};
