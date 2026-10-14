import { getUser, isAdmin } from "@/lib/dal";
import { toCsv } from "@/lib/csv";
import { getOrdersForExport, resolveRange } from "@/features/analytics/reports";

export const GET = async (request) => {
  if (!isAdmin(await getUser())) return Response.json({ error: "Forbidden" }, { status: 403 });
  const range = resolveRange(request.nextUrl.searchParams.get("range"));
  const rows = await getOrdersForExport(range.value);
  const csv = toCsv(
    ["Date", "Student", "Email", "Course", "Amount", "Currency", "Method", "Reference", "Status", "Paid at"],
    rows.map((r) => [r.date, r.student, r.email, r.course, r.amount, r.currency, r.method, r.reference, r.status, r.paidAt]),
  );
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="orders-${range.value}.csv"`, "Cache-Control": "no-store" } });
};
