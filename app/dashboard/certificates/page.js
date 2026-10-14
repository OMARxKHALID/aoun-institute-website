import Link from "next/link";
import { Award, Download, ExternalLink } from "lucide-react";
import { getMyCertificates } from "@/features/certificates/queries";
import PanelHeader from "@/components/ui/panel-header";
import StatusPill from "@/components/ui/status-pill";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Certificates" };

const CertificatesPage = async () => {
  const certificates = await getMyCertificates();
  return (
    <>
      <PanelHeader title="Certificates" subtitle="Download your certificates or share their public verification link." />
      <div className="p-4 sm:p-5 lg:p-8">
        {certificates.length ? (
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {certificates.map((c) => (
              <article key={c.id} className="flex min-w-0 flex-col gap-4 rounded-3xl border border-[#302C2A] bg-[#0C0C0C] p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent/15 text-accent">
                    <Award className="size-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-machina text-lg leading-tight">{c.courseTitle}</p>
                    <p className="text-sm text-white/45">Issued {formatDate(c.issuedAt)}</p>
                  </div>
                  <StatusPill status={c.status} />
                </div>
                <p className="select-all rounded-xl bg-[#070707] px-3 py-2 font-mono text-sm text-white/70">{c.code}</p>
                {c.status === "VALID" ? (
                  <div className="mt-auto flex flex-wrap gap-2">
                    <a href={`/api/certificates/${c.code}/pdf`} className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium">
                      <Download className="size-4" /> PDF
                    </a>
                    <Link href={`/verify/${c.code}`} className="flex items-center gap-2 rounded-full border border-[#302C2A] px-4 py-2 text-sm hover:border-accent">
                      <ExternalLink className="size-4" /> Public link
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-red-300/80">Revoked{c.reason ? `: ${c.reason}` : ""}</p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3 rounded-3xl border border-[#302C2A] bg-[#0C0C0C] p-6 sm:p-8">
            <Award className="size-8 text-accent" />
            <p className="text-white/60">Finish a course to earn your first certificate.</p>
            <Link href="/dashboard/courses" className="rounded-full bg-white px-5 py-2.5 font-medium text-black hover:bg-accent hover:text-white">
              Go to my courses
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CertificatesPage;
