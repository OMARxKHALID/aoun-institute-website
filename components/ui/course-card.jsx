import Link from "next/link";
import { BookOpen, Clock, MoveUpRight, Signal, Star } from "lucide-react";
import { formatDuration, formatPrice, plural } from "@/lib/format";
import { imageUrl } from "@/lib/upload-rules";

const priceLabel = (price, discountPrice, currency) => (price === 0 || discountPrice === 0 ? "Free" : formatPrice(discountPrice ?? price, currency));

const CompactCard = ({ slug, title, category, level, thumbnail, price, discountPrice, currency, lessons, enrolled, rating }) => (
  <Link href={enrolled ? `/dashboard/courses/${slug}` : `/courses/${slug}`} className="group flex min-w-0 overflow-hidden rounded-2xl border border-[#302C2A] bg-[#0C0C0C] transition-colors hover:border-accent sm:flex-col">
    <div className="relative aspect-video w-32 shrink-0 overflow-hidden bg-[linear-gradient(135deg,#f97316,#7c2d12_55%,#1c1917)] max-sm:aspect-auto sm:w-full">
      {thumbnail?.url && <img src={imageUrl(thumbnail.url, 800)} alt="" loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />}
      {enrolled && <span className="absolute bottom-2 left-2 rounded-full bg-green-500/90 px-2 py-0.5 text-[11px] font-semibold text-black">Enrolled</span>}
    </div>
    <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3 sm:p-4">
      <p className="truncate text-xs text-accent">{[category, level].filter(Boolean).join(" · ")}</p>
      <h3 className="line-clamp-2 font-medium leading-snug">{title}</h3>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-white/55">
        <span>{plural(lessons, "lesson")}</span>
        {rating && (
          <span className="flex items-center gap-1">
            <Star className="size-3.5 fill-amber-400 text-amber-400" /> {rating.average.toFixed(1)}
          </span>
        )}
        <span className="ml-auto text-sm font-semibold text-white">{priceLabel(price, discountPrice, currency)}</span>
      </div>
    </div>
  </Link>
);

const CourseCard = ({ compact, ...props }) => (compact ? <CompactCard {...props} /> : <FullCard {...props} />);

const FullCard = ({ slug, title, subtitle, category, level, thumbnail, price, discountPrice, currency, estimatedDuration, lessons, enrolled, rating }) => (
  <Link href={enrolled ? `/dashboard/courses/${slug}` : `/courses/${slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-[#302C2A] bg-[#0C0C0C] transition-colors hover:border-accent">
    <div className="relative aspect-video overflow-hidden bg-[linear-gradient(135deg,#f97316,#7c2d12_55%,#1c1917)]">
      {thumbnail?.url && <img src={imageUrl(thumbnail.url, 800)} alt="" loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />}
      {category && <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-sm backdrop-blur-sm">{category}</span>}
      {enrolled && <span className="absolute bottom-4 left-4 rounded-full bg-green-500/90 px-3 py-1 text-xs font-semibold text-black">Enrolled</span>}
      <span className="absolute right-4 top-4 rounded-full border border-white/40 bg-[#010101] p-3 transition-transform duration-300 group-hover:rotate-45">
        <MoveUpRight className="size-5" />
      </span>
    </div>
    <div className="flex flex-1 flex-col gap-3 p-6">
      <h3 className="font-machina text-2xl leading-tight">{title}</h3>
      {subtitle && <p className="line-clamp-2 font-light text-white/60">{subtitle}</p>}
      {rating && (
        <p className="flex items-center gap-1.5 text-sm">
          <Star className="size-4 fill-amber-400 text-amber-400" />
          <span className="font-semibold">{rating.average.toFixed(1)}</span>
          <span className="text-white/45">({rating.count})</span>
        </p>
      )}
      <div className="mt-auto flex flex-wrap gap-4 pt-3 text-sm text-white/70">
        {estimatedDuration > 0 && (
          <span className="flex items-center gap-1.5">
            <Clock className="size-4 text-accent" />
            {formatDuration(estimatedDuration)}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <BookOpen className="size-4 text-accent" />
          {plural(lessons, "lesson")}
        </span>
        {level && (
          <span className="flex items-center gap-1.5">
            <Signal className="size-4 text-accent" />
            {level}
          </span>
        )}
      </div>
      <p className="border-t border-white/10 pt-4 text-2xl font-medium">
        {priceLabel(price, discountPrice, currency)}
        {discountPrice != null && discountPrice < price && <span className="ml-2 text-base font-light text-white/40 line-through">{formatPrice(price, currency)}</span>}
      </p>
    </div>
  </Link>
);

export default CourseCard;
