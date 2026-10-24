import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Award, BookOpen, CalendarDays, CircleCheck, GraduationCap, Infinity as InfinityIcon, Signal, Users } from "lucide-react";
import SectionHeading from "@/components/ui/section-heading";
import SectionTag from "@/components/ui/section-tag";
import HeroBackground from "@/components/ui/hero-background";
import CourseCard from "@/components/ui/course-card";
import Faq from "@/components/sections/faq";
import CourseCta, { CourseCtaFallback, coursePriceLabel } from "@/features/courses/components/course-cta";
import CourseCurriculum from "@/features/courses/components/course-curriculum";
import CourseHeroMedia from "@/features/courses/components/course-hero-media";
import EnrollCard from "@/features/courses/components/enroll-card";
import MobileEnrollBar from "@/features/courses/components/mobile-enroll-bar";
import CertificatePreview from "@/features/certificates/components/certificate-preview";
import ReviewList from "@/features/reviews/components/review-list";
import Stars from "@/components/ui/stars";
import Flag from "@/components/ui/flag";
import { getCatalog, getPublicCourse } from "@/features/courses/queries";
import { formatDuration, plural } from "@/lib/format";
import { imageUrl } from "@/lib/upload-rules";
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
  const previewLessons = course.outline.flatMap((s) => s.lessons).filter((l) => l.preview);
  const faqs = [
    {
      q: "Do I need any experience before starting?",
      a: course.prerequisites.length ? `It helps to have: ${course.prerequisites.join("; ")}.` : `This course is marked ${course.level || "all levels"} and has no listed prerequisites.`,
    },
    {
      q: "How long is the course?",
      a: `${plural(course.lessons, "recorded lesson")}${course.estimatedDuration ? ` totalling about ${formatDuration(course.estimatedDuration)}` : ""}. Watch at your own pace and pick up where you left off.`,
    },
    previewLessons.length > 0 && { q: "Can I watch a lesson before I enroll?", a: `Yes. ${plural(previewLessons.length, "lesson is", "lessons are")} free to preview in the curriculum above.` },
    { q: "How long do I keep access?", a: "Your enrollment does not expire. You keep access to the recordings and your progress." },
    { q: "Will I get a certificate?", a: "Yes. When you complete the course requirements a certificate is issued automatically, with a public link and QR code anyone can verify." },
    { q: "How do I pay?", a: "Pay by bank transfer or mobile wallet at checkout and submit your transaction ID. Access opens once the payment is approved." },
  ].filter(Boolean);

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
    <main className="max-lg:pb-24">
      <JsonLd data={structured} />
      <section className="relative isolate">
        <HeroBackground className="h-[80vh]" />
        <div className="mx-auto grid w-[90%] items-start gap-10 pb-20 pt-40 max-md:pt-32 lg:w-[85%] lg:grid-cols-[minmax(0,1fr)_26rem] xl:gap-16">
          <div className="flex min-w-0 flex-col gap-6">
            <div>
              <SectionTag>{course.category || "Course"}</SectionTag>
            </div>
            <h1 className="font-machina text-[2.5rem] font-normal capitalize leading-tight tracking-tight md:text-[3.75rem]">{course.title}</h1>
            {course.subtitle && <p className="text-xl font-light text-[#D7D7D7] md:text-[1.6rem]">{course.subtitle}</p>}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {course.rating && (
                <a href="#reviews" className="flex items-center gap-2 text-white/70 hover:text-white">
                  <Stars value={course.rating.average} />
                  <span className="font-semibold">{course.rating.average.toFixed(1)}</span>
                  <span className="text-white/50">({course.rating.count} {course.rating.count === 1 ? "review" : "reviews"})</span>
                </a>
              )}
              {flags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-base text-white/70">
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
            </div>
            <CourseHeroMedia title={course.title} thumbnail={course.thumbnail?.url} previewLesson={previewLessons[0] ?? null} />
          </div>
          <EnrollCard id="enroll" course={course} previews={previewLessons.length} className="lg:sticky lg:top-28" />
        </div>
      </section>

      <section className="mx-auto flex w-[90%] flex-wrap justify-center gap-4 pb-20 lg:w-[85%]">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex w-[calc(50%-0.5rem)] items-center gap-3 rounded-2xl border border-[#302C2A] p-5 md:w-[calc(33.333%-0.7rem)] lg:w-[calc(25%-0.75rem)]">
            <span className="rounded-xl bg-[#FDEFEA] p-3 text-accent">
              <Icon className="size-6" />
            </span>
            <div>
              <p className="text-lg font-semibold">{value}</p>
              <p className="text-base text-white/50">{label}</p>
            </div>
          </div>
        ))}
      </section>

      {course.description && (
        <section className="mx-auto w-[90%] max-w-4xl pb-20">
          <SectionHeading tag="About" title="About this course" />
          <p className="whitespace-pre-line text-xl font-normal leading-relaxed text-white/70">{course.description}</p>
        </section>
      )}

      {course.outline.length > 0 && (
        <section className="mx-2 rounded-4xl bg-[#FFF3EF] px-4 py-20 text-black sm:mx-4 sm:px-6">
          <SectionHeading light tag="Curriculum" title="What you will learn, module by module" />
          <div className="mx-auto grid w-full max-w-6xl items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <CourseCurriculum outline={course.outline} />
            <aside className="flex flex-col gap-5 rounded-3xl bg-[#050000] p-6 text-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] lg:sticky lg:top-28">
              <p className="text-2xl font-medium">Before you start</p>
              <p className="flex items-center gap-2 text-lg text-white/70">
                <Signal className="size-5 text-accent" />
                {course.level || "All levels"}
                <span className="text-white/30">·</span>
                {plural(course.lessons, "lesson")}
              </p>
              {course.prerequisites.length > 0 && (
                <ul className="flex flex-col gap-3">
                  {course.prerequisites.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-lg">
                      <CircleCheck className="mt-1 size-5 shrink-0 text-green-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              <Suspense fallback={<CourseCtaFallback course={course} compact className="w-full" />}>
                <CourseCta course={course} compact className="w-full" />
              </Suspense>
            </aside>
          </div>
        </section>
      )}

      {course.outcomes.length > 0 && (
        <section className="mx-auto w-[90%] max-w-6xl py-24">
          <SectionHeading tag="Outcomes" title="What you will be able to do" />
          <ul className="grid gap-4 md:grid-cols-2">
            {course.outcomes.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-2xl border border-[#302C2A] p-5">
                <CircleCheck className="mt-1 size-5 shrink-0 text-green-400" />
                <span className="text-lg">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mx-auto w-[90%] pb-24 lg:w-[85%]">
        <SectionHeading tag="Certificate" title="Finish the course, get certified" />
        <CertificatePreview brand={brand.name} courseTitle={course.title} />
      </section>

      {course.teachers.length > 0 && (
        <section className="mx-auto w-[90%] max-w-6xl pb-24">
          <SectionHeading tag="Instructors" title={course.teachers.length === 1 ? "Meet your instructor" : "Meet your instructors"} />
          <div className="flex flex-wrap justify-center gap-6">
            {course.teachers.map((t) => (
              <article key={t.id} className="flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border border-[#302C2A] bg-linear-to-b from-[#1a0b06] to-black p-8 text-center">
                <span className="grid size-28 place-items-center overflow-hidden rounded-full border-2 border-accent/60 bg-accent/15 text-4xl font-semibold text-accent">
                  {t.image ? <img src={imageUrl(t.image, 256)} alt={t.name} loading="lazy" className="size-full object-cover" /> : t.name.charAt(0)}
                </span>
                <p className="text-2xl font-medium">{t.name}</p>
                {t.bio && <p className="text-lg text-white/70">{t.bio}</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      {course.rating && course.reviews.length > 0 && (
        <section id="reviews" className="mx-auto w-[90%] max-w-6xl scroll-mt-32 pb-24">
          <SectionHeading tag="Reviews" title="What students say" />
          <ReviewList rating={course.rating} reviews={course.reviews} />
        </section>
      )}

      <Faq faqs={faqs} />

      <section className="relative isolate mx-auto my-24 flex w-[90%] flex-col items-center gap-6 overflow-hidden rounded-4xl border border-[#302C2A] px-6 py-16 text-center lg:w-[85%]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(232,96,46,0.35),transparent_65%)]" />
        <SectionTag>Start today</SectionTag>
        <h2 className="max-w-3xl font-machina text-4xl font-normal capitalize leading-tight md:text-6xl">Ready to start {course.title}?</h2>
        <p className="max-w-2xl text-xl text-white/70">Learn at your own pace, check what stuck with quizzes and finish with a certificate anyone can verify.</p>
        <Suspense fallback={<CourseCtaFallback course={course} />}>
          <CourseCta course={course} />
        </Suspense>
      </section>

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

      <MobileEnrollBar watchId="enroll">
        <div className="min-w-0">
          <p className="truncate text-base text-white/60">{course.title}</p>
          <p className="text-xl font-semibold">{coursePriceLabel(course)}</p>
        </div>
        <Suspense fallback={<CourseCtaFallback course={course} compact className="shrink-0" />}>
          <CourseCta course={course} compact className="shrink-0" />
        </Suspense>
      </MobileEnrollBar>
    </main>
  );
};

export default CourseDetailPage;
