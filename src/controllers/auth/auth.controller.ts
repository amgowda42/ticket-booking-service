import { type Request, type Response } from "express";
import { User } from "../../models/user.model.ts";
import { signToken } from "../../utils/jwt.ts";
import { registerSchema, loginSchema } from "../../schemas/auth.schema.ts";
import bcrypt from "bcrypt";
import { AppError } from "../../utils/app-error.ts";
import type { AuthedRequest } from "../../middlewares/auth.middleware.ts";
import { hashAccessToken, RevokedToken } from "../../models/revoked-token.model.ts";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = registerSchema.parse(req.body);

  const existing = await User.findOne({ email });
  if (existing) throw new AppError(409, "Email already in use", { email: ["Email already in use"] });

  const user = await User.create({ name, email, password });
  const token = signToken({
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  res.status(201).json({ success: true, token });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError(401, "Invalid credentials");
  }

  const token = signToken({
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  });
  res.status(200).json({ success: true, token });
};

export const logout = async (req: AuthedRequest, res: Response) => {
  const expiresAt = req.user?.exp;
  const token = req.accessToken;

  if (!token || !expiresAt) throw new AppError(401, "Invalid or expired token");

  await RevokedToken.updateOne(
    { tokenHash: hashAccessToken(token) },
    { $setOnInsert: { expiresAt: new Date(expiresAt * 1000) } },
    { upsert: true },
  );

  res.status(200).json({ success: true, message: "Logged out successfully" });
};
