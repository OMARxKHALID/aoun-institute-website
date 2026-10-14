import "server-only";
import { cacheTag } from "next/cache";
import { isValidObjectId } from "mongoose";
import { connectDB, hasDatabase } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import Course from "@/features/courses/models/course";
import Section from "@/features/courses/models/section";
import Lesson from "@/features/courses/models/lesson";
import Quiz from "@/features/quizzes/models/quiz";
import Enrollment from "@/features/enrollments/model";

const plain = (value) => JSON.parse(JSON.stringify(value));

export const getAdminCourses = async () => {
  await requireAdmin();
  await connectDB();
  const [courses, lessonCounts, studentCounts] = await Promise.all([
    Course.find({}, "title slug status price discountPrice category level updatedAt thumbnail").sort({ updatedAt: -1 }).lean(),
    Lesson.aggregate([{ $group: { _id: "$courseId", count: { $sum: 1 } } }]),
    Enrollment.aggregate([{ $match: { status: "active" } }, { $group: { _id: "$courseId", count: { $sum: 1 } } }]),
  ]);
  const lessons = new Map(lessonCounts.map((c) => [String(c._id), c.count]));
  const students = new Map(studentCounts.map((c) => [String(c._id), c.count]));
  return plain(courses.map((c) => ({ ...c, id: String(c._id), lessons: lessons.get(String(c._id)) ?? 0, students: students.get(String(c._id)) ?? 0 })));
};

export const getCourseForEdit = async (id) => {
  await requireAdmin();
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const course = await Course.findById(id).lean();
  if (!course) return null;
  const [sections, lessons, quizzes, students] = await Promise.all([
    Section.find({ courseId: id }).sort({ order: 1 }).lean(),
    Lesson.find({ courseId: id }).sort({ order: 1 }).lean(),
    Quiz.find({ courseId: id }, "title sectionId status order").sort({ order: 1 }).lean(),
    Enrollment.countDocuments({ courseId: id, status: "active" }),
  ]);
  const outline = sections.map((s) => ({
    ...s,
    id: String(s._id),
    lessons: lessons.filter((l) => String(l.sectionId) === String(s._id)).map((l) => ({ ...l, id: String(l._id) })),
    quizzes: quizzes.filter((q) => String(q.sectionId) === String(s._id)).map((q) => ({ ...q, id: String(q._id) })),
  }));
  return plain({ course: { ...course, id: String(course._id) }, outline, students });
};

const CARD_FIELDS = "title slug subtitle category level thumbnail price discountPrice currency estimatedDuration createdAt";

const noDatabase = () => !hasDatabase && process.env.NODE_ENV !== "production";

export const getCatalog = async () => {
  "use cache";
  cacheTag("catalog");
  if (noDatabase()) return [];
  await connectDB();
  const courses = await Course.find({ status: "published" }, CARD_FIELDS).sort({ createdAt: -1 }).lean();
  const counts = await Lesson.aggregate([
    { $match: { courseId: { $in: courses.map((c) => c._id) }, status: "published" } },
    { $group: { _id: "$courseId", count: { $sum: 1 } } },
  ]);
  const lessons = new Map(counts.map((c) => [String(c._id), c.count]));
  return plain(courses.map((c) => ({ ...c, id: String(c._id), lessons: lessons.get(String(c._id)) ?? 0 })));
};

export const getPublicCourse = async (slug) => {
  "use cache";
  cacheTag("catalog");
  if (noDatabase()) return null;
  await connectDB();
  const course = await Course.findOne({ slug, status: "published" }, "-syllabusFile -attachments -contentVersion").lean();
  if (!course) return null;
  cacheTag(`course:${course._id}`);
  const [sections, lessons] = await Promise.all([
    Section.find({ courseId: course._id }, "title order").sort({ order: 1 }).lean(),
    Lesson.find({ courseId: course._id, status: "published" }, "sectionId title order durationSec isFreePreview video.status").sort({ order: 1 }).lean(),
  ]);
  const outline = sections
    .map((s) => ({
      id: String(s._id),
      title: s.title,
      lessons: lessons
        .filter((l) => String(l.sectionId) === String(s._id))
        .map((l) => ({ id: String(l._id), title: l.title, durationSec: l.durationSec, preview: l.isFreePreview && l.video?.status === "ready" })),
    }))
    .filter((s) => s.lessons.length);
  return plain({ ...course, id: String(course._id), outline, lessons: lessons.length });
};
