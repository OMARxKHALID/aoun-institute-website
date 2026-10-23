import Link from "next/link";
import { Award, Download, ExternalLink } from "lucide-react";
import { getMyCertificates } from "@/features/certificates/queries";
import PanelHeader from "@/components/ui/panel-header";
import EmptyState from "@/components/ui/empty-state";
import StatusPill from "@/components/ui/status-pill";
import { formatDate } from "@/lib/format";
import { btn } from "@/lib/ui";

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
                    <p className="text-sm text-white/50">Issued {formatDate(c.issuedAt)}</p>
                  </div>
                  <StatusPill status={c.status} />
                </div>
                <p className="select-all rounded-xl bg-[#070707] px-3 py-2 font-mono text-sm text-white/70">{c.code}</p>
                {c.status === "VALID" ? (
                  <div className="mt-auto flex flex-wrap gap-2">
                    <a href={`/api/certificates/${c.code}/pdf`} className={btn.primary}>
                      <Download className="size-4" /> PDF
                    </a>
                    <Link href={`/verify/${c.code}`} className={btn.outline}>
                      <ExternalLink className="size-4" /> Public link
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-red-400/80">Revoked{c.reason ? `: ${c.reason}` : ""}</p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState boxed icon={Award} title="No certificates yet" text="Finish a course and pass its quizzes to earn your first certificate." action={{ href: "/dashboard/courses", label: "Go to my courses" }} />
        )}
      </div>
    </>
  );
};

export default CertificatesPage;
