import { type Request, type Response } from "express";
import { User } from "../../models/user.model.ts";
import { signToken } from "../../utils/jwt.ts";
import { registerSchema, loginSchema } from "../../schemas/auth.schema.ts";
import bcrypt from "bcrypt";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = registerSchema.parse(req.body);

  const existing = await User.findOne({ email });
  if (existing) {
    return res
      .status(409)
      .json({ success: false, message: "Email already in use" });
  }

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
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const token = signToken({
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  });
  res.status(200).json({ success: true, token });
};
