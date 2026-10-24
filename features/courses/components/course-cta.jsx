import Link from "next/link";
import { getUser } from "@/lib/dal";
import { getCourseAccess } from "@/features/enrollments/queries";
import { formatPrice } from "@/lib/format";
import { canTeach } from "@/features/courses/access";

const base = (compact) => `rounded-2xl text-center font-bold transition-shadow ${compact ? "px-5 py-2.5 text-base" : "px-10 py-4 text-xl"}`;
const primary = (compact) => `${base(compact)} bg-linear-to-b from-[#E8602E] to-[#A8401A] hover:shadow-[0_0_40px_5px_rgba(232,96,46,0.5)]`;

export const coursePriceLabel = ({ price, discountPrice, currency }) => {
  const amount = discountPrice ?? price;
  return amount === 0 ? "Free" : formatPrice(amount, currency);
};

export const CourseCtaFallback = ({ course, compact, className = "" }) => (
  <Link href={`/checkout/${course.slug}`} className={`${primary(compact)} ${className}`}>
    {compact ? "Enroll now" : `Enroll for ${coursePriceLabel(course)}`}
  </Link>
);

const CourseCta = async ({ course, compact, className = "" }) => {
  const user = await getUser();
  if (await canTeach(user, course.id))
    return (
      <Link href={`/admin/courses/${course.id}`} className={`${base(compact)} border border-white/30 hover:border-accent ${className}`}>
        Edit this course
      </Link>
    );
  const { enrolled, order } = await getCourseAccess(user?.id, course.id);
  if (enrolled)
    return (
      <Link href={`/dashboard/courses/${course.slug}`} className={`${primary(compact)} ${className}`}>
        Go to my course
      </Link>
    );
  if (order?.status === "PENDING")
    return (
      <Link href={`/checkout/${course.slug}`} className={`${base(compact)} border border-amber-400/40 bg-amber-500/10 text-amber-300 ${className}`}>
        Payment under review
      </Link>
    );
  return <CourseCtaFallback course={course} compact={compact} className={className} />;
};

export default CourseCta;
