import "server-only";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import Note from "@/features/notes/model";
import Course from "@/features/courses/models/course";
import Lesson from "@/features/courses/models/lesson";

const plain = (value) => JSON.parse(JSON.stringify(value));

export const getLessonNotes = async (lessonId) => {
  const user = await requireUser();
  if (!isValidObjectId(lessonId)) return [];
  await connectDB();
  const notes = await Note.find({ userId: user.id, lessonId }, "sec body createdAt").sort({ sec: 1, createdAt: 1 }).lean();
  return plain(notes.map((n) => ({ ...n, id: String(n._id) })));
};

export const getAllNotes = async () => {
  const user = await requireUser();
  await connectDB();
  const notes = await Note.find({ userId: user.id }).sort({ updatedAt: -1 }).limit(1000).lean();
  const [courses, lessons] = await Promise.all([
    Course.find({ _id: { $in: [...new Set(notes.map((n) => String(n.courseId)))] } }, "title slug").lean(),
    Lesson.find({ _id: { $in: [...new Set(notes.map((n) => String(n.lessonId)))] } }, "title").lean(),
  ]);
  const course = new Map(courses.map((c) => [String(c._id), c]));
  const lesson = new Map(lessons.map((l) => [String(l._id), l.title]));
  return plain(
    notes
      .filter((n) => course.has(String(n.courseId)))
      .map((n) => ({ id: String(n._id), sec: n.sec, body: n.body, createdAt: n.createdAt, lessonId: String(n.lessonId), lesson: lesson.get(String(n.lessonId)) ?? "Lesson", course: course.get(String(n.courseId)).title, slug: course.get(String(n.courseId)).slug })),
  );
};
