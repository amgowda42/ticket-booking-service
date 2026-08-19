import { type Request, type Response, type NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../utils/jwt.ts";
import { AppError } from "../utils/app-error.ts";
import { hashAccessToken, RevokedToken } from "../models/revoked-token.model.ts";

export interface AuthedRequest extends Request {
  user?: JwtPayload;
  accessToken?: string;
}

export const requireAuth = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new AppError(401, "Missing or invalid Authorization header"));
  }

  const token = header.slice("Bearer ".length);

  try {
    req.user = verifyToken(token);
  } catch {
    return next(new AppError(401, "Invalid or expired token"));
  }

  const isRevoked = await RevokedToken.exists({ tokenHash: hashAccessToken(token) });
  if (isRevoked) return next(new AppError(401, "Token has been revoked. Please sign in again."));

  req.accessToken = token;
  next();
};

export const requireRole = (role: "admin") => {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return next(new AppError(403, "Insufficient permissions"));
    }
    next();
  };
};
