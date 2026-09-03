import jwt from "jsonwebtoken";
import type { JwtPayload as JsonWebTokenPayload } from "jsonwebtoken";
import { env } from "../config/env.ts";

export interface JwtPayload extends JsonWebTokenPayload {
  sub: string;
  role: "user" | "admin";
  email: string;
  name: string;
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "1d" });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
};
