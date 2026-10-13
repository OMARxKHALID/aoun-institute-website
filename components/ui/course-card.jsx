import Link from "next/link";
import { Clock, MoveUpRight, Radio } from "lucide-react";

const CourseCard = ({ slug, title, blurb, category, duration, mode, price }) => (
  <Link href={`/courses/${slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-[#302C2A] bg-[#0C0C0C] transition-colors hover:border-accent">
    <div className="relative aspect-video bg-[linear-gradient(135deg,#f97316,#7c2d12_55%,#1c1917)] transition-all duration-500 group-hover:grayscale">
      <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-sm backdrop-blur-sm">{category}</span>
      <span className="absolute right-4 top-4 rounded-full border border-white/40 bg-[#010101] p-3 transition-transform duration-300 group-hover:rotate-45">
        <MoveUpRight className="size-5" />
      </span>
    </div>
    <div className="flex flex-1 flex-col gap-3 p-6">
      <h3 className="font-machina text-2xl leading-tight">{title}</h3>
      <p className="line-clamp-2 font-light text-white/60">{blurb}</p>
      <div className="mt-auto flex flex-wrap gap-4 pt-3 text-sm text-white/70">
        <span className="flex items-center gap-1.5"><Clock className="size-4 text-accent" />{duration}</span>
        <span className="flex items-center gap-1.5"><Radio className="size-4 text-accent" />{mode}</span>
      </div>
      <p className="border-t border-white/10 pt-4 text-2xl font-medium">
        {price.now}
        <span className="ml-2 text-base font-light text-white/40 line-through">{price.was}</span>
      </p>
    </div>
  </Link>
);

export default CourseCard;
