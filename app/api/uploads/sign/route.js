import { NextResponse } from "next/server";
import { getUser, isAdmin } from "@/lib/dal";
import { signParams } from "@/lib/cloudinary";
import { rateLimit } from "@/lib/rate-limit";
import { UPLOAD_RULES } from "@/lib/upload-rules";

export const POST = async (request) => {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await rateLimit("upload", user.id))) return NextResponse.json({ error: "Too many uploads. Try again later." }, { status: 429 });
  const kind = request.nextUrl.searchParams.get("kind");
  const rule = UPLOAD_RULES[kind];
  if (!rule) return NextResponse.json({ error: "Unknown upload type" }, { status: 400 });
  if (rule.admin && !isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { paramsToSign } = await request.json().catch(() => ({}));
  const signature = signParams(kind, paramsToSign);
  if (!signature) return NextResponse.json({ error: "Invalid upload parameters" }, { status: 400 });
  return NextResponse.json({ signature });
};
