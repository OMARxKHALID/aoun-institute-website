import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, BadgeCheck } from "lucide-react";
import { getPublicLearner } from "@/features/certificates/queries";
import { formatDate } from "@/lib/format";
import { imageUrl } from "@/lib/upload-rules";

export const instant = false;

export const metadata = { title: "Certificates", robots: { index: false } };

const LearnerPage = async ({ params }) => {
  const { id } = await params;
  const learner = await getPublicLearner(id);
  if (!learner) notFound();
  return (
    <main className="mx-auto flex w-[90%] max-w-3xl flex-col gap-8 pb-24 pt-40 max-md:pt-32">
      <div className="flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-accent/15 text-2xl font-semibold text-accent">
          {learner.image ? <img src={imageUrl(learner.image, 128)} alt="" className="size-full object-cover" /> : learner.name.charAt(0)}
        </span>
        <div>
          <h1 className="font-machina text-3xl md:text-4xl">{learner.name}</h1>
          {learner.location && <p className="text-white/50">{learner.location}</p>}
        </div>
      </div>
      {learner.certificates.length ? (
        <ul className="flex flex-col gap-3">
          {learner.certificates.map((c) => (
            <li key={c.code}>
              <Link href={`/verify/${c.code}`} className="flex items-center gap-4 rounded-2xl border border-[#302C2A] bg-[#0C0C0C] p-4 transition hover:border-accent">
                <Award className="size-6 shrink-0 text-accent" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{c.courseTitle}</span>
                  <span className="block text-base text-white/50">
                    Issued {formatDate(c.issuedAt)} · {c.code}
                  </span>
                </span>
                <BadgeCheck className="size-5 shrink-0 text-green-400" aria-label="Verified" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-white/50">No certificates yet.</p>
      )}
    </main>
  );
};

export default LearnerPage;
