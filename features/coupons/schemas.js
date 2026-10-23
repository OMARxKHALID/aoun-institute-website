import { z } from "zod";

export const couponCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9-]{3,30}$/, { error: "Use 3 to 30 letters, numbers or dashes" });

export const couponSchema = z
  .strictObject({
    code: couponCodeSchema,
    kind: z.enum(["percent", "fixed"]),
    value: z.number({ error: "Enter a value" }).positive({ error: "Must be above 0" }).max(10_000_000),
    courseId: z.union([z.literal(""), z.string().regex(/^[a-f\d]{24}$/i)]),
    expiresOn: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Pick a date" })]),
    maxUses: z.number().int().min(1, { error: "At least 1" }).nullish(),
  })
  .refine((data) => data.kind === "fixed" || data.value <= 100, { path: ["value"], error: "A percent discount can be at most 100" });
