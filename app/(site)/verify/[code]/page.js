import { BadgeCheck, CircleX, ShieldAlert } from "lucide-react";
import { rateLimit } from "@/lib/rate-limit";
import { formatDate } from "@/lib/format";
import { getCertificateByCode } from "@/features/certificates/queries";
import VerifyForm from "@/features/certificates/components/verify-form";
import { CertificateCard } from "@/features/certificates/components/certificate-preview";
import { getSiteSettings } from "@/features/site-settings/queries";
import { buttonClass } from "@/lib/ui";

export const instant = false;

export const generateMetadata = async ({ params }) => {
  const { code } = await params;
  return { title: `Certificate ${decodeURIComponent(code).toUpperCase()}`, robots: { index: false } };
};

const Row = ({ label, value }) => (
  <div className="flex flex-col gap-1 border-b border-white/10 py-4 last:border-0 sm:flex-row sm:justify-between">
    <dt className="text-white/50">{label}</dt>
    <dd className="text-lg font-medium sm:text-right">{value}</dd>
  </div>
);

const VerifyCodePage = async ({ params }) => {
  const { code } = await params;
  const allowed = await rateLimit("verify");
  const [certificate, { brand }] = await Promise.all([allowed ? getCertificateByCode(decodeURIComponent(code)) : null, getSiteSettings()]);
  const valid = certificate?.status === "VALID";

  return (
    <main className="mx-auto flex w-[90%] max-w-3xl flex-col items-center gap-8 pb-24 pt-40 max-md:pt-32">
      {!allowed ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <ShieldAlert className="size-14 text-amber-300" />
          <h1 className="font-machina text-3xl">Too many checks</h1>
          <p className="text-white/70">Please wait a minute and try again.</p>
        </div>
      ) : !certificate ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <CircleX className="size-14 text-red-400" />
          <h1 className="font-machina text-3xl md:text-4xl">Certificate not found</h1>
          <p className="text-white/70">No certificate matches “{decodeURIComponent(code).toUpperCase()}”. Check the ID and try again.</p>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            {valid ? <BadgeCheck className="size-16 text-green-400" /> : <CircleX className="size-16 text-red-400" />}
            <h1 className="font-machina text-3xl md:text-5xl">{valid ? "Valid certificate" : "Certificate revoked"}</h1>
            {!valid && certificate.reason && <p className="text-white/70">Reason: {certificate.reason}</p>}
          </div>
          <div className="w-full max-w-2xl">
            <CertificateCard brand={brand.name} courseTitle={certificate.courseTitle} studentName={certificate.studentName} code={certificate.code} revoked={!valid} />
          </div>
          <dl className="mt-4 w-full rounded-3xl border border-[#302C2A] bg-[#0C0C0C] px-6 py-2">
            <Row label="Awarded to" value={certificate.studentName} />
            <Row label="Course" value={certificate.courseTitle} />
            <Row label="Issued on" value={formatDate(certificate.issuedAt)} />
            <Row label="Certificate ID" value={certificate.code} />
            {!valid && certificate.revokedAt && <Row label="Revoked on" value={formatDate(certificate.revokedAt)} />}
          </dl>
          {valid && (
            <a href={`/api/certificates/${certificate.code}/pdf`} className={buttonClass("primary", "lg")}>
              View certificate PDF
            </a>
          )}
        </div>
      )}
      <VerifyForm />
    </main>
  );
};

export default VerifyCodePage;
