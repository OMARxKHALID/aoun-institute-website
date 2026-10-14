"use server";

import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { fail, parse } from "@/lib/validate";
import { rateLimit } from "@/lib/rate-limit";
import Lesson from "@/features/courses/models/lesson";
import Enrollment from "@/features/enrollments/model";
import Note from "@/features/notes/model";

const noteSchema = z.strictObject({
  sec: z.number().int().min(0).max(36000),
  body: z.string().trim().min(1, { error: "Write a note" }).max(2000),
});

export const addNote = async (lessonId, input) => {
  const user = await requireUser();
  if (!(await rateLimit("notes", user.id))) return fail("Slow down a little");
  const result = parse(noteSchema, input);
  if (!result.ok) return result;
  if (!isValidObjectId(lessonId)) return fail("Lesson not found");
  await connectDB();
  const lesson = await Lesson.findById(lessonId, "courseId").lean();
  if (!lesson || !(await Enrollment.exists({ userId: user.id, courseId: lesson.courseId, status: "active" }))) return fail("Lesson not available");
  const note = await Note.create({ ...result.data, userId: user.id, courseId: lesson.courseId, lessonId });
  return { ok: true, data: { id: String(note._id) } };
};

export const deleteNote = async (id) => {
  const user = await requireUser();
  if (!isValidObjectId(id)) return fail("Note not found");
  await connectDB();
  await Note.deleteOne({ _id: id, userId: user.id });
  return { ok: true };
};
