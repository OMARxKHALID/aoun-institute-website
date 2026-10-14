import { z } from "zod";

export const studyPlanSchema = z.strictObject({
  date: z.iso.date({ error: "Pick a date" }),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: "Pick a time" }),
  durationMin: z.number({ error: "Enter minutes" }).int().min(5).max(600),
  courseId: z.union([z.literal(""), z.string().regex(/^[a-f\d]{24}$/i)]),
  title: z.string().trim().max(120),
});
