import { type Request, type Response } from "express";

export default function getHealth(req: Request, res: Response) {
  res.status(200).json({
    success: true,
    status: "UP",
    processId: process.pid,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}
