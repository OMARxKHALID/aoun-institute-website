import { z } from "zod";

export const reviewSchema = z.strictObject({
  rating: z.number({ error: "Pick a star rating" }).int().min(1, { error: "Pick a star rating" }).max(5),
  body: z.string().trim().max(1500, { error: "Keep it under 1500 characters" }),
});

export const replySchema = z.strictObject({ body: z.string().trim().min(2, { error: "Write a reply" }).max(1000) });
