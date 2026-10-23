import { getUser } from "@/lib/dal";
import { rateLimit } from "@/lib/rate-limit";
import { privateDownloadUrl } from "@/lib/cloudinary";
import { getSubmissionFile } from "@/features/assignments/queries";

export const GET = async (request, { params }) => {
  const user = await getUser();
  if (!user) return Response.redirect(new URL(`/login?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`, request.url), 302);
  if (!(await rateLimit("files", user.id))) return Response.json({ error: "Too many downloads. Try again in a minute." }, { status: 429 });
  const { id } = await params;
  const file = await getSubmissionFile(id, Number(request.nextUrl.searchParams.get("i") ?? 0), user);
  if (!file) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.redirect(privateDownloadUrl(file.publicId, file.format, "submission"), 302);
};
