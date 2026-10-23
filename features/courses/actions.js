"use server";

import { updateTag } from "next/cache";
import { Types, isValidObjectId } from "mongoose";
import { connectDB, db } from "@/lib/db";
import { isAdmin, requireAdmin, requireStaff } from "@/lib/dal";
import { fail, parse } from "@/lib/validate";
import { destroyAsset, verifyUpload } from "@/lib/cloudinary";
import { recomputeCourse } from "@/features/courses/recompute";
import { deleteVideo } from "@/features/video/mux";
import { notifyCourseStudents } from "@/features/notifications/service";
import Course from "@/features/courses/models/course";
import Section from "@/features/courses/models/section";
import Lesson from "@/features/courses/models/lesson";
import Quiz from "@/features/quizzes/models/quiz";
import Question from "@/features/quizzes/models/question";
import Enrollment from "@/features/enrollments/model";
import LessonProgress from "@/features/progress/models/lesson-progress";
import { courseDetailsSchema, lessonSchema, outlineOrderSchema, syllabusSchema, titleSchema } from "@/features/courses/schemas";
import { audit } from "@/features/audit/service";
import { canTeach } from "@/features/courses/access";

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

const announceLesson = async (lesson) => {
  const course = await Course.findById(lesson.courseId, "title slug status").lean();
  if (course?.status !== "published") return;
  await notifyCourseStudents(lesson.courseId, "notifyNewLesson", {
    subject: `New lesson in ${course.title}`,
    title: "A new lesson is available",
    text: `"${lesson.title}" was just added to ${course.title}.`,
    path: `/dashboard/courses/${course.slug}/lessons/${lesson._id}`,
  });
};

const bulk = (Model, ops) => (ops.length ? Model.bulkWrite(ops) : null);

const duplicateSlug = (error) => error?.code === 11000 && error?.keyPattern?.slug;

const NOT_YOURS = "You can only manage courses you teach";

const teacherFor = async (courseId) => {
  const user = await requireStaff();
  return (await canTeach(user, courseId)) ? user : null;
};

export const createCourse = async (input) => {
  const admin = await requireStaff();
  const result = parse(courseDetailsSchema, input);
  if (!result.ok) return result;
  await connectDB();
  const rejected = await verifyNew("thumbnail", [result.data.thumbnail], []);
  if (rejected) return fail(rejected.error, "thumbnail");
  try {
    const owned = isAdmin(admin) ? result.data : { ...result.data, price: 0, discountPrice: null, status: "draft" };
    const course = await Course.create({ ...owned, teacherIds: isAdmin(admin) ? [] : [admin.id] });
    updateTag(CATALOG_TAG);
    await audit(admin, "course.create", `Created course "${result.data.title}"`, { type: "course", id: course._id });
    return { ok: true, data: { id: String(course._id) } };
  } catch (error) {
    if (duplicateSlug(error)) return fail("This URL slug is already used", "slug");
    throw error;
  }
};

export const updateCourseDetails = async (id, input) => {
  const admin = await requireStaff();
  const result = parse(courseDetailsSchema, input);
  if (!result.ok) return result;
  const course = await loadCourse(id);
  if (!course) return fail("Course not found");
  if (!(await canTeach(admin, id))) return fail(NOT_YOURS);
  if (!isAdmin(admin)) Object.assign(result.data, { price: course.price, discountPrice: course.discountPrice ?? null, status: course.status });
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
  await audit(admin, "course.update", `Updated details of "${result.data.title}"`, { type: "course", id });
  return { ok: true };
};

export const updateSyllabus = async (id, input) => {
  const admin = await teacherFor(id);
  if (!admin) return fail(NOT_YOURS);
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
  await audit(admin, "course.syllabus", `Updated syllabus settings of "${course.title}"`, { type: "course", id });
  return { ok: true };
};

export const deleteCourse = async (id) => {
  const admin = await requireAdmin();
  const course = await loadCourse(id);
  if (!course) return fail("Course not found");
  if (await Enrollment.exists({ courseId: id })) return fail("Students are enrolled in this course. Unpublish it instead of deleting.");
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
  await audit(admin, "course.delete", `Deleted course "${course.title}"`, { type: "course", id });
  return { ok: true };
};

export const addSection = async (courseId, input) => {
  const admin = await teacherFor(courseId);
  if (!admin) return fail(NOT_YOURS);
  const result = parse(titleSchema, input);
  if (!result.ok) return result;
  if (!(await loadCourse(courseId))) return fail("Course not found");
  const last = await Section.findOne({ courseId }).sort({ order: -1 }).lean();
  const section = await Section.create({ courseId, title: result.data.title, order: (last?.order ?? -1) + 1 });
  invalidate(courseId);
  await audit(admin, "section.create", `Added section "${result.data.title}"`, { type: "course", id: courseId });
  return { ok: true, data: { id: String(section._id) } };
};

export const renameSection = async (sectionId, input) => {
  const admin = await requireStaff();
  const result = parse(titleSchema, input);
  if (!result.ok) return result;
  if (!isValidObjectId(sectionId)) return fail("Section not found");
  await connectDB();
  const section = await Section.findById(sectionId);
  if (!section) return fail("Section not found");
  if (!(await canTeach(admin, section.courseId))) return fail(NOT_YOURS);
  await Section.updateOne({ _id: sectionId }, { title: result.data.title });
  invalidate(section.courseId);
  await audit(admin, "section.rename", `Renamed a section to "${result.data.title}"`, { type: "course", id: section.courseId });
  return { ok: true };
};

export const deleteSection = async (sectionId) => {
  const admin = await requireStaff();
  if (!isValidObjectId(sectionId)) return fail("Section not found");
  await connectDB();
  const section = await Section.findById(sectionId);
  if (!section) return fail("Section not found");
  if (!(await canTeach(admin, section.courseId))) return fail(NOT_YOURS);
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
  await audit(admin, "section.delete", `Deleted section "${section.title}"`, { type: "course", id: section.courseId });
  return { ok: true };
};

export const addLesson = async (sectionId, input) => {
  const admin = await requireStaff();
  const result = parse(titleSchema, input);
  if (!result.ok) return result;
  if (!isValidObjectId(sectionId)) return fail("Section not found");
  await connectDB();
  const section = await Section.findById(sectionId).lean();
  if (!section) return fail("Section not found");
  if (!(await canTeach(admin, section.courseId))) return fail(NOT_YOURS);
  const last = await Lesson.findOne({ sectionId }).sort({ order: -1 }).lean();
  const lesson = await Lesson.create({ courseId: section.courseId, sectionId, title: result.data.title, order: (last?.order ?? -1) + 1 });
  invalidate(section.courseId);
  await audit(admin, "lesson.create", `Added lesson "${result.data.title}"`, { type: "lesson", id: lesson._id });
  return { ok: true, data: { id: String(lesson._id) } };
};

export const updateLesson = async (lessonId, input) => {
  const admin = await requireStaff();
  const result = parse(lessonSchema, input);
  if (!result.ok) return result;
  if (!isValidObjectId(lessonId)) return fail("Lesson not found");
  await connectDB();
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) return fail("Lesson not found");
  if (!(await canTeach(admin, lesson.courseId))) return fail(NOT_YOURS);
  const rejected = await verifyNew("document", result.data.attachments, lesson.attachments);
  if (rejected) return fail(rejected.error, "attachments");
  if (lesson.video?.provider === "mux" && lesson.video.status === "ready" && lesson.durationSec) result.data.durationSec = lesson.durationSec;
  result.data.releaseOn = result.data.releaseOn || null;
  const structural = lesson.status !== result.data.status || lesson.durationSec !== result.data.durationSec || (lesson.releaseOn ?? null) !== result.data.releaseOn;
  await Lesson.updateOne({ _id: lessonId }, { $set: result.data }, { runValidators: true });
  await destroyRemoved("document", result.data.attachments, lesson.attachments);
  if (lesson.status === "draft" && result.data.status === "published") await announceLesson({ ...lesson.toObject(), ...result.data });
  if (structural) await touchCourse(lesson.courseId);
  else invalidate(lesson.courseId);
  await audit(admin, "lesson.update", `Updated lesson "${result.data.title}"`, { type: "lesson", id: lessonId });
  return { ok: true };
};

export const deleteLesson = async (lessonId) => {
  const admin = await requireStaff();
  if (!isValidObjectId(lessonId)) return fail("Lesson not found");
  await connectDB();
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) return fail("Lesson not found");
  if (!(await canTeach(admin, lesson.courseId))) return fail(NOT_YOURS);
  const quizIds = (await Quiz.find({ lessonId }, "_id").lean()).map((q) => q._id);
  await Promise.all([
    Lesson.deleteOne({ _id: lessonId }),
    LessonProgress.deleteMany({ lessonId }),
    Question.deleteMany({ quizId: { $in: quizIds } }),
    Quiz.deleteMany({ _id: { $in: quizIds } }),
  ]);
  await Promise.all([destroyRemoved("document", [], lesson.attachments), deleteVideo(lesson.video)]);
  await touchCourse(lesson.courseId);
  await audit(admin, "lesson.delete", `Deleted lesson "${lesson.title}"`, { type: "course", id: lesson.courseId });
  return { ok: true };
};

export const reorderOutline = async (courseId, input) => {
  const admin = await teacherFor(courseId);
  if (!admin) return fail(NOT_YOURS);
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
    bulk(Section, result.data.map((s, order) => ({ updateOne: { filter: { _id: s.id }, update: { order } } }))),
    bulk(Lesson, result.data.flatMap((s) => s.lessonIds.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { order, sectionId: s.id } } })))),
    bulk(Quiz, result.data.flatMap((s) => s.lessonIds.map((id) => ({ updateMany: { filter: { lessonId: id }, update: { sectionId: s.id } } })))),
  ]);
  await touchCourse(courseId);
  await audit(admin, "course.reorder", "Reordered the course outline", { type: "course", id: courseId });
  return { ok: true };
};

export const setLessonFlags = async (lessonId, input) => {
  const admin = await requireStaff();
  const result = parse(lessonSchema.pick({ status: true, isFreePreview: true }).partial().strict(), input);
  if (!result.ok) return result;
  if (!isValidObjectId(lessonId)) return fail("Lesson not found");
  await connectDB();
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) return fail("Lesson not found");
  if (!(await canTeach(admin, lesson.courseId))) return fail(NOT_YOURS);
  await Lesson.updateOne({ _id: lessonId }, { $set: result.data });
  if (lesson.status === "draft" && result.data.status === "published") await announceLesson(lesson);
  if (result.data.status && result.data.status !== lesson.status) await touchCourse(lesson.courseId);
  else invalidate(lesson.courseId);
  await audit(admin, "lesson.flags", `Changed lesson "${lesson.title}" (${Object.entries(result.data).map(([k, v]) => `${k}: ${v}`).join(", ")})`, { type: "lesson", id: lessonId });
  return { ok: true };
};

export const publishAllLessons = async (courseId) => {
  const admin = await teacherFor(courseId);
  if (!admin) return fail(NOT_YOURS);
  if (!(await loadCourse(courseId))) return fail("Course not found");
  await Lesson.updateMany({ courseId }, { $set: { status: "published" } });
  await touchCourse(courseId);
  await audit(admin, "course.publish_all", "Published every lesson in a course", { type: "course", id: courseId });
  return { ok: true };
};

export const setCourseTeachers = async (courseId, teacherIds) => {
  const admin = await requireAdmin();
  const course = await loadCourse(courseId);
  if (!course) return fail("Course not found");
  const ids = [...new Set(Array.isArray(teacherIds) ? teacherIds.filter((id) => typeof id === "string" && isValidObjectId(id)) : [])];
  const valid = await db.collection("user").countDocuments({ _id: { $in: ids.map((id) => new Types.ObjectId(id)) }, role: "TEACHER" });
  if (valid !== ids.length) return fail("Pick teachers from the list");
  await Course.updateOne({ _id: courseId }, { $set: { teacherIds: ids } });
  await audit(admin, "course.teachers", `Set ${ids.length} ${ids.length === 1 ? "teacher" : "teachers"} for "${course.title}"`, { type: "course", id: courseId });
  return { ok: true };
};
