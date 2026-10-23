import { getUser } from "@/lib/dal";
import { rateLimit } from "@/lib/rate-limit";
import { getInvoice } from "@/features/payments/queries";
import { renderInvoicePdf } from "@/features/payments/invoice-pdf";
import { getSiteSettings } from "@/features/site-settings/queries";

export const GET = async (request, { params }) => {
  const user = await getUser();
  if (!user) return Response.redirect(new URL(`/login?next=${encodeURIComponent(request.nextUrl.pathname)}`, request.url), 302);
  if (!(await rateLimit("files", user.id))) return Response.json({ error: "Too many downloads. Try again in a minute." }, { status: 429 });
  const { id } = await params;
  const invoice = await getInvoice(id, user);
  if (!invoice) return Response.json({ error: "Not found" }, { status: 404 });
  const { brand, contact } = await getSiteSettings();
  const pdf = await renderInvoicePdf({ invoice, brand: brand.name, contact: contact ?? {} });
  return new Response(pdf, {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${invoice.number}.pdf"`, "Cache-Control": "private, no-store" },
  });
};
