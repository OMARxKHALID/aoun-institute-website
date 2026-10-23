import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, CircleCheck, Clock3, XCircle } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { formatDate, formatDuration, formatPrice, plural } from "@/lib/format";
import { getPublicCourse } from "@/features/courses/queries";
import { getSiteSettings } from "@/features/site-settings/queries";
import { getCourseAccess } from "@/features/enrollments/queries";
import CheckoutForm, { FreeEnrollButton } from "@/features/payments/components/checkout-form";
import { coursePriceLabel } from "@/features/courses/components/course-cta";
import { buttonClass } from "@/lib/ui";
import { imageUrl } from "@/lib/upload-rules";

export const instant = false;

export const metadata = { title: "Checkout", robots: { index: false, follow: false } };

const StateCard = ({ icon: Icon, tone, title, children }) => (
  <div className="flex flex-col gap-4 rounded-3xl border border-[#302C2A] bg-[#0C0C0C] p-6 md:p-8">
    <Icon className={`size-9 ${tone}`} />
    <h2 className="font-machina text-3xl">{title}</h2>
    <div className="flex flex-col gap-4 text-lg text-white/70">{children}</div>
  </div>
);

const CheckoutPage = async ({ params }) => {
  const { slug } = await params;
  const user = await requireUser();
  const [course, { payment }] = await Promise.all([getPublicCourse(slug), getSiteSettings()]);
  if (!course) notFound();
  const { enrolled, order } = await getCourseAccess(user.id, course.id);
  const free = (course.discountPrice ?? course.price) === 0;

  const body = () => {
    if (enrolled)
      return (
        <StateCard icon={CircleCheck} tone="text-green-400" title="You're enrolled">
          <p>You have lifetime access to this course.</p>
          <Link href={`/dashboard/courses/${course.slug}`} className={`${buttonClass("primary", "lg")} self-start`}>
            Go to my course
          </Link>
        </StateCard>
      );
    if (order?.status === "PENDING")
      return (
        <StateCard icon={Clock3} tone="text-amber-300" title="Payment under review">
          <p>
            We received your payment details on {formatDate(order.createdAt)} ({order.method}, reference {order.providerRef?.replace(/^manual:/, "")}). We will email you as soon as it is approved, usually within 24 hours.
          </p>
        </StateCard>
      );
    return (
      <div className="flex flex-col gap-6">
        {order?.status === "REJECTED" && (
          <StateCard icon={XCircle} tone="text-red-400" title="We could not confirm your last payment">
            {order.note && <p>Reason: {order.note}</p>}
            <p>Check the details and submit again below.</p>
          </StateCard>
        )}
        <div className="rounded-3xl border border-[#302C2A] bg-[#0C0C0C] p-6 md:p-8">
          {free ? <FreeEnrollButton courseId={course.id} /> : <CheckoutForm courseId={course.id} payment={payment} demoCard={process.env.DEMO_PAYMENTS === "true"} amount={coursePriceLabel(course)} />}
        </div>
      </div>
    );
  };

  return (
    <main className="mx-auto w-[90%] max-w-6xl pb-24 pt-40 max-md:pt-32">
      <h1 className="mb-10 font-machina text-4xl md:text-5xl">Checkout</h1>
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        {body()}
        <aside className="flex flex-col gap-4 rounded-3xl border border-[#302C2A] bg-[#0C0C0C] p-6 lg:sticky lg:top-36">
          <div className="aspect-video overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#f97316,#7c2d12_55%,#1c1917)]">
            {course.thumbnail?.url && <img src={imageUrl(course.thumbnail.url, 800)} alt={course.title} loading="lazy" decoding="async" className="size-full object-cover" />}
          </div>
          <Link href={`/courses/${course.slug}`} className="font-machina text-2xl leading-tight hover:text-accent">
            {course.title}
          </Link>
          <p className="flex items-center gap-2 text-white/70">
            <BookOpen className="size-4 text-accent" /> {plural(course.lessons, "lesson")}
            {course.estimatedDuration > 0 && <span>· {formatDuration(course.estimatedDuration)}</span>}
          </p>
          <div className="flex items-baseline justify-between border-t border-white/10 pt-4">
            <span className="text-white/70">Total</span>
            <span className="text-3xl font-medium">
              {coursePriceLabel(course)}
              {!free && course.discountPrice != null && <span className="ml-2 text-base font-normal text-white/50 line-through">{formatPrice(course.price, course.currency)}</span>}
            </span>
          </div>
          <p className="text-sm text-white/50">One-time payment. Lifetime access.</p>
        </aside>
      </div>
    </main>
  );
};

export default CheckoutPage;
