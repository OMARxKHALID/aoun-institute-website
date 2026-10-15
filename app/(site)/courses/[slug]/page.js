import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Award, BookOpen, CalendarDays, CircleCheck, GraduationCap, Infinity as InfinityIcon, Signal, Users } from "lucide-react";
import PageHero from "@/components/ui/page-hero";
import SectionHeading from "@/components/ui/section-heading";
import CourseCard from "@/components/ui/course-card";
import CourseCta, { CourseCtaFallback, coursePriceLabel } from "@/features/courses/components/course-cta";
import CourseCurriculum from "@/features/courses/components/course-curriculum";
import ReviewList from "@/features/reviews/components/review-list";
import Stars from "@/components/ui/stars";
import Flag from "@/components/ui/flag";
import { getCatalog, getPublicCourse } from "@/features/courses/queries";
import { formatDuration, formatPrice } from "@/lib/format";
import JsonLd from "@/components/ui/json-ld";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { getSiteSettings } from "@/features/site-settings/queries";

export const instant = false;

export const generateMetadata = async ({ params }) => {
  const { slug } = await params;
  const course = await getPublicCourse(slug);
  if (!course) return { title: "Course" };
  const description = course.subtitle || course.description?.slice(0, 160);
  const images = course.thumbnail?.url ? [course.thumbnail.url] : undefined;
  return {
    title: course.title,
    description,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: { type: "website", title: course.title, description, url: `/courses/${course.slug}`, images },
    twitter: { card: images ? "summary_large_image" : "summary", title: course.title, description, images },
  };
};

const CourseDetailPage = async ({ params }) => {
  const { slug } = await params;
  const [course, catalog, { brand }] = await Promise.all([getPublicCourse(slug), getCatalog(), getSiteSettings()]);
  if (!course) notFound();

  const facts = [
    { icon: CalendarDays, label: "Duration", value: course.estimatedDuration ? formatDuration(course.estimatedDuration) : "Self-paced" },
    { icon: BookOpen, label: "Lessons", value: course.lessons },
    { icon: Signal, label: "Level", value: course.level || "All levels" },
    { icon: Award, label: "Certificate", value: "Yes" },
    { icon: InfinityIcon, label: "Access", value: "Lifetime" },
    course.students > 0 && { icon: Users, label: "Students enrolled", value: course.students.toLocaleString("en-US") },
    course.graduates > 0 && { icon: GraduationCap, label: "Graduates", value: course.graduates.toLocaleString("en-US") },
  ].filter(Boolean);
  const flags = course.countries.slice(0, 8);
  const related = catalog.filter((c) => c.slug !== slug).slice(0, 3);
  const discounted = course.discountPrice != null && course.discountPrice < course.price && course.discountPrice > 0;

  const price = course.discountPrice ?? course.price;
  const structured = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.subtitle || course.description,
    url: absoluteUrl(`/courses/${course.slug}`),
    image: course.thumbnail?.url && (course.thumbnail.url.startsWith("http") ? course.thumbnail.url : absoluteUrl(course.thumbnail.url)),
    provider: { "@type": "EducationalOrganization", name: brand.name, sameAs: SITE_URL },
    educationalLevel: course.level,
    inLanguage: "en",
    offers: { "@type": "Offer", category: price ? "Paid" : "Free", price, priceCurrency: course.currency, availability: "https://schema.org/InStock", url: absoluteUrl(`/courses/${course.slug}`) },
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online", courseWorkload: course.estimatedDuration ? `PT${Math.round(course.estimatedDuration / 60)}M` : undefined },
    ...(course.rating && { aggregateRating: { "@type": "AggregateRating", ratingValue: course.rating.average.toFixed(1), reviewCount: course.rating.count } }),
  };

  return (
    <main>
      <JsonLd data={structured} />
      <PageHero tag={course.category || "Course"} title={course.title} text={course.subtitle}>
        <div className="mt-4 flex flex-col items-center gap-4">
          {course.rating && (
            <a href="#reviews" className="flex items-center gap-2 text-white/75 hover:text-white">
              <Stars value={course.rating.average} />
              <span className="font-semibold">{course.rating.average.toFixed(1)}</span>
              <span className="text-white/50">({course.rating.count} {course.rating.count === 1 ? "review" : "reviews"})</span>
            </a>
          )}
          {flags.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-white/60">
              <span className="flex -space-x-1.5">
                {flags.map((c) => (
                  <Flag key={c.code} code={c.code} name={c.name} className="size-6 rounded-full ring-2 ring-black" />
                ))}
              </span>
              <span>
                Students from {flags.length === 1 ? flags[0].name : `${course.countries.length} countries`}
                {course.countries.length > flags.length && ` · +${course.countries.length - flags.length} more`}
              </span>
            </div>
          )}
          <p className="text-3xl font-medium">
            {coursePriceLabel(course)}
            {discounted && <span className="ml-3 text-xl font-light text-white/40 line-through">{formatPrice(course.price, course.currency)}</span>}
          </p>
          <Suspense fallback={<CourseCtaFallback course={course} />}>
            <CourseCta course={course} />
          </Suspense>
        </div>
      </PageHero>

      <section className="mx-auto grid w-[90%] grid-cols-2 gap-4 pb-20 md:grid-cols-3 lg:w-[80%] lg:grid-cols-4">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl border border-[#302C2A] p-5">
            <span className="rounded-xl bg-[#FDEFEA] p-3 text-accent">
              <Icon className="size-6" />
            </span>
            <div>
              <p className="text-lg font-semibold">{value}</p>
              <p className="text-sm text-white/50">{label}</p>
            </div>
          </div>
        ))}
      </section>

      {course.description && (
        <section className="mx-auto w-[90%] max-w-4xl pb-20">
          <SectionHeading tag="About" title="About this course" />
          <p className="whitespace-pre-line text-xl font-light leading-relaxed text-white/70">{course.description}</p>
        </section>
      )}

      {course.outline.length > 0 && (
        <section className="mx-2 rounded-4xl bg-[#FFF3EF] px-4 py-20 text-black sm:mx-4 sm:px-6">
          <SectionHeading light tag="Curriculum" title="What you will learn, module by module" />
          <CourseCurriculum outline={course.outline} />
        </section>
      )}

      {(course.outcomes.length > 0 || course.prerequisites.length > 0) && (
        <section className="mx-auto grid w-[90%] max-w-6xl gap-12 py-24 lg:grid-cols-2">
          {[
            ["Outcomes", "What you will be able to do", course.outcomes],
            ["Before you start", "Prerequisites", course.prerequisites],
          ]
            .filter(([, , items]) => items.length)
            .map(([tag, title, items]) => (
              <div key={tag}>
                <SectionHeading tag={tag} title={title} />
                <ul className="flex flex-col gap-4">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-3 rounded-2xl border border-[#302C2A] p-5">
                      <CircleCheck className="mt-1 size-5 shrink-0 text-green-500" />
                      <span className="text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </section>
      )}

      {course.rating && course.reviews.length > 0 && (
        <section id="reviews" className="mx-auto w-[90%] max-w-6xl scroll-mt-32 pb-24">
          <SectionHeading tag="Reviews" title="What students say" />
          <ReviewList rating={course.rating} reviews={course.reviews} />
        </section>
      )}

      {related.length > 0 && (
        <section className="mx-auto w-[90%] pb-24 lg:w-[85%]">
          <SectionHeading tag="More Courses" title="Keep exploring" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <CourseCard key={c.id} {...c} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default CourseDetailPage;
