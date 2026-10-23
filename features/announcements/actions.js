"use server";

import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/dal";
import { fail, parse } from "@/lib/validate";
import Course from "@/features/courses/models/course";
import Announcement from "@/features/announcements/model";
import { announcementSchema } from "@/features/announcements/schemas";
import { notifyCourseStudents } from "@/features/notifications/service";
import { audit } from "@/features/audit/service";
import { canTeach } from "@/features/courses/access";

export const createAnnouncement = async (input) => {
  const admin = await requireStaff();
  const result = parse(announcementSchema, input);
  if (!result.ok) return result;
  await connectDB();
  const course = await Course.findById(result.data.courseId, "title slug").lean();
  if (!course) return fail("Course not found", "courseId");
  if (!(await canTeach(admin, course._id))) return fail("You can only manage courses you teach", "courseId");
  const { email, ...data } = result.data;
  await Announcement.create({ ...data, authorId: admin.id });
  const sent = email
    ? await notifyCourseStudents(course._id, "notifyAnnouncement", { subject: `${course.title}: ${data.title}`, title: data.title, text: data.body, path: `/dashboard/courses/${course.slug}` })
    : 0;
  await audit(admin, "announcement.create", `Posted "${data.title}" to ${course.title}`, { type: "course", id: course._id });
  return { ok: true, data: { sent } };
};

export const deleteAnnouncement = async (id) => {
  const admin = await requireStaff();
  if (!isValidObjectId(id)) return fail("Announcement not found");
  await connectDB();
  const announcement = await Announcement.findById(id, "courseId").lean();
  if (!announcement) return fail("Announcement not found");
  if (!(await canTeach(admin, announcement.courseId))) return fail("You can only manage courses you teach");
  await Announcement.deleteOne({ _id: id });
  await audit(admin, "announcement.delete", "Deleted an announcement", { type: "announcement", id });
  return { ok: true };
};
