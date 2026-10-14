import "server-only";
import { randomInt } from "node:crypto";
import { isValidObjectId } from "mongoose";
import Enrollment from "@/features/enrollments/model";
import Quiz from "@/features/quizzes/models/quiz";
import Question from "@/features/quizzes/models/question";
import QuizAttempt from "@/features/quizzes/models/quiz-attempt";
import ActivityLog from "@/features/progress/models/activity-log";
import { buildOutline, recomputeProgress } from "@/features/progress/service";
import { issueCertificateIfEligible } from "@/features/certificates/service";
import { scoreAttempt } from "@/features/quizzes/grading";

const GRACE_MS = 10_000;

const shuffle = (list) => {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

export const findQuizState = async (user, quizId) => {
  if (!isValidObjectId(quizId)) return null;
  const quiz = await Quiz.findOne({ _id: quizId, status: "published" }).lean();
  if (!quiz) return null;
  const enrolled = await Enrollment.exists({ userId: user.id, courseId: quiz.courseId, status: "active" });
  if (!enrolled) return null;
  const result = await buildOutline(user.id, quiz.courseId);
  const state = result.outline.flatMap((s) => [...s.quizzes, ...s.lessons.map((l) => l.quiz).filter(Boolean)]).find((q) => q.id === String(quiz._id));
  const lesson = quiz.lessonId ? result.outline.flatMap((s) => s.lessons).find((l) => l.id === String(quiz.lessonId)) : null;
  return { quiz, state, course: result.course, lesson };
};

export const createAttempt = async (user, quiz) => {
  const questions = await Question.find({ quizId: quiz._id }, "_id options._id").sort({ order: 1 }).lean();
  if (!questions.length) return null;
  const ordered = quiz.shuffleQuestions ? shuffle(questions) : questions;
  const optionOrder = Object.fromEntries(ordered.map((q) => [String(q._id), quiz.shuffleOptions ? shuffle(q.options.map((o) => o._id)) : q.options.map((o) => o._id)]));
  const count = await QuizAttempt.countDocuments({ userId: user.id, quizId: quiz._id });
  const now = Date.now();
  return QuizAttempt.create({
    userId: user.id,
    quizId: quiz._id,
    courseId: quiz.courseId,
    attemptNo: count + 1,
    questionOrder: ordered.map((q) => q._id),
    optionOrder,
    answers: [],
    startedAt: new Date(now),
    expiresAt: quiz.timeLimitSec ? new Date(now + quiz.timeLimitSec * 1000) : undefined,
  });
};

export const isExpired = (attempt) => attempt.expiresAt && Date.now() > new Date(attempt.expiresAt).getTime() + GRACE_MS;

export const cleanAnswers = (attempt, answers) => {
  const allowed = attempt.optionOrder instanceof Map ? attempt.optionOrder : new Map(Object.entries(attempt.optionOrder ?? {}));
  return (Array.isArray(answers) ? answers : [])
    .filter((a) => allowed.has(String(a?.questionId)))
    .map((a) => {
      const options = allowed.get(String(a.questionId)).map(String);
      return {
        questionId: a.questionId,
        selected: [...new Set((a.selected ?? []).map(String))].filter((id) => options.includes(id)),
        text: typeof a.text === "string" ? a.text.slice(0, 500) : undefined,
      };
    });
};

export const gradeAttempt = async (user, attempt, expired = false) => {
  const quiz = await Quiz.findById(attempt.quizId).lean();
  const questions = await Question.find({ quizId: attempt.quizId }).lean();
  const { score, maxScore, percent, passed } = scoreAttempt(questions, attempt.questionOrder, attempt.answers, quiz?.passingPercent ?? 0);
  const updated = await QuizAttempt.findOneAndUpdate(
    { _id: attempt._id, status: "in_progress" },
    { $set: { score, maxScore, percent, passed, submittedAt: new Date(), status: expired ? "expired" : "submitted" } },
    { returnDocument: "after" },
  );
  if (!updated) return QuizAttempt.findById(attempt._id);
  await ActivityLog.create({ userId: user.id, courseId: attempt.courseId, type: "quiz_submitted", refId: attempt.quizId, meta: { percent, passed } });
  const progress = await recomputeProgress(user.id, attempt.courseId);
  if (progress?.stats.eligible) await issueCertificateIfEligible(user, attempt.courseId, progress);
  return updated;
};
