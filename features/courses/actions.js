"use server";

import { updateTag } from "next/cache";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { fail, parse } from "@/lib/validate";
import { destroyAsset, verifyUpload } from "@/lib/cloudinary";
import { recomputeCourse } from "@/features/courses/recompute";
import { deleteVideo } from "@/features/video/mux";
import Course from "@/features/courses/models/course";
import Section from "@/features/courses/models/section";
import Lesson from "@/features/courses/models/lesson";
import Quiz from "@/features/quizzes/models/quiz";
import Question from "@/features/quizzes/models/question";
import Enrollment from "@/features/enrollments/model";
import LessonProgress from "@/features/progress/models/lesson-progress";
import { courseDetailsSchema, lessonSchema, outlineOrderSchema, syllabusSchema, titleSchema } from "@/features/courses/schemas";

const CATALOG_TAG = "catalog";

const invalidate = (courseId) => {
  updateTag(CATALOG_TAG);
  updateTag(`course:${courseId}`);
};

const touchCourse = async (courseId) => {
  await recomputeCourse(courseId);
  invalidate(courseId);
};

const publicIds = (list) => list.filter(Boolean).map((a) => a.publicId);

const verifyNew = async (kind, next, previous) => {
  const before = new Set(publicIds(previous));
  const added = publicIds(next).filter((id) => !before.has(id));
  const checks = await Promise.all(added.map((id) => verifyUpload(kind, id)));
  return checks.find((c) => !c.ok);
};

const destroyRemoved = (kind, next, previous) => {
  const after = new Set(publicIds(next));
  return Promise.all(publicIds(previous).filter((id) => !after.has(id)).map((id) => destroyAsset(id, kind)));
};

const loadCourse = async (id) => {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  return Course.findById(id);
};

const duplicateSlug = (error) => error?.code === 11000 && error?.keyPattern?.slug;

export const createCourse = async (input) => {
  await requireAdmin();
  const result = parse(courseDetailsSchema, input);
  if (!result.ok) return result;
  await connectDB();
  const rejected = await verifyNew("thumbnail", [result.data.thumbnail], []);
  if (rejected) return fail(rejected.error, "thumbnail");
  try {
    const course = await Course.create(result.data);
    updateTag(CATALOG_TAG);
    return { ok: true, data: { id: String(course._id) } };
  } catch (error) {
    if (duplicateSlug(error)) return fail("This URL slug is already used", "slug");
    throw error;
  }
};

export const updateCourseDetails = async (id, input) => {
  await requireAdmin();
  const result = parse(courseDetailsSchema, input);
  if (!result.ok) return result;
  const course = await loadCourse(id);
  if (!course) return fail("Course not found");
  const previous = course.thumbnail?.publicId ? [course.thumbnail] : [];
  const rejected = await verifyNew("thumbnail", [result.data.thumbnail], previous);
  if (rejected) return fail(rejected.error, "thumbnail");
  try {
    await Course.updateOne({ _id: id }, { $set: { ...result.data, thumbnail: result.data.thumbnail ?? null } }, { runValidators: true });
  } catch (error) {
    if (duplicateSlug(error)) return fail("This URL slug is already used", "slug");
    throw error;
  }
  await destroyRemoved("thumbnail", [result.data.thumbnail], previous);
  invalidate(id);
  return { ok: true };
};

export const updateSyllabus = async (id, input) => {
  await requireAdmin();
  const result = parse(syllabusSchema, input);
  if (!result.ok) return result;
  const course = await loadCourse(id);
  if (!course) return fail("Course not found");
  const next = [result.data.syllabusFile, ...result.data.attachments];
  const previous = [course.syllabusFile?.publicId && course.syllabusFile, ...course.attachments];
  const rejected = await verifyNew("document", next, previous);
  if (rejected) return fail(rejected.error, "attachments");
  await Course.updateOne({ _id: id }, { $set: { ...result.data, syllabusFile: result.data.syllabusFile ?? null }, $inc: { contentVersion: 1 } }, { runValidators: true });
  await destroyRemoved("document", next, previous);
  invalidate(id);
  return { ok: true };
};

export const deleteCourse = async (id) => {
  await requireAdmin();
  const course = await loadCourse(id);
  if (!course) return fail("Course not found");
  if (await Enrollment.exists({ courseId: id })) return fail("Students are enrolled in this course. Set it to draft instead of deleting.");
  const [lessons, quizzes] = await Promise.all([Lesson.find({ courseId: id }, "attachments video").lean(), Quiz.find({ courseId: id }, "_id").lean()]);
  await Promise.all([
    Question.deleteMany({ quizId: { $in: quizzes.map((q) => q._id) } }),
    Quiz.deleteMany({ courseId: id }),
    Lesson.deleteMany({ courseId: id }),
    Section.deleteMany({ courseId: id }),
    Course.deleteOne({ _id: id }),
  ]);
  await Promise.all([
    destroyRemoved("thumbnail", [], [course.thumbnail?.publicId && course.thumbnail]),
    destroyRemoved("document", [], [course.syllabusFile?.publicId && course.syllabusFile, ...course.attachments, ...lessons.flatMap((l) => l.attachments)]),
    ...lessons.map((l) => deleteVideo(l.video)),
  ]);
  invalidate(id);
  return { ok: true };
};

export const addSection = async (courseId, input) => {
  await requireAdmin();
  const result = parse(titleSchema, input);
  if (!result.ok) return result;
  if (!(await loadCourse(courseId))) return fail("Course not found");
  const last = await Section.findOne({ courseId }).sort({ order: -1 }).lean();
  const section = await Section.create({ courseId, title: result.data.title, order: (last?.order ?? -1) + 1 });
  invalidate(courseId);
  return { ok: true, data: { id: String(section._id) } };
};

export const renameSection = async (sectionId, input) => {
  await requireAdmin();
  const result = parse(titleSchema, input);
  if (!result.ok) return result;
  if (!isValidObjectId(sectionId)) return fail("Section not found");
  await connectDB();
  const section = await Section.findByIdAndUpdate(sectionId, { title: result.data.title });
  if (!section) return fail("Section not found");
  invalidate(section.courseId);
  return { ok: true };
};

export const deleteSection = async (sectionId) => {
  await requireAdmin();
  if (!isValidObjectId(sectionId)) return fail("Section not found");
  await connectDB();
  const section = await Section.findById(sectionId);
  if (!section) return fail("Section not found");
  const [lessons, quizzes] = await Promise.all([Lesson.find({ sectionId }, "_id attachments video").lean(), Quiz.find({ sectionId }, "_id").lean()]);
  await Promise.all([
    LessonProgress.deleteMany({ lessonId: { $in: lessons.map((l) => l._id) } }),
    Question.deleteMany({ quizId: { $in: quizzes.map((q) => q._id) } }),
    Quiz.deleteMany({ sectionId }),
    Lesson.deleteMany({ sectionId }),
    Section.deleteOne({ _id: sectionId }),
  ]);
  await Promise.all([destroyRemoved("document", [], lessons.flatMap((l) => l.attachments)), ...lessons.map((l) => deleteVideo(l.video))]);
  await touchCourse(section.courseId);
  return { ok: true };
};

export const addLesson = async (sectionId, input) => {
  await requireAdmin();
  const result = parse(titleSchema, input);
  if (!result.ok) return result;
  if (!isValidObjectId(sectionId)) return fail("Section not found");
  await connectDB();
  const section = await Section.findById(sectionId).lean();
  if (!section) return fail("Section not found");
  const last = await Lesson.findOne({ sectionId }).sort({ order: -1 }).lean();
  const lesson = await Lesson.create({ courseId: section.courseId, sectionId, title: result.data.title, order: (last?.order ?? -1) + 1 });
  invalidate(section.courseId);
  return { ok: true, data: { id: String(lesson._id) } };
};

export const updateLesson = async (lessonId, input) => {
  await requireAdmin();
  const result = parse(lessonSchema, input);
  if (!result.ok) return result;
  if (!isValidObjectId(lessonId)) return fail("Lesson not found");
  await connectDB();
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) return fail("Lesson not found");
  const rejected = await verifyNew("document", result.data.attachments, lesson.attachments);
  if (rejected) return fail(rejected.error, "attachments");
  if (lesson.video?.provider === "mux" && lesson.video.status === "ready" && lesson.durationSec) result.data.durationSec = lesson.durationSec;
  const structural = lesson.status !== result.data.status || lesson.durationSec !== result.data.durationSec;
  await Lesson.updateOne({ _id: lessonId }, { $set: result.data }, { runValidators: true });
  await destroyRemoved("document", result.data.attachments, lesson.attachments);
  if (structural) await touchCourse(lesson.courseId);
  else invalidate(lesson.courseId);
  return { ok: true };
};

export const deleteLesson = async (lessonId) => {
  await requireAdmin();
  if (!isValidObjectId(lessonId)) return fail("Lesson not found");
  await connectDB();
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) return fail("Lesson not found");
  await Promise.all([Lesson.deleteOne({ _id: lessonId }), LessonProgress.deleteMany({ lessonId })]);
  await Promise.all([destroyRemoved("document", [], lesson.attachments), deleteVideo(lesson.video)]);
  await touchCourse(lesson.courseId);
  return { ok: true };
};

export const reorderOutline = async (courseId, input) => {
  await requireAdmin();
  const result = parse(outlineOrderSchema, input);
  if (!result.ok) return result;
  if (!(await loadCourse(courseId))) return fail("Course not found");
  const [sections, lessons] = await Promise.all([Section.find({ courseId }, "_id").lean(), Lesson.find({ courseId }, "_id").lean()]);
  const sectionIds = new Set(sections.map((s) => String(s._id)));
  const lessonIds = new Set(lessons.map((l) => String(l._id)));
  const sentLessons = result.data.flatMap((s) => s.lessonIds);
  const valid =
    result.data.length === sectionIds.size &&
    result.data.every((s) => sectionIds.has(s.id)) &&
    sentLessons.length === lessonIds.size &&
    new Set(sentLessons).size === sentLessons.length &&
    sentLessons.every((id) => lessonIds.has(id));
  if (!valid) return fail("The outline changed in another tab. Reload and try again.");
  await Promise.all([
    Section.bulkWrite(result.data.map((s, order) => ({ updateOne: { filter: { _id: s.id }, update: { order } } }))),
    Lesson.bulkWrite(result.data.flatMap((s) => s.lessonIds.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { order, sectionId: s.id } } })))),
  ]);
  await touchCourse(courseId);
  return { ok: true };
};
