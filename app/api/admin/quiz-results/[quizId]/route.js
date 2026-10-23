import { getUser, isStaff } from "@/lib/dal";
import { getQuizResults } from "@/features/quizzes/queries";
import { toCsv } from "@/lib/csv";

export const GET = async (_request, { params }) => {
  if (!isStaff(await getUser())) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { quizId } = await params;
  const data = await getQuizResults(quizId);
  if (!data) return Response.json({ error: "Not found" }, { status: 404 });
  const header = ["Student", "Email", "Attempt", "Score", "Percent", "Passed", "Status", "Time taken (s)", "Submitted at"];
  const csv = toCsv(header, data.rows.map((r) => [r.student, r.email, r.attemptNo, r.score, r.percent, r.passed ? "yes" : "no", r.status, r.durationSec, r.submittedAt ?? ""]));
  const filename = `${data.quiz.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-results.csv`;
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "no-store" },
  });
};
