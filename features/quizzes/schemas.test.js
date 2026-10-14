import { expect, test } from "bun:test";
import { questionSchema } from "@/features/quizzes/schemas";

const base = { prompt: "Which keyword?", points: 1, explanation: "", acceptedAnswers: [] };

test("single choice needs exactly one correct option", () => {
  const options = [{ text: "a", isCorrect: true }, { text: "b", isCorrect: true }];
  expect(questionSchema.safeParse({ ...base, type: "single", options }).success).toBe(false);
  expect(questionSchema.safeParse({ ...base, type: "single", options: [options[0], { text: "b", isCorrect: false }] }).success).toBe(true);
});

test("written answers need at least one accepted answer and no options", () => {
  expect(questionSchema.safeParse({ ...base, type: "short_answer", options: [] }).success).toBe(false);
  expect(questionSchema.safeParse({ ...base, type: "short_answer", options: [], acceptedAnswers: ["const"] }).success).toBe(true);
});

test("true/false needs exactly two options", () => {
  const options = [{ text: "True", isCorrect: true }, { text: "False", isCorrect: false }, { text: "Maybe", isCorrect: false }];
  expect(questionSchema.safeParse({ ...base, type: "true_false", options }).success).toBe(false);
});
