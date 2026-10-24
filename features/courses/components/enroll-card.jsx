import { Suspense } from "react";
import { CircleCheck } from "lucide-react";
import CourseCta, { CourseCtaFallback, coursePriceLabel } from "@/features/courses/components/course-cta";
import { discountPercent, formatDuration, formatPrice, plural } from "@/lib/format";

const included = (course, previews) =>
  [
    `${plural(course.lessons, "recorded lesson")}${course.estimatedDuration ? ` · ${formatDuration(course.estimatedDuration)}` : ""}`,
    "Quizzes graded instantly after lessons",
    "Certificate with a public verify link and QR code",
    "Lifetime access, watch at your own pace",
    previews > 0 && `${plural(previews, "free preview lesson")} to try first`,
  ].filter(Boolean);

const EnrollCard = ({ course, previews = 0, id, className = "" }) => {
  const off = discountPercent(course.price, course.discountPrice);
  return (
    <aside id={id} className={`flex flex-col gap-6 rounded-3xl border border-[#302C2A] bg-[#0C0C0C]/90 p-6 shadow-[0_20px_60px_-20px_rgba(232,96,46,0.35)] backdrop-blur-xl md:p-8 ${className}`}>
      <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
        <p className="text-4xl font-semibold">{coursePriceLabel(course)}</p>
        {off > 0 && course.discountPrice > 0 && (
          <>
            <span className="text-xl text-white/50 line-through">{formatPrice(course.price, course.currency)}</span>
            <span className="rounded-md border border-accent/40 bg-accent/15 px-2 py-0.5 text-sm font-medium text-accent">{off}% OFF</span>
          </>
        )}
      </div>
      <Suspense fallback={<CourseCtaFallback course={course} className="w-full" />}>
        <CourseCta course={course} className="w-full" />
      </Suspense>
      <div className="flex items-center gap-3 text-sm uppercase tracking-widest text-white/50">
        <span className="h-px flex-1 bg-white/15" />
        What you get
        <span className="h-px flex-1 bg-white/15" />
      </div>
      <ul className="flex flex-col gap-3">
        {included(course, previews).map((item) => (
          <li key={item} className="flex items-start gap-3 text-lg">
            <CircleCheck className="mt-1 size-5 shrink-0 text-green-400" />
            {item}
          </li>
        ))}
      </ul>
      <p className="text-base text-white/50">Pay by bank transfer or mobile wallet. Access opens once your payment is approved.</p>
    </aside>
  );
};

export default EnrollCard;
