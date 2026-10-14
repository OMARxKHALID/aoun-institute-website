import { z } from "zod";

export const announcementSchema = z.strictObject({
  courseId: z.string().regex(/^[a-f\d]{24}$/i, { error: "Choose a course" }),
  title: z.string().trim().min(3, { error: "At least 3 characters" }).max(140),
  body: z.string().trim().min(5, { error: "Write the message" }).max(5000),
  email: z.boolean(),
});
