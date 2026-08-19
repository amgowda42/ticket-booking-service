import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .pipe(z.string().email("Enter a valid email address").toLowerCase());

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
