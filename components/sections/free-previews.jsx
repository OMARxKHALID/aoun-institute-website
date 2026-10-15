import Link from "next/link";
import { Play } from "lucide-react";
import SectionHeading from "@/components/ui/section-heading";
import Marquee from "@/components/motion/marquee";
import { formatDuration } from "@/lib/format";

const PreviewCard = ({ title, durationSec, course, slug, category }) => (
  <Link href={`/courses/${slug}`} className="group mr-6 w-[19rem] shrink-0 overflow-hidden rounded-xl border border-[#4E4A48] p-5 transition-all duration-500 hover:border-accent md:mr-9 md:w-xl md:p-7">
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-[linear-gradient(135deg,#78350f,#1c1917_60%,#9a3412)]">
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/60" />
      {category && <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs backdrop-blur-sm">{category}</span>}
      <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-accent transition-transform duration-300 group-hover:scale-110 md:size-16">
        <Play className="size-6 fill-white md:size-7" />
      </span>
      {durationSec > 0 && <span className="absolute bottom-3 right-3 rounded-md bg-black/75 px-2 py-0.5 text-xs tabular-nums">{formatDuration(durationSec)}</span>}
    </div>
    <div className="pt-4 font-light">
      <h3 className="mb-1.5 line-clamp-2 text-lg font-medium tracking-wide text-white md:text-xl">{title}</h3>
      <p className="truncate text-sm text-white/60 md:text-base">
        Free preview <span className="text-accent">·</span> {course}
      </p>
    </div>
  </Link>
);

const FreePreviews = ({ previews }) => {
  if (!previews?.length) return null;
  return (
    <section className="relative flex w-full flex-col items-center justify-center py-10">
      <SectionHeading tag="Free Previews" title="Watch a lesson before you enroll" />
      <div className="w-full py-10">
        <Marquee pauseOnHover className="py-2.5">
          {previews.map((p) => (
            <PreviewCard key={p.id} {...p} />
          ))}
        </Marquee>
      </div>
    </section>
  );
};

export default FreePreviews;
