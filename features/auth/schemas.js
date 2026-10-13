import { z } from "zod";

const email = z.email({ error: "Enter a valid email" });
const password = z.string().min(8, { error: "At least 8 characters" }).max(128);

export const loginSchema = z.object({ email, password: z.string().min(1, { error: "Enter your password" }) });

export const registerSchema = z
  .object({ name: z.string().trim().min(2, { error: "Enter your full name" }).max(80), email, password, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { error: "Passwords do not match", path: ["confirm"] });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ password, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { error: "Passwords do not match", path: ["confirm"] });
