import { Types } from "mongoose";
import { connectDB, db } from "@/lib/db";
import { linkEmail, sendEmail } from "@/lib/email";
import { TIME_ZONE } from "@/lib/format";
import StudyPlan from "@/features/calendar/model";

const timeOf = (date) => new Intl.DateTimeFormat("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE }).format(date);

export const GET = async (request) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const now = Date.now();
  const plans = await StudyPlan.find({ startsAt: { $gte: new Date(now), $lt: new Date(now + 24 * 3600000) }, remindedAt: null, done: false }).limit(2000).lean();
  const byUser = Map.groupBy(plans, (p) => p.userId);
  const ids = [...byUser.keys()].filter(Types.ObjectId.isValid).map((id) => new Types.ObjectId(id));
  const users = await db.collection("user").find({ _id: { $in: ids }, notifyReminders: { $ne: false }, banned: { $ne: true } }, { projection: { email: 1, name: 1 } }).toArray();
  const url = `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/dashboard/calendar`;
  let sent = 0;
  for (const user of users) {
    const list = byUser.get(String(user._id));
    const text = list.map((p) => `${timeOf(p.startsAt)}: ${p.title}`).join(" · ");
    const ok = await sendEmail({ to: user.email, subject: `Your study plan: ${list.length} ${list.length === 1 ? "session" : "sessions"} coming up`, html: linkEmail({ title: `Hi ${user.name.split(" ")[0]}, time to study`, text, url, cta: "Open my calendar" }) })
      .then(() => true)
      .catch((error) => console.error("[reminders] email failed", error));
    if (ok) {
      sent += 1;
      await StudyPlan.updateMany({ _id: { $in: list.map((p) => p._id) } }, { $set: { remindedAt: new Date() } });
    }
  }
  return Response.json({ ok: true, plans: plans.length, emailed: sent });
};
