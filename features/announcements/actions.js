"use server";

import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { fail, parse } from "@/lib/validate";
import Course from "@/features/courses/models/course";
import Announcement from "@/features/announcements/model";
import { announcementSchema } from "@/features/announcements/schemas";
import { notifyCourseStudents } from "@/features/notifications/service";

export const createAnnouncement = async (input) => {
  const admin = await requireAdmin();
  const result = parse(announcementSchema, input);
  if (!result.ok) return result;
  await connectDB();
  const course = await Course.findById(result.data.courseId, "title slug").lean();
  if (!course) return fail("Course not found", "courseId");
  const { email, ...data } = result.data;
  await Announcement.create({ ...data, authorId: admin.id });
  const sent = email
    ? await notifyCourseStudents(course._id, "notifyAnnouncement", { subject: `${course.title}: ${data.title}`, title: data.title, text: data.body, path: `/dashboard/courses/${course.slug}` })
    : 0;
  return { ok: true, data: { sent } };
};

export const deleteAnnouncement = async (id) => {
  await requireAdmin();
  if (!isValidObjectId(id)) return fail("Announcement not found");
  await connectDB();
  await Announcement.deleteOne({ _id: id });
  return { ok: true };
};
