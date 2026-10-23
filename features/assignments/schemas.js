import { z } from "zod";

const day = z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Pick a date" })]);

export const assignmentSchema = z.strictObject({
  courseId: z.string().regex(/^[a-f\d]{24}$/i, { error: "Choose a course" }),
  title: z.string().trim().min(3, { error: "At least 3 characters" }).max(140),
  instructions: z.string().trim().max(5000),
  dueOn: day,
  status: z.enum(["draft", "published"]),
});

export const submissionSchema = z
  .strictObject({
    text: z.string().trim().max(10000),
    files: z.array(z.object({ url: z.url().optional(), publicId: z.string().min(1), name: z.string().max(200).optional() })).max(5),
  })
  .refine((data) => data.text || data.files.length, { path: ["text"], error: "Write an answer or attach a file" });

export const gradeSchema = z.strictObject({
  grade: z.number({ error: "Enter a score" }).min(0).max(100),
  feedback: z.string().trim().max(3000),
});
