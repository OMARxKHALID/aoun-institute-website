"use server";

import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { fail } from "@/lib/validate";
import { rateLimit } from "@/lib/rate-limit";
import QuizAttempt from "@/features/quizzes/models/quiz-attempt";
import ActivityLog from "@/features/progress/models/activity-log";
import { cleanAnswers, createAttempt, findQuizState, gradeAttempt, isExpired } from "@/features/quizzes/service";

const lockMessage = {
  locked: "Finish the lesson or section before taking this quiz.",
  failed: "You have used all your attempts for this quiz.",
};

export const startAttempt = async (quizId) => {
  const user = await requireUser();
  if (!(await rateLimit("quiz", user.id))) return fail("Too many requests. Wait a minute and try again.");
  await connectDB();
  const found = await findQuizState(user, quizId);
  if (!found?.state) return fail("Quiz not available");
  const open = await QuizAttempt.findOne({ userId: user.id, quizId, status: "in_progress" });
  if (open && !isExpired(open)) return { ok: true, data: { attemptId: String(open._id) } };
  if (open) await gradeAttempt(user, open, true);
  if (lockMessage[found.state.status]) return fail(lockMessage[found.state.status]);
  const { maxAttempts } = found.quiz;
  if (maxAttempts && (await QuizAttempt.countDocuments({ userId: user.id, quizId })) >= maxAttempts) return fail(lockMessage.failed);
  const attempt = await createAttempt(user, found.quiz).catch((error) => (error?.code === 11000 ? null : Promise.reject(error)));
  if (!attempt) return fail("Could not start the quiz. Try again.");
  await ActivityLog.create({ userId: user.id, courseId: found.quiz.courseId, type: "quiz_started", refId: found.quiz._id });
  return { ok: true, data: { attemptId: String(attempt._id) } };
};

const loadOwnAttempt = async (user, attemptId) => {
  if (!isValidObjectId(attemptId)) return null;
  await connectDB();
  return QuizAttempt.findOne({ _id: attemptId, userId: user.id });
};

export const saveAnswers = async (attemptId, answers) => {
  const user = await requireUser();
  const attempt = await loadOwnAttempt(user, attemptId);
  if (!attempt || attempt.status !== "in_progress") return fail("This attempt is closed");
  if (isExpired(attempt)) {
    await gradeAttempt(user, attempt, true);
    return fail("Time is up. Your saved answers were submitted.");
  }
  await QuizAttempt.updateOne({ _id: attempt._id, status: "in_progress" }, { $set: { answers: cleanAnswers(attempt, answers) } });
  return { ok: true };
};

export const submitAttempt = async (attemptId, answers) => {
  const user = await requireUser();
  if (!(await rateLimit("quiz", user.id))) return fail("Too many requests. Wait a minute and try again.");
  const attempt = await loadOwnAttempt(user, attemptId);
  if (!attempt) return fail("Attempt not found");
  if (attempt.status !== "in_progress") return { ok: true };
  const expired = isExpired(attempt);
  if (!expired) attempt.answers = cleanAnswers(attempt, answers);
  await QuizAttempt.updateOne({ _id: attempt._id }, { $set: { answers: attempt.answers } });
  await gradeAttempt(user, attempt, expired);
  return { ok: true };
};
