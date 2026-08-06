import jwt from "jsonwebtoken";
import { env } from "../config/env.ts";

export interface JwtPayload {
  sub: string;
  role: "user" | "admin";
  email: string;
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "1d" });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
};
