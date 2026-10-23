import "server-only";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireStaff, requireUser } from "@/lib/dal";
import { courseScope } from "@/features/courses/access";
import Discussion from "@/features/discussions/model";
import Course from "@/features/courses/models/course";
import Lesson from "@/features/courses/models/lesson";
import { plain } from "@/lib/format";

const threads = async (questions, viewerId) => {
  const replies = await Discussion.find({ parentId: { $in: questions.map((q) => q._id) } }).sort({ createdAt: 1 }).lean();
  return questions.map((q) => ({
    id: String(q._id),
    authorName: q.authorName,
    instructor: q.instructor,
    body: q.body,
    answered: q.answered,
    createdAt: q.createdAt,
    mine: q.userId === viewerId,
    replies: replies.filter((r) => String(r.parentId) === String(q._id)).map((r) => ({ id: String(r._id), authorName: r.authorName, instructor: r.instructor, body: r.body, createdAt: r.createdAt, mine: r.userId === viewerId })),
  }));
};

export const getLessonDiscussion = async (lessonId) => {
  const user = await requireUser();
  if (!isValidObjectId(lessonId)) return [];
  await connectDB();
  const questions = await Discussion.find({ lessonId, parentId: null }).sort({ createdAt: -1 }).limit(100).lean();
  return plain(await threads(questions, user.id));
};

export const getAdminQuestions = async () => {
  const admin = await requireStaff();
  await connectDB();
  const questions = await Discussion.find({ parentId: null, ...(await courseScope(admin)) }).sort({ answered: 1, createdAt: -1 }).limit(300).lean();
  const [courses, lessons] = await Promise.all([
    Course.find({ _id: { $in: [...new Set(questions.map((q) => String(q.courseId)))] } }, "title slug").lean(),
    Lesson.find({ _id: { $in: [...new Set(questions.map((q) => String(q.lessonId)))] } }, "title").lean(),
  ]);
  const course = new Map(courses.map((c) => [String(c._id), c]));
  const lesson = new Map(lessons.map((l) => [String(l._id), l.title]));
  const list = await threads(questions, admin.id);
  return plain(list.map((t, i) => ({ ...t, course: course.get(String(questions[i].courseId))?.title ?? "Deleted course", courseId: String(questions[i].courseId), lesson: lesson.get(String(questions[i].lessonId)) ?? "Deleted lesson", lessonId: String(questions[i].lessonId) })));
};

