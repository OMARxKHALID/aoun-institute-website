import { expect, test } from "bun:test";
import { BADGES, evaluateBadges } from "@/features/progress/badges";

const empty = { lessons: 0, bestStreak: 0, quizzesPassed: 0, perfectScores: 0, minutes: 0, certificates: 0, notes: 0, questions: 0, reviews: 0 };

test("a new student has no badges", () => {
  expect(evaluateBadges(empty).filter((b) => b.earned)).toHaveLength(0);
});

test("badges unlock at their thresholds", () => {
  const earned = evaluateBadges({ ...empty, lessons: 10, bestStreak: 7, certificates: 1 })
    .filter((b) => b.earned)
    .map((b) => b.id);
  expect(earned).toEqual(["first-lesson", "ten-lessons", "streak-3", "streak-7", "first-certificate"]);
});

test("every badge has a unique id and no rule function leaks out", () => {
  expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
  expect(evaluateBadges(empty).every((b) => !("test" in b))).toBe(true);
});
