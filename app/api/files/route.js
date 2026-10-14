import { connectDB } from "@/lib/db";
import { getUser, isAdmin } from "@/lib/dal";
import { rateLimit } from "@/lib/rate-limit";
import { privateDownloadUrl } from "@/lib/cloudinary";
import { UPLOAD_RULES } from "@/lib/upload-rules";
import Course from "@/features/courses/models/course";
import Lesson from "@/features/courses/models/lesson";
import Enrollment from "@/features/enrollments/model";

export const GET = async (request) => {
  const publicId = request.nextUrl.searchParams.get("id");
  if (!publicId?.startsWith(`${UPLOAD_RULES.document.folder}/`)) return Response.json({ error: "Not found" }, { status: 404 });
  const user = await getUser();
  if (!user) return Response.redirect(new URL(`/login?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`, request.url), 302);
  if (!(await rateLimit("files", user.id))) return Response.json({ error: "Too many downloads. Try again in a minute." }, { status: 429 });
  await connectDB();
  const owner =
    (await Course.findOne({ $or: [{ "syllabusFile.publicId": publicId }, { "attachments.publicId": publicId }] }, "_id").lean()) ??
    (await Lesson.findOne({ "attachments.publicId": publicId }, "courseId").lean());
  if (!owner) return Response.json({ error: "Not found" }, { status: 404 });
  const courseId = owner.courseId ?? owner._id;
  const allowed = isAdmin(user) || (await Enrollment.exists({ userId: user.id, courseId, status: "active" }));
  if (!allowed) return Response.json({ error: "Enroll in this course to download its files." }, { status: 403 });
  return Response.redirect(privateDownloadUrl(publicId, "pdf", "document"), 302);
};
