"use server";

import { updateTag } from "next/cache";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/dal";
import { fail, parse } from "@/lib/validate";
import Course from "@/features/courses/models/course";
import Lesson from "@/features/courses/models/lesson";
import Section from "@/features/courses/models/section";
import Quiz from "@/features/quizzes/models/quiz";
import Question from "@/features/quizzes/models/question";
import QuizAttempt from "@/features/quizzes/models/quiz-attempt";
import AttemptGrant from "@/features/quizzes/models/attempt-grant";
import { notifyCourseStudents } from "@/features/notifications/service";
import { newQuizSchema, questionOrderSchema, questionSchema, quizSettingsSchema } from "@/features/quizzes/schemas";
import { audit } from "@/features/audit/service";
import { canTeach } from "@/features/courses/access";

const touch = async (courseId) => {
  await Course.updateOne({ _id: courseId }, { $inc: { contentVersion: 1 } });
  updateTag(`course:${courseId}`);
};

const loadQuiz = async (user, quizId) => {
  if (!isValidObjectId(quizId)) return null;
  await connectDB();
  const quiz = await Quiz.findById(quizId);
  return quiz && (await canTeach(user, quiz.courseId)) ? quiz : null;
};

export const createQuiz = async (courseId, input) => {
  const admin = await requireStaff();
  const result = parse(newQuizSchema, input);
  if (!result.ok) return result;
  if (!isValidObjectId(courseId)) return fail("Course not found");
  if (!(await canTeach(admin, courseId))) return fail("You can only manage courses you teach");
  await connectDB();
  const { sectionId, lessonId, title } = result.data;
  if (!(await Section.exists({ _id: sectionId, courseId }))) return fail("Section not found");
  if (lessonId) {
    if (!(await Lesson.exists({ _id: lessonId, courseId }))) return fail("Lesson not found");
    if (await Quiz.exists({ lessonId })) return fail("This lesson already has a quiz");
  }
  const last = await Quiz.findOne({ sectionId }).sort({ order: -1 }).lean();
  const quiz = await Quiz.create({ courseId, sectionId, lessonId: lessonId ?? undefined, title, order: (last?.order ?? -1) + 1 });
  updateTag(`course:${courseId}`);
  await audit(admin, "quiz.create", `Created quiz "${title}"`, { type: "quiz", id: quiz._id });
  return { ok: true, data: { id: String(quiz._id) } };
};

export const updateQuizSettings = async (quizId, input) => {
  const admin = await requireStaff();
  const result = parse(quizSettingsSchema, input);
  if (!result.ok) return result;
  const quiz = await loadQuiz(admin, quizId);
  if (!quiz) return fail("Quiz not found");
  const { timeLimitMin, ...data } = result.data;
  if (data.status === "published" && !(await Question.exists({ quizId }))) return fail("Add at least one question before publishing", "status");
  await Quiz.updateOne({ _id: quizId }, { $set: { ...data, maxAttempts: data.maxAttempts ?? null, timeLimitSec: timeLimitMin ? Math.round(timeLimitMin * 60) : null } });
  await touch(quiz.courseId);
  if (quiz.status === "draft" && data.status === "published") {
    const course = await Course.findById(quiz.courseId, "title status").lean();
    if (course?.status === "published")
      await notifyCourseStudents(quiz.courseId, "notifyNewQuiz", { subject: `New quiz in ${course.title}`, title: "A new quiz is available", text: `"${data.title}" was published in ${course.title}.`, path: `/dashboard/quizzes/${quizId}` });
  }
  await audit(admin, "quiz.update", `Updated quiz "${data.title}" (${data.status})`, { type: "quiz", id: quizId });
  return { ok: true };
};

export const deleteQuiz = async (quizId) => {
  const admin = await requireStaff();
  const quiz = await loadQuiz(admin, quizId);
  if (!quiz) return fail("Quiz not found");
  await Promise.all([Question.deleteMany({ quizId }), QuizAttempt.deleteMany({ quizId }), Quiz.deleteOne({ _id: quizId })]);
  await touch(quiz.courseId);
  await audit(admin, "quiz.delete", `Deleted quiz "${quiz.title}"`, { type: "course", id: quiz.courseId });
  return { ok: true, data: { courseId: String(quiz.courseId) } };
};

export const saveQuestion = async (quizId, questionId, input) => {
  const admin = await requireStaff();
  const result = parse(questionSchema, input);
  if (!result.ok) return result;
  const quiz = await loadQuiz(admin, quizId);
  if (!quiz) return fail("Quiz not found");
  result.data = result.data.type === "short_answer" ? { ...result.data, options: [] } : { ...result.data, acceptedAnswers: [] };
  if (questionId) {
    if (!isValidObjectId(questionId)) return fail("Question not found");
    const updated = await Question.findOneAndUpdate({ _id: questionId, quizId }, { $set: result.data });
    if (!updated) return fail("Question not found");
  } else {
    const last = await Question.findOne({ quizId }).sort({ order: -1 }).lean();
    await Question.create({ ...result.data, quizId, order: (last?.order ?? -1) + 1 });
  }
  await touch(quiz.courseId);
  await audit(admin, "quiz.question", `${questionId ? "Edited" : "Added"} a question in "${quiz.title}"`, { type: "quiz", id: quizId });
  return { ok: true };
};

export const deleteQuestion = async (quizId, questionId) => {
  const admin = await requireStaff();
  const quiz = await loadQuiz(admin, quizId);
  if (!quiz || !isValidObjectId(questionId)) return fail("Question not found");
  await Question.deleteOne({ _id: questionId, quizId });
  if (!(await Question.exists({ quizId }))) await Quiz.updateOne({ _id: quizId }, { $set: { status: "draft" } });
  await touch(quiz.courseId);
  await audit(admin, "quiz.question_delete", `Deleted a question from "${quiz.title}"`, { type: "quiz", id: quizId });
  return { ok: true };
};

export const reorderQuestions = async (quizId, input) => {
  const admin = await requireStaff();
  const result = parse(questionOrderSchema, input);
  if (!result.ok) return result;
  const quiz = await loadQuiz(admin, quizId);
  if (!quiz) return fail("Quiz not found");
  const existing = await Question.find({ quizId }, "_id").lean();
  const ids = new Set(existing.map((q) => String(q._id)));
  if (result.data.length !== ids.size || !result.data.every((id) => ids.has(id))) return fail("The questions changed. Reload and try again.");
  await Question.bulkWrite(result.data.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { order } } })));
  return { ok: true };
};

export const grantExtraAttempt = async (quizId, userId) => {
  const admin = await requireStaff();
  const quiz = await loadQuiz(admin, quizId);
  if (!quiz) return fail("Quiz not found");
  if (!quiz.maxAttempts) return fail("This quiz already has unlimited attempts");
  if (typeof userId !== "string" || !(await QuizAttempt.exists({ quizId: quiz._id, userId }))) return fail("This student has not taken the quiz");
  await AttemptGrant.updateOne({ userId, quizId: quiz._id }, { $inc: { extra: 1 }, $setOnInsert: { courseId: quiz.courseId } }, { upsert: true });
  await audit(admin, "quiz.extra_attempt", `Gave a student one more attempt at "${quiz.title}"`, { type: "student", id: userId });
  return { ok: true };
};
