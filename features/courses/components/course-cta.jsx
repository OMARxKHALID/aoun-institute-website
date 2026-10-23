import Link from "next/link";
import { getUser } from "@/lib/dal";
import { getCourseAccess } from "@/features/enrollments/queries";
import { formatPrice } from "@/lib/format";
import { canTeach } from "@/features/courses/access";

const base = "rounded-2xl px-10 py-4 text-xl font-bold transition-shadow";
const primary = `${base} bg-linear-to-b from-[#E8602E] to-[#A8401A] hover:shadow-[0_0_40px_5px_rgba(232,96,46,0.5)]`;

export const coursePriceLabel = ({ price, discountPrice, currency }) => {
  const amount = discountPrice ?? price;
  return amount === 0 ? "Free" : formatPrice(amount, currency);
};

export const CourseCtaFallback = ({ course }) => (
  <Link href={`/checkout/${course.slug}`} className={primary}>
    Enroll for {coursePriceLabel(course)}
  </Link>
);

const CourseCta = async ({ course }) => {
  const user = await getUser();
  if (await canTeach(user, course.id))
    return (
      <Link href={`/admin/courses/${course.id}`} className={`${base} border border-white/30 hover:border-accent`}>
        Edit this course
      </Link>
    );
  const { enrolled, order } = await getCourseAccess(user?.id, course.id);
  if (enrolled)
    return (
      <Link href={`/dashboard/courses/${course.slug}`} className={primary}>
        Go to my course
      </Link>
    );
  if (order?.status === "PENDING")
    return (
      <Link href={`/checkout/${course.slug}`} className={`${base} border border-amber-400/40 bg-amber-500/10 text-amber-300`}>
        Payment under review
      </Link>
    );
  return <CourseCtaFallback course={course} />;
};

export default CourseCta;
