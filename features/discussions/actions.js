"use server";

import { Types, isValidObjectId } from "mongoose";
import { z } from "zod";
import { connectDB, db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { fail, parse } from "@/lib/validate";
import { rateLimit } from "@/lib/rate-limit";
import { linkEmail, sendEmail } from "@/lib/email";
import Course from "@/features/courses/models/course";
import Lesson from "@/features/courses/models/lesson";
import Enrollment from "@/features/enrollments/model";
import Discussion from "@/features/discussions/model";
import { audit } from "@/features/audit/service";
import { canTeach } from "@/features/courses/access";
import { SITE_URL } from "@/lib/site";
import { notifyInApp } from "@/features/notifications/service";

const bodySchema = z.strictObject({ body: z.string().trim().min(3, { error: "Write a little more" }).max(3000) });

const canPost = async (user, courseId) => (await canTeach(user, courseId)) || Boolean(await Enrollment.exists({ userId: user.id, courseId, status: "active" }));

export const askQuestion = async (lessonId, input) => {
  const user = await requireUser();
  if (!(await rateLimit("community", user.id))) return fail("You are posting too fast. Try again in a few minutes.");
  const result = parse(bodySchema, input);
  if (!result.ok) return result;
  if (!isValidObjectId(lessonId)) return fail("Lesson not found");
  await connectDB();
  const lesson = await Lesson.findById(lessonId, "courseId").lean();
  if (!lesson || !(await canPost(user, lesson.courseId))) return fail("Only enrolled students can ask questions here");
  await Discussion.create({ courseId: lesson.courseId, lessonId, userId: user.id, authorName: user.name, instructor: await canTeach(user, lesson.courseId), body: result.data.body });
  return { ok: true };
};

export const replyToQuestion = async (questionId, input) => {
  const user = await requireUser();
  if (!(await rateLimit("community", user.id))) return fail("You are posting too fast. Try again in a few minutes.");
  const result = parse(bodySchema, input);
  if (!result.ok) return result;
  if (!isValidObjectId(questionId)) return fail("Question not found");
  await connectDB();
  const question = await Discussion.findOne({ _id: questionId, parentId: null });
  if (!question || !(await canPost(user, question.courseId))) return fail("You cannot reply here");
  const instructor = await canTeach(user, question.courseId);
  await Discussion.create({ courseId: question.courseId, lessonId: question.lessonId, parentId: question._id, userId: user.id, authorName: user.name, instructor, body: result.data.body });
  if (instructor) {
    await Discussion.updateOne({ _id: question._id }, { $set: { answered: true } });
    await audit(user, "discussion.answer", `Answered a question from ${question.authorName}`, { type: "course", id: question.courseId });
    const [asker, course, lesson] = await Promise.all([
      Types.ObjectId.isValid(question.userId) ? db.collection("user").findOne({ _id: new Types.ObjectId(question.userId) }, { projection: { email: 1, notifyAnnouncement: 1 } }) : null,
      Course.findById(question.courseId, "slug title").lean(),
      Lesson.findById(question.lessonId, "title").lean(),
    ]);
    if (question.userId !== user.id) await notifyInApp(question.userId, { title: "Your question was answered", text: `${lesson?.title ?? "A lesson"} in ${course?.title ?? "your course"}`, path: `/dashboard/courses/${course?.slug}/lessons/${question.lessonId}#questions` });
    if (asker?.email && asker.notifyAnnouncement !== false && question.userId !== user.id)
      await sendEmail({
        to: asker.email,
        subject: `Your question in ${course?.title} was answered`,
        html: linkEmail({ title: "Your question has an answer", text: `The instructor replied to your question on "${lesson?.title}".`, url: `${SITE_URL}/dashboard/courses/${course?.slug}/lessons/${question.lessonId}#questions`, cta: "Read the answer" }),
      }).catch((error) => console.error("[discussions] email failed", error));
  }
  return { ok: true };
};

export const deleteDiscussion = async (id) => {
  const user = await requireUser();
  if (!isValidObjectId(id)) return fail("Post not found");
  await connectDB();
  const post = await Discussion.findById(id);
  if (!post) return fail("Post not found");
  const admin = await canTeach(user, post.courseId);
  if (!admin && post.userId !== user.id) return fail("You can only delete your own posts");
  await Discussion.deleteMany({ $or: [{ _id: post._id }, { parentId: post._id }] });
  if (admin && post.userId !== user.id) await audit(user, "discussion.delete", `Deleted a post by ${post.authorName}`, { type: "course", id: post.courseId });
  return { ok: true };
};
