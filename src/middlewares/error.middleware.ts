import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

import { env } from "../config/env.ts";
import logger from "../logger/logger.ts";
import { AppError } from "../utils/app-error.ts";

type MongoError = Error & {
  code?: number;
  keyValue?: Record<string, unknown>;
  name?: string;
  errors?: Record<string, { message: string }>;
  type?: string;
  path?: string;
};

type ErrorResponse = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
};

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} was not found`));
};

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const normalized = normalizeError(error as MongoError);

  if (normalized.statusCode >= 500) {
    logger.error({ err: error, method: req.method, path: req.originalUrl }, "Unhandled request error");
  }

  const response: ErrorResponse = {
    success: false,
    message: normalized.message,
  };
  if (normalized.errors) response.errors = normalized.errors;

  res.status(normalized.statusCode).json(response);
};

function normalizeError(error: MongoError): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof ZodError) {
    const errors = error.issues.reduce<Record<string, string[]>>((result, issue) => {
      const field = issue.path.length ? issue.path.map(String).join(".") : "body";
      (result[field] ??= []).push(issue.message);
      return result;
    }, {});
    return new AppError(400, "Validation failed", errors);
  }

  if (error.type === "entity.parse.failed") {
    return new AppError(400, "Request body must contain valid JSON");
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue ?? {})[0] ?? "field";
    return new AppError(409, "A record with this value already exists", {
      [field]: [`${field} is already in use`],
    });
  }

  if (error.name === "ValidationError") {
    const errors = Object.fromEntries(
      Object.entries(error.errors ?? {}).map(([field, value]) => [field, [value.message]]),
    );
    return new AppError(400, "Validation failed", errors);
  }

  if (error.name === "CastError") {
    return new AppError(400, "Invalid value", {
      [String(error.path ?? "id")]: ["Invalid identifier or value"],
    });
  }

  const message = env.nodeEnv === "production" ? "Internal server error" : error.message || "Internal server error";
  return new AppError(500, message);
}
