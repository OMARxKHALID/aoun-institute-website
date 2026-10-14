import { getUser, isAdmin } from "@/lib/dal";
import { rateLimit } from "@/lib/rate-limit";
import { getCertificateByCode } from "@/features/certificates/queries";
import { renderCertificatePdf } from "@/features/certificates/pdf";
import { getSiteSettings } from "@/features/site-settings/queries";
import { SITE_URL } from "@/lib/site";

export const GET = async (_request, { params }) => {
  if (!(await rateLimit("verify"))) return Response.json({ error: "Too many requests" }, { status: 429 });
  const { code } = await params;
  const certificate = await getCertificateByCode(code);
  if (!certificate) return Response.json({ error: "Not found" }, { status: 404 });
  const user = await getUser();
  const owner = user && (user.id === certificate.userId || isAdmin(user));
  if (certificate.status !== "VALID" && !owner) return Response.json({ error: "This certificate was revoked" }, { status: 410 });
  const { brand } = await getSiteSettings();
  const pdf = await renderCertificatePdf({ certificate, brand: brand.name, verifyUrl: `${SITE_URL}/verify/${certificate.code}` });
  return new Response(pdf, {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${certificate.code}.pdf"`, "Cache-Control": "private, max-age=300" },
  });
};
