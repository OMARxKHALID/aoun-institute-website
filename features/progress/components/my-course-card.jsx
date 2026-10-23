import Link from "next/link";
import { Award, BookOpen, ClipboardCheck, PlayCircle } from "lucide-react";
import ProgressBar from "@/components/ui/progress-bar";
import { formatDuration } from "@/lib/format";
import { btn } from "@/lib/ui";
import { imageUrl } from "@/lib/upload-rules";

const MyCourseCard = ({ course }) => (
  <article className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-[#302C2A] bg-[#0C0C0C]">
    <Link href={`/dashboard/courses/${course.slug}`} className="relative aspect-video bg-[linear-gradient(135deg,#f97316,#7c2d12_55%,#1c1917)]">
      {course.thumbnail?.url && <img src={imageUrl(course.thumbnail.url, 800)} alt={course.title} loading="lazy" decoding="async" className="size-full object-cover" />}
      {course.eligible && (
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs text-green-400 backdrop-blur-sm">
          <Award className="size-3.5" /> Completed
        </span>
      )}
    </Link>
    <div className="flex flex-1 flex-col gap-3 p-5">
      <Link href={`/dashboard/courses/${course.slug}`} className="font-machina text-xl leading-tight hover:text-accent">
        {course.title}
      </Link>
      <p className="flex items-center gap-2 text-sm text-white/50">
        <BookOpen className="size-4 text-accent" /> {course.completedLessons}/{course.totalLessons} lessons
        {course.estimatedDuration > 0 && <span>· {formatDuration(course.estimatedDuration)}</span>}
      </p>
      <div className="flex items-center gap-3">
        <ProgressBar percent={course.percent} />
        <span className="text-sm font-semibold">{course.percent}%</span>
      </div>
      {course.percent === 100 && !course.eligible && course.quizzesLeft > 0 && (
        <p className="flex items-center gap-2 text-sm text-amber-300">
          <ClipboardCheck className="size-4" /> {course.quizzesLeft} {course.quizzesLeft === 1 ? "quiz" : "quizzes"} left for your certificate
        </p>
      )}
      <Link
        href={course.lastLesson ? `/dashboard/courses/${course.slug}/lessons/${course.lastLesson.id}` : `/dashboard/courses/${course.slug}`}
        className={`mt-auto ${btn.primary}`}
      >
        <PlayCircle className="size-4" /> {course.percent ? "Continue" : "Start course"}
      </Link>
    </div>
  </article>
);

export default MyCourseCard;
