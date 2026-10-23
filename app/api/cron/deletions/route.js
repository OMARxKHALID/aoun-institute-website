import { connectDB, db } from "@/lib/db";
import { audit } from "@/features/audit/service";
import { DELETION_GRACE_DAYS, eraseAccount, eraseStudyData } from "@/features/students/service";

const SYSTEM = { id: "system", name: "System" };

export const GET = async (request) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const cutoff = new Date(Date.now() - DELETION_GRACE_DAYS * 86_400_000);
  const due = await db.collection("user").find({ deletionRequestedAt: { $lte: cutoff }, role: { $ne: "ADMIN" } }, { projection: { _id: 1 } }).limit(200).toArray();
  for (const user of due) {
    const id = String(user._id);
    await eraseStudyData(id);
    await eraseAccount(id);
    await audit(SYSTEM, "student.delete", `Deleted an account ${DELETION_GRACE_DAYS} days after the student asked`, { type: "student", id });
  }
  return Response.json({ ok: true, deleted: due.length });
};
