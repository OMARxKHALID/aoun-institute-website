import Link from "next/link";
import { PlayCircle } from "lucide-react";
import ProgressBar from "@/components/ui/progress-bar";
import { btn, showProps } from "@/lib/ui";
import { formatClock } from "@/lib/format";
import { imageUrl } from "@/lib/upload-rules";

const ContinueWatching = ({ courses }) => {
  const course = courses
    .filter((c) => c.lastLesson && c.completedLessons < c.totalLessons)
    .toSorted((a, b) => new Date(b.lastActiveAt ?? 0) - new Date(a.lastActiveAt ?? 0))[0];
  if (!course) return null;
  const { lastLesson } = course;
  const position = lastLesson.durationSec && lastLesson.position < lastLesson.durationSec * 0.95 ? lastLesson.position : 0;
  const href = `/dashboard/courses/${course.slug}/lessons/${lastLesson.id}${position ? `?t=${position}` : ""}`;
  return (
    <section aria-label="Continue watching" className="grid min-w-0 overflow-hidden rounded-3xl border border-[#302C2A] bg-[#0C0C0C] sm:grid-cols-[minmax(0,240px)_1fr] lg:grid-cols-[minmax(0,320px)_1fr]">
      <Link href={href} {...showProps} className="group relative aspect-video bg-[linear-gradient(135deg,#f97316,#7c2d12_55%,#1c1917)] sm:aspect-auto sm:h-full">
        {course.thumbnail?.url && <img src={imageUrl(course.thumbnail.url, 800)} alt={course.title} className="size-full object-cover" />}
        <span className="absolute inset-0 grid place-items-center bg-black/30 transition group-show:bg-black/10">
          <PlayCircle className="size-14 text-white drop-shadow-lg transition group-show:scale-110" />
        </span>
      </Link>
      <div className="flex min-w-0 flex-col justify-center gap-3 p-5 sm:p-6">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Continue watching</p>
        <div className="min-w-0">
          <p className="truncate font-machina text-xl sm:text-2xl">{lastLesson.title}</p>
          <p className="truncate text-sm text-white/50">{course.title}</p>
        </div>
        {lastLesson.durationSec > 0 && (
          <div className="flex items-center gap-3">
            <ProgressBar percent={Math.round((position / lastLesson.durationSec) * 100)} />
            <span className="shrink-0 font-mono text-xs text-white/50">
              {formatClock(position)} / {formatClock(lastLesson.durationSec)}
            </span>
          </div>
        )}
        <Link href={href} className={`self-start ${btn.primary}`}>
          <PlayCircle className="size-4" /> {position ? `Resume at ${formatClock(position)}` : "Start lesson"}
        </Link>
      </div>
    </section>
  );
};

export default ContinueWatching;
