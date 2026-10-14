import { revalidateTag } from "next/cache";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import Lesson from "@/features/courses/models/lesson";
import { deleteVideo, mux } from "@/features/video/mux";
import { syncLessonVideo } from "@/features/video/sync";

export const POST = async (request) => {
  if (!mux || !process.env.MUX_WEBHOOK_SECRET) return Response.json({ error: "Not configured" }, { status: 503 });
  const body = await request.text();
  const event = await mux.webhooks.unwrap(body, request.headers, process.env.MUX_WEBHOOK_SECRET).catch(() => null);
  if (!event) return Response.json({ error: "Invalid signature" }, { status: 400 });
  if (!event.type?.startsWith("video.upload.") && !event.type?.startsWith("video.asset.")) return Response.json({ ok: true });
  const lessonId = event.data?.passthrough ?? event.data?.new_asset_settings?.passthrough;
  if (!isValidObjectId(lessonId)) return Response.json({ ok: true });
  await connectDB();
  const lesson = await Lesson.findById(lessonId).lean();
  const uploadId = event.type.startsWith("video.upload.") ? event.data.id : event.data.upload_id;
  if (!lesson || lesson.video?.uploadId !== uploadId) {
    if (event.type === "video.asset.ready") await deleteVideo({ provider: "mux", assetId: event.data.id });
    return Response.json({ ok: true });
  }
  const video = await syncLessonVideo(lesson);
  if (video.status === "ready") {
    revalidateTag("catalog", "max");
    revalidateTag(`course:${lesson.courseId}`, "max");
  }
  return Response.json({ ok: true });
};
