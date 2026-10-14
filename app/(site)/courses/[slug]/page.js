import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Award, BookOpen, CalendarDays, CircleCheck, Infinity as InfinityIcon, Signal } from "lucide-react";
import PageHero from "@/components/ui/page-hero";
import SectionHeading from "@/components/ui/section-heading";
import CourseCard from "@/components/ui/course-card";
import CourseCta, { CourseCtaFallback, coursePriceLabel } from "@/features/courses/components/course-cta";
import CourseCurriculum from "@/features/courses/components/course-curriculum";
import { getCatalog, getPublicCourse } from "@/features/courses/queries";
import { formatDuration, formatPrice } from "@/lib/format";

export const instant = false;

export const generateMetadata = async ({ params }) => {
  const { slug } = await params;
  const course = await getPublicCourse(slug);
  if (!course) return { title: "Course" };
  return {
    title: course.title,
    description: course.subtitle || course.description?.slice(0, 160),
    openGraph: course.thumbnail?.url ? { images: [course.thumbnail.url] } : undefined,
  };
};

const CourseDetailPage = async ({ params }) => {
  const { slug } = await params;
  const [course, catalog] = await Promise.all([getPublicCourse(slug), getCatalog()]);
  if (!course) notFound();

  const facts = [
    { icon: CalendarDays, label: "Duration", value: course.estimatedDuration ? formatDuration(course.estimatedDuration) : "Self-paced" },
    { icon: BookOpen, label: "Lessons", value: course.lessons },
    { icon: Signal, label: "Level", value: course.level || "All levels" },
    { icon: Award, label: "Certificate", value: "Yes" },
    { icon: InfinityIcon, label: "Access", value: "Lifetime" },
  ];
  const related = catalog.filter((c) => c.slug !== slug).slice(0, 3);
  const discounted = course.discountPrice != null && course.discountPrice < course.price && course.discountPrice > 0;

  return (
    <main>
      <PageHero tag={course.category || "Course"} title={course.title} text={course.subtitle}>
        <div className="mt-4 flex flex-col items-center gap-4">
          <p className="text-3xl font-medium">
            {coursePriceLabel(course)}
            {discounted && <span className="ml-3 text-xl font-light text-white/40 line-through">{formatPrice(course.price, course.currency)}</span>}
          </p>
          <Suspense fallback={<CourseCtaFallback course={course} />}>
            <CourseCta course={course} />
          </Suspense>
        </div>
      </PageHero>

      <section className="mx-auto grid w-[90%] grid-cols-2 gap-4 pb-20 md:grid-cols-3 lg:w-[80%] lg:grid-cols-5">
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
