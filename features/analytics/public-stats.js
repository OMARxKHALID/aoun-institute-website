import "server-only";
import { cacheTag } from "next/cache";
import { connectDB, db, hasDatabase } from "@/lib/db";
import { countryCode, countryName } from "@/lib/countries";
import Course from "@/features/courses/models/course";
import Enrollment from "@/features/enrollments/model";
import Certificate from "@/features/certificates/model";

const empty = { students: 0, graduates: 0, courses: 0, countries: [] };

const groupCountries = (rows) => {
  const totals = new Map();
  for (const { _id, count } of rows) {
    const code = countryCode(_id);
    if (code) totals.set(code, (totals.get(code) ?? 0) + count);
  }
  return [...totals].map(([code, count]) => ({ code, name: countryName(code), count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

export const getPublicStats = async () => {
  "use cache";
  cacheTag("catalog");
  if (!hasDatabase && process.env.NODE_ENV !== "production") return empty;
  await connectDB();
  const [students, graduates, courses, countryRows] = await Promise.all([
    Enrollment.distinct("userId", { status: "active" }).then((ids) => ids.length),
    Certificate.countDocuments({ status: "VALID" }),
    Course.countDocuments({ status: "published" }),
    db
      .collection("user")
      .aggregate([{ $match: { role: { $ne: "ADMIN" }, banned: { $ne: true }, country: { $type: "string", $ne: "" } } }, { $group: { _id: { $toLower: { $trim: { input: "$country" } } }, count: { $sum: 1 } } }])
      .toArray(),
  ]);
  return {
    students,
    graduates,
    courses,
    countries: groupCountries(countryRows),
  };
};

export const getCourseCountries = async (courseId) => {
  const rows = await Enrollment.aggregate([
    { $match: { courseId, status: "active" } },
    { $lookup: { from: "user", let: { uid: { $convert: { input: "$userId", to: "objectId", onError: null, onNull: null } } }, pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$uid"] } } }, { $project: { country: 1 } }], as: "u" } },
    { $unwind: "$u" },
    { $match: { "u.country": { $type: "string", $ne: "" } } },
    { $group: { _id: { $toLower: { $trim: { input: "$u.country" } } }, count: { $sum: 1 } } },
  ]);
  return groupCountries(rows);
};

export const getCourseCounts = async (courseIds) => {
  const [enrolled, graduated] = await Promise.all([
    Enrollment.aggregate([{ $match: { courseId: { $in: courseIds }, status: "active" } }, { $group: { _id: "$courseId", count: { $sum: 1 } } }]),
    Certificate.aggregate([{ $match: { courseId: { $in: courseIds }, status: "VALID" } }, { $group: { _id: "$courseId", count: { $sum: 1 } } }]),
  ]);
  const toMap = (rows) => new Map(rows.map((r) => [String(r._id), r.count]));
  return { enrolled: toMap(enrolled), graduated: toMap(graduated) };
};
