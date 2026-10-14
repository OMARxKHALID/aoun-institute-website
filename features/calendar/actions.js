"use server";

import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { fail, parse } from "@/lib/validate";
import { rateLimit } from "@/lib/rate-limit";
import Course from "@/features/courses/models/course";
import Enrollment from "@/features/enrollments/model";
import StudyPlan from "@/features/calendar/model";
import { studyPlanSchema } from "@/features/calendar/schemas";

const PK_OFFSET = "+05:00";

export const createStudyPlan = async (input) => {
  const user = await requireUser();
  if (!(await rateLimit("notes", user.id))) return fail("Slow down a little");
  const result = parse(studyPlanSchema, input);
  if (!result.ok) return result;
  const { date, time, durationMin, courseId, title } = result.data;
  const startsAt = new Date(`${date}T${time}:00${PK_OFFSET}`);
  if (startsAt.getTime() < Date.now() - 60000) return fail("Pick a time in the future", "time");
  await connectDB();
  let courseTitle = "";
  if (courseId) {
    if (!(await Enrollment.exists({ userId: user.id, courseId, status: "active" }))) return fail("Choose one of your courses", "courseId");
    courseTitle = (await Course.findById(courseId, "title").lean())?.title ?? "";
  }
  await StudyPlan.create({ userId: user.id, courseId: courseId || undefined, title: title || (courseTitle ? `Study ${courseTitle}` : "Study session"), startsAt, durationMin });
  return { ok: true };
};

const own = async (user, id) => {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  return StudyPlan.findOne({ _id: id, userId: user.id });
};

export const toggleStudyPlan = async (id) => {
  const user = await requireUser();
  const plan = await own(user, id);
  if (!plan) return fail("Session not found");
  await StudyPlan.updateOne({ _id: id }, { $set: { done: !plan.done } });
  return { ok: true };
};

export const deleteStudyPlan = async (id) => {
  const user = await requireUser();
  const plan = await own(user, id);
  if (!plan) return fail("Session not found");
  await StudyPlan.deleteOne({ _id: id });
  return { ok: true };
};
