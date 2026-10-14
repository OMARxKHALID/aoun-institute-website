import { getUser } from "@/lib/dal";
import { rateLimit } from "@/lib/rate-limit";
import { getPlayback } from "@/features/video/queries";

const statusFor = { "not-found": 404, login: 401, locked: 403 };

export const GET = async (_request, { params }) => {
  const { lessonId } = await params;
  const user = await getUser();
  if (!(await rateLimit("playback", user?.id))) return Response.json({ ok: false, reason: "busy" }, { status: 429 });
  const playback = await getPlayback(lessonId, user);
  return Response.json(playback, { status: statusFor[playback.reason] ?? 200, headers: { "Cache-Control": "private, no-store" } });
};
