import { getUser } from "@/lib/dal";
import { getPlayback } from "@/features/video/queries";

const statusFor = { "not-found": 404, login: 401, locked: 403 };

export const GET = async (_request, { params }) => {
  const { lessonId } = await params;
  const playback = await getPlayback(lessonId, await getUser());
  return Response.json(playback, { status: statusFor[playback.reason] ?? 200, headers: { "Cache-Control": "private, no-store" } });
};
