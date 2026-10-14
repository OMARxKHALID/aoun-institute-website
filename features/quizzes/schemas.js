import { z } from "zod";

export const SHOW_ANSWERS = [
  { value: "after_pass", label: "After the student passes" },
  { value: "always", label: "After every attempt" },
  { value: "never", label: "Never" },
];

export const DISPLAY_MODES = [
  { value: "all", label: "All questions on one page" },
  { value: "one", label: "One question at a time" },
];

export const QUESTION_TYPES = [
  { value: "single", label: "Single choice" },
  { value: "multiple", label: "Multiple choice" },
  { value: "true_false", label: "True / False" },
  { value: "short_answer", label: "Written answer" },
];

const objectId = z.string().regex(/^[a-f\d]{24}$/i, { error: "Invalid id" });

export const newQuizSchema = z.strictObject({
  title: z.string().trim().min(2, { error: "At least 2 characters" }).max(120),
  sectionId: objectId,
  lessonId: objectId.nullish(),
});

export const quizSettingsSchema = z.strictObject({
  title: z.string().trim().min(2, { error: "At least 2 characters" }).max(120),
  description: z.string().trim().max(2000),
  passingPercent: z.number({ error: "Enter a number" }).int().min(0).max(100),
  maxAttempts: z.number().int().min(1).max(100).nullish(),
  timeLimitMin: z.number().min(0).max(600).nullish(),
  shuffleQuestions: z.boolean(),
  shuffleOptions: z.boolean(),
  showAnswers: z.enum(SHOW_ANSWERS.map((o) => o.value)),
  displayMode: z.enum(["all", "one"]),
  requiredForCertificate: z.boolean(),
  status: z.enum(["draft", "published"]),
});

export const questionSchema = z
  .strictObject({
    type: z.enum(QUESTION_TYPES.map((o) => o.value)),
    prompt: z.string().trim().min(3, { error: "Write the question" }).max(2000),
    options: z.array(z.object({ text: z.string().trim().min(1, { error: "Option cannot be empty" }).max(500), isCorrect: z.boolean() })).max(10),
    acceptedAnswers: z.array(z.string().trim().min(1).max(200)).max(20),
    points: z.number({ error: "Enter points" }).int().min(1).max(100),
    explanation: z.string().trim().max(2000),
  })
  .superRefine((q, ctx) => {
    if (q.type === "short_answer") {
      if (!q.acceptedAnswers.length) ctx.addIssue({ code: "custom", path: ["acceptedAnswers"], message: "Add at least one accepted answer" });
      return;
    }
    const correct = q.options.filter((o) => o.isCorrect).length;
    if (q.options.length < 2) ctx.addIssue({ code: "custom", path: ["options"], message: "Add at least 2 options" });
    if (q.type === "true_false" && q.options.length !== 2) ctx.addIssue({ code: "custom", path: ["options"], message: "True/False needs exactly 2 options" });
    if (q.type !== "multiple" && correct !== 1) ctx.addIssue({ code: "custom", path: ["options"], message: "Mark exactly one correct answer" });
    if (q.type === "multiple" && correct < 1) ctx.addIssue({ code: "custom", path: ["options"], message: "Mark at least one correct answer" });
  });

export const questionOrderSchema = z.array(objectId).max(500);
