import Link from "next/link";
import { showProps } from "@/lib/ui";
import { Sparkles, Star } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { imageUrl } from "@/lib/upload-rules";

const RecommendedCourses = ({ courses }) =>
  courses.length ? (
    <ul className="grid gap-3 md:grid-cols-3">
      {courses.map((c) => (
        <li key={c.id}>
          <Link href={`/courses/${c.slug}`} {...showProps} className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#070707] transition hover:border-accent/50">
            <span className="relative block aspect-video bg-[linear-gradient(135deg,#f97316,#7c2d12_55%,#1c1917)]">
              {c.thumbnail?.url && <img src={imageUrl(c.thumbnail.url, 640)} alt={c.title} loading="lazy" className="size-full object-cover transition duration-500 group-show:scale-105" />}
            </span>
            <span className="flex flex-1 flex-col gap-1.5 p-3">
              <span className="flex items-center gap-1.5 text-xs text-accent">
                <Sparkles className="size-3.5 shrink-0" /> <span className="truncate">{c.reason}</span>
              </span>
              <span className="line-clamp-2 font-medium leading-snug">{c.title}</span>
              <span className="mt-auto flex items-center justify-between gap-2 pt-1 text-sm">
                <span className="font-semibold">{(c.discountPrice ?? c.price) === 0 ? "Free" : formatPrice(c.discountPrice ?? c.price, c.currency)}</span>
                {c.rating && (
                  <span className="flex items-center gap-1 text-xs text-white/70">
                    <Star className="size-3.5 fill-amber-300 text-amber-300" /> {c.rating.average.toFixed(1)}
                  </span>
                )}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  ) : null;

export default RecommendedCourses;
