import { describe, expect, test } from "bun:test";
import { isAnswerCorrect, normalizeAnswer, scoreAttempt } from "@/features/quizzes/grading";

const single = { _id: "q1", type: "single", points: 1, options: [{ _id: "a", isCorrect: false }, { _id: "b", isCorrect: true }] };
const multiple = { _id: "q2", type: "multiple", points: 2, options: [{ _id: "a", isCorrect: true }, { _id: "b", isCorrect: true }, { _id: "c", isCorrect: false }] };
const written = { _id: "q3", type: "short_answer", points: 1, options: [], acceptedAnswers: ["const", "The const keyword"] };

describe("isAnswerCorrect", () => {
  test("single choice needs the one correct option", () => {
    expect(isAnswerCorrect(single, { selected: ["b"] })).toBe(true);
    expect(isAnswerCorrect(single, { selected: ["a"] })).toBe(false);
    expect(isAnswerCorrect(single, { selected: ["a", "b"] })).toBe(false);
  });

  test("multiple choice needs exactly the correct set", () => {
    expect(isAnswerCorrect(multiple, { selected: ["b", "a"] })).toBe(true);
    expect(isAnswerCorrect(multiple, { selected: ["a"] })).toBe(false);
    expect(isAnswerCorrect(multiple, { selected: ["a", "b", "c"] })).toBe(false);
  });

  test("written answers ignore case, spacing and punctuation", () => {
    expect(isAnswerCorrect(written, { text: "  CONST. " })).toBe(true);
    expect(isAnswerCorrect(written, { text: "the  const keyword!" })).toBe(true);
    expect(isAnswerCorrect(written, { text: "let" })).toBe(false);
    expect(isAnswerCorrect(written, { text: "" })).toBe(false);
  });

  test("missing answer is wrong", () => {
    expect(isAnswerCorrect(single, undefined)).toBe(false);
  });
});

describe("scoreAttempt", () => {
  test("adds points and applies the pass mark", () => {
    const answers = [
      { questionId: "q1", selected: ["b"] },
      { questionId: "q2", selected: ["a"] },
      { questionId: "q3", text: "const" },
    ];
    expect(scoreAttempt([single, multiple, written], ["q1", "q2", "q3"], answers, 50)).toEqual({ score: 2, maxScore: 4, percent: 50, passed: true });
    expect(scoreAttempt([single, multiple, written], ["q1", "q2", "q3"], answers, 60).passed).toBe(false);
  });

  test("ignores questions that no longer exist", () => {
    expect(scoreAttempt([single], ["q1", "gone"], [{ questionId: "q1", selected: ["b"] }], 100)).toEqual({ score: 1, maxScore: 1, percent: 100, passed: true });
  });

  test("normalizes unicode and whitespace", () => {
    expect(normalizeAnswer("Ｃｏｎｓｔ\n")).toBe("const");
  });
});
