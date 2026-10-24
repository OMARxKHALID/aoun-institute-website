import { KeyRound, ScanLine, ShieldCheck } from "lucide-react";
import PageHero from "@/components/ui/page-hero";
import SectionHeading from "@/components/ui/section-heading";
import VerifyForm from "@/features/certificates/components/verify-form";
import { CertificateCard } from "@/features/certificates/components/certificate-preview";
import { getSiteSettings } from "@/features/site-settings/queries";

export const metadata = { title: "Verify a Certificate", description: "Check that a certificate issued by the institute is genuine.", alternates: { canonical: "/verify" } };

const steps = [
  { icon: KeyRound, title: "Find the ID", text: "Every certificate has an ID like INST-2026-XXXXXXXX printed at the bottom." },
  { icon: ScanLine, title: "Enter or scan", text: "Type the ID above, or scan the QR code on the certificate with any phone camera." },
  { icon: ShieldCheck, title: "See the result", text: "You get the holder's name, course and issue date, or a clear warning if it was revoked." },
];

const VerifyPage = async () => {
  const { brand } = await getSiteSettings();
  return (
    <main className="pb-24">
      <PageHero tag="Verify" title="Verify a certificate" text="Enter the certificate ID printed on the certificate or scan its QR code.">
        <div className="mt-4 flex w-full justify-center">
          <VerifyForm />
        </div>
      </PageHero>

      <section className="mx-auto w-[90%] pb-24 lg:w-[85%]">
        <SectionHeading tag="How it works" title="Three steps to check any certificate" />
        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="flex flex-col gap-4 rounded-3xl border border-[#302C2A] bg-linear-to-b from-[#120806] to-black p-8">
              <span className="flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-2xl bg-accent/15 text-accent">
                  <Icon className="size-6" />
                </span>
                <span className="font-machina text-3xl text-white/20">{String(i + 1).padStart(2, "0")}</span>
              </span>
              <p className="text-2xl font-medium">{title}</p>
              <p className="text-lg text-white/70">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto grid w-[90%] items-center gap-12 lg:w-[85%] lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <SectionHeading tag="What to look for" title="What a genuine certificate looks like" />
          <p className="text-xl text-white/70">
            Certificates are issued automatically when a student completes a course. The ID, the holder's name and the course title must match what this page shows. If anything differs, the certificate was not issued by {brand.name}.
          </p>
        </div>
        <CertificateCard brand={brand.name} courseTitle="Course title" studentName="Holder's name" />
      </section>
    </main>
  );
};

export default VerifyPage;
