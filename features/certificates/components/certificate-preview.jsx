import Link from "next/link";
import { BadgeCheck, QrCode, ShieldCheck, Share2 } from "lucide-react";

const points = [
  { icon: BadgeCheck, text: "Issued automatically the moment you complete the course requirements." },
  { icon: ShieldCheck, text: "Each certificate has a unique ID that anyone can check on our verify page." },
  { icon: Share2, text: "Download it as a PDF or share the public link on LinkedIn and your CV." },
];

const CertificatePreview = ({ brand, courseTitle }) => (
  <div className="mx-auto grid w-full max-w-6xl items-center gap-10 rounded-3xl border border-[#302C2A] p-6 md:p-10 lg:grid-cols-[1fr_1.15fr]">
    <div className="flex flex-col gap-6">
      <h3 className="text-4xl font-medium leading-tight md:text-5xl">
        Earn a certificate <span className="text-accent">anyone can verify</span>
      </h3>
      <ul className="flex flex-col gap-4">
        {points.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-3 text-lg text-white/70">
            <Icon className="mt-1 size-5 shrink-0 text-accent" />
            {text}
          </li>
        ))}
      </ul>
      <Link href="/verify" className="w-fit rounded-xl border border-white/30 px-6 py-3 text-lg transition hover:border-accent hover:text-accent">
        Verify a certificate →
      </Link>
    </div>
    <div className="relative">
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl bg-accent/20" />
      <div className="relative flex aspect-[1.414] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0C0C0C] p-5 sm:p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent sm:text-sm">{brand}</p>
          <p className="mt-3 font-machina text-xl font-bold sm:mt-5 sm:text-3xl">Certificate of Completion</p>
          <p className="mt-3 text-xs text-white/60 sm:mt-5 sm:text-sm">This certifies that</p>
          <p className="mt-1 text-lg font-bold sm:text-2xl">Your Name</p>
          <p className="mt-2 text-xs text-white/60 sm:text-sm">has successfully completed the course</p>
          <p className="mt-1 line-clamp-2 text-sm text-[#FFF3EF] sm:text-lg">{courseTitle}</p>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div className="text-[10px] sm:text-xs">
            <p className="uppercase tracking-wider text-white/40">Certificate ID</p>
            <p className="mt-0.5 font-mono">INST-YYYY-XXXXXXXX</p>
          </div>
          <span className="grid size-12 place-items-center rounded-md bg-white text-black sm:size-16">
            <QrCode className="size-8 sm:size-11" />
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default CertificatePreview;
