import { getUser } from "@/lib/dal";
import { getMyNotifications } from "@/features/notifications/queries";

export const GET = async () => {
  if (!(await getUser())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(await getMyNotifications(), { headers: { "Cache-Control": "private, no-store" } });
};
